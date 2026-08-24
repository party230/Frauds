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
  const board = document.getElementById('board');
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

  /* ----- membership teaser ----- */
  const plans = document.getElementById('plan-teaser');
  if (plans) plans.innerHTML = PLANS.map(planCardMarkup).join('');
});
