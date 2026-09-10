/* ============================================================
   OFFICIAL FRAUD RANKINGS — the merger
   Cycle 41: the two halves of the summit are ruled one entry.
   The halves are archive data — they no longer sit on the board.
   ============================================================ */

const MERGER = {
  mergedId: 'f001',
  halves: [
    {
      name: 'Parth Mehta', nickname: 'Party', hue: 42, took: 'the room',
      aggregate: 95.80, rank: 1, cycles: 41,
      note: 'Eleven cycles at the summit on social resonance and business, and the highest Appeal reading the board had published.',
      stats: { height: 97, frame: 98, transformation: 96, aesthetics: 95, grooming: 94, drip: 92, business: 96, social: 98, personality: 95, longevity: 97 }
    },
    {
      name: 'Adhiraj Sharma', nickname: 'Adhilice', hue: 205, took: 'the face',
      aggregate: 95.79, rank: 2, cycles: 38,
      note: 'The highest facial aesthetics grade ever issued, no lane below 92.9, and four straight cycles of closing the gap.',
      stats: { height: 95, frame: 97, transformation: 96, aesthetics: 98, grooming: 97, drip: 96, business: 92.9, social: 96, personality: 95, longevity: 95 }
    }
  ],
  chase: [
    { cycle: 30, gap: 2.10, note: 'Adhiraj takes #2 and the panel calls the summit settled.' },
    { cycle: 33, gap: 1.40, note: 'Grooming and drip both upgraded. First cycle the gap moves.' },
    { cycle: 36, gap: 0.62, note: 'Frame graded 97. The chase becomes the story of the cycle.' },
    { cycle: 38, gap: 0.21, note: 'Aesthetics graded 98 — the highest the quality has ever seen.' },
    { cycle: 41, gap: 0.01, note: 'A lane is graded to a decimal to separate them. The panel merges the entries instead.' }
  ]
};

