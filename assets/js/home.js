/* ============================================================
   OFFICIAL FRAUD RANKINGS — home page
   ============================================================ */

App.ready(() => {
  const field = rankedField();

  /* ----- headline numbers ----- */
  const strip = document.getElementById('stat-strip');
  if (strip) {
    const risers = field.filter(f => f.movement > 0).length;
    strip.innerHTML = [
      [field.length, 'Ranked Frauds'],
      [fmt(field[0].score), 'Top aggregate'],
      [risers, 'Risers this cycle'],
      ['48h', 'Refresh interval']
    ].map(([n, l]) => `<div><div class="n">${n}</div><div class="l">${l}</div></div>`).join('');
  }

  /* ----- podium ----- */
  const podium = document.getElementById('podium-host');
  if (podium) {
    field.slice(0, 3).forEach(f => {
      const pod = document.createElement('div');
      pod.className = 'pod' + (f.rank === 1 ? ' first' : '');
      pod.innerHTML = `<div class="rk">${f.rank}</div>`;
      pod.appendChild(avatar(f));
      pod.insertAdjacentHTML('beforeend', `
        <h3>${f.name}</h3>
        ${f.nickname ? `<div class="pod-nick">&ldquo;${f.nickname}&rdquo;</div>` : ''}
        <div class="hd">${f.handle} · ${f.region}</div>
        <div class="sc">${fmt(f.score)}<small>Aggregate grade</small></div>
        <div class="tl">${f.tagline}</div>
        <a class="btn ${f.rank === 1 ? 'btn-gold' : ''} btn-block" href="profile.html?id=${f.id}">View profile</a>`);
      podium.appendChild(pod);
    });
  }

  /* ----- movers of the cycle ----- */
  const movers = document.getElementById('movers');
  if (movers) {
    const up = field.filter(f => f.movement > 0).sort((a, b) => b.movement - a.movement).slice(0, 3);
    const down = field.filter(f => f.movement < 0).sort((a, b) => a.movement - b.movement).slice(0, 3);

    const card = (title, list, dir) => `
      <div class="card">
        <div class="num-tag">${title}</div>
        <div class="mover-list">
          ${list.map(f => `
            <a class="mover" href="profile.html?id=${f.id}">
              <span class="mover-av" style="background:${avatarStyle(f)}">${initials(f.name)}</span>
              <span class="mover-nm">${f.name}<em>#${f.rank} · ${fmt(f.score)}</em></span>
              <span class="mv ${dir}">${dir === 'up' ? '&#9650;' : '&#9660;'} ${Math.abs(f.movement)}</span>
            </a>`).join('')}
        </div>
      </div>`;

    movers.innerHTML = card('Risers this cycle', up, 'up') + card('Fallers this cycle', down, 'down');
  }

  /* ----- top ten preview ----- */
  const board = document.getElementById('home-board');
  if (board) field.slice(0, 10).forEach(f => board.appendChild(boardRow(f)));

  /* ----- latest cycle reports ----- */
  const news = document.getElementById('news-teaser');
  if (news) {
    news.innerHTML = NEWS.slice(0, 3).map(n => `
      <a class="card news-card" href="article.html?id=${n.id}">
        <div class="num-tag">${n.tag} · Cycle ${n.cycle}</div>
        <h3>${n.title}</h3>
        <p>${n.lede}</p>
        <span class="read-on">Read the report &rarr;</span>
      </a>`).join('');
  }

  /* ----- looksmaxxing desk teaser ----- */
  const lm = document.getElementById('lm-teaser');
  if (lm) {
    lm.innerHTML = LOOKSMAX.slice(0, 3).map(a => `
      <a class="card news-card" href="looksmax-article.html?id=${a.id}">
        <div class="num-tag">${looksmaxCategory(a.category).label} · ${a.readMinutes} min</div>
        <h3>${a.title}</h3>
        <p>${a.lede}</p>
        <span class="read-on">Read the protocol &rarr;</span>
      </a>`).join('');
  }

  /* ----- what the verse is doing ----- */
  const activity = document.getElementById('activity');
  if (activity) drawActivity(activity);

  /* ----- membership teaser ----- */
  const plans = document.getElementById('plan-teaser');
  if (plans) plans.innerHTML = PLANS.map(planCardMarkup).join('');
});


/* Live feed of what members are doing, first names only. */
async function drawActivity(host) {
  host.innerHTML = '<div class="empty"><p>Reading the wire…</p></div>';

  let events = [];
  try {
    const res = await Store.activity(10);
    events = res.events || [];
  } catch (e) { events = []; }

  if (!events.length) {
    host.innerHTML = `<div class="empty">
      <p>${Store.offline ? 'The activity wire needs the backend running.' : 'Nothing on the wire yet. Cast the first vote.'}</p>
      <a class="btn btn-sm" href="rankings.html">Open the board</a>
    </div>`;
    return;
  }

  const line = e => {
    if (e.kind === 'vote') return `<strong>${e.who}</strong> marked <a href="rankings.html?q=${encodeURIComponent(e.subject)}">${e.subject}</a> ${e.detail === 'rise' ? 'a rising star' : 'overrated'}`;
    if (e.kind === 'rating') return `<strong>${e.who}</strong> graded ${e.subject} at <em>${e.detail}</em>`;
    if (e.kind === 'nomination') return `<strong>${e.who}</strong> nominated ${e.subject} on ${e.detail.toLowerCase()}`;
    if (e.kind === 'test') return `<strong>${e.who}</strong> took the Fraud Test and scored <em>${e.detail}</em>`;
    if (e.kind === 'membership') return `<strong>${e.who}</strong> joined ${e.subject === 'panel' ? 'Panel Access' : 'Verified'}`;
    return `<strong>${e.who}</strong> did something in the verse`;
  };

  host.innerHTML = `<div class="wire">${events.map(e => `
    <div class="wire-row">
      <span class="wire-dot wire-${e.kind}"></span>
      <span class="wire-txt">${line(e)}</span>
      <span class="wire-at">${timeAgo(e.at)}</span>
    </div>`).join('')}</div>`;
}
