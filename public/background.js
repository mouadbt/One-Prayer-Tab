// Determine the browserApi namespace Chrome uses 'chrome' while Firefox uses 'browser'
const browserApi = typeof chrome !== "undefined" ? chrome : browser;

// Show a notification when prayer time comes
const showPrayerNotification = (prayerName) => {
  if (!prayerName) return;

  browserApi.notifications.create({
    type: "basic",
    title: prayerName,
    message: `${prayerName} time is now`,
    iconUrl: "/assets/images/icon128.png",
  });
};

// Play Athan when prayer time is came
const playSound = () => {
  const athan = new Audio('/assets/audio/اسلام-صبحي.m4a');
  console.log('now playing athan sound')
  athan.play();
}

// Tells the browser's hardware clock to set an alarm
const createAlarm = (timestamp, name) => {

  const alarmName = `prayer:${name}`;

  // After clearing it if it's already exist the alaram that will excute and run in the prayer timestamp is created
  browserApi.alarms.clear(alarmName, () => {

    // Create the alaram 
    browserApi.alarms.create(alarmName, { when: timestamp });

    console.log('now playing athan sound')

    // Show the notification
    showPrayerNotification(name);
    playSound();
  });
}

// 1. Listen for messages from the UI
browserApi.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === "SCHEDULE_NEXT_PRAYER") {
    const { timestamp, name } = message.payload;

    // Trigger the alarm creation
    createAlarm(timestamp, name);

    // Tell the UI we got the message (important for Firefox stability)
    sendResponse({ status: "success" });
  }
  return true;
});