const PASSWORD = '1234';
let lockShown = false;

/* user activity */
['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
  document.addEventListener(event, () => {
    chrome.runtime.sendMessage({ type: 'ACTIVE' });
  });
});

/* 🔔 instant LOCK message */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'LOCK_NOW') {
    showLockScreen();
  }
});

/* storage sync (unlock + fallback) */
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.locked) {
    if (changes.locked.newValue === false) {
      removeLockScreen();
    }
  }
});

/* initial load */
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
        <button id="unlock-btn">Unlock</button>
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

    chrome.runtime.sendMessage({ type: 'FORCE_UNLOCK' });
  };
}

function removeLockScreen() {
  const el = document.getElementById('chrome-lock-overlay');
  if (el) el.remove();
  lockShown = false;
}
