/* ============================================================
   OFFICIAL FRAUD RANKINGS — the Fraud Test
   Grade yourself on the same ten qualities and see where the
   aggregate would place you on the board.
   ============================================================ */

App.ready(() => {
  const host = document.getElementById('test');
  if (!host) return;

  const sliders = document.getElementById('sliders');
  const live = document.getElementById('live');
  const result = document.getElementById('result');
  const params = new URLSearchParams(location.search);

  /* a shared result carries its grades in the URL */
  const shared = decodeStats(params.get('s'));
  const stats = {};
  CATEGORIES.forEach(c => { stats[c.key] = shared ? shared[c.key] : 70; });

  sliders.innerHTML = CATEGORIES.map(c => `
    <div class="slider-row">
      <label for="q-${c.key}">${c.label}<em>${c.blurb}</em></label>
      <input id="q-${c.key}" type="range" min="0" max="100" step="1" value="${stats[c.key]}" data-q="${c.key}">
      <output for="q-${c.key}" id="out-${c.key}">${stats[c.key]}</output>
    </div>`).join('');

  sliders.querySelectorAll('input[type=range]').forEach(input => {
    input.addEventListener('input', () => {
      stats[input.dataset.q] = +input.value;
      document.getElementById('out-' + input.dataset.q).textContent = input.value;
      drawLive();
    });
  });

  function drawLive() {
    const score = CATEGORIES.reduce((a, c) => a + stats[c.key], 0) / CATEGORIES.length;
    const tier = tierOf(score);
    const field = rankedField();
    const rank = field.filter(f => f.score > score).length + 1;

    live.innerHTML = `
      <div class="live-score">${fmt(score)}<small>Running aggregate</small></div>
      <div class="live-meta">
        <span class="tier tier-${tier.key}">${tier.label}</span>
        <span class="tier tier-prospect">${rank > field.length ? 'Unranked' : 'Would enter #' + rank}</span>
      </div>`;
  }

  document.getElementById('randomise').addEventListener('click', () => {
    CATEGORIES.forEach(c => {
      stats[c.key] = 45 + Math.floor(Math.random() * 50);
      const input = document.getElementById('q-' + c.key);
      input.value = stats[c.key];
      document.getElementById('out-' + c.key).textContent = stats[c.key];
    });
    drawLive();
  });

  document.getElementById('honest').addEventListener('click', () => {
    CATEGORIES.forEach(c => {
      stats[c.key] = 50;
      const input = document.getElementById('q-' + c.key);
      input.value = 50;
      document.getElementById('out-' + c.key).textContent = 50;
    });
    drawLive();
    toast('Reset to a flat fifty. Now be honest.');
  });

  document.getElementById('grade-me').addEventListener('click', async ev => {
    const btn = ev.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Grading…';
    try {
      const res = await Store.runTest(Object.assign({}, stats));
      showResult(res);
    } catch (err) {
      apiFail(err, 'The panel could not grade that.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Grade me';
    }
  });

  function showResult(res) {
    const field = rankedField();
    const ahead = field.filter(f => f.score > res.score).slice(-1)[0];
    const behind = field.filter(f => f.score < res.score)[0];

    result.innerHTML = `
      <div class="num-tag">Panel verdict · cycle ${CURRENT_CYCLE}</div>
      <div class="result-top">
        <div class="big-score"><div class="v">${fmt(res.score)}</div><div class="l">Your aggregate</div></div>
        <div class="result-lines">
          <div class="tags">
            <span class="tier tier-${res.tier.key}">${res.tier.label}</span>
            <span class="tier tier-prospect">${res.wouldRank > res.fieldSize ? 'Below the board' : 'Would enter at #' + res.wouldRank}</span>
            <span class="tier tier-prospect">Beats ${res.beats} of ${res.fieldSize}</span>
          </div>
          <p>Strongest lane is <strong>${res.strongest.label}</strong> at ${res.strongest.value}. The one costing you the most is
             <strong>${res.weakest.label}</strong> at ${res.weakest.value} — and since every quality is worth exactly 10%, that is
             ${((res.strongest.value - res.weakest.value) / 10).toFixed(1)} points of aggregate sitting on the table.</p>
          ${ahead ? `<p class="dim-line">Directly above you: <a href="profile.html?id=${ahead.id}">#${ahead.rank} ${ahead.name}</a> on ${fmt(ahead.score)}.${behind ? ` Directly below: <a href="profile.html?id=${behind.id}">#${behind.rank} ${behind.name}</a> on ${fmt(behind.score)}.` : ''}</p>` : ''}
        </div>
      </div>

      ${res.reading ? `
        <div class="result-read">
          <div class="num-tag">Prescribed reading</div>
          <a href="looksmax-article.html?id=${res.reading.id}"><strong>${res.reading.title}</strong></a>
          <span>${res.reading.verdict}</span>
        </div>` : ''}

      <div class="profile-actions">
        <button class="btn btn-gold btn-sm" type="button" id="share-result">Copy share link</button>
        <a class="btn btn-sm" href="looksmax.html">Open the looksmax desk</a>
        ${res.saved ? '<a class="btn btn-sm" href="account.html">See your test history</a>'
                    : '<a class="btn btn-sm" href="signup.html?next=test.html">Save results to an account</a>'}
      </div>`;
    result.classList.add('show');
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    document.getElementById('share-result').addEventListener('click', async () => {
      const url = location.origin + location.pathname + '?s=' + encodeStats(stats);
      try {
        await navigator.clipboard.writeText(url);
        toast('Share link copied.');
      } catch (e) {
        modal('Your result link', `<p class="share-url">${url}</p>`);
      }
    });
  }

  drawLive();
  if (shared) toast('Loaded a shared result. Move a slider to make it yours.');
});

/* Grades ride in the URL as two digits each, in category order. */
function encodeStats(stats) {
  return CATEGORIES.map(c => String(Math.min(99, stats[c.key])).padStart(2, '0')).join('');
}

function decodeStats(code) {
  if (!code || code.length !== CATEGORIES.length * 2 || /\D/.test(code)) return null;
  const out = {};
  CATEGORIES.forEach((c, i) => { out[c.key] = +code.slice(i * 2, i * 2 + 2); });
  return out;
}
