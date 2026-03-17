const browserApi = typeof chrome !== "undefined" ? chrome : browser;

let athanAudio = null;
let ringAudio = null;

browserApi.runtime.onMessage.addListener((msg, sendResponse) => {

  if (msg.type === "PLAY_ATHAN") {
    // stop any current athan before starting new one
    if (athanAudio) { athanAudio.pause(); athanAudio.currentTime = 0; }
    athanAudio = new Audio(browserApi.runtime.getURL("assets/audio/islam-subhi.m4a"));
    athanAudio.onended = () => { athanAudio = null; }; // clear when sound ends naturally
    athanAudio.play().catch((err) => console.error("Athan play error:", err));
    sendResponse({ status: "playing" });
  }

  if (msg.type === "PLAY_RING") {
    if (ringAudio) { ringAudio.pause(); ringAudio.currentTime = 0; }
    ringAudio = new Audio(browserApi.runtime.getURL("assets/audio/ring.mp3"));
    ringAudio.onended = () => { ringAudio = null; };
    ringAudio.play().catch((err) => console.error("Ring play error:", err));
    sendResponse({ status: "playing" });
  }

  if (msg.type === "STOP_ATHAN") {
    if (athanAudio) { athanAudio.pause(); athanAudio.currentTime = 0; athanAudio = null; }
    sendResponse({ status: "stopped" });
  }

  return true;
});