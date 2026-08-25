'use strict';
/* ============================================================
   API handlers. Every rule the frontend shows — plan gates, the
   watchlist cap, one nomination per cycle — is enforced here too;
   the client copy is a courtesy, this one is the rule.
   ============================================================ */

const crypto = require('node:crypto');
const auth = require('./auth.js');
const dataset = require('./dataset.js');

const CURRENT_CYCLE = 41;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_BODY = 32 * 1024;

/* ---------- errors ---------- */
class ApiError extends Error {
  constructor(status, code, message, field) {
    super(message);
    this.status = status; this.code = code; this.field = field;
  }
}
const bad = (msg, field) => new ApiError(400, 'invalid_request', msg, field);
const unauthorized = msg => new ApiError(401, 'unauthorized', msg || 'Sign in to continue.');
const forbidden = (code, msg) => new ApiError(403, code, msg);
const notFound = msg => new ApiError(404, 'not_found', msg || 'Not found.');

/* ---------- validation ---------- */
function str(value, { field, min = 1, max = 500, label }) {
  const v = typeof value === 'string' ? value.trim() : '';
  if (v.length < min) throw bad(`${label || field} must be at least ${min} characters.`, field);
  if (v.length > max) throw bad(`${label || field} must be at most ${max} characters.`, field);
  return v;
}

function email(value) {
  const v = str(value, { field: 'email', min: 3, max: 254, label: 'Email' }).toLowerCase();
  if (!EMAIL_RE.test(v)) throw bad('Enter a valid email address.', 'email');
  return v;
}

function password(value) {
  const v = typeof value === 'string' ? value : '';
  if (v.length < 8) throw bad('Passwords are at least eight characters.', 'password');
  if (v.length > 200) throw bad('That password is too long.', 'password');
  return v;
}

/* ---------- board maths ---------- */
function plansOf(state) { return state.data.PLANS; }
function planById(state, id) { return plansOf(state).find(p => p.id === id) || plansOf(state)[0]; }
function planLevel(state, id) { return planById(state, id).level; }

function fraudRows(db) {
  return db.prepare('SELECT * FROM frauds').all().map(r => ({
    id: r.id, name: r.name, nickname: r.nickname || '', handle: r.handle, region: r.region, age: r.age,
    joined: r.joined, movement: r.movement, peak: r.peak, weeks: r.weeks,
    tagline: r.tagline, bio: r.bio, stats: JSON.parse(r.stats),
    profile: JSON.parse(r.profile || '{}'),
    baseline: { rise: r.baseline_rise, over: r.baseline_over }
  }));
}

function liveVotes(db) {
  const out = {};
  for (const row of db.prepare('SELECT fraud_id, kind, COUNT(*) n FROM votes GROUP BY fraud_id, kind').all()) {
    out[row.fraud_id] = out[row.fraud_id] || { rise: 0, over: 0 };
    out[row.fraud_id][row.kind] = row.n;
  }
  return out;
}

/* What members graded each Fraud, alongside what the panel scored. */
function communityGrades(db) {
  const out = {};
  for (const r of db.prepare('SELECT fraud_id, AVG(score) avg, COUNT(*) n FROM ratings GROUP BY fraud_id').all()) {
    out[r.fraud_id] = { average: Number(r.avg.toFixed(1)), count: r.n };
  }
  return out;
}

