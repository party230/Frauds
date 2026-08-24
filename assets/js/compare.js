/* ============================================================
   OFFICIAL FRAUD RANKINGS — head to head
   ============================================================ */

App.ready(() => {
  const host = document.getElementById('compare');
  if (!host) return;

  const field = rankedField();
  const params = new URLSearchParams(location.search);
  const selA = document.getElementById('pick-a');
  const selB = document.getElementById('pick-b');

  const options = field.map(f => `<option value="${f.id}">#${f.rank} · ${f.name} (${fmt(f.score)})</option>`).join('');
  selA.innerHTML = options;
  selB.innerHTML = options;
  selA.value = params.get('a') || field[0].id;
  selB.value = params.get('b') || (selA.value === field[1].id ? field[0].id : field[1].id);

  function render() {
    if (selA.value === selB.value) {
      const alt = field.find(f => f.id !== selA.value);
      selB.value = alt.id;
    }
    const a = byId(selA.value);
    const b = byId(selB.value);
    history.replaceState(null, '', 'compare.html?a=' + a.id + '&b=' + b.id);

    document.getElementById('card-a').innerHTML = sideMarkup(a);
    document.getElementById('card-b').innerHTML = sideMarkup(b);

    let winsA = 0, winsB = 0, draws = 0;
    document.getElementById('rows').innerHTML = CATEGORIES.map(c => {
      const va = a.stats[c.key], vb = b.stats[c.key];
      if (va > vb) winsA++; else if (vb > va) winsB++; else draws++;
      const total = va + vb;
      return `
        <div class="h2h-row">
          <div class="h2h-v ${va >= vb ? 'win' : ''}">${va}</div>
          <div class="h2h-mid">
            <div class="h2h-label">${c.label}</div>
            <div class="h2h-bar">
              <span class="h2h-a" style="width:${(va / total * 100).toFixed(1)}%"></span>
              <span class="h2h-b" style="width:${(vb / total * 100).toFixed(1)}%"></span>
            </div>
          </div>
          <div class="h2h-v ${vb >= va ? 'win' : ''}">${vb}</div>
        </div>`;
    }).join('');

    const lead = a.score === b.score ? null : (a.score > b.score ? a : b);
    const gap = Math.abs(a.score - b.score);
    document.getElementById('verdict').innerHTML = `
      <div class="num-tag">Panel verdict</div>
      <h3>${lead ? lead.name + ' takes it' : 'Dead level'}</h3>
      <p>${lead
        ? `${lead.name} leads by <strong>${gap.toFixed(1)}</strong> points on the aggregate and takes <strong>${lead.id === a.id ? winsA : winsB}</strong> of the ten qualities${draws ? `, with ${draws} drawn` : ''}. ${loserNote(a, b, lead)}`
        : 'Both profiles grade identically on the aggregate. The board splits them on cycles ranked.'}</p>
      <div class="h2h-tally">
        <span><b>${winsA}</b> ${a.name.split(' ')[0]}</span>
        <span><b>${draws}</b> drawn</span>
        <span><b>${winsB}</b> ${b.name.split(' ')[0]}</span>
      </div>`;
  }

  function loserNote(a, b, lead) {
    const other = lead.id === a.id ? b : a;
    const weak = extremeQuality(other, false);
    const strong = extremeQuality(other, true);
    return `${other.name} holds the edge nowhere decisive: ${strong.label.toLowerCase()} at ${strong.value} is the profile's best case, and ${weak.label.toLowerCase()} at ${weak.value} is what keeps them behind.`;
  }

  function sideMarkup(f) {
    const s = sentiment(f);
    return `
      <div class="h2h-head">
        <span class="av" style="background:${avatarStyle(f)}">${initials(f.name)}</span>
        <div>
          <h3>${f.name}</h3>
          <div class="handle">${f.handle} · ${f.region}</div>
        </div>
      </div>
      <div class="h2h-score">${fmt(f.score)}<small>Aggregate</small></div>
      <div class="kv">
        <div><span>Rank</span><span>#${f.rank}</span></div>
        <div><span>Tier</span><span>${f.tier.label}</span></div>
        <div><span>Movement</span><span>${movementLabel(f.movement)}</span></div>
        <div><span>Peak</span><span>#${f.peak}</span></div>
        <div><span>Sentiment</span><span>${s.rise}% rising</span></div>
      </div>
      <a class="btn btn-sm btn-block" href="profile.html?id=${f.id}">Full profile</a>`;
  }

  selA.addEventListener('change', render);
  selB.addEventListener('change', render);
  document.getElementById('swap').addEventListener('click', () => {
    const t = selA.value; selA.value = selB.value; selB.value = t; render();
  });
  document.getElementById('shuffle').addEventListener('click', () => {
    const pick = () => field[Math.floor(Math.random() * field.length)].id;
    selA.value = pick();
    do { selB.value = pick(); } while (selB.value === selA.value);
    render();
  });

  render();
});
