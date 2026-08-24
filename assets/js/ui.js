/* ============================================================
   OFFICIAL FRAUD RANKINGS — shared chrome and widgets
   ============================================================ */

/* ---------- site header / footer ---------- */
const NAV = [
  { href: 'index.html',      label: 'Home'          },
  { href: 'rankings.html',   label: 'Rankings'      },
  { href: 'compare.html',    label: 'Compare'       },
  { href: 'news.html',       label: 'Cycle Reports' },
  { href: 'about.html',      label: 'Methodology'   },
  { href: 'membership.html', label: 'Membership'    }
];

function currentPage() {
  return (location.pathname.split('/').pop() || 'index.html').toLowerCase();
}

function renderHeader() {
  const host = document.getElementById('site-header');
  if (!host) return;
  const here = currentPage();
  const signedIn = Store.isSignedIn();
  const s = Store.session();

  host.innerHTML = `
    <div class="ticker-bar"><div class="ticker-track"></div></div>
    <header class="site-head">
      <div class="wrap head-inner">
        <a class="brand" href="index.html">
          <span class="brand-mark">F</span>
          <span class="brand-txt">
            <span class="b1"><i class="w-official">Official </i><em>Fraud</em> Rankings</span>
            <span class="b2">The Fraud Verse Leaderboard</span>
          </span>
        </a>
        <nav class="nav">
          ${NAV.map(n => `<a href="${n.href}"${n.href === here ? ' class="on"' : ''}>${n.label}</a>`).join('')}
          <a class="nav-submit" href="submit.html">Submit a Fraud</a>
          ${signedIn
            ? `<a class="nav-only" href="account.html">Account</a><a class="nav-only" href="#" data-signout>Sign out</a>`
            : `<a class="nav-only" href="login.html">Sign in</a>`}
        </nav>
        <div class="head-cta">
          ${signedIn ? accountMenuMarkup(s) : `<a class="btn btn-gold btn-sm" href="login.html">Sign in</a>`}
        </div>
        <button class="burger" type="button" aria-label="Menu" aria-expanded="false">&#9776;</button>
      </div>
    </header>`;

  /* mobile nav */
  const burger = host.querySelector('.burger');
  const nav = host.querySelector('.nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });

  /* account dropdown */
  const menu = host.querySelector('.acct');
  if (menu) {
    const toggle = menu.querySelector('.acct-btn');
    toggle.addEventListener('click', ev => { ev.stopPropagation(); menu.classList.toggle('open'); });
    document.addEventListener('click', () => menu.classList.remove('open'));
  }

  host.querySelectorAll('[data-signout]').forEach(a => a.addEventListener('click', ev => {
    ev.preventDefault();
    Store.signOut();
    toast('Signed out.');
    renderHeader();
    if (['account.html', 'checkout.html', 'submit.html'].indexOf(currentPage()) > -1) location.href = 'index.html';
  }));

  renderTicker();
}

function accountMenuMarkup(s) {
  const plan = Store.plan();
  const hue = (s.email || '').length * 37 % 360;
  return `
    <div class="acct">
      <button class="acct-btn" type="button" aria-haspopup="true">
        <span class="acct-av" style="background:linear-gradient(150deg,hsl(${hue} 60% 66%),hsl(${(hue + 40) % 360} 52% 42%))">${(s.name || '?')[0].toUpperCase()}</span>
        <span class="acct-nm">${s.name}</span>
      </button>
      <div class="acct-menu">
        <div class="acct-head">
          <div class="acct-nm2">${s.name}</div>
          <div class="acct-em">${s.email}</div>
          <span class="tier tier-${plan.level === 2 ? 'mythic' : plan.level === 1 ? 'elite' : 'prospect'}">${plan.name}</span>
        </div>
        <a href="account.html">Dashboard</a>
        <a href="account.html#watchlist">Watchlist</a>
        <a href="account.html#votes">Vote record</a>
        <a href="submit.html">Nominate a Fraud</a>
        <a href="membership.html">Manage membership</a>
        <a href="#" data-signout>Sign out</a>
      </div>
    </div>`;
}

function renderFooter() {
  const host = document.getElementById('site-footer');
  if (!host) return;
  host.innerHTML = `
    <footer class="site-foot">
      <div class="wrap">
        <div class="foot-grid">
          <div>
            <h4>Official Fraud Rankings</h4>
            <p>The definitive daily leaderboard tracking the rise and fall of the most influential Frauds across the verse in culture, business and media.</p>
            <p>Board refreshed every 48 hours. Cycle ${CURRENT_CYCLE}.</p>
          </div>
          <div>
            <h4>The Board</h4>
            <a href="rankings.html">Full rankings</a>
            <a href="rankings.html?sort=movers">Biggest risers</a>
            <a href="rankings.html?sort=fallers">Biggest fallers</a>
            <a href="compare.html">Head to head</a>
          </div>
          <div>
            <h4>How it works</h4>
            <a href="about.html#qualities">The ten qualities</a>
            <a href="about.html#tiers">Tier structure</a>
            <a href="about.html#faq">FAQ</a>
            <a href="news.html">Cycle reports</a>
          </div>
          <div>
            <h4>Members</h4>
            <a href="membership.html">Membership</a>
            <a href="submit.html">Submit a Fraud</a>
            <a href="contact.html#appeal">Appeal a grade</a>
            <a href="contact.html">Contact the panel</a>
          </div>
        </div>
        <div class="foot-bottom">
          <span>&copy; <span id="year">${new Date().getFullYear()}</span> Official Fraud Rankings. All rights reserved.</span>
          <span class="foot-legal">
            <a href="terms.html">Terms</a>
            <a href="privacy.html">Privacy</a>
            <span>Satirical parody &middot; All ranked figures are fictional</span>
          </span>
        </div>
      </div>
    </footer>`;
}

function renderTicker() {
  const track = document.querySelector('.ticker-track');
  if (!track) return;
  const movers = rankedField().filter(f => f.movement !== 0)
    .sort((a, b) => Math.abs(b.movement) - Math.abs(a.movement))
    .slice(0, 10);

  track.innerHTML = movers.map(f => {
    const cls = f.movement > 0 ? 'u' : 'd';
    const arr = f.movement > 0 ? '&#9650;' : '&#9660;';
    return `<span><b>${f.name}</b> #${f.rank} <i class="${cls}">${arr} ${Math.abs(f.movement)}</i> · ${fmt(f.score)}</span>`;
  }).join('') + `<span>Cycle ${CURRENT_CYCLE} · Board refreshed every 48 hours · <b>Submissions open</b></span>`;
}

/* ---------- avatars ---------- */
const AV_HUES = [42, 12, 205, 268, 150, 330, 190, 88];

function initials(name) {
  return name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function avatarStyle(fraud) {
  const hue = AV_HUES[parseInt(fraud.id.slice(1), 10) % AV_HUES.length];
  return `linear-gradient(150deg, hsl(${hue} 62% 68%), hsl(${(hue + 34) % 360} 54% 44%))`;
}

function avatar(fraud, cls) {
  const el = document.createElement('div');
  el.className = 'av ' + (cls || '');
  el.style.background = avatarStyle(fraud);
  el.textContent = initials(fraud.name);
  return el;
}

/* ---------- toast ---------- */
function toast(message, kind) {
  let host = document.querySelector('.toast-host');
  if (!host) {
    host = document.createElement('div');
    host.className = 'toast-host';
    document.body.appendChild(host);
  }
  const t = document.createElement('div');
  t.className = 'toast' + (kind ? ' toast-' + kind : '');
  t.textContent = message;
  host.appendChild(t);
  requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, 3200);
}

/* ---------- modal ---------- */
function modal(title, bodyHtml, actionsHtml) {
  const back = document.createElement('div');
  back.className = 'modal-back';
  back.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${title}">
      <button class="modal-x" type="button" aria-label="Close">&times;</button>
      <h3>${title}</h3>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-actions">${actionsHtml || '<button class="btn btn-gold" data-close type="button">Close</button>'}</div>
    </div>`;
  document.body.appendChild(back);
  requestAnimationFrame(() => back.classList.add('in'));

  const close = () => { back.classList.remove('in'); setTimeout(() => back.remove(), 220); };
  back.addEventListener('click', ev => { if (ev.target === back) close(); });
  back.querySelector('.modal-x').addEventListener('click', close);
  back.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  document.addEventListener('keydown', function esc(ev) {
    if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });
  return { el: back, close };
}

/* ---------- vote + watch widgets ---------- */
function voteControls(fraud) {
  const wrap = document.createElement('div');
  wrap.className = 'votes';
  const s = sentiment(fraud);
  const current = Store.voteFor(fraud.id);

  [['rise', 'Rising ' + s.rise + '%'], ['over', 'Overrated ' + s.over + '%']].forEach(([kind, label]) => {
    const b = document.createElement('button');
    b.className = 'vote ' + kind + (current === kind ? ' cast' : '');
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', ev => {
      ev.stopPropagation();
      ev.preventDefault();
      const now = Store.castVote(fraud.id, kind);
      wrap.querySelectorAll('.vote').forEach(x => x.classList.remove('cast'));
      if (now) {
        b.classList.add('cast');
        toast(fraud.name + ' marked ' + (kind === 'rise' ? 'a rising star' : 'overrated') + '.');
      } else {
        toast('Vote withdrawn.');
      }
    });
    wrap.appendChild(b);
  });
  return wrap;
}

function watchButton(fraud, withLabel) {
  const b = document.createElement('button');
  b.type = 'button';
  const paint = () => {
    const on = Store.isWatched(fraud.id);
    b.className = 'watch' + (on ? ' on' : '') + (withLabel ? ' watch-lg' : '');
    b.title = on ? 'Remove from watchlist' : 'Add to watchlist';
    b.setAttribute('aria-pressed', String(on));
    b.innerHTML = (on ? '&#9733;' : '&#9734;') + (withLabel ? ' <span>' + (on ? 'Watching' : 'Watch') + '</span>' : '');
  };
  paint();
  b.addEventListener('click', ev => {
    ev.stopPropagation();
    ev.preventDefault();
    const res = Store.toggleWatch(fraud.id);
    if (res === 'full') {
      modal('Watchlist limit reached',
        '<p>Spectator members can watch up to five Frauds. Verified members get an unlimited watchlist along with a nomination every cycle.</p>',
        '<a class="btn" href="account.html#watchlist">Manage watchlist</a><a class="btn btn-gold" href="membership.html">See membership</a>');
      return;
    }
    paint();
    toast(res ? fraud.name + ' added to your watchlist.' : fraud.name + ' removed from your watchlist.');
  });
  return b;
}

/* ---------- board rows (shared by home and rankings) ---------- */
function boardRow(f, opts) {
  opts = opts || {};
  const row = document.createElement('div');
  row.className = 'row' + (f.rank <= 3 ? ' top3' : '');
  row.tabIndex = 0;
  row.setAttribute('role', 'link');
  const go = () => { location.href = 'profile.html?id=' + f.id; };
  row.addEventListener('click', go);
  row.addEventListener('keydown', ev => { if (ev.key === 'Enter') go(); });

  const rank = document.createElement('div');
  rank.className = 'rank';
  rank.textContent = f.rank;

  const mv = document.createElement('div');
  mv.innerHTML = movementMarkup(f.movement);

  const who = document.createElement('div');
  who.className = 'who';
  who.appendChild(avatar(f, 'av-sm'));
  const nm = document.createElement('div');
  nm.innerHTML = `<div class="nm">${f.name}</div><div class="mt">${f.handle}<span class="who-region"> · ${f.region}</span></div>`;
  who.appendChild(nm);

  const sc = document.createElement('div');
  sc.className = 'score';
  sc.textContent = fmt(f.score);

  const tc = document.createElement('div');
  tc.className = 'tier-cell';
  tc.innerHTML = `<span class="tier tier-${f.tier.key}">${f.tier.label}</span>`;

  row.append(rank, mv, who, sc, tc);
  if (opts.votes !== false) row.append(voteControls(f));

  const act = document.createElement('div');
  act.className = 'row-act';
  act.appendChild(watchButton(f));
  row.append(act);
  return row;
}

/* ---------- membership plan card ---------- */
function planCardMarkup(p) {
  const current = Store.isSignedIn() && Store.plan().id === p.id;
  return `
    <div class="card plan${p.featured ? ' feature' : ''}${current ? ' current' : ''}">
      <div class="num-tag">Tier 0${p.level + 1}${p.featured ? ' · Most popular' : ''}${current ? ' · Your plan' : ''}</div>
      <h3>${p.name}</h3>
      <div class="price">${p.price ? '$' + p.price : 'Free'}<small>${p.price ? ' / month' : ' / forever'}</small></div>
      <p class="plan-blurb">${p.blurb}</p>
      <ul>${p.perks.map(x => `<li>${x}</li>`).join('')}</ul>
      ${current
        ? '<a class="btn btn-block" href="account.html">Manage plan</a>'
        : p.price
          ? `<a class="btn ${p.featured ? 'btn-gold' : ''} btn-block" href="checkout.html?plan=${p.id}">Choose ${p.name}</a>`
          : '<a class="btn btn-block" href="rankings.html">Browse the board</a>'}
    </div>`;
}

/* ---------- forms ---------- */
function initForms() {
  document.querySelectorAll('form[data-notice]').forEach(form => {
    form.addEventListener('submit', ev => {
      ev.preventDefault();
      const notice = document.getElementById(form.dataset.notice);
      if (notice) {
        notice.classList.add('show');
        notice.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      form.reset();
    });
  });
}

/* ---------- boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  initForms();
});