/* The ranked field: aggregate grade, rank, tier, live sentiment and member grades. */
function rankedField(state) {
  const { db, data } = state;
  const votes = liveVotes(db);
  const grades = communityGrades(db);

  return fraudRows(db)
    .map(f => {
      const score = dataset.overall(f, data.CATEGORIES);
      const live = votes[f.id] || { rise: 0, over: 0 };
      const rise = f.baseline.rise + live.rise;
      const over = f.baseline.over + live.over;
      const total = rise + over || 1;
      return {
        ...f,
        score: Number(score.toFixed(4)),
        tier: dataset.tierOf(score),
        community: grades[f.id] || { average: null, count: 0 },
        sentiment: {
          rise: Math.round(rise / total * 100),
          over: 100 - Math.round(rise / total * 100),
          votes: rise + over
        }
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((f, i) => ({ ...f, rank: i + 1 }));
}

/* ---------- shaping ---------- */
function publicUser(state, row) {
  return { id: row.id, name: row.name, email: row.email, plan: row.plan, joined: row.created_at.slice(0, 10) };
}

function memberState(state, user) {
  const { db } = state;
  const watchlist = db.prepare('SELECT fraud_id FROM watchlist WHERE user_id = ? ORDER BY created_at').all(user.id).map(r => r.fraud_id);
  const votes = {};
  for (const r of db.prepare('SELECT fraud_id, kind FROM votes WHERE user_id = ?').all(user.id)) votes[r.fraud_id] = r.kind;

  const nominations = db.prepare('SELECT id, name, handle, region, quality, note, cycle, status FROM nominations WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  const appeals = db.prepare('SELECT id, fraud_id AS fraudId, quality, note, cycle, status FROM appeals WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  const orders = db.prepare('SELECT id, plan, billing, amount_cents AS amountCents, card_brand AS cardBrand, card_last4 AS cardLast4, created_at AS createdAt FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(user.id);

  const bookmarks = db.prepare('SELECT article_id FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC').all(user.id).map(r => r.article_id);
  const ratings = {};
  for (const r of db.prepare('SELECT fraud_id, score FROM ratings WHERE user_id = ?').all(user.id)) ratings[r.fraud_id] = r.score;
  const tests = db.prepare('SELECT id, stats, score, tier, would_rank AS wouldRank, created_at AS createdAt FROM self_tests WHERE user_id = ? ORDER BY created_at DESC LIMIT 10')
    .all(user.id).map(t => ({ ...t, stats: JSON.parse(t.stats) }));

  return {
    user: publicUser(state, user),
    watchlist,
    votes,
    bookmarks,
    ratings,
    tests,
    routine: routineSummary(db, user.id),
    nominations: nominations.map(n => ({ ...n })),
    appeals: appeals.map(a => ({ ...a })),
    orders: orders.map(o => ({ ...o })),
    nominationsThisCycle: nominations.filter(n => n.cycle === CURRENT_CYCLE).length
  };
}

/* ---------- routine tracker ---------- */
const today = () => new Date().toISOString().slice(0, 10);
const dayBefore = (iso, n) => new Date(new Date(iso + 'T00:00:00Z').getTime() - n * 864e5).toISOString().slice(0, 10);

function routineSummary(db, userId) {
  const rows = db.prepare('SELECT day, habits FROM routine_days WHERE user_id = ? ORDER BY day DESC LIMIT 60').all(userId);
  const byDay = {};
  for (const r of rows) byDay[r.day] = JSON.parse(r.habits);

  /* a day counts toward the streak once at least three habits are ticked */
  const counts = d => (byDay[d] || []).length;
  let streak = 0;
  let cursor = today();
  if (counts(cursor) < 3) cursor = dayBefore(cursor, 1);       /* today still has time to count */
  while (counts(cursor) >= 3) { streak++; cursor = dayBefore(cursor, 1); }

  const last14 = [];
  for (let i = 13; i >= 0; i--) {
    const d = dayBefore(today(), i);
    last14.push({ day: d, done: counts(d) });
  }

  return { today: byDay[today()] || [], streak, last14, days: rows.length };
}

/* ---------- rate limiting ---------- */
const buckets = new Map();
function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) { buckets.set(key, { count: 1, reset: now + windowMs }); return; }
  if (++b.count > limit) {
    throw new ApiError(429, 'rate_limited', 'Too many attempts. Try again in a few minutes.');
  }
}
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) if (now > b.reset) buckets.delete(k);
}, 60_000).unref();

/* ---------- card checks (nothing is stored beyond brand and last four) ---------- */
function luhn(digits) {
  let sum = 0, alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = +digits[i];
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
}

function cardBrand(digits) {
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^6/.test(digits)) return 'Discover';
  return 'Card';
}

/* ============================================================
   Routes
   ============================================================ */
const routes = [];
const route = (method, pattern, handler, opts) => routes.push({ method, pattern, handler, opts: opts || {} });

