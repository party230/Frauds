/* ============================================================
   OFFICIAL FRAUD RANKINGS — profile page
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const id = new URLSearchParams(location.search).get('id');
  const field = rankedField();
  const fraud = (id && byId(id)) || field[0];
  const host = document.getElementById('profile');
  if (!host) return;

  document.title = fraud.name + ' | Official Fraud Rankings';

  /* ----- header ----- */
  const head = document.getElementById('profile-head');
  head.appendChild(avatar(fraud, 'av-lg'));

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `
    <div class="eyebrow">Rank #${fraud.rank} of ${field.length} · Cycle 41</div>
    <h1>${fraud.name}</h1>
    <div class="handle">${fraud.handle} · ${fraud.region} · ${fraud.age}</div>
    <div class="tags">
      <span class="tier tier-${fraud.tier.key}">${fraud.tier.label}</span>
      <span class="tier tier-prospect">${movementLabel(fraud.movement)}</span>
      <span class="tier tier-prospect">Peak #${fraud.peak}</span>
    </div>`;
  head.appendChild(meta);

  const big = document.createElement('div');
  big.className = 'big-score';
  big.innerHTML = `<div class="v">${fmt(fraud.score)}</div><div class="l">Aggregate grade</div>`;
  head.appendChild(big);

  /* ----- quality breakdown ----- */
  const bars = document.getElementById('bars');
  CATEGORIES.forEach(c => {
    const v = fraud.stats[c.key];
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <div class="bl" title="${c.blurb}">${c.label}</div>
      <div class="bar-track"><div class="bar-fill"></div></div>
      <div class="bv">${v}</div>`;
    bars.appendChild(row);
    requestAnimationFrame(() => { row.querySelector('.bar-fill').style.width = v + '%'; });
  });

  /* ----- rank history ----- */
  drawHistory(fraud, field.length);

  /* ----- panel notes ----- */
  document.getElementById('bio').textContent = fraud.bio;
  document.getElementById('tagline').textContent = fraud.tagline;

  /* ----- record ----- */
  const s = sentiment(fraud);
  document.getElementById('kv').innerHTML = [
    ['Current rank', '#' + fraud.rank],
    ['Peak rank', '#' + fraud.peak],
    ['Cycle movement', movementLabel(fraud.movement)],
    ['Cycles ranked', fraud.weeks],
    ['Entered board', fraud.joined],
    ['Strongest quality', best(fraud, true)],
    ['Weakest quality', best(fraud, false)],
    ['Community sentiment', s.rise + '% rising']
  ].map(([k, v]) => `<div><span>${k}</span><span>${v}</span></div>`).join('');

  /* ----- vote ----- */
  document.getElementById('vote-host').appendChild(voteControls(fraud));

  /* ----- neighbours ----- */
  const near = field.filter(f => Math.abs(f.rank - fraud.rank) <= 2 && f.id !== fraud.id).slice(0, 4);
  document.getElementById('nearby').innerHTML = near.map(f => `
    <a class="card" href="profile.html?id=${f.id}">
      <div class="num-tag">Rank #${f.rank} · ${f.tier.label}</div>
      <h3>${f.name}</h3>
      <p>${f.tagline}</p>
    </a>`).join('');
});

function movementLabel(n) {
  if (n > 0) return 'Up ' + n;
  if (n < 0) return 'Down ' + Math.abs(n);
  return 'Unmoved';
}

function best(fraud, highest) {
  const sorted = CATEGORIES.slice().sort((a, b) =>
    highest ? fraud.stats[b.key] - fraud.stats[a.key] : fraud.stats[a.key] - fraud.stats[b.key]);
  const c = sorted[0];
  return c.label + ' (' + fraud.stats[c.key] + ')';
}

/* Deterministic 12-cycle rank history ending on the current position.
 * Walks backwards from the current rank, drifting against the Fraud's momentum
 * and staying inside their peak / floor range.
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

function drawHistory(fraud, size) {
  const host = document.getElementById('spark');
  if (!host) return;
  const pts = rankHistory(fraud, size);
  const W = 560, H = 168, PAD = 22;
  const lo = Math.max(1, Math.min.apply(null, pts) - 2);
  const hi = Math.min(size, Math.max.apply(null, pts) + 2);
  const x = i => PAD + (i * (W - PAD * 2)) / (pts.length - 1);
  const y = v => PAD + ((v - lo) / (hi - lo || 1)) * (H - PAD * 2);   /* rank 1 sits at the top */

  const line = pts.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
  const area = line + ' L' + x(pts.length - 1).toFixed(1) + ' ' + (H - PAD) + ' L' + PAD + ' ' + (H - PAD) + ' Z';

  host.innerHTML =
    '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Rank across the last twelve cycles">' +
      '<line class="grid-line" x1="' + PAD + '" y1="' + PAD + '" x2="' + (W - PAD) + '" y2="' + PAD + '"/>' +
      '<line class="grid-line" x1="' + PAD + '" y1="' + (H / 2) + '" x2="' + (W - PAD) + '" y2="' + (H / 2) + '"/>' +
      '<line class="grid-line" x1="' + PAD + '" y1="' + (H - PAD) + '" x2="' + (W - PAD) + '" y2="' + (H - PAD) + '"/>' +
      '<path class="area" d="' + area + '"/>' +
      '<path class="path" d="' + line + '"/>' +
      pts.map((v, i) => '<circle class="dot" cx="' + x(i).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="' + (i === pts.length - 1 ? 4 : 2.5) + '"/>').join('') +
      '<text class="lbl" x="' + PAD + '" y="' + (H - 6) + '">CYCLE 30</text>' +
      '<text class="lbl" x="' + (W - PAD) + '" y="' + (H - 6) + '" text-anchor="end">CYCLE 41</text>' +
      '<text class="lbl" x="' + PAD + '" y="' + (PAD - 8) + '">#' + lo + '</text>' +
      '<text class="lbl" x="' + PAD + '" y="' + (H - PAD - 8) + '">#' + hi + '</text>' +
    '</svg>';
}
