# MacFiesta Pro — Mobile / APK packaging

The homepage is kept **promotional and lightweight** for phone sharing. Full admin and desk features stay on their own routes.

## Current homepage sections

1. Hero (text + countdown + CTAs)
2. Welcome / about
3. Event types (Solo → Group)
4. Theme
5. Guest profile
6. Rewind (4 tiles)
7. Sponsors
8. Gallery glimpses (6 images max)

Removed from home for a shorter scroll: energy statement block, footer countdown, stats, announcements, FAQ.

Logo appears in the **navbar only** — not on the hero.

---

## Option A — Install as PWA (quickest)

1. Deploy frontend + backend (or run on LAN for testing).
2. Open the site in **Chrome on Android**.
3. Menu → **Install app** / **Add to Home screen**.

`public/manifest.webmanifest` is already configured for standalone display.

For LAN testing during dev:

```powershell
cd frontend
npm run build
npm run preview -- --host
```

Point phones to `http://<your-pc-ip>:4173` (same Wi‑Fi). Set `VITE_API_BASE_URL` to your backend URL reachable from the phone.

---

## Option B — Build a shareable APK (Capacitor)

### Prerequisites

- Node.js, Android Studio, JDK 17+
- Built production frontend

### Steps

```powershell
cd frontend
npm run build

npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "MacFiesta Pro" "org.macfast.macfiesta" --web-dir dist
npx cap add android
npx cap sync android
npx cap open android
```

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

Share the APK from `android/app/build/outputs/apk/`.

### API URL for APK

Set production API in `.env.production`:

```
VITE_API_BASE_URL=https://your-server.com/api
```

Rebuild before `cap sync`.

---

## Option C — TWA (Play Store style)

Use [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) or PWA Builder with your deployed HTTPS URL. Requires a live domain with valid SSL.

---

## Mobile checklist before sharing

- [ ] Hero shows text only (no duplicate logo image)
- [ ] Countdown fits one row on 390px width
- [ ] Gallery home preview loads ≤ 6 images
- [ ] Backend API reachable from phone network
- [ ] `npm run build` succeeds
- [ ] Test Register → Events flow on phone

---

## Files for mobile

| File | Role |
|------|------|
| `public/manifest.webmanifest` | PWA install metadata |
| `index.html` | viewport, manifest link, iOS meta |
| `public/assets/official/macfiesta-logo.png` | App icon |

Replace the 512×512 app icon with a square cropped logo export when ready for Play Store.
