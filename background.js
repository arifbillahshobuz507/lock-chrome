
let lastActive = Date.now();
const LOCK_TIME = 10 * 1000; // 10 sec

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'ACTIVE') {
    lastActive = Date.now();
  }

  if (msg.type === 'FORCE_UNLOCK') {
    lastActive = Date.now();
    chrome.storage.local.set({ locked: false });
  }
});

setInterval(() => {
  if (Date.now() - lastActive > LOCK_TIME) {
    chrome.storage.local.set({ locked: true });
  }
}, 1000);

