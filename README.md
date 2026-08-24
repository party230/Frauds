# Official Fraud Rankings

A static parody leaderboard site — the definitive daily board tracking the rise and fall of the
most influential **Frauds** across the verse in culture, business and media. It mirrors the
structure of the "official rankings" leaderboard format: a ranked board, per-figure profile
pages, an evenly weighted ten-quality grading methodology, community voting, membership tiers
and a submission/appeals desk.

Every ranked figure, grade and quote on this site is fictional.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Hero, headline numbers, top-three podium, the full board (search / sort / tier filter / voting), membership tiers |
| `profile.html` | Per-Fraud profile — `profile.html?id=f006` — quality breakdown, 12-cycle rank history, board record, community vote, nearby competition |
| `about.html` | Methodology: the ten qualities, tier structure, the grading cycle, FAQ |
| `contact.html` | Submit a Fraud, general enquiries and grade appeals, panel desk |

## Structure

```
assets/css/styles.css   all styling (dark board aesthetic, fully responsive)
assets/js/data.js       the dataset: 24 ranked Frauds + the ten graded qualities
assets/js/app.js        scoring, tiers, board rendering, filters, votes, podium, ticker
assets/js/profile.js    profile page: grade bars, rank-history chart, record, neighbours
```

## How grading works

Each Fraud is graded 0–100 on ten qualities — height, body frame, transformation, facial
aesthetics, grooming, style & drip, business acumen, social resonance, personality and
longevity. All ten are weighted evenly at 10%, so the aggregate grade is the flat mean of the
ten. Rank is the descending order of that aggregate, and the tier (Mythic / Elite / Ascending /
Contender / Prospect) is derived from it.

Community "rising star" and "overrated" votes are stored per browser in `localStorage` under
`ofr.votes.v1`.

## Running it

No build step, no dependencies — plain HTML, CSS and vanilla JS.

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` from the filesystem works too, though profile links read a query string,
so a local server is the smoother path.

## Editing the board

Add or edit entries in `assets/js/data.js`. Ranks, tiers, headline numbers, the ticker and the
podium are all derived from the data at runtime — nothing needs to be renumbered by hand.
