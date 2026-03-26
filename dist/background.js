const browserApi = typeof chrome !== "undefined" ? chrome : browser;
const isFirefox = typeof browser !== "undefined";
let currentAudio = null;
let selectedMuadhinFile = "islam-subhi.m4a";
let isPlaying = false;

// Make sure offscreen doc exists before sending it a message (chrome only)
const ensureOffscreen = async () => {
  console.log("[Background] ensureOffscreen called");
  if (!(await browserApi.offscreen.hasDocument?.())) {
    console.log("[Background] Creating offscreen document");
    await browserApi.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play prayer sounds",
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("[Background] Offscreen document created");
  } else {
    console.log("[Background] Offscreen document already exists");
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
  console.log("[Background] playSoundOnFirefoxBasedBrwosers called:", type);
  if (currentAudio) {
    console.log("[Background] Stopping existing audio");
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  const file = type === "PLAY_ATHAN" ? `assets/audio/${selectedMuadhinFile}` : "assets/audio/ring.mp3";
  console.log("[Background] Playing file:", file);
  currentAudio = new Audio(browserApi.runtime.getURL(file));
  currentAudio.onended = () => {
    console.log("[Background] Audio onended fired");
    currentAudio = null;
    isPlaying = false;
    if (type === "PLAY_ATHAN") {
      console.log("[Background] Sending ADHAN_ENDED message (Firefox)");
      broadcastToTabs("ADHAN_STOPPED");
    }
  };
  currentAudio.onerror = () => {
    console.error("[Background] Audio onerror fired:", currentAudio.error);
    currentAudio = null;
    isPlaying = false;
    broadcastToTabs("ADHAN_STOPPED");
  };
  currentAudio.play().catch((err) => {
    console.error("[Background] Audio play() error:", err);
    currentAudio = null;
    isPlaying = false;
    broadcastToTabs("ADHAN_STOPPED");
  });
}

// Play athan or ring sounds
const playSound = async (type) => {
  console.log("[Background] playSound called:", type);
  if (type === "PLAY_ATHAN") {
    console.log("[Background] Setting isPlaying = true");
    isPlaying = true;
  }
  if (!isFirefox) {
    await ensureOffscreen();
    console.log("[Background] Sending message to offscreen:", type);
    browserApi.runtime.sendMessage({ type });
  } else {
    playSoundOnFirefoxBasedBrwosers(type);
  }
}

// Stop the athan when the notification is clicked / closed
const stopSound = () => {
  console.log("[Background] stopSound called");
  isPlaying = false;
  broadcastToTabs("ADHAN_STOPPED");
  if (isFirefox) {
    if (currentAudio) {
      console.log("[Background] Pausing Firefox audio");
      currentAudio.pause();
      currentAudio = null;
    }
  } else {
    console.log("[Background] Sending STOP_AUDIO to offscreen");
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
  console.log("[Background] broadcastToTabs:", type);
  browserApi.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      browserApi.tabs.sendMessage(tab.id, { type }).catch(() => { });
    });
  });
}

// Receive messages from the page
browserApi.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("[Background] Received message:", msg, "from:", sender.id ? "extension" : "content");

  // Receive selected muadhin from the page
  if (msg.type === "SET_MUADHIN") {
    console.log("[Background] Setting muadhin file:", msg.muadhinFile);
    selectedMuadhinFile = msg.muadhinFile;
  }

  // Schedule prayer alarms
  if (msg.type === "SCHEDULE_PRAYER_ALARMS") {
    console.log("[Background] Scheduling alarms:", msg.payload.length, "prayers");
    clearPrayerAlarms().then(() => {
      msg.payload.forEach(prayer => {
        browserApi.alarms.create(`prayer: ${prayer.name}`, { when: prayer.timestamp });
        browserApi.alarms.create(`reminder: ${prayer.name}`, { when: prayer.timestamp - 5 * 60 * 1000 });
      });
      sendResponse({ success: true });
    });
    return true;
  }

  if (msg.type === "test") {
    console.log("[Background] Test message received, creating alarm in 1s");
    browserApi.alarms.create(`prayer:test`, { when: Date.now() + 1000 });
    sendResponse({ success: true });
    return true;
  }

  // Test athan immediately - creates an alarm that fires after 10s (more accurate test)
  if (msg.type === "TEST_ATHAN") {
    console.log("[Background] TEST_ATHAN received - creating alarm to fire in 10s");
    browserApi.alarms.create(`prayer:test`, { when: Date.now() + 10000 });
    sendResponse({ success: true });
    return true;
  }

  if (msg.type === "IS_ADHAN_PLAYING") {
    console.log("[Background] IS_ADHAN_PLAYING query, returning:", isPlaying);
    sendResponse({ isAudioPlaying: isPlaying });
    return true;
  }

  if (msg.type === "ADHAN_ENDED") {
    console.log("[Background] ADHAN_ENDED received");
    isPlaying = false;
    broadcastToTabs("ADHAN_STOPPED");
  }

  if (msg.type === "STOP_ADHAN") {
    console.log("[Background] STOP_ADHAN received");
    stopSound();
    sendResponse({ success: true });
    return true;
  }
});

// When an alarm fires play the right sound and show a notification
browserApi.alarms.onAlarm.addListener(async (alarm) => {
  console.log("[Background] Alarm fired:", alarm.name, "scheduled at:", new Date(alarm.scheduledTime));
  
  // Ignore alarms that are more than 2 minutes late
  const diff = Date.now() - alarm.scheduledTime;
  if (diff > 2 * 60 * 1000) {
    console.log("[Background] Ignoring late alarm (diff:", diff, "ms)");
    return;
  }

  const prayerName = alarm.name.split(":")[1];
  console.log("[Background] Prayer name:", prayerName);

  if (alarm.name.startsWith("reminder:")) {
    console.log("[Background] Playing reminder sound");
    showNotification(alarm.name, "Prayer Reminder", `${prayerName} in 5 minutes`);
    playSound("PLAY_RING");
  }

  if (alarm.name.startsWith("prayer:")) {
    console.log("[Background] Playing athan sound");
    showNotification(alarm.name, "Prayer Time", `It's now time for ${prayerName}`);
    playSound("PLAY_ATHAN");
    broadcastToTabs("ADHAN_STARTED");
  }
});


