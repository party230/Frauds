/* ============================================================
   OFFICIAL FRAUD RANKINGS — full board
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('board');
  if (!board) return;

  const params = new URLSearchParams(location.search);
  const search = document.getElementById('search');
  const sort = document.getElementById('sort');
  const region = document.getElementById('region');
  const quality = document.getElementById('quality');
  const watchOnly = document.getElementById('watch-only');
  const count = document.getElementById('result-count');
  const more = document.getElementById('load-more');
  const PAGE = 12;
  let shown = PAGE;

  /* deep links: rankings.html?sort=movers&tier=elite&q=berlin */
  if (params.get('sort') && sort) sort.value = params.get('sort');
  if (params.get('q') && search) search.value = params.get('q');
  let tier = params.get('tier') || 'all';

  /* region filter options come from the dataset */
  region.innerHTML = '<option value="all">Region: All</option>' +
    regions().map(r => `<option value="${r}">Region: ${r}</option>`).join('');
  if (params.get('region')) region.value = params.get('region');

  /* per-quality sorting */
  quality.innerHTML = '<option value="">Rank by: Aggregate</option>' +
    CATEGORIES.map(c => `<option value="${c.key}">Rank by: ${c.label}</option>`).join('');

  const chips = Array.from(document.querySelectorAll('.chip'));
  chips.forEach(c => c.classList.toggle('on', c.dataset.tier === tier));

  function filtered() {
    const q = search.value.trim().toLowerCase();
    let field = rankedField();

    if (q) field = field.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.handle.toLowerCase().includes(q) ||
      f.region.toLowerCase().includes(q) ||
      f.tagline.toLowerCase().includes(q));

    if (tier !== 'all') field = field.filter(f => f.tier.key === tier);
    if (region.value !== 'all') field = field.filter(f => f.region.endsWith(region.value));
    if (watchOnly.checked) field = field.filter(f => Store.isWatched(f.id));

    if (quality.value) {
      field = field.map(f => ({ ...f, qv: f.stats[quality.value] }))
                   .sort((a, b) => b.qv - a.qv || a.rank - b.rank);
      return field;
    }

    const mode = sort.value;
    if (mode === 'movers') field.sort((a, b) => b.movement - a.movement || a.rank - b.rank);
    else if (mode === 'fallers') field.sort((a, b) => a.movement - b.movement || a.rank - b.rank);
    else if (mode === 'name') field.sort((a, b) => a.name.localeCompare(b.name));
    else if (mode === 'newest') field.sort((a, b) => a.weeks - b.weeks || a.rank - b.rank);
    else if (mode === 'age') field.sort((a, b) => a.age - b.age || a.rank - b.rank);
    else field.sort((a, b) => a.rank - b.rank);
    return field;
  }

  function render(resetPage) {
    if (resetPage) shown = PAGE;
    const field = filtered();
    const page = field.slice(0, shown);

    board.innerHTML = '';
    if (!field.length) {
      board.innerHTML = `<div class="empty">
        <p>No ranked Fraud matches those filters.</p>
        <button class="btn btn-sm" type="button" id="clear-filters">Clear all filters</button>
      </div>`;
      board.querySelector('#clear-filters').addEventListener('click', clearAll);
    } else {
      page.forEach(f => {
        const row = boardRow(f);
        if (quality.value) {
          const cat = CATEGORIES.find(c => c.key === quality.value);
          row.querySelector('.score').textContent = f.stats[quality.value];
          row.querySelector('.score').title = cat.label + ' grade';
          row.querySelector('.mt').innerHTML += ` · <span class="q-note">${cat.label} ${f.stats[quality.value]}</span>`;
        }
        board.appendChild(row);
      });
    }

    count.textContent = field.length
      ? `Showing ${page.length} of ${field.length} ranked ${field.length === 1 ? 'Fraud' : 'Frauds'}`
      : 'No results';
    more.style.display = field.length > shown ? '' : 'none';
    more.textContent = `Load ${Math.min(PAGE, field.length - shown)} more`;
  }

  function clearAll() {
    search.value = '';
    sort.value = 'rank';
    region.value = 'all';
    quality.value = '';
    watchOnly.checked = false;
    tier = 'all';
    chips.forEach(c => c.classList.toggle('on', c.dataset.tier === 'all'));
    render(true);
  }

  search.addEventListener('input', () => render(true));
  [sort, region, quality].forEach(el => el.addEventListener('change', () => render(true)));
  watchOnly.addEventListener('change', () => render(true));
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.classList.remove('on'));
    c.classList.add('on');
    tier = c.dataset.tier;
    render(true);
  }));
  more.addEventListener('click', () => { shown += PAGE; render(false); });
  const clear = document.getElementById('clear-all');
  if (clear) clear.addEventListener('click', clearAll);

  /* keep the board honest when a watch is toggled from a row */
  Store.on(() => { if (watchOnly.checked) render(false); });

  render(true);
});
