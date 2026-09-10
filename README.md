# Official Fraud Rankings

A parody leaderboard product — the definitive daily board tracking the rise and fall of the most
influential **Frauds** across the verse in culture, business and media. Seventeen frontend pages
covering the whole surface (board, profiles, head-to-head, cycle reports, membership and checkout,
accounts, dashboard, nominations, legal, 404) on top of a Node backend with real accounts, sessions,
persistence and plan enforcement.

No build step and no npm dependencies on either side: plain HTML, CSS and vanilla JavaScript in the
browser, Node's own modules and `node:sqlite` on the server.

Every grade, panel note and quote on this site is invented for entertainment. The top three are real
people who are in on the joke; the rest of the board is fictional.

```bash
npm start                  # http://127.0.0.1:8080 — site and API on one origin
node tools/build-bundle.js # dist/fraud-rankings.html — the whole site in one file
```

## Pages

| Page | What it is |
| --- | --- |
| `index.html` | Home — hero, headline numbers, top-three podium, risers/fallers, top ten, latest cycle reports, membership |
| `rankings.html` | The complete board — search, sort, tier chips, region filter, rank-by-any-quality, watchlist-only, pagination |
| `profile.html?id=f006` | One Fraud — ten grade bars against the board average, 12-cycle rank history chart, record, voting, nearby ranks |
| `compare.html?a=f001&b=f003` | Head to head — any two Frauds: PSL and Appeal side by side, quality-by-quality split bars, per-quality winners, panel verdict, swap and shuffle |
| `rivalry.html` | The marquee pairing — Party vs Adhilice, the 0.01 margin, the PSL/Appeal split, the chase from 2.10 down, the verdict |
| `news.html` / `article.html?id=c41` | Cycle reports index and article, with the board's top five alongside and prev/next |
| `looksmax.html` | The looksmaxxing desk — category chips, search, saved-only, quickest-read sort, and the daily routine tracker |
| `looksmax-article.html?id=lm01` | One protocol: the piece, the checklist, the verdict, which graded quality it feeds, related reading |
| `test.html` | The Fraud Test — ten sliders, a live aggregate, and where that aggregate would enter the board |
| `membership.html` | Three tiers, a full feature comparison table, membership FAQ |
| `checkout.html?plan=verified` | Monthly/yearly summary, validated card form, order confirmation |
| `login.html` / `signup.html` | Sign in and create account, with redirect-through for gated destinations |
| `account.html` | Member dashboard — usage tiles, watchlist, vote record, nominations, appeals, settings |
| `submit.html` | Nomination flow, gated by sign-in, plan and one-per-cycle |
| `about.html` | Methodology — the ten qualities, tier structure, the cycle, FAQ |
| `contact.html` | Grade appeals (wired to the store) and a general enquiry form |
| `terms.html` / `privacy.html` | What the site is, and what it stores |
| `404.html` | Unranked |

## The interactive bits

- **Compare any two** — every board row carries a compare toggle. Pick two anywhere on the board and
  a tray rises with both names and a link straight into the head-to-head; a third pick replaces the
  oldest. Profiles link into it too, and `compare.html?a=…&b=…` is shareable.
- **Dossiers** — the top three carry a full profile beyond the ten grades: a status line, a pull
  quote and signature look, vitals (height, weight, clavicle, wingspan, debut), the lanes carrying
  the profile against the ones the panel is watching, ventures, a daily protocol, a cycle-by-cycle
  timeline and a rivalry card. Frauds without one simply do not render those sections.
- **PSL and Appeal** — two published readings that sit beside the aggregate without feeding it.
  PSL (1–10) weighs the structural lanes: aesthetics at half, then frame, grooming and height.
  Appeal weighs what a room reacts to: social resonance, personality, business and drip. Cycle 41's
  top two split them one each, which is the site's own argument for grading ten qualities evenly.

- **Looksmax desk** (`looksmax.html`) — a vertical separate from the cycle reports: ten pieces across
  nine categories (jaw and mewing, skin, hair, frame, sleep, diet, style, posture, angles), each with
  a protocol checklist, a one-line verdict, and the graded quality it feeds. Filter by category,
  search the full text, sort by quickest read, and save pieces to a reading list on your account.
- **Daily routine tracker** — seven habits from the desk's protocol, ticked per day, with a streak
  (three habits makes a day count) and a fourteen-day strip. Saved server-side and shown on the
  dashboard.
