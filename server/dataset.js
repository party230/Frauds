'use strict';
/* ============================================================
   Loads the canonical dataset from assets/js/data.js.
   That file is written for the browser (plain top-level vars) and is
   the single source of truth for both sides — evaluating it here keeps
   the server and the static fallback from drifting apart.
   ============================================================ */

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const DATA_FILE = path.join(__dirname, '..', 'assets', 'js', 'data.js');

function load() {
  const code = fs.readFileSync(DATA_FILE, 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  new vm.Script(code, { filename: 'data.js' }).runInContext(sandbox);

  const { CATEGORIES, FRAUDS, PLANS, NEWS, LOOKSMAX, LOOKSMAX_CATEGORIES, HABITS } = sandbox;
  const required = { CATEGORIES, FRAUDS, PLANS, NEWS, LOOKSMAX, LOOKSMAX_CATEGORIES, HABITS };
  for (const [name, value] of Object.entries(required)) {
    if (!Array.isArray(value)) throw new Error('assets/js/data.js did not define ' + name);
  }
  return required;
}

/* Ten qualities, weighted evenly — the same rule the frontend states. */
function overall(fraud, categories) {
  const v = categories.map(c => fraud.stats[c.key]);
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function tierOf(score) {
  if (score >= 95) return { key: 'mythic', label: 'Mythic' };
  if (score >= 91) return { key: 'elite', label: 'Elite' };
  if (score >= 87) return { key: 'ascending', label: 'Ascending' };
  if (score >= 83) return { key: 'contender', label: 'Contender' };
  return { key: 'prospect', label: 'Prospect' };
}

/* Seed sentiment: deterministic per Fraud so a fresh database still shows a
   plausible split. Real votes are added on top of this baseline. */
function baselineSentiment(fraud, categories) {
  const seed = fraud.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rise = 52 + ((seed * 7 + Math.round(overall(fraud, categories))) % 44);
  const total = 40 + (seed % 60);                 /* a plausible number of prior voters */
  return { rise: Math.round(total * rise / 100), over: total - Math.round(total * rise / 100) };
}

module.exports = { load, overall, tierOf, baselineSentiment, DATA_FILE };
