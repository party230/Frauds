/* ============================================================
   OFFICIAL FRAUD RANKINGS — methodology page
   ============================================================ */

App.ready(function () {
  var host = document.getElementById('cat-list');
  if (!host) return;
  host.innerHTML = CATEGORIES.map(function (c, i) {
    return '<div class="cat-row">' +
      '<div class="i">' + String(i + 1).padStart(2, '0') + '</div>' +
      '<div class="n">' + c.label + '</div>' +
      '<div class="d">' + c.blurb + '</div>' +
      '<div class="w">10%</div>' +
    '</div>';
  }).join('');
});