- **The Fraud Test** (`test.html`) — grade yourself on the same ten qualities. Live aggregate and
  tier as you drag, then a verdict: which rank you would enter at, how many ranked Frauds you beat,
  your strongest and weakest lane with the aggregate points it costs, the Fraud directly above and
  below you, and a prescribed article for the weak lane. Results save to your account and every run
  has a share link that carries the grades in the URL.
- **Member grades** — on any profile, members grade the whole man on one slider; the average is
  published next to the panel's aggregate with the gap called out.
- **The wire** — a live activity feed on the home page: votes, grades, nominations, test scores and
  memberships as they happen, first names only.
- **Command palette** — `Ctrl/⌘ K` (or `/`) anywhere, searching Frauds by name, nickname, handle and
  region, plus looksmax protocol, cycle reports and pages, with arrow-key navigation.

## Backend

`npm start` runs `server/server.js`, which serves the static site and the JSON API from a single
origin so the session cookie can stay `HttpOnly` and `SameSite=Strict`.

```
server/server.js    HTTP server: static files, routing, security headers, error shaping
server/api.js       the 19 endpoints, validation and every membership rule
server/db.js        SQLite schema and seeding (node:sqlite, WAL, foreign keys on)
server/auth.js      scrypt password hashing, session tokens, cookies
server/dataset.js   loads assets/js/data.js as the canonical dataset for both sides
server/data/        the SQLite database (created on first run, gitignored)
```

### API

| Method | Path | What it does |
| --- | --- | --- |
| `GET` | `/api/health` | liveness, touches the database |
| `GET` | `/api/bootstrap` | categories, plans, cycle reports, the whole ranked board, regions |
| `GET` | `/api/frauds` | board query — `q`, `tier`, `region`, `quality`, `sort`, `watched`, `limit`, `offset` |
| `GET` | `/api/frauds/:id` | one Fraud plus the ranks either side |
| `POST` | `/api/auth/signup` · `/login` · `/logout` | accounts and sessions |
| `GET` `PATCH` `DELETE` | `/api/auth/me` | current member state, edit details, delete the account |
| `PUT` `DELETE` | `/api/watchlist/:id` | watch or unwatch, cap enforced |
| `POST` | `/api/votes` | rising / overrated, toggling, returns the fresh tally |
| `POST` | `/api/ratings` | a member's own grade for a Fraud, returns the community average |
| `GET` | `/api/looksmax` | the desk — `q`, `category`, `tag`, `saved`, `sort` |
| `GET` | `/api/looksmax/:id` | one piece plus related, prev and next |
| `PUT` `DELETE` | `/api/bookmarks/:id` | save or unsave an article |
| `GET` `POST` | `/api/routine` | today's habits and the streak |
| `POST` | `/api/self-test` | grade a set of ten qualities, returns rank, lanes and prescribed reading |
| `GET` | `/api/activity` | the wire — recent votes, grades, nominations, tests and memberships |
| `GET` `POST` | `/api/nominations` | nominate, gated by plan and one per cycle |
| `GET` `POST` | `/api/appeals` | file a grade appeal |
| `POST` | `/api/checkout` | validate a card, record an order, set the plan |
| `POST` | `/api/membership/cancel` | back to Spectator |

Errors come back as `{ "error": { "code", "message", "field" } }` with a real status code, and the
frontend renders `message` next to the field named by `field`.

### Rules the server enforces

The frontend shows these; the backend is what actually applies them.

- **Auth** — votes, watchlists, nominations, appeals and checkout all require a session.
- **Watchlist cap** — five for Spectator, unlimited from Verified up.
- **Grades and routines** — one grade per member per Fraud, one routine row per member per day, and
  no ticking a day that has not happened yet.
- **Nominations** — Verified or better, one per member per cycle, no name already on the board,
  a real quality, and at least forty characters of case.
- **Appeals** — must name one of the ten graded qualities; Panel Access members get one priority
  appeal per cycle, everyone else's is logged.
- **Checkout** — Luhn check, expiry and CVC validation, server-side pricing (yearly bills ten
  months, not twelve). Only the card brand and last four digits are stored.

### Security

- Passwords: `scrypt` with a per-user random salt, compared in constant time.
- Sessions: 32 random bytes in an `HttpOnly`, `SameSite=Strict` cookie; only the SHA-256 of the
  token is stored, so a copy of the database cannot be replayed. Expired sessions are swept on boot.
