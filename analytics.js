/* Trifecta analytics: Google Analytics 4 + click/event tracking.
   Cloudflare Web Analytics (cookieless page counts) is separate and always on.
   To switch Google Analytics on, paste the GA4 Measurement ID (looks like G-XXXXXXXXXX) below.
   While it is empty this file loads nothing and sends nothing. */
(function () {
  var GA_ID = 'G-C8BSBX4F3Q';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  // trifectaTrack('event_name', {key: value}) -- safe to call from any page, does nothing when GA is off.
  window.trifectaTrack = function (name, params) {
    if (!GA_ID) return;
    try { gtag('event', name, params || {}); } catch (e) {}
  };

  // Local previews (localhost) never load Google's script, so testing can't pollute real data;
  // events still land in dataLayer so they can be inspected.
  var LOCAL = /^(localhost|127\.)/.test(location.hostname);
  if (GA_ID && !LOCAL) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }
  if (GA_ID) {
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  // Named calls-to-action across the whole site, matched by selector (no per-page markup needed).
  var CTAS = [
    ['.nav-st-btn', 'nav_dfs_click'],
    ['.nav .links .btn-primary', 'nav_subscribe_click'],
    ['.sub-cta-top a', 'cta_subscribe_click', { position: 'top' }],
    ['.sub-cta a', 'cta_subscribe_click', { position: 'band' }],
    ['.promo-banner-deal', 'home_week3_banner_click'],
    ['.deal-ticker', 'home_week3_ticker_click'],
    ['a[href*="x.com/TrifectaNFL"]', 'x_profile_click']
  ];
  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;
    for (var i = 0; i < CTAS.length; i++) {
      var hit = e.target.closest(CTAS[i][0]);
      if (hit) {
        var p = { page: location.pathname };
        var extra = CTAS[i][2] || {};
        for (var k in extra) p[k] = extra[k];
        window.trifectaTrack(CTAS[i][1], p);
        break;
      }
    }
  }, true);

  // Any element with data-track="event_name" reports a click.
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-track]') : null;
    if (el) window.trifectaTrack(el.getAttribute('data-track'), { page: location.pathname, channel: new URLSearchParams(location.search).get('c') || '' });
  }, true);
})();
