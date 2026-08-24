'use strict';
/* ============================================================
   Official Fraud Rankings — HTTP server
   Serves the static site and the JSON API from one origin, so the
   session cookie can stay HttpOnly and SameSite=Strict.
   ============================================================ */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { open } = require('./db.js');
const auth = require('./auth.js');
const dataset = require('./dataset.js');
const { routes, ApiError, MAX_BODY } = require('./api.js');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '127.0.0.1';

const db = open();
const data = dataset.load();
auth.sweepSessions(db);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    'X-Frame-Options': 'DENY'
  }, headers || {}));
  res.end(body);
}

const sendJson = (res, status, obj, headers) => send(res, status, JSON.stringify(obj), headers);

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > MAX_BODY) {
        req.pause();                       /* answer first, hang up after */
        reject(new ApiError(413, 'payload_too_large', 'That request is too large.'));
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch (e) { reject(new ApiError(400, 'invalid_json', 'The request body was not valid JSON.')); }
    });
    req.on('error', reject);
  });
}

async function handleApi(req, res, url) {
  const method = req.method.toUpperCase();
  const match = routes.find(r => r.method === method && r.pattern.test(url.pathname));

  if (!match) {
    const otherMethod = routes.some(r => r.pattern.test(url.pathname));
    throw new ApiError(otherMethod ? 405 : 404, otherMethod ? 'method_not_allowed' : 'not_found',
      otherMethod ? 'That method is not allowed here.' : 'No such endpoint.');
  }

  /* A custom header cannot be sent cross-origin without a CORS preflight this
     server never grants, so requiring it blocks form-based CSRF. */
  if (method !== 'GET' && req.headers['x-ofr-client'] !== 'web') {
    throw new ApiError(403, 'csrf', 'Missing client header.');
  }

  const cookies = auth.parseCookies(req.headers.cookie);
  const token = cookies[auth.COOKIE];
  const user = auth.userForToken(db, token);

  if (match.opts.auth && !user) throw new ApiError(401, 'unauthorized', 'Sign in to continue.');

  const state = {
    db, data, user, token,
    ip: req.socket.remoteAddress || 'unknown',
    secure: (req.headers['x-forwarded-proto'] || '').split(',')[0] === 'https'
  };

  const params = url.pathname.match(match.pattern).slice(1);
  req.query = url.searchParams;
  req.body = method === 'GET' ? {} : await readBody(req);

  const result = await match.handler(req, res, state, params);
  sendJson(res, 200, result, { 'Cache-Control': 'no-store' });
}

function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';

  const full = path.join(ROOT, rel);
  if (!full.startsWith(ROOT + path.sep)) return notFoundPage(res);          /* no traversal */
  if (full.startsWith(path.join(ROOT, 'server'))) return notFoundPage(res); /* server code is not public */

  let file = full;
  if (!fs.existsSync(file) && fs.existsSync(full + '.html')) file = full + '.html';   /* /rankings works too */
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return notFoundPage(res);

  const ext = path.extname(file).toLowerCase();
  const body = fs.readFileSync(file);
  send(res, 200, body, {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300'
  });
}

function notFoundPage(res) {
  const file = path.join(ROOT, '404.html');
  const body = fs.existsSync(file) ? fs.readFileSync(file) : 'Not found';
  send(res, 404, body, { 'Content-Type': 'text/html; charset=utf-8' });
}

/* A liveness probe that touches the database, for whatever runs this. */
function health(res) {
  const rows = db.prepare('SELECT COUNT(*) n FROM frauds').get().n;
  sendJson(res, 200, { ok: true, frauds: rows, cycle: require('./api.js').CURRENT_CYCLE, uptime: Math.round(process.uptime()) },
           { 'Cache-Control': 'no-store' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));

  try {
    if (url.pathname === '/api/health') return health(res);
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(res, 405, 'Method not allowed', { 'Content-Type': 'text/plain' });
    }
    return serveStatic(req, res, url);
  } catch (err) {
    if (err instanceof ApiError) {
      const headers = err.status === 413 ? { Connection: 'close' } : undefined;
      sendJson(res, err.status, { error: { code: err.code, message: err.message, field: err.field } }, headers);
      if (err.status === 413) res.on('finish', () => req.destroy());
      return;
    }
    console.error('[500]', req.method, url.pathname, err);
    sendJson(res, 500, { error: { code: 'server_error', message: 'Something went wrong on the board.' } });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Official Fraud Rankings running at http://${HOST}:${PORT}`);
  console.log(`Database: ${require('./db.js').DB_PATH}`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { server.close(() => { db.close(); process.exit(0); }); });
}