/* ---- reference data ---- */
route('GET', /^\/api\/bootstrap$/, (req, res, state) => {
  const field = rankedField(state);
  return {
    cycle: CURRENT_CYCLE,
    categories: state.data.CATEGORIES,
    plans: state.data.PLANS,
    news: state.data.NEWS,
    looksmax: state.data.LOOKSMAX,
    looksmaxCategories: state.data.LOOKSMAX_CATEGORIES,
    habits: state.data.HABITS,
    frauds: field,
    regions: [...new Set(field.map(f => f.region.split(', ').pop()))].sort()
  };
});

/* ---- board ---- */
route('GET', /^\/api\/frauds$/, (req, res, state) => {
  const q = req.query;
  let field = rankedField(state);

  const search = (q.get('q') || '').trim().toLowerCase();
  if (search) field = field.filter(f =>
    f.name.toLowerCase().includes(search) || f.handle.toLowerCase().includes(search) ||
    f.region.toLowerCase().includes(search) || f.tagline.toLowerCase().includes(search));

  const tier = q.get('tier');
  if (tier && tier !== 'all') field = field.filter(f => f.tier.key === tier);

  const region = q.get('region');
  if (region && region !== 'all') field = field.filter(f => f.region.endsWith(region));

  if (q.get('watched') === '1') {
    if (!state.user) throw unauthorized('Sign in to filter by your watchlist.');
    const ids = new Set(state.db.prepare('SELECT fraud_id FROM watchlist WHERE user_id = ?').all(state.user.id).map(r => r.fraud_id));
    field = field.filter(f => ids.has(f.id));
  }

  const quality = q.get('quality');
  if (quality) {
    if (!state.data.CATEGORIES.some(c => c.key === quality)) throw bad('Unknown quality.', 'quality');
    field.sort((a, b) => b.stats[quality] - a.stats[quality] || a.rank - b.rank);
  } else {
    const sort = q.get('sort') || 'rank';
    if (sort === 'movers') field.sort((a, b) => b.movement - a.movement || a.rank - b.rank);
    else if (sort === 'fallers') field.sort((a, b) => a.movement - b.movement || a.rank - b.rank);
    else if (sort === 'name') field.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'newest') field.sort((a, b) => a.weeks - b.weeks || a.rank - b.rank);
    else if (sort === 'age') field.sort((a, b) => a.age - b.age || a.rank - b.rank);
    else field.sort((a, b) => a.rank - b.rank);
  }

  const total = field.length;
  const limit = Math.min(Math.max(parseInt(q.get('limit') || '24', 10) || 24, 1), 100);
  const offset = Math.max(parseInt(q.get('offset') || '0', 10) || 0, 0);
  return { total, limit, offset, frauds: field.slice(offset, offset + limit) };
});

route('GET', /^\/api\/frauds\/([\w-]+)$/, (req, res, state, params) => {
  const field = rankedField(state);
  const fraud = field.find(f => f.id === params[0]);
  if (!fraud) throw notFound('No ranked Fraud with that id.');
  const nearby = field.filter(f => Math.abs(f.rank - fraud.rank) <= 2 && f.id !== fraud.id);
  return { fraud, nearby, total: field.length };
});

/* ---- auth ---- */
route('POST', /^\/api\/auth\/signup$/, (req, res, state) => {
  rateLimit('signup:' + state.ip, 10, 15 * 60_000);

  const name = str(req.body.name, { field: 'name', min: 2, max: 80, label: 'Name' });
  const mail = email(req.body.email);
  const pass = password(req.body.password);
  if (req.body.confirm !== undefined && req.body.confirm !== req.body.password) {
    throw bad('Those passwords do not match.', 'confirm');
  }
  if (!req.body.terms) throw bad('You need to accept the terms to create an account.', 'terms');

  if (state.db.prepare('SELECT 1 FROM users WHERE email = ?').get(mail)) {
    throw new ApiError(409, 'email_taken', 'An account already exists for that email.', 'email');
  }

  const { hash, salt } = auth.hashPassword(pass);
  const user = {
    id: auth.id('usr'), name, email: mail, pass_hash: hash, salt,
    plan: 'spectator', created_at: new Date().toISOString()
  };
  state.db.prepare('INSERT INTO users (id, name, email, pass_hash, salt, plan, created_at) VALUES (?,?,?,?,?,?,?)')
    .run(user.id, user.name, user.email, user.pass_hash, user.salt, user.plan, user.created_at);

  const session = auth.createSession(state.db, user.id);
  res.setHeader('Set-Cookie', auth.sessionCookie(session.token, session.expires, state.secure));
  return memberState(state, user);
});

