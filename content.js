const PASSWORD = '1234';
let lockShown = false;

/* 1️⃣ User activity → global timer reset */
['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
  document.addEventListener(event, () => {
    chrome.runtime.sendMessage({ type: 'ACTIVE' });
  });
});

/* 2️⃣ INSTANT sync (unlock হলে সাথে সাথে) */
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.locked) {
    handleLockChange(changes.locked.newValue);
  }
});

/* 3️⃣ FALLBACK sync (যদি event miss হয়) */
setInterval(() => {
  chrome.storage.local.get('locked', (data) => {
    handleLockChange(data.locked);
  });
}, 500);

/* 4️⃣ Initial load */
chrome.storage.local.get('locked', (data) => {
  handleLockChange(data.locked);
});

function handleLockChange(isLocked) {
  if (isLocked === true && !lockShown) {
    showLockScreen();
  }

  if (isLocked === false && lockShown) {
    removeLockScreen();
  }
}

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

    // 🔓 ONE TAB unlock → ALL TAB unlock (NO reload)
    chrome.runtime.sendMessage({ type: 'FORCE_UNLOCK' });
  };
}

function removeLockScreen() {
  const el = document.getElementById('chrome-lock-overlay');
  if (el) el.remove();
  lockShown = false;
}
