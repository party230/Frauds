/* ============================================================
   OFFICIAL FRAUD RANKINGS — member dashboard
   ============================================================ */

App.ready(() => {
  const host = document.getElementById('account');
  if (!host) return;

  if (!Store.isSignedIn()) {
    host.innerHTML = `
      <div class="wrap" style="max-width:560px">
        <div class="card gate-card">
          <div class="num-tag">Members only</div>
          <h2>Sign in to see your dashboard</h2>
          <p>Your watchlist, vote record and nominations live behind your account.</p>
          <div class="profile-actions" style="margin-top:18px">
            <a class="btn btn-gold btn-sm" href="login.html?next=account.html">Sign in</a>
            <a class="btn btn-sm" href="signup.html">Create an account</a>
          </div>
        </div>
      </div>`;
    return;
  }

  render();
  Store.on(render);

  function render() {
    const s = Store.session();
    if (!s) return;                     /* signing out re-notifies while we navigate away */
    const plan = Store.plan();
    const field = rankedField();

    /* ----- summary ----- */
    document.getElementById('acct-summary').innerHTML = `
      <div class="acct-hero">
        <span class="av av-lg" style="background:linear-gradient(150deg,hsl(${s.email.length * 37 % 360} 60% 66%),hsl(${(s.email.length * 37 + 40) % 360} 52% 42%))">${s.name[0].toUpperCase()}</span>
        <div>
          <div class="eyebrow">Member since ${s.joined}</div>
          <h1>${s.name}</h1>
          <div class="handle">${s.email}</div>
          <div class="tags">
            <span class="tier tier-${plan.level === 2 ? 'mythic' : plan.level === 1 ? 'elite' : 'prospect'}">${plan.name}</span>
            <span class="tier tier-prospect">Cycle ${CURRENT_CYCLE}</span>
          </div>
        </div>
        <div class="acct-actions">
          ${plan.level < 2 ? '<a class="btn btn-gold btn-sm" href="membership.html">Upgrade plan</a>' : '<a class="btn btn-sm" href="membership.html">Manage plan</a>'}
          <a class="btn btn-sm" href="submit.html">Nominate a Fraud</a>
        </div>
      </div>`;

    /* ----- usage tiles ----- */
    const watch = Store.watchlist();
    const votes = Store.votes();
    document.getElementById('acct-stats').innerHTML = [
      [watch.length, 'On your watchlist'],
      [Object.keys(votes).length, 'Votes cast'],
      [Store.nominations().length, 'Nominations filed'],
      [plan.level >= 1 ? (1 - Store.nominationsThisCycle()) + '/1' : '0/1', 'Nominations left this cycle']
    ].map(([n, l]) => `<div><div class="n">${n}</div><div class="l">${l}</div></div>`).join('');

    /* ----- watchlist ----- */
    const wl = document.getElementById('watchlist');
    const watched = field.filter(f => watch.indexOf(f.id) > -1);
    if (!watched.length) {
      wl.innerHTML = `<div class="empty">
        <p>Nothing on your watchlist yet. Star any Fraud on the board to track them here.</p>
        <a class="btn btn-sm" href="rankings.html">Open the board</a>
      </div>`;
    } else {
      wl.innerHTML = '';
      watched.forEach(f => {
        const row = boardRow(f, { votes: false });
        wl.appendChild(row);
      });
    }
    document.getElementById('watch-cap').textContent = plan.level >= 1
      ? 'Unlimited watchlist on ' + plan.name + '.'
      : watch.length + ' of 5 used on Spectator.';

    /* ----- vote record ----- */
    const vr = document.getElementById('vote-record');
    const voted = field.filter(f => votes[f.id]);
    vr.innerHTML = voted.length
      ? `<div class="kv kv-list">${voted.map(f => `
          <div>
            <span><a href="profile.html?id=${f.id}">#${f.rank} ${f.name}</a></span>
            <span class="${votes[f.id] === 'rise' ? 'v-rise' : 'v-over'}">${votes[f.id] === 'rise' ? 'Rising star' : 'Overrated'}</span>
          </div>`).join('')}</div>`
      : '<div class="empty"><p>No votes cast this cycle.</p></div>';

    /* ----- nominations ----- */
    const noms = Store.nominations();
    document.getElementById('nominations').innerHTML = noms.length
      ? `<div class="kv kv-list">${noms.map(n => `
          <div>
            <span>${n.name} <em class="dim">${n.handle}</em></span>
            <span>Cycle ${n.cycle} · ${n.status}</span>
          </div>`).join('')}</div>`
      : `<div class="empty"><p>No nominations filed yet.</p><a class="btn btn-sm" href="submit.html">Nominate a Fraud</a></div>`;

    /* ----- orders ----- */
    const orders = Store.orders();
    const oh = document.getElementById('orders');
    if (oh) {
      oh.innerHTML = orders.length
        ? `<div class="kv kv-list">${orders.map(o => {
            const p = planById(o.plan);
            return `<div><span>${p.name} · ${o.billing === 'year' ? 'Yearly' : 'Monthly'} <em class="dim">${o.cardBrand} ····${o.cardLast4}</em></span><span>$${(o.amountCents / 100).toFixed(2)} · ${o.createdAt.slice(0, 10)}</span></div>`;
          }).join('')}</div>`
        : '<div class="empty"><p>No membership charges on this account.</p></div>';
    }

    /* ----- appeals ----- */
    const appeals = Store.appeals();
    document.getElementById('appeals').innerHTML = appeals.length
      ? `<div class="kv kv-list">${appeals.map(a => {
          const f = byId(a.fraudId);
          return `<div><span>${f ? f.name : a.fraudId} · ${a.quality}</span><span>Cycle ${a.cycle} · ${a.status}</span></div>`;
        }).join('')}</div>`
      : '<div class="empty"><p>No open appeals.</p></div>';
  }

  /* ----- settings ----- */
  const settings = document.getElementById('settings-form');
  settings.name_.value = Store.session().name;
  settings.email_.value = Store.session().email;
  settings.addEventListener('submit', async ev => {
    ev.preventDefault();
    const name = settings.name_.value.trim();
    const email = settings.email_.value.trim();
    if (name.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast('Check the name and email before saving.', 'bad');
      return;
    }
    try {
      await Store.updateAccount(name, email);
      renderHeader();
      render();
      toast('Account details saved.');
    } catch (err) {
      apiFail(err, 'Those details could not be saved.');
    }
  });

  document.getElementById('sign-out').addEventListener('click', async () => {
    await Store.signOut();
    toast('Signed out.');
    location.href = 'index.html';
  });

  document.getElementById('reset-data').addEventListener('click', () => {
    const where = Store.offline ? 'from this browser' : 'from the board';
    modal('Delete your account?',
      `<p>This removes your account, watchlist, votes, nominations and appeals ${where}. It cannot be undone.</p>`,
      '<button class="btn" data-close type="button">Keep my account</button><button class="btn btn-danger" id="confirm-reset" type="button">Delete everything</button>')
      .el.querySelector('#confirm-reset').addEventListener('click', async () => {
        try {
          await Store.deleteAccount();
          location.href = 'index.html';
        } catch (err) {
          apiFail(err, 'The account could not be deleted.');
        }
      });
  });
});