App.ready(() => {
  const host = document.getElementById('rivalry');
  if (!host) return;

  const field = rankedField();
  const merged = field.find(f => f.id === MERGER.mergedId) || field[0];
  const second = field[1];
  const [a, b] = MERGER.halves;
  const gap = Math.abs(a.aggregate - b.aggregate);

  /* ----- the headline figure ----- */
  document.getElementById('rv-gap').innerHTML = `
    <div class="gap-figure">${gap.toFixed(2)}</div>
    <div class="gap-label">points between them when the panel stopped counting</div>`;

  /* ----- the two halves, then what they became ----- */
  document.getElementById('rv-heads').innerHTML = MERGER.halves.map(h => {
    const psl = pslOf(h), appeal = appealOf(h);
    const other = h === a ? b : a;
    return `
      <div class="rv-head archived">
        <div class="rv-rank">was #${h.rank}</div>
        <span class="av av-lg" style="background:linear-gradient(150deg, hsl(${h.hue} 62% 68%), hsl(${(h.hue + 34) % 360} 54% 44%))">${initials(h.name)}</span>
        <h2>${h.name}</h2>
        <div class="rv-nick">&ldquo;${h.nickname}&rdquo; &middot; took ${h.took}</div>
        <div class="rv-score">${h.aggregate.toFixed(2)}<small>Final aggregate</small></div>
        <div class="rv-readings">
          <div class="rv-reading${psl > pslOf(other) ? ' win' : ''}">
            <span class="rr-v">${psl.toFixed(1)}</span><span class="rr-l">PSL</span>
          </div>
          <div class="rv-reading${appeal > appealOf(other) ? ' win' : ''}">
            <span class="rr-v">${appeal.toFixed(1)}</span><span class="rr-l">Appeal</span>
          </div>
        </div>
        <p class="rv-note">${h.note}</p>
      </div>`;
  }).join('') + `
    <div class="merge-arrow"><span>+</span></div>`;

  document.getElementById('rv-merged').innerHTML = `
    <div class="rv-head leader merged-head">
      <div class="rv-rank">#${merged.rank}</div>
      <span class="av av-lg" style="background:${avatarStyle(merged)}">${initials(merged.name)}</span>
      <h2>${merged.name}</h2>
      <div class="rv-nick">&ldquo;${merged.nickname}&rdquo; &middot; the merged entry</div>
      <div class="rv-score">${fmt(merged.score)}<small>Aggregate &mdash; the highest ever recorded</small></div>
      <div class="rv-readings">
        <div class="rv-reading win"><span class="rr-v">${pslOf(merged).toFixed(1)}</span><span class="rr-l">PSL &middot; ${pslLabel(pslOf(merged))}</span></div>
        <div class="rv-reading win"><span class="rr-v">${appealOf(merged).toFixed(1)}</span><span class="rr-l">Appeal</span></div>
      </div>
      <p class="rv-note">Leads ${second.name} by <strong>${fmt(merged.score - second.score)}</strong> points &mdash; the widest margin the board has carried since cycle 3.</p>
      <a class="btn btn-gold btn-sm btn-block" href="profile.html?id=${merged.id}">Open the profile</a>
    </div>`;

  /* ----- lane by lane: which half each grade came from ----- */
  document.getElementById('rv-rows').innerHTML = `
    <div class="merge-row merge-head">
      <span>${a.nickname}</span><span>Quality</span><span>${b.nickname}</span><span>Merged</span>
    </div>` + CATEGORIES.map(c => {
    const va = a.stats[c.key], vb = b.stats[c.key], vm = merged.stats[c.key];
    const from = va === vb ? 'both' : (vm === va ? 'a' : 'b');
    return `
      <div class="merge-row">
        <span class="mr-v ${from === 'a' || from === 'both' ? 'kept' : ''}">${va}</span>
        <span class="mr-l">${c.label}</span>
        <span class="mr-v ${from === 'b' || from === 'both' ? 'kept' : ''}">${vb}</span>
        <span class="mr-m">${vm}</span>
      </div>`;
  }).join('');

  const fromA = CATEGORIES.filter(c => a.stats[c.key] > b.stats[c.key]).length;
  const fromB = CATEGORIES.filter(c => b.stats[c.key] > a.stats[c.key]).length;
  const drawn = CATEGORIES.length - fromA - fromB;
  document.getElementById('rv-tally').innerHTML = `
    <span><b>${fromA}</b> lanes from ${a.nickname}</span>
    <span><b>${drawn}</b> identical</span>
    <span><b>${fromB}</b> lanes from ${b.nickname}</span>`;

  /* ----- the chase that forced the ruling ----- */
  const max = MERGER.chase[0].gap;
  document.getElementById('rv-chase').innerHTML = MERGER.chase.map(c => `
    <div class="chase-row">
      <span class="chase-cycle">Cycle ${c.cycle}</span>
      <span class="chase-track"><span class="chase-fill" style="width:${Math.max(1.5, c.gap / max * 100).toFixed(1)}%"></span></span>
      <span class="chase-gap">${c.gap.toFixed(2)}</span>
      <span class="chase-note">${c.note}</span>
    </div>`).join('');

  /* ----- the ruling ----- */
  document.getElementById('rv-verdict').innerHTML = `
    <div class="num-tag">The ruling &middot; cycle ${CURRENT_CYCLE}</div>
    <h3>One entry, ${fmt(merged.score)}</h3>
    <p>For eleven cycles the board's headline was a margin nobody could see. ${a.name} held the room — ${a.stats.social} on social resonance, ${a.stats.business} on business, the highest Appeal reading published. ${b.name} held the face — ${b.stats.aesthetics} on facial aesthetics, the highest single grade in the quality's history, and the higher PSL of the two. Neither could take the other's lane, and the aggregate separated them by ${gap.toFixed(2)}.</p>
    <p>The panel's ruling is that a hundredth of a point is not a distinction, it is a rounding of the same profile: <strong>${merged.name}</strong> takes ${fromA} lanes from ${a.nickname}, ${fromB} from ${b.nickname}, and ${drawn} that were already identical. The result grades ${fmt(merged.score)} with nothing below 95, and is the first PSL God the board has published at ${pslOf(merged).toFixed(1)}.</p>
    <p class="dim-line">Both halves are archived. Neither appears on the board, and the votes, grades and watchlist rows attached to them went with the ruling.</p>
    <div class="profile-actions" style="margin-top:18px">
      <a class="btn btn-gold btn-sm" href="profile.html?id=${merged.id}">The merged profile</a>
      <a class="btn btn-sm" href="compare.html">Compare any two Frauds</a>
      <a class="btn btn-sm" href="rankings.html">Back to the board</a>
    </div>`;
});
