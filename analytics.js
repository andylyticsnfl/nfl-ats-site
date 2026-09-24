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

  if (GA_ID) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  // Any element with data-track="event_name" reports a click.
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-track]') : null;
    if (el) window.trifectaTrack(el.getAttribute('data-track'), { page: location.pathname, channel: new URLSearchParams(location.search).get('c') || '' });
  }, true);
})();
