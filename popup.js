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
 * Wired to Brevo's "Simple HTML" form action. Submitted via a hidden
 * iframe target rather than fetch() — Brevo's form endpoint expects a
 * normal browser form POST (not JSON), and a real <form target="..."> POST
 * sidesteps any cross-origin fetch/CORS complications entirely, since it's
 * not a script-initiated cross-origin request in the way fetch/XHR are.
 * The hidden iframe just absorbs Brevo's response/redirect in the
 * background while our own success message shows immediately.
 */
(function () {
  var FORM_ENDPOINT = 'https://bf3fab7e.sibforms.com/serve/MUIFANTnm7MltWD6JFgafuL-EEUnR1MpQBhPmDkNaFcvJAvh5UxW4SDGCDZPp6ORmr-atf5GxQT_HLckHjTAZXrWB4QJMd4kDkXsZ39tA9DIE6facvHznLJgZ2cq-UpAsTcG-07inTDGnAILHHWBQtAHUHCWfO5qSQPr_7b66Hwgiz7YfJw34TcO0HCPTw8CyMDYCpgW4MlI4vMwzQ==';
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
    }
    .promo-close {
      position: absolute; top: 16px; right: 16px; background: none; border: none;
      color: var(--text-muted); font-size: 20px; cursor: pointer; line-height: 1; padding: 4px;
    }
    .promo-modal h3 { font-size: 22px; font-weight: 800; margin: 0 0 10px; letter-spacing: -0.01em; }
    .promo-modal p { font-size: 14.5px; color: var(--text-secondary); margin: 0 0 20px; }
    .promo-form { display: flex; flex-direction: column; gap: 10px; }
    .promo-form input {
      background: var(--surface-2); border: 1px solid var(--border-strong); border-radius: 8px;
      padding: 12px 14px; color: var(--text-primary); font-size: 14.5px; font-family: var(--font-body);
    }
    .promo-note { font-size: 11.5px; color: var(--text-muted); margin-top: 6px; }
    .promo-success { text-align: center; padding: 12px 0; }
    .promo-hidden-field { position: absolute; left: -5000px; width: 1px; height: 1px; opacity: 0; }
  `;
  document.head.appendChild(style);

  var hiddenFrame = document.createElement('iframe');
  hiddenFrame.name = 'promo-hidden-frame';
  hiddenFrame.style.display = 'none';
  document.body.appendChild(hiddenFrame);

  var overlay = document.createElement('div');
  overlay.className = 'promo-overlay';
  overlay.innerHTML = `
    <div class="promo-modal">
      <button class="promo-close" aria-label="Close">&times;</button>
      <div class="eyebrow" style="margin-bottom:14px;"><span class="dot"></span>WEEK 1 FREE</div>
      <h3>Get Week 1 picks free.</h3>
      <p>Drop your email and we'll send you Trifecta's full Week 1 slate at no cost — no card, no catch. See the model before you subscribe.</p>
      <form class="promo-form" id="promo-form" method="POST" action="${FORM_ENDPOINT}" target="promo-hidden-frame">
        <input type="email" id="promo-email" name="EMAIL" placeholder="you@email.com" autocomplete="off" required>
        <input type="text" name="email_address_check" value="" class="promo-hidden-field">
        <input type="hidden" name="locale" value="en">
        <input type="hidden" name="html_type" value="simple">
        <button type="submit" class="btn btn-primary" style="justify-content:center;">Send me Week 1 picks</button>
      </form>
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

  overlay.querySelector('#promo-form').addEventListener('submit', function () {
    // Deliberately NOT preventing default here — the form really does
    // submit to Brevo, it just targets the hidden iframe instead of
    // navigating this page, so Brevo actually receives the signup while
    // our own success message shows immediately below.
    localStorage.setItem('trifecta_email_submitted', '1');
    overlay.querySelector('.promo-modal').innerHTML = `
      <button class="promo-close" aria-label="Close">&times;</button>
      <div class="promo-success">
        <h3>You're in.</h3>
        <p>Watch your inbox before Week 1 kicks off.</p>
      </div>`;
    overlay.querySelector('.promo-close').addEventListener('click', close);
    setTimeout(close, 2500);
  });
})();
