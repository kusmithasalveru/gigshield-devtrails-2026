# GigShield - Frontend Documentation

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI framework |
| Vite | 5.2 | Build tool + dev server |
| React Router | 6.23 | Client-side routing |
| Tailwind CSS | 3.4 | Utility-first styling |
| i18next | 23.11 | Internationalization (8 languages) |
| lucide-react | 0.379 | Icon library (tree-shakeable) |
| vite-plugin-pwa | 0.20 | Service worker + PWA manifest |
| clsx | 2.1 | Conditional CSS classes |

## Running Locally

```bash
cd frontend
npm install
npm run dev     # Dev server → http://localhost:5173
npm run build   # Production build → dist/
npm run preview # Preview production build
```

---

## Folder Structure

```
frontend/
├── index.html               # Entry HTML with PWA meta tags
├── package.json
├── vite.config.js           # Vite + PWA plugin config
├── tailwind.config.js       # Custom colors, touch target sizes
├── postcss.config.js
├── public/
│   └── icons/               # PWA icons (192px, 512px)
└── src/
    ├── main.jsx             # React entry + BrowserRouter
    ├── App.jsx              # Routes + AuthContext provider
    ├── i18n.js              # i18next configuration
    ├── index.css            # Tailwind directives + custom utilities
    ├── api/
    │   ├── client.js        # API functions (returns mock data)
    │   └── mockData.js      # All mock data for demo
    ├── pages/
    │   ├── Onboarding.jsx   # Language → OTP → Profile (3 steps)
    │   ├── Dashboard.jsx    # Home screen
    │   ├── PolicySelection.jsx
    │   ├── ClaimStatus.jsx
    │   ├── PayoutHistory.jsx
    │   ├── DisputePortal.jsx
    │   └── Profile.jsx
    ├── components/
    │   ├── Layout.jsx       # Shell: AlertBanner + content + BottomNav
    │   ├── BottomNav.jsx    # 5-tab navigation
    │   ├── StatusCard.jsx   # Green/Yellow/Red coverage card
    │   ├── TierSelector.jsx # 3-tier horizontal picker
    │   ├── AlertBanner.jsx  # Live disruption warning
    │   ├── PayoutBadge.jsx  # Shareable payout receipt
    │   ├── LanguagePicker.jsx # 8-language grid
    │   └── VoiceButton.jsx  # Web Speech API mic button
    ├── hooks/
    │   ├── useGeoLocation.js   # Browser geolocation
    │   ├── useTriggerFeed.js   # Simulated WebSocket for live events
    │   └── usePremiumCalc.js   # Client-side premium calculation
    └── locales/
        ├── en.json          # English (complete)
        ├── te.json          # Telugu (complete)
        ├── hi.json          # Hindi (complete)
        ├── ta.json          # Tamil (partial)
        ├── kn.json          # Kannada (partial)
        ├── ml.json          # Malayalam (partial)
        ├── bn.json          # Bengali (partial)
        └── mr.json          # Marathi (partial)
```

---

## Pages

### Onboarding (`/`)
3-step flow for new users:

| Step | Screen | Inputs |
|------|--------|--------|
| 1 | Language Selection | 8-language grid |
| 2 | Phone + OTP | 10-digit phone, 6-digit OTP |
| 3 | Profile Setup | Name, platform, zone, earnings slider, UPI ID |

After completion, user is logged in and redirected to Dashboard.

### Dashboard (`/dashboard`)
Home screen showing:
- **StatusCard** — Current coverage status (green/yellow/red)
- **Total Protected** — Sum of all completed payouts
- **Active Alerts** — Live disruption events from useTriggerFeed
- **Recent Payouts** — Last 3 payouts with "See All" link

### PolicySelection (`/policy`)
Weekly policy purchase:
- **Week Forecast** — 7-day weather outlook (mock)
- **TierSelector** — Basic (₹20) / Standard (₹35) / Pro (₹55) with peer choice %
- **Dynamic Premium** — Calculated via usePremiumCalc hook
- **UPI Payment** — Simulated payment with success confirmation

### ClaimStatus (`/claims`)
Real-time claim tracking:
- **Active Triggers** — From useTriggerFeed hook
- **Progress Stepper** — Detecting → Validating → Processing → Paid
- **Live Duration** — Updates every 30 seconds

### PayoutHistory (`/payouts`)
Full payout record:
- **Total Received** — Sum banner
- **Expandable List** — Each payout expands to show PayoutBadge
- **Status Badges** — Completed (green), Under Review (amber), Failed (red)
- **Share Button** — Web Share API or clipboard copy

