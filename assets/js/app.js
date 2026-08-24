/* ============================================================
   OFFICIAL FRAUD RANKINGS — shared logic
   ============================================================ */

/* ---------- scoring ---------- *
 * Every quality is weighted evenly: ten qualities, 10% each.
 */
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

/* Ranked field, highest aggregate first. */
function rankedField() {
  return FRAUDS
    .map(f => ({ ...f, score: overall(f), tier: tierOf(overall(f)) }))
    .sort((a, b) => b.score - a.score)
    .map((f, i) => ({ ...f, rank: i + 1 }));
}

function byId(id) {
  return rankedField().find(f => f.id === id) || null;
}

/* ---------- presentation helpers ---------- */
const AV_HUES = [42, 12, 205, 268, 150, 330, 190, 88];

function initials(name) {
  return name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function avatar(fraud, cls) {
  const hue = AV_HUES[parseInt(fraud.id.slice(1), 10) % AV_HUES.length];
  const el = document.createElement('div');
  el.className = 'av ' + (cls || '');
  el.style.background = `linear-gradient(150deg, hsl(${hue} 62% 68%), hsl(${(hue + 34) % 360} 54% 44%))`;
  el.textContent = initials(fraud.name);
  return el;
}

function movementMarkup(n) {
  if (n > 0) return `<span class="mv up">&#9650; ${n}</span>`;
  if (n < 0) return `<span class="mv down">&#9660; ${Math.abs(n)}</span>`;
  return `<span class="mv flat">&mdash;</span>`;
}

const fmt = n => n.toFixed(1);

/* ---------- community votes (stored per browser) ---------- */
const VOTE_KEY = 'ofr.votes.v1';

function loadVotes() {
  try { return JSON.parse(localStorage.getItem(VOTE_KEY)) || {}; }
  catch (e) { return {}; }
}

function saveVotes(v) {
  try { localStorage.setItem(VOTE_KEY, JSON.stringify(v)); } catch (e) { /* private mode */ }
}

function castVote(id, kind) {
  const votes = loadVotes();
  votes[id] = votes[id] === kind ? null : kind;
  saveVotes(votes);
  return votes[id];
}

/* Deterministic community split so the figure is stable between visits. */
function sentiment(fraud) {
  const seed = fraud.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 52 + ((seed * 7 + Math.round(overall(fraud))) % 44);
  return { rise: base, over: 100 - base };
}

function voteControls(fraud) {
  const wrap = document.createElement('div');
  wrap.className = 'votes';
  const s = sentiment(fraud);
  const current = loadVotes()[fraud.id];

  [['rise', 'Rising ' + s.rise + '%'], ['over', 'Overrated ' + s.over + '%']].forEach(([kind, label]) => {
    const b = document.createElement('button');
    b.className = 'vote ' + kind + (current === kind ? ' cast' : '');
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', ev => {
      ev.stopPropagation();
      const now = castVote(fraud.id, kind);
      wrap.querySelectorAll('.vote').forEach(x => x.classList.remove('cast'));
      if (now) b.classList.add('cast');
    });
    wrap.appendChild(b);
  });
  return wrap;
}

/* ---------- nav ---------- */
function initNav() {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  if (burger && nav) burger.addEventListener('click', () => nav.classList.toggle('open'));

  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav a').forEach(a => {
    if ((a.getAttribute('href') || '').toLowerCase() === here) a.classList.add('on');
  });
}

/* ---------- ticker ---------- */
function initTicker() {
  const track = document.querySelector('.ticker-track');
  if (!track) return;
  const field = rankedField();
  const movers = field.filter(f => f.movement !== 0)
    .sort((a, b) => Math.abs(b.movement) - Math.abs(a.movement))
    .slice(0, 10);

  track.innerHTML = movers.map(f => {
    const cls = f.movement > 0 ? 'u' : 'd';
    const arr = f.movement > 0 ? '&#9650;' : '&#9660;';
    return `<span><b>${f.name}</b> #${f.rank} <i class="${cls}">${arr} ${Math.abs(f.movement)}</i> · ${fmt(f.score)}</span>`;
  }).join('') + `<span>Cycle 41 · Board refreshed every 48 hours · <b>Submissions open</b></span>`;
}

