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
