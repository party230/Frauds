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
    bookmarks: [],
    ratings: {},
    tests: [],
    routine: { today: [], streak: 0, last14: [], days: 0 },
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
    resetListeners() { listeners.length = 0; },

    /* ---------- boot ---------- */
    async boot() {
      try {
        const data = await Api.get('/bootstrap');
        /* a host that answers unknown paths with its own page is not a backend */
        if (!data || !Array.isArray(data.frauds) || !data.frauds.length) throw new Error('no backend');
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

    /* ---------- saved looksmaxxing articles ---------- */
    bookmarks: () => state.bookmarks.slice(),
    isSaved: id => state.bookmarks.indexOf(id) > -1,

    async toggleBookmark(id) {
      requireUser();
      const on = state.bookmarks.indexOf(id) > -1;
      if (offline) {
        state.bookmarks = on ? state.bookmarks.filter(x => x !== id) : [id].concat(state.bookmarks);
        writeLocal(); notify();
        return !on;
      }
      const res = on ? await Api.del('/bookmarks/' + id) : await Api.put('/bookmarks/' + id);
      state.bookmarks = res.bookmarks;
      notify();
      return res.saved;
    },

    /* ---------- member grades ---------- */
    ratings: () => Object.assign({}, state.ratings),
    ratingFor: id => (id in state.ratings ? state.ratings[id] : null),

    async rate(fraudId, score) {
      requireUser();
      if (offline) {
        state.ratings[fraudId] = score;
        writeLocal(); notify();
        const f = byId(fraudId);
        return { score, community: { average: score, count: 1 }, panel: f.score };
      }
      const res = await Api.post('/ratings', { fraudId, score });
      state.ratings[fraudId] = res.score;
      const f = FRAUDS.find(x => x.id === fraudId);
      if (f) f.community = res.community;
      notify();
      return res;
    },

    /* ---------- daily routine ---------- */
    routine: () => state.routine,

    async saveRoutine(habitKeys) {
      requireUser();
      if (offline) {
        const day = new Date().toISOString().slice(0, 10);
        const days = Object.assign({}, state.routineDays || {}, { [day]: habitKeys });
        state.routineDays = days;
        state.routine = localRoutineSummary(days);
        writeLocal(); notify();
        return state.routine;
      }
      state.routine = await Api.post('/routine', { habits: habitKeys });
      notify();
      return state.routine;
    },

    /* ---------- the Fraud Test ---------- */
    tests: () => state.tests.slice(),

    async runTest(stats) {
      if (offline) {
        const res = localTestResult(stats);
        if (state.user) {
          state.tests.unshift({ id: 'tst_local_' + Date.now(), stats, score: res.score, tier: res.tier.label,
                                wouldRank: res.wouldRank, createdAt: new Date().toISOString() });
          writeLocal(); notify();
        }
        return res;
      }
      const res = await Api.post('/self-test', { stats });
      if (state.user) {
        state.tests.unshift({ id: res.id, stats, score: res.score, tier: res.tier.label,
                              wouldRank: res.wouldRank, createdAt: new Date().toISOString() });
        notify();
      }
      return res;
    },

    /* ---------- activity ---------- */
    async activity(limit) {
      if (offline) return { events: [] };
      return Api.get('/activity?limit=' + (limit || 12));
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

  /* offline equivalents of what the server computes */
  function localRoutineSummary(days) {
    const iso = d => d.toISOString().slice(0, 10);
    const today = iso(new Date());
    const back = n => iso(new Date(Date.now() - n * 864e5));
    const count = d => (days[d] || []).length;

    let streak = 0;
    let i = count(today) >= 3 ? 0 : 1;
    while (count(back(i)) >= 3) { streak++; i++; }

    const last14 = [];
    for (let k = 13; k >= 0; k--) last14.push({ day: back(k), done: count(back(k)) });
    return { today: days[today] || [], streak, last14, days: Object.keys(days).length };
  }

  function localTestResult(stats) {
    const score = CATEGORIES.reduce((a, c) => a + stats[c.key], 0) / CATEGORIES.length;
    const field = rankedField();
    const sorted = CATEGORIES.slice().sort((a, b) => stats[a.key] - stats[b.key]);
    const weakest = sorted[0], strongest = sorted[sorted.length - 1];
    const advice = LOOKSMAX.find(a => a.tags.includes(weakest.key) || a.category === weakest.key) || LOOKSMAX[0];
    return {
      score: Number(score.toFixed(1)),
      tier: tierOf(score),
      wouldRank: field.filter(f => f.score > score).length + 1,
      fieldSize: field.length,
      beats: field.filter(f => f.score < score).length,
      weakest: { key: weakest.key, label: weakest.label, value: stats[weakest.key] },
      strongest: { key: strongest.key, label: strongest.label, value: stats[strongest.key] },
      reading: advice ? { id: advice.id, title: advice.title, verdict: advice.verdict } : null,
      saved: false
    };
  }

  function nextChargeDate(billing) {
    const d = new Date();
    if (billing === 'year') d.setFullYear(d.getFullYear() + 1); else d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  }
})();