### DisputePortal (`/dispute`)
Two-tap dispute flow:
1. Tap "Dispute" on a held payout
2. Choose input: Voice Note (Web Speech API) or Text
3. Submit → "Under Review" status
- Supports voice input in regional languages via Web Speech API

### Profile (`/profile`)
Settings page:
- **User Info** — Name, phone, platform
- **Trust Score** — Score/100 with progress bar
- **Language Picker** — Compact 4-column grid
- **Details** — Platform, zone, UPI, weekly earnings
- **Notifications** — WhatsApp and SMS toggles
- **Logout**

---

## Components

### StatusCard
Coverage status indicator with color coding.
```jsx
<StatusCard
  status="covered"     // "covered" | "expiring" | "action"
  policyTier="standard"
  premium={30}
  coverageLimit={350}
  expiryDate="2026-04-11"
/>
```

### TierSelector
Horizontal scrollable tier picker with social proof.
```jsx
<TierSelector
  selected="standard"
  onSelect={setSelectedTier}
  peerChoice={{ basic: 15, standard: 62, pro: 23 }}
  weeksActive={8}
  zone="Kukatpally"
/>
```

### AlertBanner
Displays active disruption alerts at top of screen. Renders nothing when no alerts.
```jsx
<AlertBanner alerts={triggers} />
```

### PayoutBadge
Shareable payout receipt card with gradient background.
```jsx
<PayoutBadge amount={280} eventType="heavy_rain" date="2026-03-25" description="..." />
```

### LanguagePicker
Grid of 8 language buttons. Each shows the language in its native script.
```jsx
<LanguagePicker onSelect={handleLanguageChange} compact={false} />
```

### VoiceButton
Microphone button using Web Speech API. Hides on unsupported browsers.
```jsx
<VoiceButton lang="te" onTranscript={(text) => setReason(text)} />
```

---

## Custom Hooks

### useGeoLocation
```js
const { latitude, longitude, error, loading, refresh } = useGeoLocation();
```
- Requests browser geolocation permission
- Caches last known position in localStorage
- Returns coordinates, loading state, and refresh function

### useTriggerFeed
```js
const { triggers, connected } = useTriggerFeed();
```
- Simulates WebSocket connection with mock data
- Updates trigger durations every 30 seconds
- Returns array of active triggers and connection status

### usePremiumCalc
```js
const { premium, coverageLimit, loading, error } = usePremiumCalc({ zone, tier, weeksActive });
```
- Calculates premium using the pricing formula
- Returns premium amount and coverage limit
- 200ms simulated delay (swappable to real API)

---

## i18n (Internationalization)

**8 Languages Supported:**
| Code | Language | Coverage |
|------|----------|----------|
| en | English | Complete (100%) |
| te | Telugu | Complete (100%) |
| hi | Hindi | Complete (100%) |
| ta | Tamil | Core screens (~60%) |
| kn | Kannada | Core screens (~50%) |
| ml | Malayalam | Core screens (~50%) |
| bn | Bengali | Core screens (~50%) |
| mr | Marathi | Core screens (~50%) |

**Auto-detection:** Language detected from browser settings, stored in `localStorage` as `gigshield_lang`.

**Fallback:** Missing keys fall back to English automatically.

**Usage in components:**
```jsx
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
// t('dashboard.welcome', { name: 'Ravi' }) → "Welcome, Ravi!"
```

---

## UX Design Principles

| Principle | Implementation |
|-----------|---------------|
| Mobile-first | `max-w-lg mx-auto`, 6-inch screen optimized |
| 48px touch targets | `min-h-touch min-w-touch` Tailwind utility |
| Icon-first | Every action has lucide-react icon + text |
| Color coding | Green = covered, Yellow = expiring, Red = action needed |
| Low bandwidth | PWA service worker caches static assets + key pages |
| No free-text fields | Taps, toggles, sliders, selections (except dispute reason) |
| Offline support | Dashboard, PolicySelection, PayoutHistory cached |

---

## Mock Data → Real API Migration

All API calls go through `src/api/client.js`. To switch from mock to real:

```js
// Current (mock):
export async function getActivePolicy(workerId) {
  await delay();
  return mockPolicy;
}

// Real API:
export async function getActivePolicy(workerId) {
  return apiCall(`/workers/${workerId}/policies?status=active`);
}
```

The `apiCall()` helper already handles:
- Base URL from `VITE_API_URL` env var
- Bearer token from localStorage
- JSON parsing and error handling
