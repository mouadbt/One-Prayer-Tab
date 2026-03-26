const browserApi = typeof chrome !== "undefined" ? chrome : browser;
const isFirefox = typeof browser !== "undefined";
let currentAudio = null;
let selectedMuadhinFile = "islam-subhi.m4a";
let isPlaying = false;

// Make sure offscreen doc exists before sending it a message (chrome only)
const ensureOffscreen = async () => {
  if (!(await browserApi.offscreen.hasDocument?.())) {
    await browserApi.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play prayer sounds",
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

// Show a browser notification with a given id
const showNotification = (id, title, message) => {
  browserApi.notifications.create(id, {
    type: "basic",
    title,
    message,
    iconUrl: "/assets/images/icon128.png",
  });
}

// Firefox supports Audio API directly in the background script, no offscreen document needed
const playSoundOnFirefoxBasedBrwosers = (type) => {
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
  const file = type === "PLAY_ATHAN" ? `assets/audio/${selectedMuadhinFile}` : "assets/audio/ring.mp3";
  currentAudio = new Audio(browserApi.runtime.getURL(file));
  currentAudio.onended = () => {
    currentAudio = null;
    isPlaying = false;
    if (type === "PLAY_ATHAN") broadcastToTabs("ADHAN_STOPPED");
  };
  currentAudio.onerror = () => {
    currentAudio = null;
    isPlaying = false;
    broadcastToTabs("ADHAN_STOPPED");
  };
  currentAudio.play().catch((err) => {
    console.error("[Background] Audio play error:", err);
    currentAudio = null;
    isPlaying = false;
    broadcastToTabs("ADHAN_STOPPED");
  });
}

// Play athan or ring sounds
const playSound = async (type) => {
  if (type === "PLAY_ATHAN") isPlaying = true;
  if (!isFirefox) {
    await ensureOffscreen();
    browserApi.runtime.sendMessage({ type });
  } else {
    playSoundOnFirefoxBasedBrwosers(type);
  }
}

// Stop the athan when the notification is clicked / closed
const stopSound = () => {
  isPlaying = false;
  broadcastToTabs("ADHAN_STOPPED");
  if (isFirefox) {
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  } else {
    browserApi.runtime.sendMessage({ type: "STOP_AUDIO" });
  }
}

// Clear all existing prayer and reminder alarms before scheduling new ones
const clearPrayerAlarms = async () => {
  const alarms = await browserApi.alarms.getAll();
  for (const alarm of alarms) {
    if (alarm.name.startsWith("prayer:") || alarm.name.startsWith("reminder:")) {
      browserApi.alarms.clear(alarm.name);
    }
  }
}

// Broadcast to ui if the adhan is played or stopped
const broadcastToTabs = (type) => {
  browserApi.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      browserApi.tabs.sendMessage(tab.id, { type }).catch(() => { });
    });
  });
}

// Receive messages from the page
browserApi.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Receive selected muadhin from the page
  if (msg.type === "SET_MUADHIN") {
    selectedMuadhinFile = msg.muadhinFile;
  }

  // Schedule prayer alarms
  if (msg.type === "SCHEDULE_PRAYER_ALARMS") {
    clearPrayerAlarms().then(() => {
      msg.payload.forEach(prayer => {
        browserApi.alarms.create(`prayer: ${prayer.name}`, { when: prayer.timestamp });
        browserApi.alarms.create(`reminder: ${prayer.name}`, { when: prayer.timestamp - 5 * 60 * 1000 });
      });
      sendResponse({ success: true });
    });
    return true;
  }

  // if (msg.type === "test") {
  //   browserApi.alarms.create(`prayer:test`, { when: Date.now() + 1000 });
  //   sendResponse({ success: true });
  //   return true;
  // }

  if (msg.type === "IS_ADHAN_PLAYING") {
    sendResponse({ isAudioPlaying: isPlaying });
    return true;
  }

  if (msg.type === "ADHAN_ENDED") {
    isPlaying = false;
    broadcastToTabs("ADHAN_STOPPED");
  }

  if (msg.type === "STOP_ADHAN") {
    stopSound();
    sendResponse({ success: true });
    return true;
  }
});

// When an alarm fires play the right sound and show a notification
browserApi.alarms.onAlarm.addListener(async (alarm) => {
  // Ignore alarms that are more than 2 minutes late
  const diff = Date.now() - alarm.scheduledTime;
  if (diff > 2 * 60 * 1000) {
    return;
  }

  const prayerName = alarm.name.split(":")[1];

  if (alarm.name.startsWith("reminder:")) {
    showNotification(alarm.name, "Prayer Reminder", `${prayerName} in 5 minutes`);
    playSound("PLAY_RING");
  }

  if (alarm.name.startsWith("prayer:")) {
    showNotification(alarm.name, "Prayer Time", `It's now time for ${prayerName}`);
    playSound("PLAY_ATHAN");
    broadcastToTabs("ADHAN_STARTED");
  }
});


