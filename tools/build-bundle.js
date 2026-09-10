#!/usr/bin/env node
'use strict';
/* ============================================================
   Builds the whole site into one self-contained HTML file.
   Every page body becomes a template, every script and stylesheet is
   inlined, and a small router swaps <main> on ?page=… so the bundle
   behaves like the multi-page site without a server.
   ============================================================ */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'dist');
const OUT = path.join(OUT_DIR, 'fraud-rankings.html');

/* page file -> the script it needs, in load order */
const PAGES = [
  ['index.html', 'home.js'],
  ['rankings.html', 'rankings.js'],
  ['profile.html', 'profile.js'],
  ['compare.html', 'compare.js'],
  ['rivalry.html', 'rivalry.js'],
  ['test.html', 'test.js'],
  ['looksmax.html', 'looksmax.js'],
  ['looksmax-article.html', 'looksmax.js'],
  ['news.html', 'news.js'],
  ['article.html', 'news.js'],
  ['membership.html', 'membership.js'],
  ['checkout.html', 'checkout.js'],
  ['login.html', 'auth.js'],
  ['signup.html', 'auth.js'],
  ['account.html', 'account.js'],
  ['submit.html', 'submit.js'],
  ['about.html', 'about.js'],
  ['contact.html', 'contact.js'],
  ['terms.html', null],
  ['privacy.html', null],
  ['404.html', null]
];

const CORE = ['data.js', 'core.js', 'api.js', 'store.js', 'ui.js'];

const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const between = (html, open, close) => {
  const a = html.indexOf(open);
  const b = html.lastIndexOf(close);
  return a < 0 || b < 0 ? '' : html.slice(a + open.length, b).trim();
};

/* ---------- collect ---------- */
const css = read('assets/css/styles.css');

const bodies = PAGES.map(([file]) => {
  const html = read(file);
  return { page: file, body: between(html, '<main>', '</main>') };
});

const scripts = [];
for (const name of CORE) scripts.push({ name, code: read('assets/js/' + name) });
for (const [, script] of PAGES) {
  if (script && !scripts.some(s => s.name === script)) {
    scripts.push({ name: script, code: read('assets/js/' + script) });
  }
}

/* ---------- the router ---------- */
const router = `
/* ============================================================
   Bundle router — one file, every page, no server.
   ============================================================ */
(function () {
  const TEMPLATES = {};
  document.querySelectorAll('script[type="text/ofr-page"]').forEach(t => { TEMPLATES[t.dataset.page] = t.textContent; });

  const DEFAULT_PAGE = 'index.html';
  const main = document.getElementById('app-main');

  function pageFromUrl() {
    const p = new URLSearchParams(location.search).get('page');
    return TEMPLATES[p] ? p : DEFAULT_PAGE;
  }

  /* profile.html?id=f001 -> ?page=profile.html&id=f001 */
  function toBundleUrl(href) {
    const [file, query] = String(href).split('?');
    const page = file.split('/').pop() || DEFAULT_PAGE;
    if (!TEMPLATES[page]) return null;
    const qs = new URLSearchParams(query || '');
    qs.set('page', page);
    return location.pathname + '?' + qs.toString();
  }

  function render(push) {
    const page = pageFromUrl();
    window.__PAGE__ = page;
    Store.resetListeners();
    main.innerHTML = TEMPLATES[page];
    App.rerun();
    Compare.repaint();
    if (push !== false) window.scrollTo({ top: 0 });
    const anchor = new URLSearchParams(location.search).get('hash');
    if (anchor) {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  window.__NAVIGATE__ = function (href) {
    const url = toBundleUrl(href);
    if (!url) { location.href = href; return; }
    history.pushState(null, '', url);
    render();
  };

  /* links inside the bundle route rather than navigate */
  document.addEventListener('click', ev => {
    const a = ev.target.closest && ev.target.closest('a[href]');
    if (!a || ev.metaKey || ev.ctrlKey || ev.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;

    if (href.startsWith('#')) return;                       /* in-page anchor */
    const [file, query] = href.split('?');
    const page = file.split('/').pop();
    const [, hash] = (query || '').split('#');
    if (!TEMPLATES[page]) return;

    ev.preventDefault();
    const qs = new URLSearchParams((query || '').split('#')[0]);
    qs.set('page', page);
    if (hash || file.includes('#')) qs.set('hash', hash || file.split('#')[1]);
    history.pushState(null, '', location.pathname + '?' + qs.toString());
    render();
  });

  window.addEventListener('popstate', () => render(false));

  Store.boot().then(() => {
    renderHeader();
    renderFooter();
    render(false);
  });
})();
`;

/* App gains a rerun() so page initialisers fire on every route change. */
const uiPatch = [
  [`  return {
    ready(fn) {
      if (booted) fn();
      else queue.push(fn);
    },`,
   `  const registered = [];

  return {
    ready(fn) {
      registered.push(fn);
      if (booted) fn();
      else queue.push(fn);
    },

    /* a bundled build re-runs every page initialiser after swapping <main>;
       each one guards on its own host element, so only the live page acts */
    rerun() {
      booted = true;
      registered.forEach(fn => {
        try { fn(); } catch (e) { console.error(e); }
      });
      initForms();
    },`],
  /* the bundle boots through the router instead */
  [`document.addEventListener('DOMContentLoaded', () => { App.boot(); });`, ``]
];

/* ---------- assemble ---------- */
let js = scripts.map(s => `/* ===== ${s.name} ===== */\n${s.code}`).join('\n\n');
for (const [from, to] of uiPatch) {
  if (!js.includes(from)) throw new Error('bundle patch did not match:\n' + from.slice(0, 80));
  js = js.replace(from, to);
}

const title = 'Official Fraud Rankings';
const templates = bodies.map(b =>
  `<script type="text/ofr-page" data-page="${b.page}">\n${b.body}\n</script>`).join('\n\n');

const out = `<meta charset="utf-8">
<title>${title}</title>
<meta name="description" content="The definitive daily leaderboard tracking the rise and fall of the most influential Frauds across the verse.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
${css}
</style>

<div id="site-header"></div>
<main id="app-main"></main>
<div id="site-footer"></div>

${templates}

<script>
${js}
${router}
</script>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, out);

const kb = n => (n / 1024).toFixed(0) + 'KB';
console.log('built  ' + path.relative(ROOT, OUT));
console.log('pages  ' + bodies.length + ' · scripts ' + scripts.length + ' · size ' + kb(out.length));
