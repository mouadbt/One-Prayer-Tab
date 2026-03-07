const browserApi = typeof chrome !== "undefined" ? chrome : browser;
let audio = null;

browserApi.runtime.onMessage.addListener((msg, sendResponse) => {
  if (msg.type === "PLAY_ATHAN") {
    if (audio) { audio.pause(); audio.currentTime = 0; }
    audio = new Audio(browserApi.runtime.getURL("assets/audio/islam-subhi.m4a"));
    audio.play().catch(err => console.error('Audio play error:', err));
    // Auto-stop after 3 minutes
    setTimeout(() => { if (audio) { audio.pause(); audio = null; } }, 180000);
    sendResponse({ status: 'playing' });
  }
  if (msg.type === "STOP_ATHAN") {
    if (audio) { audio.pause(); audio.currentTime = 0; audio = null; }
    sendResponse({ status: 'stopped' });
  }
  return true;
});