route('POST', /^\/api\/auth\/login$/, (req, res, state) => {
  rateLimit('login:' + state.ip, 10, 15 * 60_000);

  const mail = email(req.body.email);
  const pass = password(req.body.password);
  const row = state.db.prepare('SELECT * FROM users WHERE email = ?').get(mail);

  /* same response either way, so the endpoint does not confirm which emails exist */
  if (!row || !auth.verifyPassword(pass, row.salt, row.pass_hash)) {
    throw new ApiError(401, 'bad_credentials', 'That email and password do not match an account.');
  }

  const session = auth.createSession(state.db, row.id);
  res.setHeader('Set-Cookie', auth.sessionCookie(session.token, session.expires, state.secure));
  return memberState(state, row);
});

route('POST', /^\/api\/auth\/logout$/, (req, res, state) => {
  auth.destroySession(state.db, state.token);
  res.setHeader('Set-Cookie', auth.clearCookie(state.secure));
  return { ok: true };
});

route('GET', /^\/api\/auth\/me$/, (req, res, state) => {
  if (!state.user) return { user: null };
  return memberState(state, state.user);
}, { auth: false });

route('PATCH', /^\/api\/auth\/me$/, (req, res, state) => {
  const name = str(req.body.name, { field: 'name', min: 2, max: 80, label: 'Name' });
  const mail = email(req.body.email);
  const clash = state.db.prepare('SELECT 1 FROM users WHERE email = ? AND id <> ?').get(mail, state.user.id);
  if (clash) throw new ApiError(409, 'email_taken', 'Another account already uses that email.', 'email');

  state.db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, mail, state.user.id);
  state.user.name = name; state.user.email = mail;
  return memberState(state, state.user);
}, { auth: true });

route('DELETE', /^\/api\/auth\/me$/, (req, res, state) => {
  state.db.prepare('DELETE FROM users WHERE id = ?').run(state.user.id);
  res.setHeader('Set-Cookie', auth.clearCookie(state.secure));
  return { ok: true };
}, { auth: true });

/* ---- watchlist ---- */
route('PUT', /^\/api\/watchlist\/([\w-]+)$/, (req, res, state, params) => {
  const fraudId = params[0];
  if (!state.db.prepare('SELECT 1 FROM frauds WHERE id = ?').get(fraudId)) throw notFound('No ranked Fraud with that id.');

  const already = state.db.prepare('SELECT 1 FROM watchlist WHERE user_id = ? AND fraud_id = ?').get(state.user.id, fraudId);
  if (already) return { watching: true, watchlist: currentWatchlist(state) };

  const level = planLevel(state, state.user.plan);
  const count = state.db.prepare('SELECT COUNT(*) n FROM watchlist WHERE user_id = ?').get(state.user.id).n;
  if (level < 1 && count >= 5) {
    throw forbidden('watchlist_full', 'Spectator members can watch up to five Frauds.');
  }

  state.db.prepare('INSERT INTO watchlist (user_id, fraud_id, created_at) VALUES (?,?,?)')
    .run(state.user.id, fraudId, new Date().toISOString());
  return { watching: true, watchlist: currentWatchlist(state) };
}, { auth: true });

route('DELETE', /^\/api\/watchlist\/([\w-]+)$/, (req, res, state, params) => {
  state.db.prepare('DELETE FROM watchlist WHERE user_id = ? AND fraud_id = ?').run(state.user.id, params[0]);
  return { watching: false, watchlist: currentWatchlist(state) };
}, { auth: true });

function currentWatchlist(state) {
  return state.db.prepare('SELECT fraud_id FROM watchlist WHERE user_id = ? ORDER BY created_at').all(state.user.id).map(r => r.fraud_id);
}

