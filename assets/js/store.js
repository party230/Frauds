/* ============================================================
   OFFICIAL FRAUD RANKINGS — client-side store
   ------------------------------------------------------------
   Everything a member does lives in this browser: session,
   membership plan, watchlist, votes and nominations. There is no
   backend behind this site, so the store is the source of truth.
   ============================================================ */

const Store = (() => {
  const KEY = 'ofr.state.v2';
  const LEGACY_VOTES = 'ofr.votes.v1';

  const blank = () => ({
    session: null,          /* { name, email, plan, joined } */
    watchlist: [],          /* fraud ids */
    votes: {},              /* fraudId -> 'rise' | 'over' */
    nominations: [],        /* { name, handle, region, quality, note, cycle, status } */
    appeals: []             /* { fraudId, quality, note, cycle, status } */
  });

  function read() {
    let state;
    try { state = JSON.parse(localStorage.getItem(KEY)); }
    catch (e) { state = null; }
    state = Object.assign(blank(), state || {});

    /* carry over votes cast before the store existed */
    if (!Object.keys(state.votes).length) {
      try {
        const old = JSON.parse(localStorage.getItem(LEGACY_VOTES));
        if (old) state.votes = old;
      } catch (e) { /* ignore */ }
    }
    return state;
  }

  let state = read();
  const listeners = [];

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { /* private browsing — state stays in memory */ }
    listeners.forEach(fn => fn(state));
  }

  return {
    get: () => state,
    on(fn) { listeners.push(fn); return fn; },

    /* ----- session ----- */
    session: () => state.session,
    isSignedIn: () => !!state.session,
    plan: () => planById(state.session ? state.session.plan : 'spectator'),
    hasLevel(level) { return this.plan().level >= level; },

    signIn(email, name, plan) {
      state.session = {
        name: name || email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        email: email,
        plan: plan || (state.session && state.session.plan) || 'spectator',
        joined: (state.session && state.session.joined) || new Date().toISOString().slice(0, 10)
      };
      persist();
      return state.session;
    },

    signOut() { state.session = null; persist(); },

    setPlan(planId) {
      if (!state.session) return null;
      state.session.plan = planId;
      persist();
      return state.session;
    },

    /* ----- watchlist ----- */
    watchlist: () => state.watchlist.slice(),
    isWatched: id => state.watchlist.indexOf(id) > -1,

    toggleWatch(id) {
      const i = state.watchlist.indexOf(id);
      if (i > -1) { state.watchlist.splice(i, 1); persist(); return false; }

      const cap = Store.hasLevel(1) ? Infinity : 5;
      if (state.watchlist.length >= cap) return 'full';
      state.watchlist.push(id);
      persist();
      return true;
    },

    /* ----- votes ----- */
    votes: () => Object.assign({}, state.votes),
    voteFor: id => state.votes[id] || null,

    castVote(id, kind) {
      state.votes[id] = state.votes[id] === kind ? null : kind;
      if (!state.votes[id]) delete state.votes[id];
      persist();
      return state.votes[id] || null;
    },

    /* ----- nominations and appeals ----- */
    nominations: () => state.nominations.slice(),
    nominationsThisCycle: () => state.nominations.filter(n => n.cycle === CURRENT_CYCLE).length,

    addNomination(nom) {
      state.nominations.unshift(Object.assign({ cycle: CURRENT_CYCLE, status: 'Under review' }, nom));
      persist();
      return state.nominations[0];
    },

    appeals: () => state.appeals.slice(),

    addAppeal(appeal) {
      state.appeals.unshift(Object.assign({ cycle: CURRENT_CYCLE, status: 'Filed' }, appeal));
      persist();
      return state.appeals[0];
    },

    reset() { state = blank(); persist(); }
  };
})();
