'use strict';
/* ============================================================
   Passwords and sessions.
   - passwords: scrypt with a per-user random salt, compared in constant time
   - sessions : 32 random bytes sent as an HttpOnly cookie; only the SHA-256
                of the token is stored, so a database copy cannot be replayed
   ============================================================ */

const crypto = require('node:crypto');

const SESSION_DAYS = 30;
const COOKIE = 'ofr_session';
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

function id(prefix) {
  return prefix + '_' + crypto.randomBytes(9).toString('base64url');
}

function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, SCRYPT.keylen, SCRYPT).toString('hex');
  return { hash, salt };
}

function verifyPassword(password, salt, expected) {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const tokenHash = token => crypto.createHash('sha256').update(token).digest('hex');

function createSession(db, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 864e5);
  db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?,?,?,?)')
    .run(tokenHash(token), userId, now.toISOString(), expires.toISOString());
  return { token, expires };
}

function destroySession(db, token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash(token));
}

function userForToken(db, token) {
  if (!token) return null;
  const row = db.prepare(`
    SELECT u.* FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `).get(tokenHash(token), new Date().toISOString());
  return row || null;
}

function sweepSessions(db) {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString());
}

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach(part => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function sessionCookie(token, expires, secure) {
  return [
    COOKIE + '=' + token,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Expires=' + expires.toUTCString(),
    secure ? 'Secure' : null
  ].filter(Boolean).join('; ');
}

function clearCookie(secure) {
  return [COOKIE + '=', 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0', secure ? 'Secure' : null]
    .filter(Boolean).join('; ');
}

module.exports = {
  COOKIE, id, hashPassword, verifyPassword, createSession, destroySession,
  userForToken, sweepSessions, parseCookies, sessionCookie, clearCookie
};
