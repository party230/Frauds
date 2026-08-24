# Official Fraud Rankings

A complete static frontend for a parody leaderboard product — the definitive daily board tracking
the rise and fall of the most influential **Frauds** across the verse in culture, business and
media. Seventeen pages covering the whole product surface: the board, profiles, head-to-head
comparison, cycle reports, membership and checkout, accounts, a member dashboard, the nomination
flow, legal pages and a 404.

No build step, no dependencies, no backend — plain HTML, CSS and vanilla JavaScript.

Every ranked figure, grade and quote on this site is fictional.

## Pages

| Page | What it is |
| --- | --- |
| `index.html` | Home — hero, headline numbers, top-three podium, risers/fallers, top ten, latest cycle reports, membership |
| `rankings.html` | The complete board — search, sort, tier chips, region filter, rank-by-any-quality, watchlist-only, pagination |
| `profile.html?id=f006` | One Fraud — ten grade bars against the board average, 12-cycle rank history chart, record, voting, nearby ranks |
| `compare.html?a=f001&b=f003` | Head to head — quality-by-quality split bars, per-quality winners, panel verdict, swap and shuffle |
| `news.html` / `article.html?id=c41` | Cycle reports index and article, with the board's top five alongside and prev/next |
| `membership.html` | Three tiers, a full feature comparison table, membership FAQ |
| `checkout.html?plan=verified` | Monthly/yearly summary, validated card form, order confirmation |
| `login.html` / `signup.html` | Sign in and create account, with redirect-through for gated destinations |
| `account.html` | Member dashboard — usage tiles, watchlist, vote record, nominations, appeals, settings |
| `submit.html` | Nomination flow, gated by sign-in, plan and one-per-cycle |
| `about.html` | Methodology — the ten qualities, tier structure, the cycle, FAQ |
| `contact.html` | Grade appeals (wired to the store) and a general enquiry form |
| `terms.html` / `privacy.html` | What the site is, and what it stores |
| `404.html` | Unranked |

## Structure

```
assets/css/styles.css   all styling — dark board aesthetic, responsive from 320px up
assets/js/data.js       dataset: 24 ranked Frauds, the ten qualities, plans, cycle reports
assets/js/core.js       scoring, tiers, ranked field, rank history, sentiment, formatting
assets/js/store.js      client-side state: session, plan, watchlist, votes, nominations, appeals
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
```

The header and footer are rendered by `ui.js` into `#site-header` / `#site-footer` on every page,
so navigation and the signed-in state stay consistent without duplicated markup.

## How grading works

Each Fraud is graded 0–100 on ten qualities — height, body frame, transformation, facial
aesthetics, grooming, style & drip, business acumen, social resonance, personality and longevity.
All ten are weighted evenly at 10%, so the aggregate is the flat mean. Rank is the descending order
of that aggregate and the tier (Mythic / Elite / Ascending / Contender / Prospect) follows from it.

## State

There is no server. Everything a member does is written to `localStorage` under `ofr.state.v2`:
session and plan, watchlist, rising-star/overrated votes, nominations and appeals. Clearing it from
the dashboard, or clearing site data, removes it permanently. The checkout takes no payment and no
card details leave the form.

Plan gates are enforced in the UI: Spectator watchlists cap at five, nominations need Verified, and
one nomination is allowed per member per cycle.

## Running it

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

A local server is needed because pages read query strings (`profile.html?id=…`); opening the files
directly still renders, but links between pages are smoother over HTTP.

## Editing the board

Add or edit entries in `assets/js/data.js`. Ranks, tiers, headline numbers, the ticker, the podium,
movers, region filters and comparison options are all derived from the data at runtime — nothing
needs renumbering by hand. `PLANS` and `NEWS` in the same file drive membership and cycle reports.
