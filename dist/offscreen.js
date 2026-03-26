const browserApi = chrome;

let currentAudio = null;
let selectedMuadhinFile = "islam-subhi.m4a";

const playAudio = (file, type) => {
  console.log("[Offscreen] playAudio called:", { file, type });
  
  // Stop any playable audio and start from 0
  if (currentAudio) {
    console.log("[Offscreen] Stopping existing audio before playing new one");
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // create new audio
  currentAudio = new Audio(browserApi.runtime.getURL(file));
  console.log("[Offscreen] Created new Audio object");

  // Audio is finished playing reset
  currentAudio.onended = () => {
    console.log("[Offscreen] Audio onended fired");
    currentAudio = null;
    if (type === "PLAY_ATHAN") {
      console.log("[Offscreen] Sending ADHAN_ENDED message");
      browserApi.runtime.sendMessage({ type: "ADHAN_ENDED" });
    }
  };

  // Handle audio errors during playback
  currentAudio.onerror = () => {
    console.error("[Offscreen] Audio onerror fired:", currentAudio.error);
    currentAudio = null;
    if (type === "PLAY_ATHAN") {
      console.log("[Offscreen] Sending ADHAN_ENDED message after error");
      browserApi.runtime.sendMessage({ type: "ADHAN_ENDED" });
    }
  };

  // Play the audio and log any error
  currentAudio.play()
    .then(() => {
      console.log("[Offscreen] Audio playback started successfully");
    })
    .catch((err) => {
      console.error("[Offscreen] Audio play() error:", err);
      currentAudio = null;
      if (type === "PLAY_ATHAN") {
        console.log("[Offscreen] Sending ADHAN_ENDED message after play error");
        browserApi.runtime.sendMessage({ type: "ADHAN_ENDED" });
      }
    });
}

// Listens for messages coming from background.js to determine which audio to play
browserApi.runtime.onMessage.addListener((msg) => {
  console.log("[Offscreen] Received message:", msg);
  
  if (msg.type === "SET_MUADHIN") {
    console.log("[Offscreen] Setting muadhin file:", msg.muadhinFile);
    selectedMuadhinFile = msg.muadhinFile;
  }

  if (msg.type === "PLAY_ATHAN") {
    console.log("[Offscreen] PLAY_ATHAN - will play:", `assets/audio/${selectedMuadhinFile}`);
    playAudio(`assets/audio/${selectedMuadhinFile}`, "PLAY_ATHAN");
  }

  if (msg.type === "PLAY_RING") {
    console.log("[Offscreen] PLAY_RING");
    playAudio("assets/audio/ring.mp3", "PLAY_RING");
  }

  // Stop the athan when the user clicks on the notification
  if (msg.type === "STOP_AUDIO") {
    console.log("[Offscreen] STOP_AUDIO received");
    if (currentAudio) {
      console.log("[Offscreen] Pausing current audio");
      currentAudio.pause();
      currentAudio = null;
    }
  }
});
