/* ============================================================
   OFFICIAL FRAUD RANKINGS — the rivalry
   The marquee pairing: Parth Mehta and Adhiraj Sharma, 0.01 apart.
   ============================================================ */

const RIVALRY = {
  a: 'f001',
  b: 'f002',
  chase: [
    { cycle: 30, gap: 2.10, note: 'Adhiraj takes #2 and the panel calls the summit settled.' },
    { cycle: 33, gap: 1.40, note: 'Grooming and drip both upgraded. First cycle the gap moves.' },
    { cycle: 36, gap: 0.62, note: 'Frame graded 97. The chase becomes the story of the cycle.' },
    { cycle: 38, gap: 0.21, note: 'Aesthetics graded 98 — the highest the quality has ever seen.' },
    { cycle: 41, gap: 0.01, note: 'Both cross into Mythic. The panel grades a lane to a decimal to separate them.' }
  ]
};

App.ready(() => {
  const host = document.getElementById('rivalry');
  if (!host) return;

  const field = rankedField();
  const a = field.find(f => f.id === RIVALRY.a) || field[0];
  const b = field.find(f => f.id === RIVALRY.b) || field[1];
  const gap = Math.abs(a.score - b.score);

  /* ----- the headline ----- */
  document.getElementById('rv-gap').innerHTML = `
    <div class="gap-figure">${gap.toFixed(2)}</div>
    <div class="gap-label">points between first and second</div>`;

  document.getElementById('rv-heads').innerHTML = [a, b].map((f, i) => {
    const psl = pslOf(f), appeal = appealOf(f);
    const other = i === 0 ? b : a;
    const winsPsl = psl > pslOf(other);
    const winsAppeal = appeal > appealOf(other);
    return `
      <div class="rv-head${f.rank === 1 ? ' leader' : ''}">
        <div class="rv-rank">#${f.rank}</div>
        <span class="av av-lg" style="background:${avatarStyle(f)}">${initials(f.name)}</span>
        <h2>${f.name}</h2>
        <div class="rv-nick">&ldquo;${f.nickname}&rdquo;</div>
        <div class="rv-score">${fmt(f.score)}<small>Aggregate</small></div>
        <div class="rv-readings">
          <div class="rv-reading${winsPsl ? ' win' : ''}">
            <span class="rr-v">${psl.toFixed(1)}</span>
            <span class="rr-l">PSL · ${pslLabel(psl)}</span>
          </div>
          <div class="rv-reading${winsAppeal ? ' win' : ''}">
            <span class="rr-v">${appeal.toFixed(1)}</span>
            <span class="rr-l">Appeal</span>
          </div>
        </div>
        <a class="btn btn-sm btn-block" href="profile.html?id=${f.id}">Full profile</a>
      </div>`;
  }).join('');

  /* ----- the split: who owns which reading ----- */
  const pslLead = pslOf(b) > pslOf(a) ? b : a;
  const appealLead = appealOf(a) > appealOf(b) ? a : b;
  document.getElementById('rv-split').innerHTML = `
    <div class="card split-card">
      <div class="num-tag">Structure</div>
      <h3>${pslLead.name.split(' ')[0]} takes PSL</h3>
      <p><strong>${pslOf(pslLead).toFixed(1)}</strong> against ${pslOf(pslLead.id === a.id ? b : a).toFixed(1)}. PSL weighs facial aesthetics at half, then frame, grooming and height — the lanes you are largely born into and can only refine. ${pslLead.name.split(' ')[0]} owns the highest aesthetics grade the panel has ever issued at ${pslLead.stats.aesthetics}.</p>
    </div>
    <div class="card split-card">
      <div class="num-tag">The room</div>
      <h3>${appealLead.name.split(' ')[0]} takes Appeal</h3>
      <p><strong>${appealOf(appealLead).toFixed(1)}</strong> against ${appealOf(appealLead.id === a.id ? b : a).toFixed(1)}. Appeal weighs social resonance, personality, business and drip — what a room does when you walk into it. ${appealLead.name.split(' ')[0]} grades ${appealLead.stats.social} on resonance and ${appealLead.stats.business} on business, and neither has moved down in eleven cycles.</p>
    </div>`;

  /* ----- quality by quality ----- */
  let winsA = 0, winsB = 0, draws = 0;
  document.getElementById('rv-rows').innerHTML = CATEGORIES.map(c => {
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

  document.getElementById('rv-tally').innerHTML = `
    <span><b>${winsA}</b> ${a.nickname}</span>
    <span><b>${draws}</b> drawn</span>
    <span><b>${winsB}</b> ${b.nickname}</span>`;

  /* ----- the chase ----- */
  const max = RIVALRY.chase[0].gap;
  document.getElementById('rv-chase').innerHTML = RIVALRY.chase.map(c => `
    <div class="chase-row">
      <span class="chase-cycle">Cycle ${c.cycle}</span>
      <span class="chase-track"><span class="chase-fill" style="width:${Math.max(1.5, c.gap / max * 100).toFixed(1)}%"></span></span>
      <span class="chase-gap">${c.gap.toFixed(2)}</span>
      <span class="chase-note">${c.note}</span>
    </div>`).join('');

  /* ----- verdict ----- */
  const lead = a.score >= b.score ? a : b;
  const trail = lead.id === a.id ? b : a;
  document.getElementById('rv-verdict').innerHTML = `
    <div class="num-tag">Panel verdict &middot; cycle ${CURRENT_CYCLE}</div>
    <h3>${lead.name} holds it</h3>
    <p>${lead.name} keeps the summit by <strong>${gap.toFixed(2)}</strong> of a point, taking ${lead.id === a.id ? winsA : winsB} of the ten qualities to ${trail.name}'s ${lead.id === a.id ? winsB : winsA}${draws ? `, with ${draws} drawn` : ''}. The two published readings split cleanly: ${trail.name.split(' ')[0]} grades higher on PSL, ${lead.name.split(' ')[0]} grades higher on Appeal, and the aggregate — which is neither of those, just the flat mean of ten — falls to the man with the room.</p>
    <p>The panel notes the obvious: at a hundredth of a point, a single upgrade in any one lane settles cycle 42. ${trail.name.split(' ')[0]} needs ${(0.1).toFixed(1)} of a point on business acumen. That is it.</p>
    <div class="profile-actions" style="margin-top:18px">
      <a class="btn btn-gold btn-sm" href="compare.html?a=${a.id}&b=${b.id}">Open in the comparison tool</a>
      <a class="btn btn-sm" href="compare.html">Compare any two Frauds</a>
    </div>`;
});
