/* ============================================================
   OFFICIAL FRAUD RANKINGS — profile page
   ============================================================ */

App.ready(() => {
  const host = document.getElementById('profile');
  if (!host) return;

  const id = new URLSearchParams(location.search).get('id');
  const field = rankedField();
  const fraud = (id && byId(id)) || field[0];
  document.title = fraud.name + ' | Official Fraud Rankings';

  /* ----- masthead ----- */
  const head = document.getElementById('profile-head');
  const psl = pslOf(fraud), appeal = appealOf(fraud);

  head.innerHTML = `
    <div class="mag-numeral" aria-hidden="true">${String(fraud.rank).padStart(2, '0')}</div>
    <div class="mag-lead">
      <div class="mag-eyebrow">Rank #${fraud.rank} of ${field.length} &middot; Cycle ${CURRENT_CYCLE}</div>
      <h1 class="mag-name">${fraud.name}</h1>
      ${fraud.nickname ? `<div class="mag-nick">&ldquo;${fraud.nickname}&rdquo;</div>` : ''}
      <div class="mag-sub">${fraud.handle} &middot; ${fraud.region} &middot; ${fraud.age} &middot; ${fraud.weeks} cycles ranked</div>
      <div class="profile-actions"></div>
    </div>
    <div class="mag-portrait"></div>`;

  head.querySelector('.mag-portrait').appendChild(avatar(fraud, 'av-xl'));

  const actions = head.querySelector('.profile-actions');
  actions.appendChild(watchButton(fraud, true));
  actions.insertAdjacentHTML('beforeend', `
    <a class="btn btn-sm" href="compare.html?a=${fraud.id}">Compare head to head</a>
    <a class="btn btn-sm" href="contact.html#appeal">Appeal a grade</a>`);

  /* ----- the figures strip ----- */
  const pslRank = field.slice().sort((x, y) => pslOf(y) - pslOf(x)).findIndex(f => f.id === fraud.id) + 1;
  const appealRank = field.slice().sort((x, y) => appealOf(y) - appealOf(x)).findIndex(f => f.id === fraud.id) + 1;

  const figures = document.getElementById('readings');
  figures.innerHTML = [
    { v: fmt(fraud.score), l: 'Aggregate', r: 'Flat mean of ten', big: true },
    { v: fraud.tier.label, l: 'Tier', r: fraud.tier.key === 'mythic' ? '95.00 and above' : 'By aggregate', word: true },
    { v: psl.toFixed(1), l: 'PSL', r: '#' + pslRank + ' on structure &middot; ' + pslLabel(psl) },
    { v: appeal.toFixed(1), l: 'Appeal', r: '#' + appealRank + ' in a room' },
    { v: movementLabel(fraud.movement), l: 'This cycle', r: 'Peak #' + fraud.peak, word: true }
  ].map(f => `
    <div class="fig${f.big ? ' fig-lead' : ''}">
      <div class="fig-v${f.word ? ' fig-word' : ''}">${f.v}</div>
      <div class="fig-l">${f.l}</div>
      <div class="fig-r">${f.r}</div>
    </div>`).join('');
  figures.classList.add('show');

  /* ----- quality breakdown ----- */
  const bars = document.getElementById('bars');
  const boardAvg = k => FRAUDS.reduce((a, f) => a + f.stats[k], 0) / FRAUDS.length;

  CATEGORIES.forEach(c => {
    const v = fraud.stats[c.key];
    const avg = boardAvg(c.key);
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <div class="bl" title="${c.blurb}">${c.label}</div>
      <div class="bar-track">
        <div class="bar-fill"></div>
        <div class="bar-avg" style="left:${avg}%" title="Board average ${avg.toFixed(1)}"></div>
      </div>
      <div class="bv">${v}</div>`;
    bars.appendChild(row);
    requestAnimationFrame(() => { row.querySelector('.bar-fill').style.width = v + '%'; });
  });

  /* ----- rank history ----- */
  drawHistory(fraud, field.length);

  /* ----- panel notes ----- */
  document.getElementById('tagline').textContent = fraud.tagline;
  document.getElementById('bio').textContent = fraud.bio;

  /* ----- record ----- */
  const s = sentiment(fraud);
  document.getElementById('kv').innerHTML = [
    ['Current rank', '#' + fraud.rank],
    ['Peak rank', '#' + fraud.peak],
    ['Cycle movement', movementLabel(fraud.movement)],
    ['Cycles ranked', fraud.weeks],
    ['Entered board', fraud.joined],
    ['Strongest quality', extremeQuality(fraud, true).text],
    ['Weakest quality', extremeQuality(fraud, false).text],
    ['Community sentiment', s.rise + '% rising']
  ].map(([k, v]) => `<div><span>${k}</span><span>${v}</span></div>`).join('');

  /* ----- vote ----- */
  document.getElementById('vote-host').appendChild(voteControls(fraud));

  /* ----- the dossier ----- */
  renderDossier(fraud, field);

  /* ----- what the verse grades him ----- */
  initCommunityGrade(fraud);

  /* ----- neighbours ----- */
  const near = field.filter(f => Math.abs(f.rank - fraud.rank) <= 2 && f.id !== fraud.id).slice(0, 4);
  document.getElementById('nearby').innerHTML = near.map(f => `
    <a class="card" href="profile.html?id=${f.id}">
      <div class="num-tag">Rank #${f.rank} · ${f.tier.label}</div>
      <h3>${f.name}</h3>
      <p>${f.tagline}</p>
      <span class="read-on">Compare &rarr;</span>
    </a>`).join('');
});

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
      pts.map((v, i) => '<circle class="dot" cx="' + x(i).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="' + (i === pts.length - 1 ? 4 : 2.5) + '"><title>Cycle ' + (CURRENT_CYCLE - 11 + i) + ' · #' + v + '</title></circle>').join('') +
      '<text class="lbl" x="' + PAD + '" y="' + (H - 6) + '">CYCLE ' + (CURRENT_CYCLE - 11) + '</text>' +
      '<text class="lbl" x="' + (W - PAD) + '" y="' + (H - 6) + '" text-anchor="end">CYCLE ' + CURRENT_CYCLE + '</text>' +
      '<text class="lbl" x="' + PAD + '" y="' + (PAD - 8) + '">#' + lo + '</text>' +
      '<text class="lbl" x="' + PAD + '" y="' + (H - PAD - 8) + '">#' + hi + '</text>' +
    '</svg>';
}


/* Members grade a Fraud themselves; the average sits next to the panel's. */
function initCommunityGrade(fraud) {
  const host = document.getElementById('grade-host');
  if (!host) return;

  function draw(community, mine) {
    const avg = community && community.count ? community.average : null;
    const gap = avg == null ? null : (avg - fraud.score);

    host.innerHTML = `
      <div class="grade-compare">
        <div class="gc-cell">
          <span class="gc-v">${fmt(fraud.score)}</span>
          <span class="gc-l">Panel</span>
        </div>
        <div class="gc-cell">
          <span class="gc-v ${avg == null ? 'dim' : ''}">${avg == null ? '—' : avg.toFixed(1)}</span>
          <span class="gc-l">The verse${community && community.count ? ' · ' + community.count + (community.count === 1 ? ' grade' : ' grades') : ''}</span>
        </div>
      </div>
      ${gap == null ? '' : `<p class="gc-note">${Math.abs(gap) < 1
        ? 'The verse and the panel agree within a point.'
        : (gap > 0 ? 'Members grade him ' + gap.toFixed(1) + ' points higher than the panel does.'
                   : 'Members grade him ' + Math.abs(gap).toFixed(1) + ' points lower than the panel does.')}</p>`}
      <div class="slider-row grade-row">
        <label for="my-grade">Your grade</label>
        <input id="my-grade" type="range" min="0" max="100" step="1" value="${mine == null ? Math.round(fraud.score) : mine}">
        <output id="my-grade-out">${mine == null ? Math.round(fraud.score) : mine}</output>
      </div>
      <button class="btn btn-gold btn-sm btn-block" type="button" id="submit-grade">${mine == null ? 'Submit your grade' : 'Update your grade'}</button>`;

    const slider = host.querySelector('#my-grade');
    const out = host.querySelector('#my-grade-out');
    slider.addEventListener('input', () => { out.textContent = slider.value; });

    host.querySelector('#submit-grade').addEventListener('click', async ev => {
      if (!Store.isSignedIn()) return promptSignIn();
      const btn = ev.currentTarget;
      btn.disabled = true;
      try {
        const res = await Store.rate(fraud.id, +slider.value);
        draw(res.community, res.score);
        toast('Graded ' + fraud.name + ' at ' + res.score + '.');
      } catch (err) {
        apiFail(err, 'That grade did not save.');
        btn.disabled = false;
      }
    });
  }

  draw(fraud.community, Store.ratingFor(fraud.id));
}


/* Everything the panel publishes beyond the ten grades. Frauds without a
   dossier simply do not render these sections. */
function renderDossier(fraud, field) {
  const pr = fraud.profile || {};

  const status = document.getElementById('status-line');
  if (status && pr.status) {
    status.innerHTML = `<span class="status-pill">${pr.status}</span>`;
    status.classList.add('show');
  }

  const quote = document.getElementById('quote-card');
  if (quote && pr.quote) {
    quote.innerHTML = `
      <blockquote class="pull-quote">${pr.quote}</blockquote>
      <div class="quote-foot">
        <span class="quote-by">${fraud.name}${fraud.nickname ? ', &ldquo;' + fraud.nickname + '&rdquo;' : ''}</span>
        ${pr.signature ? `<p class="sig-line">${pr.signature}</p>` : ''}
      </div>`;
    quote.classList.add('show');
  }

  const vitals = document.getElementById('vitals');
  if (vitals && pr.vitals) {
    vitals.innerHTML = `<div class="kv">${pr.vitals.map(([k, v]) => `<div><span>${k}</span><span>${v}</span></div>`).join('')}</div>`;
    vitals.closest('.card').classList.add('show-card');
  }

  const lanes = document.getElementById('lanes');
  if (lanes && (pr.strengths || pr.watch)) {
    lanes.innerHTML = `
      ${pr.strengths ? `<div class="lane-block"><div class="num-tag">Carrying the profile</div><ul class="check-list">${pr.strengths.map(x => `<li>${x}</li>`).join('')}</ul></div>` : ''}
      ${pr.watch ? `<div class="lane-block"><div class="num-tag">Panel is watching</div><ul class="warn-list">${pr.watch.map(x => `<li>${x}</li>`).join('')}</ul></div>` : ''}`;
    lanes.closest('.card').classList.add('show-card');
  }

  const ventures = document.getElementById('ventures');
  if (ventures && pr.ventures) {
    ventures.innerHTML = pr.ventures.map(v => `
      <div class="venture"><strong>${v.name}</strong><span>${v.note}</span></div>`).join('');
    ventures.closest('.card').classList.add('show-card');
  }

  const protocol = document.getElementById('protocol');
  if (protocol && pr.protocol) {
    protocol.innerHTML = `<ul class="check-list">${pr.protocol.map(x => `<li>${x}</li>`).join('')}</ul>`;
    protocol.closest('.card').classList.add('show-card');
  }

  const timeline = document.getElementById('timeline');
  if (timeline && pr.milestones) {
    timeline.innerHTML = pr.milestones.map(m => `
      <div class="mile">
        <span class="mile-cycle">Cycle ${m.cycle}</span>
        <span class="mile-note">${m.note}</span>
      </div>`).join('');
    timeline.closest('.card').classList.add('show-card');
  }

  const rival = document.getElementById('rival-card');
  if (rival && pr.rival) {
    const other = field.find(f => f.id === pr.rival);
    if (other) {
      const gap = Math.abs(fraud.score - other.score);
      rival.innerHTML = `
        <div class="num-tag">The rivalry</div>
        <h3>${fraud.name.split(' ')[0]} vs ${other.name.split(' ')[0]}</h3>
        <p>${gap < 0.5
          ? `Separated by <strong>${fmt(gap)}</strong> points — the closest pairing the board has ever produced.`
          : `${other.name} sits ${fmt(gap)} points ${other.score > fraud.score ? 'ahead' : 'behind'} at #${other.rank}.`}</p>
        <div class="profile-actions" style="margin-top:16px">
          ${(fraud.id === 'f001' && other.id === 'f002') || (fraud.id === 'f002' && other.id === 'f001')
            ? '<a class="btn btn-gold btn-sm" href="rivalry.html">Open the rivalry page</a>' : ''}
          <a class="btn btn-sm" href="compare.html?a=${fraud.id}&b=${other.id}">Head to head</a>
        </div>`;
      rival.classList.add('show');
    }
  }
}
