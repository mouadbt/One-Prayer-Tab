const browserApi = chrome;

let currentAudio = null;
let selectedMuadhinFile = "islam-subhi.m4a";

const playAudio = (file, type) => {
  // Stop any playable audio and start from 0
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }

  // create new audio
  currentAudio = new Audio(browserApi.runtime.getURL(file));

  // Audio is finished playing reset
  currentAudio.onended = () => {
    currentAudio = null;
    if (type === "PLAY_ATHAN") browserApi.runtime.sendMessage({ type: "ADHAN_ENDED" });
  };

  // Play the audio and log any error
  currentAudio.play().catch((err) => console.error("Audio play error:", err));
}

// Listens for messages coming from background.js to determine which audio to play
browserApi.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SET_MUADHIN") {
    selectedMuadhinFile = msg.muadhinFile;
  }

  if (msg.type === "PLAY_ATHAN") playAudio(`assets/audio/${selectedMuadhinFile}`, "PLAY_ATHAN");

  if (msg.type === "PLAY_RING") playAudio("assets/audio/ring.mp3", "PLAY_RING");

  // Stop the athan when the user clicks on the notification
  if (msg.type === "STOP_AUDIO") {
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  }
});