/* ---------- leaderboard ---------- */
function initBoard() {
  const board = document.getElementById('board');
  if (!board) return;

  const search = document.getElementById('search');
  const sort = document.getElementById('sort');
  const chips = Array.from(document.querySelectorAll('.chip'));
  let tier = 'all';

  function render() {
    const q = (search ? search.value : '').trim().toLowerCase();
    let field = rankedField();

    if (q) field = field.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.handle.toLowerCase().includes(q) ||
      f.region.toLowerCase().includes(q));

    if (tier !== 'all') field = field.filter(f => f.tier.key === tier);

    const mode = sort ? sort.value : 'rank';
    if (mode === 'movers') field.sort((a, b) => b.movement - a.movement || a.rank - b.rank);
    else if (mode === 'fallers') field.sort((a, b) => a.movement - b.movement || a.rank - b.rank);
    else if (mode === 'name') field.sort((a, b) => a.name.localeCompare(b.name));
    else if (mode === 'newest') field.sort((a, b) => a.weeks - b.weeks || a.rank - b.rank);
    else field.sort((a, b) => a.rank - b.rank);

    board.innerHTML = '';
    if (!field.length) {
      board.innerHTML = '<div class="empty">No ranked Fraud matches that filter.</div>';
      return;
    }

    field.forEach(f => {
      const row = document.createElement('div');
      row.className = 'row' + (f.rank <= 3 ? ' top3' : '');
      row.addEventListener('click', () => { location.href = 'profile.html?id=' + f.id; });

      const rank = document.createElement('div');
      rank.className = 'rank';
      rank.textContent = f.rank;

      const mv = document.createElement('div');
      mv.innerHTML = movementMarkup(f.movement);

      const who = document.createElement('div');
      who.className = 'who';
      who.appendChild(avatar(f, 'av-sm'));
      const nm = document.createElement('div');
      nm.innerHTML = `<div class="nm">${f.name}</div><div class="mt">${f.handle} · ${f.region}</div>`;
      who.appendChild(nm);

      const sc = document.createElement('div');
      sc.className = 'score';
      sc.textContent = fmt(f.score);

      const tc = document.createElement('div');
      tc.className = 'tier-cell';
      tc.innerHTML = `<span class="tier tier-${f.tier.key}">${f.tier.label}</span>`;

      row.append(rank, mv, who, sc, tc, voteControls(f));
      board.appendChild(row);
    });
  }

  if (search) search.addEventListener('input', render);
  if (sort) sort.addEventListener('change', render);
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.classList.remove('on'));
    c.classList.add('on');
    tier = c.dataset.tier;
    render();
  }));

  render();
}

/* ---------- podium ---------- */
function initPodium() {
  const host = document.getElementById('podium-host');
  if (!host) return;

  rankedField().slice(0, 3).forEach(f => {
    const pod = document.createElement('div');
    pod.className = 'pod' + (f.rank === 1 ? ' first' : '');
    pod.innerHTML = `<div class="rk">${f.rank}</div>`;
    pod.appendChild(avatar(f));
    pod.insertAdjacentHTML('beforeend', `
      <h3>${f.name}</h3>
      <div class="hd">${f.handle} · ${f.region}</div>
      <div class="sc">${fmt(f.score)}<small>Aggregate grade</small></div>
      <div class="tl">${f.tagline}</div>
      <a class="btn ${f.rank === 1 ? 'btn-gold' : ''} btn-block" href="profile.html?id=${f.id}">View profile</a>
    `);
    host.appendChild(pod);
  });
}

/* ---------- headline numbers ---------- */
function initStats() {
  const host = document.getElementById('stat-strip');
  if (!host) return;
  const field = rankedField();
  const top = field[0];
  const risers = field.filter(f => f.movement > 0).length;

  host.innerHTML = [
    [field.length, 'Ranked Frauds'],
    [fmt(top.score), 'Top aggregate'],
    [risers, 'Risers this cycle'],
    ['48h', 'Refresh interval']
  ].map(([n, l]) => `<div><div class="n">${n}</div><div class="l">${l}</div></div>`).join('');
}

/* ---------- contact / submission forms ---------- */
function initForms() {
  document.querySelectorAll('form[data-notice]').forEach(form => {
    form.addEventListener('submit', ev => {
      ev.preventDefault();
      const notice = document.getElementById(form.dataset.notice);
      if (notice) {
        notice.classList.add('show');
        notice.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      form.reset();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initTicker();
  initStats();
  initPodium();
  initBoard();
  initForms();
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});
