/* ============================================================
   OFFICIAL FRAUD RANKINGS — contact and grade appeals
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('appeal-form');
  if (!form) return;

  const field = rankedField();
  form.fraud.innerHTML = field.map(f => `<option value="${f.id}">#${f.rank} · ${f.name}</option>`).join('');
  form.quality.innerHTML = CATEGORIES.map(c => `<option value="${c.label}">${c.label}</option>`).join('');

  const err = document.getElementById('appeal-error');
  const done = document.getElementById('appeal-notice');
  const fail = msg => { err.textContent = msg; err.classList.add('show'); };

  /* the panel only reads appeals from Panel Access members */
  const note = document.getElementById('appeal-gate');
  if (!Store.hasLevel(2)) {
    note.innerHTML = Store.isSignedIn()
      ? `Appeals are reviewed for Panel Access members. Yours will be logged and answered after the cycle. <a href="membership.html">Compare plans</a>.`
      : `Appeals are reviewed for Panel Access members. <a href="login.html?next=contact.html">Sign in</a> to file one against your account.`;
    note.classList.add('show');
  }

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    err.classList.remove('show');

    const reason = form.reason.value.trim();
    if (reason.length < 40) return fail('An appeal needs at least forty characters naming the evidence in dispute.');

    const fraudId = form.fraud.value;
    const quality = form.quality.value;
    Store.addAppeal({ fraudId: fraudId, quality: quality, note: reason });

    const f = byId(fraudId);
    form.reset();
    done.textContent = `Appeal filed against ${f.name}'s ${quality.toLowerCase()} grade. The panel answers within one cycle.`;
    done.classList.add('show');
    toast('Appeal filed.');
  });
});