/* ---- votes ---- */
route('POST', /^\/api\/votes$/, (req, res, state) => {
  const fraudId = str(req.body.fraudId, { field: 'fraudId', min: 1, max: 40, label: 'Fraud' });
  const kind = req.body.kind;
  if (kind !== 'rise' && kind !== 'over') throw bad('A vote is either rising or overrated.', 'kind');
  if (!state.db.prepare('SELECT 1 FROM frauds WHERE id = ?').get(fraudId)) throw notFound('No ranked Fraud with that id.');

  const existing = state.db.prepare('SELECT kind FROM votes WHERE user_id = ? AND fraud_id = ?').get(state.user.id, fraudId);
  let vote = kind;
  if (existing && existing.kind === kind) {
    state.db.prepare('DELETE FROM votes WHERE user_id = ? AND fraud_id = ?').run(state.user.id, fraudId);
    vote = null;
  } else {
    state.db.prepare(`
      INSERT INTO votes (user_id, fraud_id, kind, created_at) VALUES (?,?,?,?)
      ON CONFLICT(user_id, fraud_id) DO UPDATE SET kind = excluded.kind, created_at = excluded.created_at
    `).run(state.user.id, fraudId, kind, new Date().toISOString());
  }

  const fraud = rankedField(state).find(f => f.id === fraudId);
  return { vote, sentiment: fraud.sentiment };
}, { auth: true });

/* ---- nominations ---- */
route('GET', /^\/api\/nominations$/, (req, res, state) => ({
  nominations: memberState(state, state.user).nominations,
  cycle: CURRENT_CYCLE,
  remaining: Math.max(0, 1 - memberState(state, state.user).nominationsThisCycle)
}), { auth: true });

