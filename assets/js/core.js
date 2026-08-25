/* ============================================================
   OFFICIAL FRAUD RANKINGS — scoring and formatting core
   ============================================================ */

/* Every quality is weighted evenly: ten qualities, 10% each. */
function overall(fraud) {
  const v = CATEGORIES.map(c => fraud.stats[c.key]);
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function tierOf(score) {
  if (score >= 95) return { key: 'mythic',    label: 'Mythic'    };
  if (score >= 91) return { key: 'elite',     label: 'Elite'     };
  if (score >= 87) return { key: 'ascending', label: 'Ascending' };
  if (score >= 83) return { key: 'contender', label: 'Contender' };
  return              { key: 'prospect',  label: 'Prospect'  };
}

/* The ranked field, highest aggregate first.
 * When the backend served the dataset the rows already carry score, rank,
 * tier and live sentiment; the local maths is the offline path. */
function rankedField() {
  if (FRAUDS.length && FRAUDS[0].rank != null) {
    return FRAUDS.slice().sort((a, b) => a.rank - b.rank).map(f => ({ ...f }));
  }
  return FRAUDS
    .map(f => ({ ...f, score: overall(f), tier: tierOf(overall(f)) }))
    .sort((a, b) => b.score - a.score)
    .map((f, i) => ({ ...f, rank: i + 1 }));
}

function byId(id) {
  return rankedField().find(f => f.id === id) || null;
}

function regions() {
  if (REGIONS.length) return REGIONS.slice();
  return Array.from(new Set(FRAUDS.map(f => f.region.split(', ').pop()))).sort();
}

/* ---------- dataset wiring ---------- *
 * data.js ships a bundled copy for the static fallback; when the backend
 * answers, its payload replaces it wholesale.
 */
var REGIONS = [];

function applyDataset(payload) {
  if (payload.categories) CATEGORIES = payload.categories;
  if (payload.frauds) FRAUDS = payload.frauds;
  if (payload.plans) PLANS = payload.plans;
  if (payload.news) NEWS = payload.news;
  if (payload.looksmax) LOOKSMAX = payload.looksmax;
  if (payload.looksmaxCategories) LOOKSMAX_CATEGORIES = payload.looksmaxCategories;
  if (payload.habits) HABITS = payload.habits;
  if (payload.regions) REGIONS = payload.regions;
  if (payload.cycle) CURRENT_CYCLE = payload.cycle;
}

function articleById(id) {
  return LOOKSMAX.find(a => a.id === id) || null;
}

function looksmaxCategory(key) {
  return LOOKSMAX_CATEGORIES.find(c => c.key === key) || { key: key, label: key };
}

/* "Parth Mehta" plus the name the verse actually uses. */
function displayName(fraud) {
  return fraud.nickname ? fraud.name + ' &ldquo;' + fraud.nickname + '&rdquo;' : fraud.name;
}

/* Fold a fresh tally from the server back into the cached board. */
function applySentiment(fraudId, tally) {
  const f = FRAUDS.find(x => x.id === fraudId);
  if (f) f.sentiment = tally;
}

/* Deterministic 12-cycle rank history ending on the current position.
 * Walks backwards from the current rank, drifting against the Fraud's
 * momentum and staying inside their peak / floor range.
 */
function rankHistory(fraud, size) {
  let s = fraud.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 977;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

  const ceiling = Math.min(size, fraud.rank + 11);
  const floor = fraud.peak;
  const clamp = v => Math.min(ceiling, Math.max(floor, v));
  const drift = fraud.movement > 0 ? 1 : fraud.movement < 0 ? -1 : 0;

  const out = [fraud.rank];
  let r = clamp(fraud.rank - fraud.movement);
  for (let i = 1; i < 12; i++) {
    out.unshift(r);
    r = clamp(r + drift + Math.round(rnd() * 4) - 2);
  }
  return out;
}

/* Community split. The backend returns real tallies; offline this is the
 * deterministic baseline the seed data was built from. */
function sentiment(fraud) {
  if (fraud && fraud.sentiment) return fraud.sentiment;
  const seed = fraud.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 52 + ((seed * 7 + Math.round(overall(fraud))) % 44);
  return { rise: base, over: 100 - base };
}

/* ---------- formatting ---------- *
 * Aggregates are shown to two decimals: cycle 41 separates first and second
 * by a hundredth of a point, and one decimal would hide it.
 */
const fmt = n => Number(n).toFixed(2);

function movementMarkup(n) {
  if (n > 0) return `<span class="mv up">&#9650; ${n}</span>`;
  if (n < 0) return `<span class="mv down">&#9660; ${Math.abs(n)}</span>`;
  return `<span class="mv flat">&mdash;</span>`;
}

function movementLabel(n) {
  if (n > 0) return 'Up ' + n;
  if (n < 0) return 'Down ' + Math.abs(n);
  return 'Unmoved';
}

function extremeQuality(fraud, highest) {
  const sorted = CATEGORIES.slice().sort((a, b) =>
    highest ? fraud.stats[b.key] - fraud.stats[a.key] : fraud.stats[a.key] - fraud.stats[b.key]);
  const c = sorted[0];
  return { label: c.label, value: fraud.stats[c.key], text: c.label + ' (' + fraud.stats[c.key] + ')' };
}

function planById(id) {
  return PLANS.find(p => p.id === id) || PLANS[0];
}

var CURRENT_CYCLE = 41;
