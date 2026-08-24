/* Site-wide name+email capture popup for the Week 1 free-picks promo.
 *
 * Behavior:
 *  - On index/track-record/about: shows on EVERY visit, until either the
 *    visitor submits the form or the WEEK1_CUTOFF date passes.
 *  - Never shows on subscribe.html or encyclopedia.html — those visitors
 *    are already mid-funnel toward a paid tier or already subscribed.
 *  - Once submitted, never shows again anywhere (any page).
 *
 * WEEK1_CUTOFF is set to when Week 1's Snapshot/Digest picks actually go
 * out — Sunday Sept 13, 2026, 8:45am PT (matches the "main" batch send
 * time in nfl-ats-model's send_weekly_picks.yml) — not an arbitrary
 * kickoff time. Caleb's call (2026-08-18): align the free-picks cutoff to
 * the real delivery instant, not a guessed kickoff time.
 *
 * SUBMISSION PATH (2026-08-24): posts straight to the Worker's
 * /internal/signup, which calls Brevo's Contacts API server-side. Previously
 * posted to Brevo's own sibforms.com embedded form + main.js script — that
 * form was never configured with First/Last Name fields in Brevo's own
 * dashboard, so every name typed on the site was silently discarded
 * server-side (confirmed via Brevo's API: attributes came back empty on
 * every real signup, despite the site sending them correctly). Routing
 * through our own Worker sidesteps that entirely and removes the need for
 * Brevo's script + a pile of CSS overrides to reskin their default markup.
 */
(function () {
  var WORKER_BASE = 'https://trifecta-encyclopedia-api.andylyticsnfl.workers.dev';
  var WEEK1_CUTOFF = new Date('2026-09-13T15:45:00Z'); // Sun Sept 13 2026, 8:45am PT — picks-delivery time
  window.TRIFECTA_WEEK1_CUTOFF = WEEK1_CUTOFF; // exposed so other page elements (e.g. the homepage promo banner) can apply the same cutoff without duplicating the date.

  var page = location.pathname.split('/').pop() || 'index.html';

  function showPromoPopup() {
    // Manual re-trigger (e.g. the homepage banner) after the popup already
    // built itself once this pageload — just re-reveal it instead of
    // building a second overlay.
    var existing = document.querySelector('.promo-overlay');
    if (existing) {
      existing.classList.add('show');
      return;
    }
    renderPromoPopup();
  }
  window.trifectaOpenPromo = showPromoPopup;

  if (new Date() >= WEEK1_CUTOFF) return;
  if (localStorage.getItem('trifecta_email_submitted')) return;
  // A stored Encyclopedia session token means this browser already
  // completed a real magic-link login — i.e. an actual paying subscriber.
  // Don't pitch them a "get Week 1 free" promo they've already paid past.
  if (localStorage.getItem('trifecta_enc_token')) return;

  // Neither page should compete with what's already happening there — the
  // sign-in flow / paid-tier upsell on Encyclopedia, or the purchase
  // decision already in progress on Subscribe.
  if (page === 'encyclopedia.html' || page === 'subscribe.html') return;

  renderPromoPopup();

  function renderPromoPopup() {
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
      .promo-title { font-size: 22px; font-weight: 800; color: var(--text-primary); font-family: var(--font-body); margin: 0 0 12px; }
      .promo-body { font-size: 14.5px; color: var(--text-secondary); font-family: var(--font-body); margin: 0 0 18px; }
      .promo-field { margin-bottom: 12px; }
      .promo-field input {
        background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px;
        color: var(--text-primary); font-family: var(--font-body); font-size: 14.5px;
        padding: 12px 14px; width: 100%; box-sizing: border-box; outline: none;
      }
      .promo-field input:focus { border-color: var(--accent); }
      .promo-submit {
        background: var(--accent); border: none; border-radius: 8px; width: 100%;
        font-family: var(--font-body); padding: 12px; text-align: center;
        font-weight: 650; font-size: 14.5px; color: #fff; cursor: pointer; margin-top: 4px;
      }
      .promo-submit:disabled { opacity: 0.6; cursor: default; }
      .promo-status { font-size: 13.5px; font-family: var(--font-body); margin-top: 12px; display: none; }
      .promo-status.show { display: block; }
      .promo-status.success { color: var(--good); }
      .promo-status.error { color: var(--bad); }
      .promo-note { font-size: 11.5px; color: var(--text-muted); margin-top: 14px; }
    `;
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.className = 'promo-overlay';
    overlay.innerHTML = `
      <div class="promo-modal">
        <button class="promo-close" aria-label="Close">&times;</button>
        <div class="eyebrow" style="margin-bottom:14px;"><span class="dot"></span>WEEK 1 FREE</div>
        <p class="promo-title">Get Week 1 picks free.</p>
        <p class="promo-body">Drop your email and we'll send you Trifecta's top five picks for Week 1 — free, no card, no catch. Picks go out right before Week 1 kicks off, not today, so watch your inbox then.</p>
        <form id="promo-form">
          <div class="promo-field"><input type="text" id="promo-name" placeholder="Your name" autocomplete="off" required /></div>
          <div class="promo-field"><input type="email" id="promo-email" placeholder="you@email.com" autocomplete="off" required /></div>
          <button class="promo-submit" type="submit">SEND ME WEEK 1 PICKS</button>
        </form>
        <div class="promo-status success" id="promo-success">You're in — watch your inbox before Week 1 kicks off.</div>
        <div class="promo-status error" id="promo-error">Something went wrong — please try again.</div>
        <div class="promo-note">One email, no spam. Unsubscribe anytime.</div>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('show'); });

    function close() {
      overlay.classList.remove('show');
      setTimeout(function () { overlay.remove(); }, 200);
    }

    overlay.querySelector('.promo-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    var formEl = overlay.querySelector('#promo-form');
    var nameInput = overlay.querySelector('#promo-name');
    var emailInput = overlay.querySelector('#promo-email');
    var submitBtn = overlay.querySelector('.promo-submit');
    var successEl = overlay.querySelector('#promo-success');
    var errorEl = overlay.querySelector('#promo-error');

    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      errorEl.classList.remove('show');
      var parts = nameInput.value.trim().split(/\s+/);
      var firstName = parts[0] || '';
      var lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'SENDING…';

      fetch(WORKER_BASE + '/internal/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName, lastName: lastName, email: emailInput.value.trim() }),
      })
        .then(function (resp) { return resp.ok ? resp.json() : Promise.reject(); })
        .then(function () {
          formEl.style.display = 'none';
          successEl.classList.add('show');
          localStorage.setItem('trifecta_email_submitted', '1');
          setTimeout(close, 2500);
        })
        .catch(function () {
          errorEl.classList.add('show');
          submitBtn.disabled = false;
          submitBtn.textContent = 'SEND ME WEEK 1 PICKS';
        });
    });
  }
})();
