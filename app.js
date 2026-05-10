// Shared utilities used by all pages

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function fmtDate(val) {
  if (!val) return '';
  let d;
  try {
    if (val && typeof val.toDate === 'function') d = val.toDate();
    else if (val && val.seconds) d = new Date(val.seconds * 1000);
    else d = new Date(val);
  } catch { return ''; }
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function showMsg(elId, text, type) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = text;
  el.className = type === 'success' ? 'msg-success' : 'msg-error';
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3500);
}

function friendlyAuthError(code) {
  const map = {
    'auth/user-not-found':    'No account found with that email.',
    'auth/wrong-password':    'Incorrect password.',
    'auth/invalid-email':     'Invalid email address.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/invalid-credential':'Invalid email or password.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}
