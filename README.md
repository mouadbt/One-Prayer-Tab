# One Prayer Tab

A minimalist browser extension (Chrome + Firefox) that replaces your new tab page with a clean interface with search functionality, prayer times, weather and more...

## Features

### Prayer Times

- Display today's 5 prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Show next prayer countdown (hours and minutes remaining)
- Display current Hijri date
- Audio notifications (Athān) when prayer time starts
- 5-minute reminder before each prayer
- Choose your preferred Muadhin for Athān audio

### Quran Ayah

- Daily random ayah from the Quran with Arabic text
- Tafsir (explanation) in Arabic
- Audio recitation with multiple reciters to choose from
- Play/pause, next/previous ayah controls
- Visual audio bars animation during playback

### Weather

- Current temperature, condition, humidity, and wind speed
- Beautiful background images that change based on weather and time of day
- Auto-refresh every hour
- Works offline with cached data

### Tasks (To-Do)

- Add, complete, and remove tasks
- Tasks saved to local storage
- Simple checkbox interface

### Search

- Quick search from new tab
- Multiple search engines support (Startpage, Google, DuckDuckGo, etc.)
- Set preferred search engine
- URL detection - type a URL and press enter to navigate directly
- Search suggestions from browser history and top sites

### Clock

- Real-time digital clock (HH:MM format)

### Location & Map

- Interactive map to set your location
- Auto-detect location via IP
- Manual location update by clicking on map
- Dark and satellite map layers
- Location used for accurate prayer times and weather

### Settings

- Toggle features on/off (search focus, prayer notifications)
- Choose your preferred Quran reciter
- Choose your preferred Muadhin for prayer Athān
- Update location from map
- Clean and simple settings panel

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+ modules)
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **Map**: Leaflet
- **APIs**:
  - Prayer times: Aladhan API
  - Weather: Open-Meteo API
  - Quran: AlQuran Cloud API
  - Location: IP-based geolocation

## Project Structure

```
onePrayerTab/
├── public/
│   ├── manifest.json       # Extension manifest (v3)
│   ├── background.js       # Service worker for alarms and notifications
│   ├── offscreen.js        # Offscreen document for audio playback (Chrome)
│   ├── offscreen.html      # Offscreen HTML wrapper
│   └── assets/
│       ├── audio/          # Athān and ring sounds
│       └── images/         # Icons and backgrounds
├── src/
│   ├── index.html          # Main new tab page
│   ├── css/
│   │   └── style.css       # Custom styles + Tailwind
│   └── js/
│       ├── main.js         # App entry point
│       ├── prayers.js      # Prayer times logic
│       ├── location.js     # Location and map handling
│       ├── weather.js      # Weather data and display
│       ├── ayah.js         # Quran ayah and audio
│       ├── todo.js         # Tasks management
│       ├── search.js       # Search functionality
│       ├── suggestions.js  # Search suggestions from history/top sites
│       ├── settings.js     # Settings handling
│       ├── ui.js           # UI rendering functions
│       ├── utils.js        # Utility functions
│       ├── time.js         # Clock logic
│       └── events.js       # Global event listeners
└── vite.config.js          # Vite configuration
```

## Installation

### Development

1. Clone the repo:

```bash
git clone https://github.com/mouadbt/One-Newtab-Prayer.git
cd onePrayerTab
```

2. Install dependencies:

```bash
npm install
```

3. Build the extension:

```bash
npm run build
```

4. Load in browser:
   - **Chrome**: Go to `chrome://extensions/` → Enable "Developer mode" → Click "Load unpacked" → Select the `dist` folder
   - **Firefox**: Go to `about:debugging#/runtime/this-firefox` → Click "Load Temporary Add-on" → Select `dist/manifest.json`

### Development Mode

Run dev server with hot reload:

```bash
npm run dev
```

## How It Works

### Prayer Times Flow

1. Get user location (IP-based or manual)
2. Fetch monthly prayer times from Aladhan API
3. Cache data in localStorage
4. Find today's prayers and categorize them (passed/next/upcoming)
5. Send timestamps to background script
6. Background script schedules alarms
7. When alarm fires → play selected Muadhin audio + show notification

### Search Suggestions Flow

1. User starts typing in search box
2. Extension fetches top sites and browsing history
3. Filters results matching the query
4. Displays suggestions with favicons
5. Click to navigate or press Enter to search

### Audio Playback

- **Firefox**: Audio plays directly in background script
- **Chrome**: Audio plays in offscreen document (Manifest v3 requirement)

### Data Storage

All data stored in localStorage:

- Prayer times (monthly cache)
- Weather forecast (hourly cache)
- Quran data (full Quran cached once)
- User settings and preferences (reciter, muadhin, enabled features)
- Tasks list
- Location coordinates
- Search engines configuration

## APIs Used

| Service | Endpoint | Purpose |
|---------|----------|---------|
| Aladhan | `api.aladhan.com/v1/calendar` | Prayer times |
| Open-Meteo | `api.open-meteo.com/v1/forecast` | Weather data |
| AlQuran Cloud | `api.alquran.cloud/v1/quran` | Quran text and audio |
| IPGeo | `api.techniknews.net/ipgeo` | Location from IP |
| IPWho | `ipwho.is` | Fallback location API |

## Browser Support

- Chrome (Manifest v3)
- Firefox (Manifest v3 with browser-specific settings)
- Other Firefox-based & Chromium-based browsers

## Permissions

```json
{
  "history": "Get search suggestions from browsing history",
  "topSites": "Get search suggestions from top visited sites",
  "alarms": "Schedule prayer notifications",
  "notifications": "Show prayer time alerts",
  "offscreen": "Audio playback in Chrome (Manifest v3)"
}
```

## Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build
```

Output goes to `dist/` folder ready for extension upload.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Test in both Chrome and Firefox
5. Submit a PR

## License

ISC

## Support

Found a bug or have a feature request? Open an issue on [GitHub](https://github.com/mouadbt/One-Newtab-Prayer/issues).

---

**Made with ❤️ for the Muslim Ummah**
