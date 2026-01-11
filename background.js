let lastActive = Date.now();
const LOCK_TIME = 10 * 1000;

function lockAllTabs() {
  chrome.storage.local.set({ locked: true });

  // 🔔 broadcast lock event
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { type: 'LOCK_NOW' });
    });
  });
}

function unlockAllTabs() {
  chrome.storage.local.set({ locked: false });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'ACTIVE') {
    lastActive = Date.now();
  }

  if (msg.type === 'FORCE_UNLOCK') {
    lastActive = Date.now();
    unlockAllTabs();
  }
});

setInterval(() => {
  if (Date.now() - lastActive > LOCK_TIME) {
    lockAllTabs();
  }
}, 1000);
