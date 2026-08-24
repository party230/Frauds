/* ============================================================
   OFFICIAL FRAUD RANKINGS — nominate a Fraud
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const host = document.getElementById('submit-page');
  if (!host) return;

  const gate = document.getElementById('gate');
  const form = document.getElementById('nominate');
  const err = document.getElementById('nom-error');
  const done = document.getElementById('nom-done');
  const list = document.getElementById('past-noms');

  /* quality options come from the graded categories */
  form.quality.innerHTML = CATEGORIES.map(c => `<option value="${c.label}">${c.label}</option>`).join('');

  function gateOff(title, body, actions) {
    form.style.display = 'none';
    gate.innerHTML = `<div class="num-tag">Nominations</div><h3>${title}</h3><p>${body}</p>
      <div class="profile-actions" style="margin-top:18px">${actions}</div>`;
    gate.classList.add('show');
  }

  if (!Store.isSignedIn()) {
    gateOff('Sign in to nominate',
      'Nominations are tied to a member account so the panel can weigh who is putting a name forward.',
      '<a class="btn btn-gold btn-sm" href="login.html?next=submit.html">Sign in</a><a class="btn btn-sm" href="signup.html?next=submit.html">Create an account</a>');
  } else if (!Store.hasLevel(1)) {
    gateOff('Nominations are a Verified benefit',
      'Spectator members can vote and watch the board. Verified members put one figure per cycle in front of the panel.',
      '<a class="btn btn-gold btn-sm" href="checkout.html?plan=verified">Upgrade to Verified &mdash; $9/mo</a><a class="btn btn-sm" href="membership.html">Compare plans</a>');
  } else if (Store.nominationsThisCycle() >= 1) {
    gateOff('You have used this cycle\'s nomination',
      'One nomination per member per cycle. Yours is with the panel and the next slot opens at cycle ' + (CURRENT_CYCLE + 1) + '.',
      '<a class="btn btn-sm" href="account.html">See your nominations</a><a class="btn btn-sm" href="rankings.html">Back to the board</a>');
  }

  const fail = msg => { err.textContent = msg; err.classList.add('show'); };

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    err.classList.remove('show');

    const name = form.name_.value.trim();
    const handle = form.handle.value.trim();
    const note = form.note.value.trim();

    if (name.length < 2) return fail('Enter the name of the figure you are nominating.');
    if (!/^@?[\w.]{2,}$/.test(handle)) return fail('Enter a usable handle, e.g. @handle.');
    if (note.length < 40) return fail('The panel needs a case of at least forty characters, citing evidence from the last two cycles.');
    if (FRAUDS.some(f => f.name.toLowerCase() === name.toLowerCase())) return fail(name + ' is already ranked on the board.');

    Store.addNomination({
      name: name,
      handle: handle[0] === '@' ? handle : '@' + handle,
      region: form.region.value.trim(),
      quality: form.quality.value,
      note: note
    });

    form.reset();
    form.style.display = 'none';
    done.innerHTML = `
      <div class="tick">&#10003;</div>
      <div class="num-tag">Submission received</div>
      <h3>${name} is under review</h3>
      <p>The panel requires two full cycles of evidence, so the earliest ${name} can appear on the board is cycle ${CURRENT_CYCLE + 2}. You will find the status in your dashboard.</p>
      <div class="profile-actions" style="margin-top:18px">
        <a class="btn btn-gold btn-sm" href="account.html">Track it in your dashboard</a>
        <a class="btn btn-sm" href="rankings.html">Back to the board</a>
      </div>`;
    done.classList.add('show');
    renderPast();
    toast('Nomination filed for ' + name + '.');
  });

  function renderPast() {
    const noms = Store.nominations();
    list.innerHTML = noms.length
      ? `<div class="kv kv-list">${noms.map(n => `
          <div><span>${n.name} <em class="dim">${n.handle} · ${n.quality}</em></span><span>Cycle ${n.cycle} · ${n.status}</span></div>`).join('')}</div>`
      : '<div class="empty"><p>Nothing filed yet.</p></div>';
  }
  renderPast();
});
