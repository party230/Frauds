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

/* The ranked field, highest aggregate first. */
function rankedField() {
  return FRAUDS
    .map(f => ({ ...f, score: overall(f), tier: tierOf(overall(f)) }))
    .sort((a, b) => b.score - a.score)
    .map((f, i) => ({ ...f, rank: i + 1 }));
}

function byId(id) {
  return rankedField().find(f => f.id === id) || null;
}

function regions() {
  return Array.from(new Set(FRAUDS.map(f => f.region.split(', ').pop()))).sort();
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

/* Deterministic community split so the figure is stable between visits. */
function sentiment(fraud) {
  const seed = fraud.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 52 + ((seed * 7 + Math.round(overall(fraud))) % 44);
  return { rise: base, over: 100 - base };
}

/* ---------- formatting ---------- */
const fmt = n => n.toFixed(1);

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

const CURRENT_CYCLE = 41;
