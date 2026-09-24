// Free weekly pick signup -> worker -> Brevo list + welcome email (see worker.js handleFreePickSignup).
(function () {
  var form = document.getElementById('cap-form');
  if (!form) return;
  var WORKER = 'https://trifecta-encyclopedia-api.andylyticsnfl.workers.dev';
  var err = document.getElementById('cap-err'), btn = document.getElementById('cap-btn');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.textContent = '';
    var email = document.getElementById('cap-email').value.trim();
    var name = document.getElementById('cap-name').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Please enter a valid email address.'; return; }
    btn.disabled = true; btn.textContent = 'Sending\u2026';
    fetch(WORKER + '/internal/signup-free', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: name, email: email, website: form.website.value })
    }).then(function (r) {
      if (!r.ok) throw new Error('bad');
      if (window.trifectaTrack) trifectaTrack('free_pick_signup', { page: location.pathname });
      document.getElementById('cap-form-wrap').innerHTML = '<div class="cap-done"><h4>You\u2019re in.</h4><p>Check your inbox for a welcome email. Your first free pick arrives 75 minutes before Thursday\u2019s game.</p></div>';
    }).catch(function () {
      err.textContent = 'Something went wrong. Please try again.';
      btn.disabled = false; btn.innerHTML = 'Send me the free pick &rarr;';
    });
  });
})();
