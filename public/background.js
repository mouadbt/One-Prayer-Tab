const browserApi = typeof chrome !== "undefined" ? chrome : browser;
const isFirefox = typeof browser !== "undefined";

// Show notification
const showNotification = (prayerName) => {
  browserApi.notifications.create({
    type: "basic",
    title: prayerName,
    message: `${prayerName} time is now`,
    iconUrl: "/assets/images/icon128.png",
  });
};

// Play athan sound - Firefox plays directly, Chrome uses offscreen
async function playAthan() {
  if (isFirefox) {
    // Firefox: play audio directly in background script
    const audio = new Audio(browserApi.runtime.getURL("assets/audio/islam-subhi.m4a"));
    audio.play().catch(err => console.error('Audio play error:', err));
    // Auto-stop after 3 minutes
    setTimeout(() => { audio.pause(); }, 180000);
  } else {
    // Chrome: use offscreen document
    if (!(await browserApi.offscreen.hasDocument?.())) {
      await browserApi.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Play athan sound'
      });
      await new Promise(r => setTimeout(r, 300));
    }
    browserApi.runtime.sendMessage({ type: 'PLAY_ATHAN' });
  }
}

// Handle scheduled prayer alarms
browserApi.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCHEDULE_NEXT_PRAYER") {
    const { timestamp, name } = message.payload;
    browserApi.alarms.create(`prayer:${name}`, { when: timestamp });
    sendResponse({ status: "success" });
  }
  return true;
});

// When alarm fires, play athan and show notification
browserApi.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('prayer:')) {
    const prayerName = alarm.name.split(':')[1];
    showNotification(prayerName);
    playAthan();
  }
});

// Stop athan when notification is closed (Chrome only)
if (!isFirefox) {
  browserApi.notifications.onClosed.addListener(() => {
    browserApi.runtime.sendMessage({ type: 'STOP_ATHAN' });
  });
}