route('POST', /^\/api\/nominations$/, (req, res, state) => {
  if (planLevel(state, state.user.plan) < 1) {
    throw forbidden('upgrade_required', 'Nominations are a Verified benefit.');
  }
  const used = state.db.prepare('SELECT COUNT(*) n FROM nominations WHERE user_id = ? AND cycle = ?')
    .get(state.user.id, CURRENT_CYCLE).n;
  if (used >= 1) throw forbidden('cycle_limit', 'One nomination per member per cycle.');

  const name = str(req.body.name, { field: 'name', min: 2, max: 80, label: 'Name' });
  let handle = str(req.body.handle, { field: 'handle', min: 2, max: 40, label: 'Handle' });
  if (!/^@?[\w.]{2,}$/.test(handle)) throw bad('Enter a usable handle, e.g. @handle.', 'handle');
  if (handle[0] !== '@') handle = '@' + handle;

  const region = req.body.region ? str(req.body.region, { field: 'region', min: 0, max: 80, label: 'Region' }) : '';
  const quality = str(req.body.quality, { field: 'quality', min: 2, max: 40, label: 'Quality' });
  if (!state.data.CATEGORIES.some(c => c.label === quality)) throw bad('Pick one of the ten graded qualities.', 'quality');

  const note = str(req.body.note, { field: 'note', min: 40, max: 4000, label: 'The case' });

  const clash = state.db.prepare('SELECT 1 FROM frauds WHERE LOWER(name) = ?').get(name.toLowerCase());
  if (clash) throw new ApiError(409, 'already_ranked', name + ' is already ranked on the board.', 'name');

  const row = {
    id: auth.id('nom'), user_id: state.user.id, name, handle, region, quality, note,
    cycle: CURRENT_CYCLE, status: 'Under review', created_at: new Date().toISOString()
  };
  state.db.prepare(`INSERT INTO nominations (id, user_id, name, handle, region, quality, note, cycle, status, created_at)
                    VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(row.id, row.user_id, row.name, row.handle, row.region, row.quality, row.note, row.cycle, row.status, row.created_at);

  return { nomination: { id: row.id, name, handle, region, quality, note, cycle: row.cycle, status: row.status },
           earliestEntry: CURRENT_CYCLE + 2 };
}, { auth: true });

/* ---- appeals ---- */
route('GET', /^\/api\/appeals$/, (req, res, state) => ({ appeals: memberState(state, state.user).appeals }), { auth: true });

route('POST', /^\/api\/appeals$/, (req, res, state) => {
  const fraudId = str(req.body.fraudId, { field: 'fraudId', min: 1, max: 40, label: 'Fraud' });
  const fraud = state.db.prepare('SELECT name FROM frauds WHERE id = ?').get(fraudId);
  if (!fraud) throw notFound('No ranked Fraud with that id.');

  const quality = str(req.body.quality, { field: 'quality', min: 2, max: 40, label: 'Quality' });
  if (!state.data.CATEGORIES.some(c => c.label === quality)) throw bad('Name one of the ten graded qualities.', 'quality');
  const note = str(req.body.note, { field: 'note', min: 40, max: 4000, label: 'The evidence' });

  const priority = planLevel(state, state.user.plan) >= 2;
  if (priority) {
    const used = state.db.prepare('SELECT COUNT(*) n FROM appeals WHERE user_id = ? AND cycle = ?')
      .get(state.user.id, CURRENT_CYCLE).n;
    if (used >= 1) throw forbidden('cycle_limit', 'One appeal per member per cycle.');
  }

  const row = {
    id: auth.id('apl'), user_id: state.user.id, fraud_id: fraudId, quality, note,
    cycle: CURRENT_CYCLE, status: priority ? 'Filed' : 'Logged', created_at: new Date().toISOString()
  };
  state.db.prepare(`INSERT INTO appeals (id, user_id, fraud_id, quality, note, cycle, status, created_at)
                    VALUES (?,?,?,?,?,?,?,?)`)
    .run(row.id, row.user_id, row.fraud_id, row.quality, row.note, row.cycle, row.status, row.created_at);

  return { appeal: { id: row.id, fraudId, fraudName: fraud.name, quality, cycle: row.cycle, status: row.status }, priority };
}, { auth: true });

/* ---- looksmaxxing desk ---- */
route('GET', /^\/api\/looksmax$/, (req, res, state) => {
  const q = (req.query.get('q') || '').trim().toLowerCase();
  const category = req.query.get('category');
  const tag = req.query.get('tag');
  let items = state.data.LOOKSMAX.slice();

  if (category && category !== 'all') items = items.filter(a => a.category === category);
  if (tag) items = items.filter(a => a.tags.indexOf(tag) > -1);
  if (q) items = items.filter(a =>
    a.title.toLowerCase().includes(q) || a.lede.toLowerCase().includes(q) ||
    a.tags.join(' ').toLowerCase().includes(q) || a.body.join(' ').toLowerCase().includes(q));

  if (req.query.get('saved') === '1') {
    if (!state.user) throw unauthorized('Sign in to see your saved articles.');
    const saved = new Set(state.db.prepare('SELECT article_id FROM bookmarks WHERE user_id = ?').all(state.user.id).map(r => r.article_id));
    items = items.filter(a => saved.has(a.id));
  }

  const sort = req.query.get('sort');
  if (sort === 'quick') items.sort((a, b) => a.readMinutes - b.readMinutes);

  return {
    total: items.length,
    categories: state.data.LOOKSMAX_CATEGORIES,
    articles: items
  };
});

route('GET', /^\/api\/looksmax\/([\w-]+)$/, (req, res, state, params) => {
  const i = state.data.LOOKSMAX.findIndex(a => a.id === params[0]);
  if (i < 0) throw notFound('No such article.');
  const article = state.data.LOOKSMAX[i];
  const related = state.data.LOOKSMAX
    .filter(a => a.id !== article.id && (a.category === article.category || a.tags.some(t => article.tags.includes(t))))
    .slice(0, 3);
  return { article, related, next: state.data.LOOKSMAX[i - 1] || null, prev: state.data.LOOKSMAX[i + 1] || null };
});

route('PUT', /^\/api\/bookmarks\/([\w-]+)$/, (req, res, state, params) => {
  if (!state.data.LOOKSMAX.some(a => a.id === params[0])) throw notFound('No such article.');
  state.db.prepare('INSERT OR IGNORE INTO bookmarks (user_id, article_id, created_at) VALUES (?,?,?)')
    .run(state.user.id, params[0], new Date().toISOString());
  return { saved: true, bookmarks: currentBookmarks(state) };
}, { auth: true });

route('DELETE', /^\/api\/bookmarks\/([\w-]+)$/, (req, res, state, params) => {
  state.db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND article_id = ?').run(state.user.id, params[0]);
  return { saved: false, bookmarks: currentBookmarks(state) };
}, { auth: true });

function currentBookmarks(state) {
  return state.db.prepare('SELECT article_id FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC').all(state.user.id).map(r => r.article_id);
}

/* ---- daily routine ---- */
route('GET', /^\/api\/routine$/, (req, res, state) => routineSummary(state.db, state.user.id), { auth: true });

route('POST', /^\/api\/routine$/, (req, res, state) => {
  const keys = Array.isArray(req.body.habits) ? req.body.habits : [];
  const valid = state.data.HABITS.map(h => h.key);
  const habits = [...new Set(keys.filter(k => valid.includes(k)))];

  const day = /^\d{4}-\d{2}-\d{2}$/.test(req.body.day || '') ? req.body.day : today();
  if (day > today()) throw bad('You cannot tick a day that has not happened.', 'day');

  state.db.prepare(`INSERT INTO routine_days (user_id, day, habits, updated_at) VALUES (?,?,?,?)
                    ON CONFLICT(user_id, day) DO UPDATE SET habits = excluded.habits, updated_at = excluded.updated_at`)
    .run(state.user.id, day, JSON.stringify(habits), new Date().toISOString());

  return routineSummary(state.db, state.user.id);
}, { auth: true });

/* ---- member grades ---- */
route('POST', /^\/api\/ratings$/, (req, res, state) => {
  const fraudId = str(req.body.fraudId, { field: 'fraudId', min: 1, max: 40, label: 'Fraud' });
  if (!state.db.prepare('SELECT 1 FROM frauds WHERE id = ?').get(fraudId)) throw notFound('No ranked Fraud with that id.');

  const score = Math.round(Number(req.body.score));
  if (!Number.isFinite(score) || score < 0 || score > 100) throw bad('A grade is between 0 and 100.', 'score');

  state.db.prepare(`INSERT INTO ratings (user_id, fraud_id, score, created_at) VALUES (?,?,?,?)
                    ON CONFLICT(user_id, fraud_id) DO UPDATE SET score = excluded.score, created_at = excluded.created_at`)
    .run(state.user.id, fraudId, score, new Date().toISOString());

  const fraud = rankedField(state).find(f => f.id === fraudId);
  return { score, community: fraud.community, panel: fraud.score };
}, { auth: true });

/* ---- the Fraud Test ---- */
route('POST', /^\/api\/self-test$/, (req, res, state) => {
  const stats = {};
  for (const c of state.data.CATEGORIES) {
    const v = Math.round(Number((req.body.stats || {})[c.key]));
    if (!Number.isFinite(v) || v < 0 || v > 100) throw bad('Grade every quality between 0 and 100.', c.key);
    stats[c.key] = v;
  }

  const score = dataset.overall({ stats }, state.data.CATEGORIES);
  const tier = dataset.tierOf(score);
  const field = rankedField(state);
  const wouldRank = field.filter(f => f.score > score).length + 1;

  const sorted = state.data.CATEGORIES.slice().sort((a, b) => stats[a.key] - stats[b.key]);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];
  const advice = state.data.LOOKSMAX.find(a => a.tags.includes(weakest.key) || a.category === weakest.key)
    || state.data.LOOKSMAX.find(a => a.category === 'frame');

  const row = {
    id: auth.id('tst'), user_id: state.user ? state.user.id : null,
    stats: JSON.stringify(stats), score: Number(score.toFixed(2)), tier: tier.label,
    would_rank: wouldRank, created_at: new Date().toISOString()
  };
  state.db.prepare('INSERT INTO self_tests (id, user_id, stats, score, tier, would_rank, created_at) VALUES (?,?,?,?,?,?,?)')
    .run(row.id, row.user_id, row.stats, row.score, row.tier, row.would_rank, row.created_at);

  return {
    id: row.id,
    score: Number(score.toFixed(1)),
    tier: tier,
    wouldRank,
    fieldSize: field.length,
    beats: field.filter(f => f.score < score).length,
    weakest: { key: weakest.key, label: weakest.label, value: stats[weakest.key] },
    strongest: { key: strongest.key, label: strongest.label, value: stats[strongest.key] },
    reading: advice ? { id: advice.id, title: advice.title, verdict: advice.verdict } : null,
    saved: !!state.user
  };
});

/* ---- what the verse is doing ---- */
route('GET', /^\/api\/activity$/, (req, res, state) => {
  const limit = Math.min(Math.max(parseInt(req.query.get('limit') || '12', 10) || 12, 1), 50);
  const rows = state.db.prepare(`
    SELECT * FROM (
      SELECT 'vote' AS kind, v.created_at AS at, u.name AS who, f.name AS subject, v.kind AS detail
        FROM votes v JOIN users u ON u.id = v.user_id JOIN frauds f ON f.id = v.fraud_id
      UNION ALL
      SELECT 'rating', r.created_at, u.name, f.name, CAST(r.score AS TEXT)
        FROM ratings r JOIN users u ON u.id = r.user_id JOIN frauds f ON f.id = r.fraud_id
      UNION ALL
      SELECT 'nomination', n.created_at, u.name, n.name, n.quality
        FROM nominations n JOIN users u ON u.id = n.user_id
      UNION ALL
      SELECT 'test', t.created_at, u.name, '', CAST(ROUND(t.score, 1) AS TEXT)
        FROM self_tests t JOIN users u ON u.id = t.user_id
      UNION ALL
      SELECT 'membership', o.created_at, u.name, o.plan, o.billing
        FROM orders o JOIN users u ON u.id = o.user_id
    ) ORDER BY at DESC LIMIT ?
  `).all(limit);

  /* first names only — the feed is public */
  return { events: rows.map(r => ({ kind: r.kind, at: r.at, who: String(r.who).split(' ')[0], subject: r.subject, detail: r.detail })) };
});

/* ---- membership ---- */
route('POST', /^\/api\/checkout$/, (req, res, state) => {
  const plan = plansOf(state).find(p => p.id === req.body.plan);
  if (!plan) throw bad('Unknown plan.', 'plan');
  if (!plan.price) throw bad('The Spectator plan is free — there is nothing to check out.', 'plan');

  const billing = req.body.billing === 'year' ? 'year' : 'month';
  const name = str(req.body.cardName, { field: 'cardName', min: 2, max: 80, label: 'Name on card' });

  const digits = String(req.body.card || '').replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) throw bad('A card number is sixteen digits.', 'card');
  if (!luhn(digits)) throw bad('That card number is not valid.', 'card');

  const m = String(req.body.exp || '').match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!m || +m[1] < 1 || +m[1] > 12) throw bad('Enter the expiry as MM/YY.', 'exp');
  if (new Date(2000 + +m[2], +m[1], 0) < new Date()) throw bad('That card has expired.', 'exp');

  const cvc = String(req.body.cvc || '');
  if (!/^\d{3,4}$/.test(cvc)) throw bad('Enter the three or four digit security code.', 'cvc');

  const months = billing === 'year' ? 10 : 1;              /* yearly billing gets two months free */
  const amountCents = plan.price * months * 100;

  const order = {
    id: auth.id('ord'), user_id: state.user.id, plan: plan.id, billing,
    amount_cents: amountCents, card_brand: cardBrand(digits), card_last4: digits.slice(-4),
    cycle: CURRENT_CYCLE, created_at: new Date().toISOString()
  };
  state.db.prepare(`INSERT INTO orders (id, user_id, plan, billing, amount_cents, card_brand, card_last4, cycle, created_at)
                    VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(order.id, order.user_id, order.plan, order.billing, order.amount_cents,
         order.card_brand, order.card_last4, order.cycle, order.created_at);

  state.db.prepare('UPDATE users SET plan = ? WHERE id = ?').run(plan.id, state.user.id);
  state.user.plan = plan.id;

  const next = new Date();
  if (billing === 'year') next.setFullYear(next.getFullYear() + 1); else next.setMonth(next.getMonth() + 1);

  return {
    order: {
      id: order.id, plan: plan.id, planName: plan.name, billing,
      amountCents, cardBrand: order.card_brand, cardLast4: order.card_last4,
      nextCharge: next.toISOString().slice(0, 10)
    },
    member: memberState(state, state.user)
  };
}, { auth: true });

route('POST', /^\/api\/membership\/cancel$/, (req, res, state) => {
  state.db.prepare("UPDATE users SET plan = 'spectator' WHERE id = ?").run(state.user.id);
  state.user.plan = 'spectator';
  return memberState(state, state.user);
}, { auth: true });

module.exports = { routes, ApiError, MAX_BODY, CURRENT_CYCLE, rankedField, memberState };
