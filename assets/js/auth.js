/* ============================================================
   OFFICIAL FRAUD RANKINGS — sign in / create account
   ------------------------------------------------------------
   There is no backend: an account is a record in this browser.
   ============================================================ */

App.ready(() => {
  const form = document.getElementById('auth-form');
  if (!form) return;

  const mode = form.dataset.mode;                       /* 'login' | 'signup' */
  const params = new URLSearchParams(location.search);
  const next = params.get('next') || 'account.html';
  const plan = params.get('plan');

  if (Store.isSignedIn()) {
    const box = document.getElementById('already');
    box.innerHTML = `
      <div class="num-tag">Already signed in</div>
      <h3>${Store.session().name}</h3>
      <p>You are signed in as ${Store.session().email} on the ${Store.plan().name} plan.</p>
      <div class="profile-actions" style="margin-top:16px">
        <a class="btn btn-gold btn-sm" href="${next}">Continue</a>
        <button class="btn btn-sm" type="button" id="switch-account">Use another account</button>
      </div>`;
    box.classList.add('show');
    document.getElementById('switch-account').addEventListener('click', async () => {
      await Store.signOut();
      renderHeader();
      box.classList.remove('show');
    });
  }

  const err = document.getElementById('auth-error');
  const fail = msg => { err.textContent = msg; err.classList.add('show'); };

  const submit = form.querySelector('button[type=submit]');

  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    err.classList.remove('show');

    const email = form.email.value.trim();
    const password = form.password.value;
    const name = mode === 'signup' ? form.fullname.value.trim() : '';

    /* checked here for a fast answer, and again by the server */
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Enter a valid email address.');
    if (password.length < 8) return fail('Passwords are at least eight characters.');
    if (mode === 'signup') {
      if (name.length < 2) return fail('Enter the name the panel should see.');
      if (password !== form.confirm.value) return fail('Those passwords do not match.');
      if (!form.terms.checked) return fail('You need to accept the terms to create an account.');
    }

    submit.disabled = true;
    submit.textContent = mode === 'signup' ? 'Creating account…' : 'Signing in…';

    try {
      if (mode === 'signup') await Store.signUp(name, email, password, form.confirm.value, form.terms.checked);
      else await Store.signIn(email, password);
    } catch (e) {
      submit.disabled = false;
      submit.textContent = mode === 'signup' ? 'Create account' : 'Sign in';
      if (e.field && form[e.field]) form[e.field].focus();
      return fail(e.message);
    }

    renderHeader();
    toast(mode === 'signup' ? 'Account created. Welcome to the board.' : 'Signed in.');
    location.href = plan ? 'checkout.html?plan=' + plan : next;
  });

  /* carry the redirect through the login/signup switch link */
  document.querySelectorAll('[data-carry]').forEach(a => {
    const url = new URL(a.getAttribute('href'), location.href);
    if (params.get('next')) url.searchParams.set('next', params.get('next'));
    if (plan) url.searchParams.set('plan', plan);
    a.setAttribute('href', url.pathname.split('/').pop() + url.search);
  });
});
