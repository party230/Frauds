/* ============================================================
   OFFICIAL FRAUD RANKINGS — cycle reports index and article
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('news-list');
  if (list) {
    const lead = NEWS[0];
    const leadHost = document.getElementById('news-lead');
    if (leadHost) leadHost.innerHTML = `
      <a class="card news-lead" href="article.html?id=${lead.id}">
        <div class="num-tag">${lead.tag} · Cycle ${lead.cycle} · ${lead.date}</div>
        <h2>${lead.title}</h2>
        <p>${lead.lede}</p>
        <span class="read-on">Read the report &rarr;</span>
      </a>`;

    list.innerHTML = NEWS.slice(1).map(n => `
      <a class="card news-card" href="article.html?id=${n.id}">
        <div class="num-tag">${n.tag} · Cycle ${n.cycle}</div>
        <h3>${n.title}</h3>
        <p>${n.lede}</p>
        <span class="read-on">Read the report &rarr;</span>
      </a>`).join('');
  }

  const article = document.getElementById('article');
  if (article) {
    const id = new URLSearchParams(location.search).get('id');
    const i = Math.max(0, NEWS.findIndex(n => n.id === id));
    const n = NEWS[i];
    document.title = n.title + ' | Official Fraud Rankings';

    article.innerHTML = `
      <div class="eyebrow">${n.tag} · Cycle ${n.cycle} · ${n.date}</div>
      <h1>${n.title}</h1>
      <p class="lede">${n.lede}</p>
      ${n.body.map(p => `<p>${p}</p>`).join('')}`;

    const board = rankedField();
    document.getElementById('article-side').innerHTML = `
      <div class="card">
        <div class="num-tag">Board at cycle ${n.cycle}</div>
        <h3>Top five</h3>
        <div class="kv kv-list" style="margin-top:8px">
          ${board.slice(0, 5).map(f => `<div><span>#${f.rank} ${f.name}</span><span>${fmt(f.score)}</span></div>`).join('')}
        </div>
        <a class="btn btn-sm btn-block" style="margin-top:16px" href="rankings.html">Open the full board</a>
      </div>`;

    const prev = NEWS[i + 1], next = NEWS[i - 1];
    document.getElementById('article-nav').innerHTML = `
      ${prev ? `<a class="btn btn-sm" href="article.html?id=${prev.id}">&larr; ${prev.tag} ${prev.cycle}</a>` : '<span></span>'}
      ${next ? `<a class="btn btn-sm" href="article.html?id=${next.id}">${next.tag} ${next.cycle} &rarr;</a>` : '<span></span>'}`;
  }
});
