/* ============================================================
   OFFICIAL FRAUD RANKINGS — member state
   ------------------------------------------------------------
   Backed by the API when the Node backend is serving the site. If the
   site is served as plain static files (no backend), the store falls
   back to this browser's localStorage so everything still works — the
   difference is announced by Store.offline.
   ============================================================ */

const Store = (() => {
  const KEY = 'ofr.state.v2';

  const blank = () => ({
    user: null,
    watchlist: [],
    votes: {},
    nominations: [],
    appeals: [],
    orders: [],
    nominationsThisCycle: 0
  });

  let state = blank();
  let offline = false;
  const listeners = [];
  const notify = () => listeners.forEach(fn => fn(state));

  /* ---------- offline persistence ---------- */
  function readLocal() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (!raw) return blank();
      /* the pre-backend shape kept the account under `session` */
      const user = raw.user || (raw.session ? {
        name: raw.session.name, email: raw.session.email,
        plan: raw.session.plan, joined: raw.session.joined
      } : null);
      return Object.assign(blank(), raw, { user: user });
    } catch (e) { return blank(); }
  }

  function writeLocal() {
    if (!offline) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  function apply(member) {
    state = Object.assign(blank(), member || {});
    state.nominationsThisCycle = state.nominations.filter(n => n.cycle === CURRENT_CYCLE).length;
    writeLocal();
    notify();
    return state;
  }

  function requireUser() {
    if (!state.user) throw new ApiError(401, { error: { code: 'unauthorized', message: 'Sign in to continue.' } });
  }

  return {
    get offline() { return offline; },
    get: () => state,
    on(fn) { listeners.push(fn); return fn; },

    /* ---------- boot ---------- */
    async boot() {
      try {
        const data = await Api.get('/bootstrap');
        applyDataset(data);
        const me = await Api.get('/auth/me');
        apply(me.user ? me : null);
      } catch (e) {
        /* no backend: bundled dataset plus whatever this browser remembers */
        offline = true;
        Api.offline = true;
        state = readLocal();
        state.nominationsThisCycle = state.nominations.filter(n => n.cycle === CURRENT_CYCLE).length;
        notify();
      }
      return state;
    },

    /* ---------- session ---------- */
    session: () => state.user,
    isSignedIn: () => !!state.user,
    plan: () => planById(state.user ? state.user.plan : 'spectator'),
    hasLevel(level) { return this.plan().level >= level; },

    async signIn(email, password) {
      if (offline) {
        state.user = { name: nameFromEmail(email), email: email, plan: state.user ? state.user.plan : 'spectator',
                       joined: new Date().toISOString().slice(0, 10) };
        writeLocal(); notify();
        return state;
      }
      return apply(await Api.post('/auth/login', { email, password }));
    },

    async signUp(name, email, password, confirm, terms) {
      if (offline) {
        state = blank();
        state.user = { name: name, email: email, plan: 'spectator', joined: new Date().toISOString().slice(0, 10) };
        writeLocal(); notify();
        return state;
      }
      return apply(await Api.post('/auth/signup', { name, email, password, confirm, terms }));
    },

    async signOut() {
      if (!offline) { try { await Api.post('/auth/logout'); } catch (e) { /* already gone */ } }
      state = blank();
      writeLocal();
      notify();
    },

    async updateAccount(name, email) {
      requireUser();
      if (offline) {
        state.user = Object.assign({}, state.user, { name, email });
        writeLocal(); notify();
        return state;
      }
      return apply(await Api.patch('/auth/me', { name, email }));
    },

    async deleteAccount() {
      if (!offline) { try { await Api.del('/auth/me'); } catch (e) { /* already gone */ } }
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      state = blank();
      notify();
    },

    /* ---------- watchlist ---------- */
    watchlist: () => state.watchlist.slice(),
    isWatched: id => state.watchlist.indexOf(id) > -1,

    async toggleWatch(id) {
      requireUser();
      const on = state.watchlist.indexOf(id) > -1;

      if (offline) {
        if (on) state.watchlist = state.watchlist.filter(x => x !== id);
        else {
          if (!this.hasLevel(1) && state.watchlist.length >= 5) {
            throw new ApiError(403, { error: { code: 'watchlist_full', message: 'Spectator members can watch up to five Frauds.' } });
          }
          state.watchlist.push(id);
        }
        writeLocal(); notify();
        return !on;
      }

      const res = on ? await Api.del('/watchlist/' + id) : await Api.put('/watchlist/' + id);
      state.watchlist = res.watchlist;
      notify();
      return res.watching;
    },

    /* ---------- votes ---------- */
    votes: () => Object.assign({}, state.votes),
    voteFor: id => state.votes[id] || null,

    async castVote(id, kind) {
      requireUser();
      if (offline) {
        state.votes[id] = state.votes[id] === kind ? null : kind;
        if (!state.votes[id]) delete state.votes[id];
        writeLocal(); notify();
        return { vote: state.votes[id] || null, sentiment: sentiment(byId(id)) };
      }

      const res = await Api.post('/votes', { fraudId: id, kind: kind });
      if (res.vote) state.votes[id] = res.vote; else delete state.votes[id];
      applySentiment(id, res.sentiment);
      notify();
      return res;
    },

    /* ---------- nominations and appeals ---------- */
    nominations: () => state.nominations.slice(),
    nominationsThisCycle: () => state.nominationsThisCycle,
    orders: () => state.orders.slice(),

    async addNomination(nom) {
      requireUser();
      if (offline) {
        const row = Object.assign({ cycle: CURRENT_CYCLE, status: 'Under review' }, nom);
        state.nominations.unshift(row);
        state.nominationsThisCycle++;
        writeLocal(); notify();
        return { nomination: row, earliestEntry: CURRENT_CYCLE + 2 };
      }
      const res = await Api.post('/nominations', nom);
      state.nominations.unshift(res.nomination);
      state.nominationsThisCycle++;
      notify();
      return res;
    },

    appeals: () => state.appeals.slice(),

    async addAppeal(appeal) {
      requireUser();
      if (offline) {
        const row = Object.assign({ cycle: CURRENT_CYCLE, status: 'Logged' }, appeal);
        state.appeals.unshift(row);
        writeLocal(); notify();
        return { appeal: row, priority: this.hasLevel(2) };
      }
      const res = await Api.post('/appeals', appeal);
      state.appeals.unshift(res.appeal);
      notify();
      return res;
    },

    /* ---------- membership ---------- */
    async checkout(order) {
      requireUser();
      if (offline) {
        state.user = Object.assign({}, state.user, { plan: order.plan });
        writeLocal(); notify();
        const plan = planById(order.plan);
        const months = order.billing === 'year' ? 10 : 1;
        return { order: {
          id: 'ord_local', plan: plan.id, planName: plan.name, billing: order.billing,
          amountCents: plan.price * months * 100, cardBrand: 'Card',
          cardLast4: String(order.card || '').replace(/\D/g, '').slice(-4),
          nextCharge: nextChargeDate(order.billing)
        } };
      }
      const res = await Api.post('/checkout', order);
      apply(res.member);
      return res;
    },

    async cancelPlan() {
      requireUser();
      if (offline) {
        state.user = Object.assign({}, state.user, { plan: 'spectator' });
        writeLocal(); notify();
        return state;
      }
      return apply(await Api.post('/membership/cancel'));
    }
  };

  function nameFromEmail(email) {
    return email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  function nextChargeDate(billing) {
    const d = new Date();
    if (billing === 'year') d.setFullYear(d.getFullYear() + 1); else d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  }
})();