- CSRF: every mutation requires an `X-OFR-Client` header, which a cross-origin form cannot send.
- Login and signup are rate limited per IP; request bodies are capped at 32 KB.
- Static serving refuses path traversal and never exposes `server/`.
- `X-Content-Type-Options`, `X-Frame-Options` and `Referrer-Policy` on every response; `no-store`
  on API responses.

### Running it

```bash
npm start                  # port 8080
PORT=3000 npm start        # or pick your own
npm run dev                # restarts on change
npm run reset-db           # wipe the database and reseed from data.js
curl localhost:8080/api/health
```

Node 22.5+ is required for `node:sqlite`, which prints an experimental-feature warning on boot —
that is Node talking about its own API, not a problem with the server. The database lives at
`server/data/ofr.sqlite`; set `OFR_DB` to move it.

### One-file build

`node tools/build-bundle.js` inlines every stylesheet, script and page body into
`dist/fraud-rankings.html` — the whole site, routed client-side through `?page=…`, with working
back/forward. It runs from a file:// path, any static host, or a published artifact, and behaves
exactly like the static fallback below: bundled dataset, member state in `localStorage`.

### Without the backend

The site still runs as plain static files (`python3 -m http.server`, GitHub Pages, anything). When
`/api/bootstrap` does not answer, the frontend falls back to the bundled dataset and keeps member
state in `localStorage`, and a banner says so. The one console 404 in that mode is the probe that
detects it.

## Structure

```
assets/css/styles.css   all styling — dark board aesthetic, responsive from 320px up
assets/js/data.js       dataset: 24 ranked Frauds, the ten qualities, plans, cycle reports,
                        the looksmax desk and the routine habits
assets/js/core.js       scoring, tiers, ranked field, rank history, sentiment, formatting
assets/js/api.js        fetch client for the JSON API
assets/js/store.js      member state — server-backed, with the localStorage fallback
assets/js/ui.js         header/footer components, toasts, modals, board rows, vote and watch widgets
assets/js/home.js       home page
assets/js/rankings.js   the full board
assets/js/profile.js    profile page, including the rank-history chart
assets/js/compare.js    head to head
assets/js/news.js       cycle reports index and article
assets/js/membership.js plans and feature table
assets/js/checkout.js   checkout, card validation, order confirmation
assets/js/auth.js       sign in / create account
assets/js/account.js    member dashboard
assets/js/submit.js     nomination flow and its gates
assets/js/contact.js    grade appeals
assets/js/about.js      the ten-qualities table
assets/js/looksmax.js   the desk feed, the routine tracker and article pages
assets/js/test.js       the Fraud Test
```

Page scripts register with `App.ready()`, which runs once the dataset and session have loaded, so
page code can read `Store` synchronously.

The header and footer are rendered by `ui.js` into `#site-header` / `#site-footer` on every page,
so navigation and the signed-in state stay consistent without duplicated markup.

## How grading works

Each Fraud is graded 0–100 on ten qualities — height, body frame, transformation, facial
aesthetics, grooming, style & drip, business acumen, social resonance, personality and longevity.
All ten are weighted evenly at 10%, so the aggregate is the flat mean. Rank is the descending order
of that aggregate and the tier (Mythic / Elite / Ascending / Contender / Prospect) follows from it.

## State

With the backend running, member state lives in SQLite and is shared: votes from every account move
the same sentiment tallies, and signing in on another browser brings the account with it. Without
it, the same state is kept per-browser in `localStorage` under `ofr.state.v2`.

Either way the checkout takes no payment, and no card number is stored — the server keeps the brand
and last four digits against the order and discards the rest.

## Editing the board

Add or edit entries in `assets/js/data.js`. It is the single source for both sides: the browser
loads it directly in static mode, and the server evaluates the same file to seed SQLite, refreshing
the `frauds` table on every boot (member data is never touched). Ranks, tiers, headline numbers, the
ticker, podium, movers, region filters and comparison options are all derived at runtime — nothing
needs renumbering by hand. `PLANS` and `NEWS` drive membership and cycle reports; `LOOKSMAX`,
`LOOKSMAX_CATEGORIES` and `HABITS` drive the looksmax desk and the routine tracker. A `nickname` on a
Fraud is rendered everywhere the board shows their name.
