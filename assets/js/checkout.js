/* ============================================================
   OFFICIAL FRAUD RANKINGS — checkout
   ------------------------------------------------------------
   No payments are taken and no card details leave the form:
   choosing a plan writes it to this browser's membership record.
   ============================================================ */

App.ready(() => {
  const host = document.getElementById('checkout');
  if (!host) return;

  const params = new URLSearchParams(location.search);
  const plan = planById(params.get('plan') || 'verified');
  const cycle = document.getElementById('billing-cycle');
  const summary = document.getElementById('summary');
  const form = document.getElementById('pay-form');
  const gate = document.getElementById('gate');
  const err = document.getElementById('pay-error');

  /* free plan has nothing to buy */
  if (!plan.price) { location.replace('membership.html'); return; }

  /* signing in is required before a plan can be attached to anything */
  if (!Store.isSignedIn()) {
    form.style.display = 'none';
    gate.innerHTML = `
      <div class="num-tag">One step first</div>
      <h3>Sign in to continue</h3>
      <p>A membership attaches to an account. Sign in or create one and you will come straight back to this checkout.</p>
      <div class="profile-actions" style="margin-top:18px">
        <a class="btn btn-gold btn-sm" href="login.html?plan=${plan.id}&next=checkout.html%3Fplan%3D${plan.id}">Sign in</a>
        <a class="btn btn-sm" href="signup.html?plan=${plan.id}">Create an account</a>
      </div>`;
    gate.classList.add('show');
  }

  function price() {
    const yearly = cycle.value === 'year';
    const monthly = plan.price;
    return {
      yearly: yearly,
      unit: monthly,
      months: yearly ? 12 : 1,
      gross: yearly ? monthly * 12 : monthly,
      discount: yearly ? monthly * 2 : 0,
      total: yearly ? monthly * 10 : monthly
    };
  }

  function renderSummary() {
    const p = price();
    summary.innerHTML = `
      <div class="num-tag">Order summary</div>
      <h3>${plan.name}</h3>
      <p class="plan-blurb">${plan.blurb}</p>
      <ul class="check-list">${plan.perks.map(x => `<li>${x}</li>`).join('')}</ul>
      <div class="kv" style="margin-top:18px">
        <div><span>${plan.name} membership</span><span>$${p.unit}.00 / month</span></div>
        <div><span>Billing</span><span>${p.yearly ? 'Yearly (12 months)' : 'Monthly'}</span></div>
        ${p.discount ? `<div><span>Two months free</span><span class="disc">&minus; $${p.discount}.00</span></div>` : ''}
        <div><span>Due today</span><span class="due">$${p.total}.00</span></div>
      </div>
      <p class="form-note" style="margin-top:14px">Renews ${p.yearly ? 'yearly' : 'monthly'}. Cancel any time from your account. This is a demonstration checkout — no payment is taken.</p>`;
  }

  cycle.addEventListener('change', renderSummary);
  renderSummary();

  /* ----- card field niceties ----- */
  const card = form.card, exp = form.exp, cvc = form.cvc;
  card.addEventListener('input', () => {
    const digits = card.value.replace(/\D/g, '').slice(0, 16);
    card.value = digits.replace(/(.{4})/g, '$1 ').trim();
  });
  exp.addEventListener('input', () => {
    const d = exp.value.replace(/\D/g, '').slice(0, 4);
    exp.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  });
  cvc.addEventListener('input', () => { cvc.value = cvc.value.replace(/\D/g, '').slice(0, 4); });

  const fail = msg => { err.textContent = msg; err.classList.add('show'); };

  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    err.classList.remove('show');

    if (!Store.isSignedIn()) return fail('Sign in before completing the order.');
    if (form.cardname.value.trim().length < 2) return fail('Enter the name printed on the card.');
    if (card.value.replace(/\D/g, '').length !== 16) return fail('A card number is sixteen digits.');

    const m = exp.value.match(/^(\d{2})\/(\d{2})$/);
    if (!m || +m[1] < 1 || +m[1] > 12) return fail('Enter the expiry as MM/YY.');
    const expiry = new Date(2000 + +m[2], +m[1], 0);
    if (expiry < new Date()) return fail('That card has expired.');
    if (cvc.value.length < 3) return fail('Enter the three or four digit security code.');

    const submit = form.querySelector('button[type=submit]');
    submit.disabled = true;
    submit.textContent = 'Completing…';

    /* The card is validated and charged nowhere: the server keeps only the
       brand and last four digits against the order. */
    let res;
    try {
      res = await Store.checkout({
        plan: plan.id,
        billing: cycle.value,
        cardName: form.cardname.value.trim(),
        card: card.value,
        exp: exp.value,
        cvc: cvc.value,
        postcode: form.zip.value.trim()
      });
    } catch (e) {
      submit.disabled = false;
      submit.textContent = 'Complete order';
      if (e.code === 'unauthorized') return apiFail(e);
      if (e.field && form[e.field === 'cardName' ? 'cardname' : e.field]) {
        form[e.field === 'cardName' ? 'cardname' : e.field].focus();
      }
      return fail(e.message);
    }

    const order = res.order;
    renderHeader();

    host.innerHTML = `
      <div class="wrap" style="max-width:660px">
        <div class="card success-card">
          <div class="tick">&#10003;</div>
          <div class="num-tag">Order complete</div>
          <h2>You are ${order.planName}</h2>
          <p>$${(order.amountCents / 100).toFixed(2)} charged ${order.billing === 'year' ? 'yearly' : 'monthly'} to the ${order.cardBrand} ending ${order.cardLast4}. Your new benefits are live from this cycle.</p>
          <div class="kv" style="margin:20px 0">
            <div><span>Plan</span><span>${order.planName}</span></div>
            <div><span>Account</span><span>${Store.session().email}</span></div>
            <div><span>Next charge</span><span>${formatDate(order.nextCharge)}</span></div>
            <div><span>Reference</span><span>${order.id}</span></div>
          </div>
          <div class="profile-actions">
            <a class="btn btn-gold btn-sm" href="account.html">Go to your dashboard</a>
            <a class="btn btn-sm" href="submit.html">Nominate a Fraud</a>
          </div>
        </div>
      </div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Membership active: ' + order.planName + '.');
  });
});

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
