const browserApi = typeof chrome !== "undefined" ? chrome : browser;
const isFirefox = typeof browser !== "undefined";

// Keep a reference to athan audio on firefox so we can stop it
let firefoxAthan = null;

// Show a browser notification with a given id
const showNotification = (id, title, message) => {
  browserApi.notifications.create(id, {
    type: "basic",
    title,
    message,
    iconUrl: "/assets/images/icon128.png",
  });
};

// Make sure offscreen doc exists before sending it a message (chrome only)
const ensureOffscreen = async () => {
  if (!(await browserApi.offscreen.hasDocument?.())) {
    await browserApi.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play prayer sounds",
    });
    // small delay so the doc is ready to receive messages
    await new Promise((r) => setTimeout(r, 300));
  }
};

// Play the 5-min reminder ring sound
const playRing = async () => {
  if (isFirefox) {
    const audio = new Audio(browserApi.runtime.getURL("assets/audio/ring.mp3"));
    audio.play().catch((err) => console.error("Ring error:", err));
  } else {
    await ensureOffscreen();
    browserApi.runtime.sendMessage({ type: "PLAY_RING" });
  }
};

// Play the athan sound at prayer time
const playAthan = async () => {
  if (isFirefox) {
    if (firefoxAthan) { firefoxAthan.pause(); firefoxAthan.currentTime = 0; }
    firefoxAthan = new Audio(browserApi.runtime.getURL("assets/audio/islam-subhi.m4a"));
    firefoxAthan.onended = () => { firefoxAthan = null; }; // stop when sound ends
    firefoxAthan.play().catch((err) => console.error("Athan error:", err));
  } else {
    await ensureOffscreen();
    browserApi.runtime.sendMessage({ type: "PLAY_ATHAN" });
  }
};

// Stop athan when prayer notification is closed
const stopAthan = () => {
  if (isFirefox) {
    if (firefoxAthan) { firefoxAthan.pause(); firefoxAthan = null; }
  } else {
    browserApi.runtime.sendMessage({ type: "STOP_ATHAN" });
  }
};

// Clear all existing prayer and reminder alarms before scheduling new ones
const clearPrayerAlarms = async () => {
  const alarms = await browserApi.alarms.getAll();
  for (const alarm of alarms) {
    if (alarm.name.startsWith("prayer:") || alarm.name.startsWith("reminder:")) {
      browserApi.alarms.clear(alarm.name);
    }
  }
};

// Schedule a reminder (5 min before) and a prayer alarm for each prayer
const schedulePrayerAlarms = async (prayers) => {
  await clearPrayerAlarms();
  const now = Date.now();

  for (const { name, timestamp } of prayers) {
    const reminderTime = timestamp - 5 * 60 * 1000;

    if (reminderTime > now) {
      browserApi.alarms.create(`reminder:${name}`, { when: reminderTime });
    }
    if (timestamp > now) {
      browserApi.alarms.create(`prayer:${name}`, { when: timestamp });
    }
  }
};

// Rceive alarm schedule requests from the page
browserApi.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SCHEDULE_PRAYER_ALARMS") {
    schedulePrayerAlarms(msg.payload).then(() => sendResponse({ status: "ok" }));
    return true; // keep channel open for async response
  }
});

// when an alarm fires play the right sound and show a notification
browserApi.alarms.onAlarm.addListener(async (alarm) => {
  // Check if the alarm time is in the past - if so, skip execution
  // This handles the case where the browser was closed and reopened after the scheduled time
  if (alarm.when && alarm.when <= Date.now()) {
    console.log(`Skipping alarm ${alarm.name} - scheduled time has passed (was set for ${new Date(alarm.when).toISOString()})`);
    return;
  }

  const name = alarm.name.split(":")[1];

  if (alarm.name.startsWith("reminder:")) {
    showNotification(alarm.name, "Prayer Reminder", `${name} in 5 minutes`);
    playRing();
  }

  if (alarm.name.startsWith("prayer:")) {
    showNotification(alarm.name, name, `${name} time`);
    playAthan();
  }
});

// only stop athan when the prayer notification is closed, not the reminder
browserApi.notifications.onClosed.addListener((notifId) => {
  if (notifId.startsWith("prayer:")) {
    stopAthan();
  }
});