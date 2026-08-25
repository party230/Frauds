'use strict';
/* ============================================================
   SQLite storage. The schema is created and seeded on first boot;
   re-running is safe.
   ============================================================ */

const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const dataset = require('./dataset.js');

const DB_PATH = process.env.OFR_DB || path.join(__dirname, 'data', 'ofr.sqlite');

function open() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  migrate(db);
  seed(db);
  return db;
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL UNIQUE,
      pass_hash   TEXT NOT NULL,
      salt        TEXT NOT NULL,
      plan        TEXT NOT NULL DEFAULT 'spectator',
      created_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash  TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at  TEXT NOT NULL,
      expires_at  TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

    CREATE TABLE IF NOT EXISTS frauds (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      nickname       TEXT NOT NULL DEFAULT '',
      handle         TEXT NOT NULL,
      region         TEXT NOT NULL,
      age            INTEGER NOT NULL,
      joined         TEXT NOT NULL,
      movement       INTEGER NOT NULL,
      peak           INTEGER NOT NULL,
      weeks          INTEGER NOT NULL,
      tagline        TEXT NOT NULL,
      bio            TEXT NOT NULL,
      stats          TEXT NOT NULL,
      profile        TEXT NOT NULL DEFAULT '{}',
      baseline_rise  INTEGER NOT NULL DEFAULT 0,
      baseline_over  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS votes (
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      fraud_id   TEXT NOT NULL REFERENCES frauds(id) ON DELETE CASCADE,
      kind       TEXT NOT NULL CHECK (kind IN ('rise','over')),
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, fraud_id)
    );
    CREATE INDEX IF NOT EXISTS idx_votes_fraud ON votes(fraud_id);

    CREATE TABLE IF NOT EXISTS watchlist (
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      fraud_id   TEXT NOT NULL REFERENCES frauds(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, fraud_id)
    );

    CREATE TABLE IF NOT EXISTS nominations (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      handle     TEXT NOT NULL,
      region     TEXT NOT NULL DEFAULT '',
      quality    TEXT NOT NULL,
      note       TEXT NOT NULL,
      cycle      INTEGER NOT NULL,
      status     TEXT NOT NULL DEFAULT 'Under review',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_noms_user ON nominations(user_id, cycle);

    CREATE TABLE IF NOT EXISTS appeals (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      fraud_id   TEXT NOT NULL REFERENCES frauds(id) ON DELETE CASCADE,
      quality    TEXT NOT NULL,
      note       TEXT NOT NULL,
      cycle      INTEGER NOT NULL,
      status     TEXT NOT NULL DEFAULT 'Filed',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_appeals_user ON appeals(user_id, cycle);

    CREATE TABLE IF NOT EXISTS orders (
      id           TEXT PRIMARY KEY,
      user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan         TEXT NOT NULL,
      billing      TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      card_brand   TEXT NOT NULL,
      card_last4   TEXT NOT NULL,
      cycle        INTEGER NOT NULL,
      created_at   TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

    /* member grades: what the verse thinks, next to what the panel scored */
    CREATE TABLE IF NOT EXISTS ratings (
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      fraud_id   TEXT NOT NULL REFERENCES frauds(id) ON DELETE CASCADE,
      score      INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, fraud_id)
    );
    CREATE INDEX IF NOT EXISTS idx_ratings_fraud ON ratings(fraud_id);

    /* saved looksmaxxing articles */
    CREATE TABLE IF NOT EXISTS bookmarks (
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      article_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, article_id)
    );

    /* one row per member per day of the routine tracker */
    CREATE TABLE IF NOT EXISTS routine_days (
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day        TEXT NOT NULL,
      habits     TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, day)
    );

    /* self-assessments from the Fraud Test */
    CREATE TABLE IF NOT EXISTS self_tests (
      id          TEXT PRIMARY KEY,
      user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
      stats       TEXT NOT NULL,
      score       REAL NOT NULL,
      tier        TEXT NOT NULL,
      would_rank  INTEGER NOT NULL,
      created_at  TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_tests_user ON self_tests(user_id, created_at);
  `);

  /* nickname arrived after the first release */
  const cols = db.prepare('PRAGMA table_info(frauds)').all().map(c => c.name);
  if (!cols.includes('nickname')) db.exec("ALTER TABLE frauds ADD COLUMN nickname TEXT NOT NULL DEFAULT ''");
  if (!cols.includes('profile')) db.exec("ALTER TABLE frauds ADD COLUMN profile TEXT NOT NULL DEFAULT '{}'");
}

/* Frauds are reference data: refreshed from the dataset on every boot so
   editing assets/js/data.js stays the way to change the board. Member data
   is never touched here. */
function seed(db) {
  const { FRAUDS, CATEGORIES } = dataset.load();
  const up = db.prepare(`
    INSERT INTO frauds (id, name, nickname, handle, region, age, joined, movement, peak, weeks, tagline, bio, stats, profile, baseline_rise, baseline_over)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, nickname=excluded.nickname, handle=excluded.handle, region=excluded.region, age=excluded.age,
      joined=excluded.joined, movement=excluded.movement, peak=excluded.peak, weeks=excluded.weeks,
      tagline=excluded.tagline, bio=excluded.bio, stats=excluded.stats, profile=excluded.profile,
      baseline_rise=excluded.baseline_rise, baseline_over=excluded.baseline_over
  `);

  for (const f of FRAUDS) {
    const base = dataset.baselineSentiment(f, CATEGORIES);
    up.run(f.id, f.name, f.nickname || '', f.handle, f.region, f.age, f.joined, f.movement, f.peak, f.weeks,
           f.tagline, f.bio, JSON.stringify(f.stats), JSON.stringify(f.profile || {}), base.rise, base.over);
  }
}

module.exports = { open, DB_PATH };
