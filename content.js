const events = ['mousemove', 'keydown', 'click', 'scroll'];
let lockShown = false;
const PASSWORD = '1234'; // এখানেই password

events.forEach(event => {
  document.addEventListener(event, () => {
    chrome.runtime.sendMessage({ type: 'ACTIVE' });
  });
});

setInterval(() => {
  chrome.storage.local.get('locked', (data) => {
    if (data.locked === true && !lockShown) {
      showLockScreen();
    }

    if (data.locked === false && lockShown) {
      removeLockScreen();
    }
  });
}, 500);

function showLockScreen() {
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
      return; // 🔴 এখানেই stop
    }

    // ✅ password correct হলে তবেই unlock
    chrome.runtime.sendMessage({ type: 'FORCE_UNLOCK' });
  };
}

function removeLockScreen() {
  const el = document.getElementById('chrome-lock-overlay');
  if (el) el.remove();
  lockShown = false;
}
