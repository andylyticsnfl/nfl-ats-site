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
 * NOT WIRED TO A REAL EMAIL SERVICE YET. Replace FORM_ENDPOINT below once
 * Caleb has set up Brevo (recommended — free email + pay-per-message SMS
 * from one account, see conversation). Until then this just shows a local
 * "thanks" message and does not actually save the email anywhere durable.
 */
(function () {
  var FORM_ENDPOINT = null; // e.g. Brevo's hosted form action URL once set up
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
  `;
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.className = 'promo-overlay';
  overlay.innerHTML = `
    <div class="promo-modal">
      <button class="promo-close" aria-label="Close">&times;</button>
      <div class="eyebrow" style="margin-bottom:14px;"><span class="dot"></span>WEEK 1 FREE</div>
      <h3>Get Week 1 picks free.</h3>
      <p>Drop your email and we'll send you Trifecta's full Week 1 slate at no cost — no card, no catch. See the model before you subscribe.</p>
      <form class="promo-form" id="promo-form">
        <input type="email" id="promo-email" placeholder="you@email.com" required>
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

  overlay.querySelector('#promo-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('promo-email').value;
    if (FORM_ENDPOINT) {
      fetch(FORM_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, source: 'week1_promo' }),
      }).catch(function () {});
    } else {
      console.warn('Trifecta promo popup: FORM_ENDPOINT not set, email not actually saved:', email);
    }
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
