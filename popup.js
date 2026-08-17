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
 * live account): Brevo's "Simple HTML" export is genuinely broken — its
 * form POSTs to a legacy endpoint that returns {"success":true} without
 * ever creating a contact. An iframe pointed at Brevo's hosted page DOES
 * work, but looks bad (their default light-card styling, can't restyle
 * cross-origin content, forced scrolling). The right answer turned out to
 * be Brevo's "HTML" export (not "Simple HTML") — it includes their real
 * submission-handling script (main.js), which is what actually makes the
 * submission work, AND it's real same-origin DOM once embedded directly
 * in our page, so we CAN restyle it with our own CSS. This is that
 * version, with our copy substituted in and colors overridden to match
 * the site — same underlying Brevo markup/IDs so their script still
 * finds and wires up the right elements.
 */
(function () {
  var FORM_ACTION = 'https://bf3fab7e.sibforms.com/serve/MUIFANTnm7MltWD6JFgafuL-EEUnR1MpQBhPmDkNaFcvJAvh5UxW4SDGCDZPp6ORmr-atf5GxQT_HLckHjTAZXrWB4QJMd4kDkXsZ39tA9DIE6facvHznLJgZ2cq-UpAsTcG-07inTDGnAILHHWBQtAHUHCWfO5qSQPr_7b66Hwgiz7YfJw34TcO0HCPTw8CyMDYCpgW4MlI4vMwzQ==';
  var WEEK1_CUTOFF = new Date('2026-09-10T00:00:00Z'); // placeholder, confirm real date

  if (new Date() >= WEEK1_CUTOFF) return;
  if (localStorage.getItem('trifecta_email_submitted')) return;

  var page = location.pathname.split('/').pop() || 'index.html';
  var isSubscribePage = page === 'subscribe.html';
  if (isSubscribePage && sessionStorage.getItem('trifecta_subscribe_popup_seen')) return;

  // Brevo's own stylesheet (base layout/behavior classes their script
  // expects) + our override block on top, scoped to #sib-container so it
  // can't leak into the rest of the page.
  var brevoCss = document.createElement('link');
  brevoCss.rel = 'stylesheet';
  brevoCss.href = 'https://sibforms.com/forms/end-form/build/sib-styles.css';
  document.head.appendChild(brevoCss);

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
      max-width: 440px; width: 100%; padding: 32px; position: relative;
      box-shadow: 0 24px 60px rgba(0,0,0,0.4); max-height: 90vh; overflow-y: auto;
    }
    .promo-close {
      position: absolute; top: 16px; right: 16px; background: none; border: none;
      color: var(--text-muted); font-size: 20px; cursor: pointer; line-height: 1; padding: 4px; z-index: 1;
    }
    /* Override Brevo's default light-theme inline styles to match our dark theme.
       Note: .sib-form is the PARENT of #sib-form-container in the markup, not a
       descendant, so it has to be targeted directly (not via #sib-form-container .sib-form,
       which never matches and let Brevo's own ~100px of default padding through). */
    .promo-modal .sib-form { background: transparent !important; padding: 0 !important; text-align: left !important; }
    #sib-form-container #sib-container {
      background: transparent !important; border: none !important; max-width: none !important;
      padding: 0 !important;
    }
    #sib-form-container .sib-form-block p,
    #sib-form-container .entry__label,
    #sib-form-container .entry__specification { color: var(--text-secondary) !important; }
    #sib-form-container .promo-title-text {
      font-size: 22px !important; font-weight: 800 !important; color: var(--text-primary) !important;
      font-family: var(--font-body) !important;
    }
    #sib-form-container .sib-text-form-block p {
      font-weight: 400 !important; font-size: 14.5px !important; color: var(--text-secondary) !important;
      font-family: var(--font-body) !important;
    }
    #sib-form-container input.input,
    #sib-form-container input.input:focus {
      background: var(--surface-2) !important; border: 1px solid var(--border) !important;
      border-radius: 8px !important; color: var(--text-primary) !important; font-family: var(--font-body) !important;
      padding: 12px 14px !important; width: 100%; box-sizing: border-box;
      -webkit-appearance: none !important; appearance: none !important; outline: none !important; box-shadow: none !important;
    }
    #sib-form-container .sib-form-block__button {
      background: var(--accent) !important; border-radius: 8px !important; width: 100%;
      font-family: var(--font-body) !important; padding: 12px !important; text-align: center !important;
      justify-content: center; display: flex; align-items: center; gap: 8px;
      font-weight: 650 !important; font-size: 14.5px !important; color: #fff !important;
      -webkit-appearance: none !important; appearance: none !important; outline: none !important;
    }
    #sib-form-container #success-message, #sib-form-container #error-message {
      border-radius: 8px !important; font-family: var(--font-body) !important; font-size: 13.5px !important;
    }
    .promo-note { font-size: 11.5px; color: var(--text-muted); margin-top: 14px; }
  `;
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.className = 'promo-overlay';
  overlay.innerHTML = `
    <div class="promo-modal">
      <button class="promo-close" aria-label="Close">&times;</button>
      <div class="eyebrow" style="margin-bottom:14px;"><span class="dot"></span>WEEK 1 FREE</div>

      <div class="sib-form" style="text-align: center; background-color: transparent;">
        <div id="sib-form-container" class="sib-form-container">
          <div id="error-message" class="sib-form-message-panel" style="font-family:Helvetica, sans-serif; font-size:14px; text-align:left; color:#661d1d; background-color:#ffeded; border-color:#ff4949; border-radius:3px;">
            <div class="sib-form-message-panel__text sib-form-message-panel__text--center">
              <span class="sib-form-message-panel__inner-text">Something went wrong — please try again.</span>
            </div>
          </div>
          <div id="success-message" class="sib-form-message-panel" style="font-family:Helvetica, sans-serif; font-size:14px; text-align:left; color:#085229; background-color:#e7faf0; border-color:#13ce66; border-radius:3px;">
            <div class="sib-form-message-panel__text sib-form-message-panel__text--center">
              <span class="sib-form-message-panel__inner-text">You're in — watch your inbox before Week 1 kicks off.</span>
            </div>
          </div>
          <div id="sib-container" class="sib-container--large sib-container--vertical" style="direction:ltr">
            <form id="sib-form" method="POST" action="${FORM_ACTION}" data-type="subscription">
              <div style="padding: 8px 0;">
                <div class="sib-form-block"><p class="promo-title-text">Get Week 1 picks free.</p></div>
              </div>
              <div style="padding: 8px 0;">
                <div class="sib-form-block">
                  <div class="sib-text-form-block">
                    <p>Drop your email and we'll send you Trifecta's full Week 1 slate at no cost — no card, no catch.</p>
                  </div>
                </div>
              </div>
              <div style="padding: 8px 0;">
                <div class="sib-input sib-form-block">
                  <div class="form__entry entry_block">
                    <div class="form__label-row">
                      <div class="entry__field">
                        <input class="input" type="text" id="EMAIL" name="EMAIL" autocomplete="off" value="" placeholder="you@email.com" data-required="true" required />
                      </div>
                    </div>
                    <label class="entry__error entry__error--primary" style="font-family:Helvetica, sans-serif; font-size:14px; text-align:left; color:#661d1d; background-color:#ffeded; border-color:#ff4949; border-radius:3px;"></label>
                  </div>
                </div>
              </div>
              <div style="padding: 8px 0;">
                <div class="sib-form-block" style="text-align: left">
                  <button class="sib-form-block__button sib-form-block__button-with-loader" form="sib-form" type="submit">
                    <svg class="icon clickable__icon progress-indicator__icon sib-hide-loader-icon" viewBox="0 0 512 512" style="width:14px;height:14px;">
                      <path fill="currentColor" d="M460.116 373.846l-20.823-12.022c-5.541-3.199-7.54-10.159-4.663-15.874 30.137-59.886 28.343-131.652-5.386-189.946-33.641-58.394-94.896-95.833-161.827-99.676C261.028 55.961 256 50.751 256 44.352V20.309c0-6.904 5.808-12.337 12.703-11.982 83.556 4.306 160.163 50.864 202.11 123.677 42.063 72.696 44.079 162.316 6.031 236.832-3.14 6.148-10.75 8.461-16.728 5.01z" />
                    </svg>
                    SEND ME WEEK 1 PICKS
                  </button>
                </div>
              </div>
              <input type="text" name="email_address_check" value="" class="input--hidden">
              <input type="hidden" name="locale" value="en">
            </form>
          </div>
        </div>
      </div>

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

  // main.js drives the actual submit handling (validation, AJAX post,
  // showing #success-message / #error-message) — Brevo's own script,
  // loaded once per popup instance. Script tags inserted via innerHTML
  // never execute, so this has to be created and appended manually.
  window.REQUIRED_ERROR_MESSAGE = 'This field cannot be left blank.';
  window.EMAIL_INVALID_MESSAGE = window.GENERIC_INVALID_MESSAGE = 'Please enter a valid email address.';
  window.LOCALE = 'en';
  window.AUTOHIDE = false;
  var brevoScript = document.createElement('script');
  brevoScript.src = 'https://sibforms.com/forms/end-form/build/main.js';
  brevoScript.defer = true;
  document.body.appendChild(brevoScript);

  // Their script shows #success-message by adding a class rather than
  // firing an event we can hook — watch for that instead of trying to
  // guess the exact class name from source.
  var successEl = overlay.querySelector('#success-message');
  var observer = new MutationObserver(function () {
    if (getComputedStyle(successEl).display !== 'none') {
      localStorage.setItem('trifecta_email_submitted', '1');
      setTimeout(close, 2500);
    }
  });
  observer.observe(successEl, { attributes: true, attributeFilter: ['class', 'style'] });
})();
