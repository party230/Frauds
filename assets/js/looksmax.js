/* ============================================================
   OFFICIAL FRAUD RANKINGS — looksmaxxing desk
   Protocol, evidence and gear. Nothing about the board itself.
   ============================================================ */

App.ready(() => {
  const feed = document.getElementById('feed');
  if (feed) initFeed(feed);

  const routine = document.getElementById('routine');
  if (routine) initRoutine(routine);

  const article = document.getElementById('lm-article');
  if (article) initArticle(article);
});

/* ---------- the feed ---------- */
function initFeed(feed) {
  const search = document.getElementById('lm-search');
  const sort = document.getElementById('lm-sort');
  const savedOnly = document.getElementById('saved-only');
  const count = document.getElementById('lm-count');
  const chipRow = document.getElementById('lm-chips');
  let category = new URLSearchParams(location.search).get('category') || 'all';

  chipRow.innerHTML = [{ key: 'all', label: 'Everything' }].concat(LOOKSMAX_CATEGORIES)
    .map(c => `<button class="chip${c.key === category ? ' on' : ''}" data-cat="${c.key}" type="button">${c.label}</button>`).join('');

  const chips = Array.from(chipRow.querySelectorAll('.chip'));
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.classList.remove('on'));
    c.classList.add('on');
    category = c.dataset.cat;
    render();
  }));

  function filtered() {
    const q = search.value.trim().toLowerCase();
    let items = LOOKSMAX.slice();
    if (category !== 'all') items = items.filter(a => a.category === category);
    if (savedOnly.checked) items = items.filter(a => Store.isSaved(a.id));
    if (q) items = items.filter(a =>
      a.title.toLowerCase().includes(q) || a.lede.toLowerCase().includes(q) ||
      a.tags.join(' ').includes(q) || a.body.join(' ').toLowerCase().includes(q));
    if (sort.value === 'quick') items.sort((a, b) => a.readMinutes - b.readMinutes);
    return items;
  }

  function render() {
    const items = filtered();
    feed.innerHTML = '';

    if (!items.length) {
      feed.innerHTML = `<div class="empty"><p>${savedOnly.checked
        ? 'Nothing saved yet. Hit save on any article to keep it here.'
        : 'No protocol matches that.'}</p></div>`;
    }

    items.forEach(a => {
      const card = document.createElement('article');
      card.className = 'card lm-card';
      card.innerHTML = `
        <div class="lm-top">
          <span class="tier tier-ascending">${looksmaxCategory(a.category).label}</span>
          <span class="lm-meta">${a.date} · ${a.readMinutes} min</span>
        </div>
        <h3><a href="looksmax-article.html?id=${a.id}">${a.title}</a></h3>
        <p>${a.lede}</p>
        <div class="lm-verdict">${a.verdict}</div>
        <div class="lm-foot">
          <span class="lm-tags">${a.tags.map(t => `<em>#${t}</em>`).join('')}</span>
        </div>`;
      card.querySelector('.lm-foot').appendChild(bookmarkButton(a));
      feed.appendChild(card);
    });

    count.textContent = items.length
      ? `${items.length} ${items.length === 1 ? 'article' : 'articles'}${category !== 'all' ? ' in ' + looksmaxCategory(category).label : ''}`
      : 'Nothing to read here';
  }

  let typing;
  search.addEventListener('input', () => { clearTimeout(typing); typing = setTimeout(render, 160); });
  sort.addEventListener('change', render);
  savedOnly.addEventListener('change', render);
  Store.on(() => { if (savedOnly.checked) render(); });

  render();
}

/* ---------- daily routine tracker ---------- */
function initRoutine(host) {
  if (!Store.isSignedIn()) {
    host.innerHTML = `
      <div class="num-tag">Daily routine</div>
      <h3>Track the boring part</h3>
      <p>Seven habits, one streak. Sign in and the panel's protocol becomes a checklist you actually keep.</p>
      <div class="profile-actions" style="margin-top:16px">
        <a class="btn btn-gold btn-sm" href="login.html?next=looksmax.html">Sign in</a>
        <a class="btn btn-sm" href="signup.html?next=looksmax.html">Create account</a>
      </div>`;
    return;
  }

  let saving;

  function draw() {
    const r = Store.routine();
    const done = new Set(r.today);

    host.innerHTML = `
      <div class="num-tag">Daily routine · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
      <div class="streak">
        <div class="streak-n">${r.streak}</div>
        <div class="streak-l">day${r.streak === 1 ? '' : 's'} in a row<br><em>three habits makes a day count</em></div>
      </div>
      <div class="habit-list">
        ${HABITS.map(h => `
          <label class="habit${done.has(h.key) ? ' done' : ''}">
            <input type="checkbox" data-habit="${h.key}"${done.has(h.key) ? ' checked' : ''}>
            <span class="habit-txt">${h.label}<em>${h.hint}</em></span>
          </label>`).join('')}
      </div>
      <div class="strip">
        ${r.last14.map(d => `<span class="strip-day${d.done >= 3 ? ' hit' : d.done ? ' part' : ''}" title="${d.day}: ${d.done} habits"></span>`).join('')}
      </div>
      <div class="strip-legend"><span>14 days ago</span><span>today</span></div>`;

    host.querySelectorAll('[data-habit]').forEach(box => box.addEventListener('change', () => {
      const keys = Array.from(host.querySelectorAll('[data-habit]')).filter(b => b.checked).map(b => b.dataset.habit);
      box.closest('.habit').classList.toggle('done', box.checked);
      clearTimeout(saving);
      saving = setTimeout(async () => {
        try {
          const before = Store.routine().streak;
          const after = await Store.saveRoutine(keys);
          draw();
          if (after.streak > before) toast('Streak at ' + after.streak + ' days.');
        } catch (err) { apiFail(err, 'The routine did not save.'); }
      }, 400);
    }));
  }

  draw();
}

/* ---------- one article ---------- */
function initArticle(host) {
  const id = new URLSearchParams(location.search).get('id');
  const article = articleById(id) || LOOKSMAX[0];
  const i = LOOKSMAX.indexOf(article);
  document.title = article.title + ' | Official Fraud Rankings';

  host.innerHTML = `
    <div class="eyebrow">${looksmaxCategory(article.category).label} · ${article.date} · ${article.readMinutes} min read</div>
    <h1>${article.title}</h1>
    <p class="lede">${article.lede}</p>
    ${article.body.map(p => `<p>${p}</p>`).join('')}
    <div class="lm-tags article-tags">${article.tags.map(t => `<em>#${t}</em>`).join('')}</div>`;

  const side = document.getElementById('lm-side');
  side.innerHTML = `
    <div class="card">
      <div class="num-tag">The protocol</div>
      <h3>Do this</h3>
      <ul class="check-list" style="margin-bottom:0">${article.protocol.map(x => `<li>${x}</li>`).join('')}</ul>
      <div class="lm-verdict" style="margin-top:18px">${article.verdict}</div>
      <div id="save-host" style="margin-top:16px"></div>
    </div>
    <div class="card">
      <div class="num-tag">Where it counts</div>
      <h3>On the board</h3>
      <p>Every quality is worth 10% of the aggregate. This one moves ${qualityFor(article.category)}.</p>
      <a class="btn btn-sm btn-block" style="margin-top:14px" href="test.html">Grade yourself &rarr;</a>
    </div>`;
  document.getElementById('save-host').appendChild(bookmarkButton(article, true));

  const related = LOOKSMAX
    .filter(a => a.id !== article.id && (a.category === article.category || a.tags.some(t => article.tags.includes(t))))
    .concat(LOOKSMAX.filter(a => a.id !== article.id))
    .filter((a, k, arr) => arr.indexOf(a) === k)
    .slice(0, 3);

  document.getElementById('lm-related').innerHTML = related.map(a => `
    <a class="card news-card" href="looksmax-article.html?id=${a.id}">
      <div class="num-tag">${looksmaxCategory(a.category).label} · ${a.readMinutes} min</div>
      <h3>${a.title}</h3>
      <p>${a.lede}</p>
      <span class="read-on">Read it &rarr;</span>
    </a>`).join('');

  const prev = LOOKSMAX[i + 1], next = LOOKSMAX[i - 1];
  document.getElementById('lm-nav').innerHTML =
    (prev ? `<a class="btn btn-sm" href="looksmax-article.html?id=${prev.id}">&larr; ${prev.title.slice(0, 38)}…</a>` : '<span></span>') +
    (next ? `<a class="btn btn-sm" href="looksmax-article.html?id=${next.id}">${next.title.slice(0, 38)}… &rarr;</a>` : '<span></span>');
}

/* Which graded quality a looksmax category feeds. */
function qualityFor(category) {
  const map = {
    jaw: 'facial aesthetics', skin: 'grooming', hair: 'grooming', frame: 'body frame',
    sleep: 'facial aesthetics', diet: 'transformation', style: 'style &amp; drip',
    posture: 'body frame', angles: 'social resonance'
  };
  return map[category] || 'the aggregate';
}
