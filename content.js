
const PASSWORD = '807502';
let lockShown = false;

// user activity → global timer reset
['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
  document.addEventListener(event, () => {
    chrome.runtime.sendMessage({ type: 'ACTIVE' });
  });
});

// 🔥 GLOBAL STORAGE LISTENER (সব tab sync করবে)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.locked) {
    if (changes.locked.newValue === true) {
      showLockScreen();
    } else {
      removeLockScreen();
    }
  }
});

// initial load check
chrome.storage.local.get('locked', (data) => {
  if (data.locked === true) {
    showLockScreen();
  }
});

function showLockScreen() {
  if (lockShown) return;
  lockShown = true;

  const overlay = document.createElement('div');
  overlay.id = 'chrome-lock-overlay';

  overlay.innerHTML = `
    <div style="
      position:fixed;
      inset:0;
      background:#111;
      display:flex;
      justify-content:center;
      align-items:center;
      z-index:9999999;
    ">
      <div style="background:#222;padding:30px;border-radius:8px;color:#fff;text-align:center">
        <h2>🔒 Chrome Locked</h2>
        <input id="lock-pass" type="password" placeholder="Password"
          style="padding:10px;width:200px"><br><br>
        <button id="unlock-btn" style="padding:8px 20px">Unlock</button>
        <p id="lock-error" style="color:red"></p>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('unlock-btn').onclick = () => {
    const pass = document.getElementById('lock-pass').value;

    if (pass !== PASSWORD) {
      document.getElementById('lock-error').innerText = '❌ Wrong password';
      return;
    }

    // 🔓 ONE TAB unlock → ALL TAB unlock
    chrome.runtime.sendMessage({ type: 'FORCE_UNLOCK' });
  };
}

function removeLockScreen() {
  const el = document.getElementById('chrome-lock-overlay');
  if (el) el.remove();
  lockShown = false;
}
