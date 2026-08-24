/* ============================================================
   OFFICIAL FRAUD RANKINGS — membership
   ============================================================ */

const FEATURES = [
  ['The public board every cycle',            0],
  ['Rising star and overrated voting',        0],
  ['Quality breakdown on every profile',      0],
  ['Watchlist',                               0, 'Up to 5', 'Unlimited', 'Unlimited'],
  ['Head-to-head comparison',                 0],
  ['Nominate a Fraud each cycle',             1],
  ['Cycle-by-cycle grade history',            1],
  ['Panel notes 24 hours early',              1],
  ['Raw per-quality scoring sheets',          2],
  ['Priority submissions and appeals',        2],
  ['Comparison exports',                      2],
  ['Direct line to the ranking panel',        2]
];

App.ready(() => {
  const host = document.getElementById('plans');
  if (!host) return;
  host.innerHTML = PLANS.map(planCardMarkup).join('');

  const table = document.getElementById('feature-table');
  table.innerHTML = `
    <div class="ft-row ft-head">
      <div>What you get</div>${PLANS.map(p => `<div>${p.name}</div>`).join('')}
    </div>
    ${FEATURES.map(f => `
      <div class="ft-row">
        <div class="ft-label">${f[0]}</div>
        ${PLANS.map((p, i) => {
          const custom = f[2 + i];
          if (custom) return `<div class="ft-val">${custom}</div>`;
          return `<div class="ft-val">${p.level >= f[1] ? '<span class="ft-yes">&#10003;</span>' : '<span class="ft-no">&mdash;</span>'}</div>`;
        }).join('')}
      </div>`).join('')}`;

  const state = document.getElementById('plan-state');
  if (Store.isSignedIn()) {
    const p = Store.plan();
    state.innerHTML = `You are signed in as <strong>${Store.session().name}</strong> on the <strong>${p.name}</strong> plan.` +
      (p.level < 2 ? ' Upgrading takes effect from the next cycle.' : '');
    state.classList.add('show');
  }
});
