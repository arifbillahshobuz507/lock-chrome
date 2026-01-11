const CORRECT_PASSWORD = "1234"; // change this

function unlock() {
  const input = document.getElementById('password').value;

  if (input === CORRECT_PASSWORD) {
    chrome.storage.local.set({ locked: false });
    window.top.document.getElementById('chrome-lock').remove();
  } else {
    document.getElementById('error').innerText = "Wrong password!";
  }
}
