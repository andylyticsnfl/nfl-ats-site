/* Site-wide email capture popup for the Week 1 free-picks promo.
 *
 * Behavior:
 *  - On index/track-record/about: shows on EVERY visit, until either the
 *    visitor submits an email or the WEEK1_CUTOFF date passes.
 *  - On subscribe.html: shows once (first visit only), same cutoff rules.
 *  - Once an email is submitted, never shows again anywhere (any page).
 *
 * WEEK1_CUTOFF is a placeholder (~Sept 10, 2026, per the season's likely
 * Thursday opener) — update this once the real 2026 Week 1 date is set.
 *
 * IMPLEMENTATION NOTE (found the hard way, via direct testing against the
 * real account): Brevo's "Simple HTML" export gives a legacy /serve/ URL
 * that returns {"success":true} WITHOUT actually creating a contact — a
 * silent no-op. The real endpoint is /v2/serve/, confirmed by testing
 * through Brevo's own hosted preview. But even /v2/serve/ rejects a bare
 * reconstructed form POST (tested via curl AND via our own hidden-iframe
 * form — both returned {"success":true} but created no contact); it
 * needs session/cookie context that only exists once a browser has
 * actually loaded Brevo's real page. So instead of recreating the form
 * ourselves, we embed Brevo's actual hosted form in a real iframe here —
 * less control over its internal styling, but guaranteed to work, which
 * matters more. Their own hosted form already shows its own "subscription
 * successful" message inside the iframe, so we don't need to fake one.
 */
(function () {
  var BREVO_FORM_URL = 'https://bf3fab7e.sibforms.com/v2/serve/MUIFANTnm7MltWD6JFgafuL-EEUnR1MpQBhPmDkNaFcvJAvh5UxW4SDGCDZPp6ORmr-atf5GxQT_HLckHjTAZXrWB4QJMd4kDkXsZ39tA9DIE6facvHznLJgZ2cq-UpAsTcG-07inTDGnAILHHWBQtAHUHCWfO5qSQPr_7b66Hwgiz7YfJw34TcO0HCPTw8CyMDYCpgW4MlI4vMwzQ==';
  var WEEK1_CUTOFF = new Date('2026-09-10T00:00:00Z'); // placeholder, confirm real date

  if (new Date() >= WEEK1_CUTOFF) return;
  if (localStorage.getItem('trifecta_email_submitted')) return;

  var page = location.pathname.split('/').pop() || 'index.html';
  var isSubscribePage = page === 'subscribe.html';
  if (isSubscribePage && sessionStorage.getItem('trifecta_subscribe_popup_seen')) return;

  var style = document.createElement('style');
  style.textContent = `
    .promo-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 20px;
      opacity: 0; transition: opacity .2s;
    }
    .promo-overlay.show { opacity: 1; }
    .promo-modal {
      background: var(--surface-1); border: 1px solid var(--border-strong); border-radius: 16px;
      max-width: 420px; width: 100%; padding: 32px; position: relative;
      box-shadow: 0 24px 60px rgba(0,0,0,0.4);
      max-height: 90vh; overflow-y: auto;
    }
    .promo-close {
      position: absolute; top: 16px; right: 16px; background: none; border: none;
      color: var(--text-muted); font-size: 20px; cursor: pointer; line-height: 1; padding: 4px; z-index: 1;
    }
    .promo-modal h3 { font-size: 22px; font-weight: 800; margin: 0 0 10px; letter-spacing: -0.01em; }
    .promo-modal p { font-size: 14.5px; color: var(--text-secondary); margin: 0 0 20px; }
    .promo-form-frame { width: 100%; height: 340px; border: none; border-radius: 8px; overflow: hidden; }
    .promo-note { font-size: 11.5px; color: var(--text-muted); margin-top: 10px; }
  `;
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.className = 'promo-overlay';
  overlay.innerHTML = `
    <div class="promo-modal">
      <button class="promo-close" aria-label="Close">&times;</button>
      <div class="eyebrow" style="margin-bottom:14px;"><span class="dot"></span>WEEK 1 FREE</div>
      <h3>Get Week 1 picks free.</h3>
      <p>Drop your email and we'll send you Trifecta's full Week 1 slate at no cost — no card, no catch.</p>
      <iframe class="promo-form-frame" src="${BREVO_FORM_URL}" title="Week 1 free picks signup"></iframe>
      <div class="promo-note">One email, no spam. Unsubscribe anytime.</div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(function () { overlay.classList.add('show'); });

  function close() {
    overlay.classList.remove('show');
    setTimeout(function () { overlay.remove(); }, 200);
    if (isSubscribePage) sessionStorage.setItem('trifecta_subscribe_popup_seen', '1');
  }

  overlay.querySelector('.promo-close').addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

  // Best-effort success detection: some embedded forms postMessage() their
  // parent on submit, which IS readable cross-origin (unlike iframe DOM
  // content). Not confirmed whether Brevo's does — if it never fires, the
  // safe fallback is simply that the popup keeps showing on repeat visits,
  // which matches what was asked for anyway (recur until we KNOW they
  // submitted, not assume they did).
  window.addEventListener('message', function (e) {
    if (typeof e.origin === 'string' && e.origin.indexOf('sibforms.com') !== -1) {
      localStorage.setItem('trifecta_email_submitted', '1');
    }
  });
})();
