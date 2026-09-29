/* Mobile nav hamburger toggle — shared across all pages. */
(function () {
  document.querySelectorAll('.nav-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var nav = btn.closest('.nav');
      var open = nav.classList.toggle('nav-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? '✕' : '☰';
    });
  });
  document.querySelectorAll('.nav .links a').forEach(function (a) {
    a.addEventListener('click', function () {
      var nav = a.closest('.nav');
      nav.classList.remove('nav-open');
      var btn = nav.querySelector('.nav-toggle');
      if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.textContent = '☰'; }
    });
  });
})();

/* Table rows with data-href open that page when clicked anywhere (links inside the row keep their own targets). */
document.addEventListener('click', function (e) {
  var row = e.target.closest && e.target.closest('tr[data-href]');
  if (!row || e.target.closest('a, button, input, select, label')) return;
  if (window.getSelection && String(window.getSelection()).length) return;   // selecting text, not clicking
  var url = row.getAttribute('data-href');
  if (e.metaKey || e.ctrlKey) window.open(url, '_blank'); else location.href = url;
});
