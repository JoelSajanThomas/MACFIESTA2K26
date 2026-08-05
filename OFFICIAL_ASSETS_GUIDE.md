# MacFiesta Pro — Official Assets Replacement Guide

Use this guide when replacing development placeholders with official MacFiesta branding.  
**Do not copy images from the old macfiesta.in website** unless your team owns the rights.

---

## Quick reference

| Asset | Primary method | Fallback file |
|-------|----------------|---------------|
| Logo (navbar, favicon) | Replace SVG in `public/brand/` | `src/utils/brand.js` → `logo.*` paths |
| Hero image | Admin → Site Settings | `src/utils/assets.js` → `heroImage` |
| Welcome / about image | Admin → Site Settings | `src/utils/assets.js` → `aboutImage` |
| Theme section image | Admin → Theme | `src/utils/assets.js` → `categoryImages.cultural` |
| Guest photo | Admin → Guest Profiles | `src/utils/assets.js` → `guestPlaceholder` |
| Sponsor logos | Admin → Sponsors | Text-only until logo uploaded |
| Gallery | Admin → Gallery | `src/utils/assets.js` → `galleryPlaceholders` |
| Rewind tiles | `src/utils/constants.js` → `REWIND_HIGHLIGHTS` | `categoryImages` in `assets.js` |
| Contact details | Admin → Site Settings + `src/utils/brand.js` | `BRAND` object |

---

## 1. Logo

### Files to replace

Place official SVG (preferred) or PNG in:

```
frontend/public/brand/logo-mark.svg      ← Navbar, favicon
frontend/public/brand/logo-lockup.svg    ← Hero (if used)
frontend/public/brand/logo-footer.svg    ← Footer
frontend/public/favicon.svg              ← Browser tab (copy from mark or export)
```

### Configuration

Paths are defined in `frontend/src/utils/brand.js`:

```js
logo: {
  mark: "/brand/logo-mark.svg",
  lockup: "/brand/logo-lockup.svg",
  footer: "/brand/logo-footer.svg",
  ...
}
```

After replacing files, **keep the same filenames** or update paths in `brand.js`.

### Size recommendations

| Variant | Recommended canvas | Notes |
|---------|-------------------|--------|
| Mark | 64×64 px (SVG) | Square; works at 36px navbar height |
| Lockup | 440×80 px | Horizontal wordmark + mark |
| Footer | 320×60 px | Lighter version for dark footer |

### Naming format

```
logo-mark.svg
logo-lockup.svg
logo-footer.svg
favicon.svg
```

Use lowercase, hyphens, no spaces.

---

## 2. Hero image

### Preferred: CMS (no deploy needed)

1. Log in as admin → **Admin** → **Website Content** → **Site Settings**
2. Upload **Hero image**
3. Save

Homepage hero reads `settings.hero_image_url` from the API.

### Fallback (before CMS upload)

Edit `frontend/src/utils/assets.js`:

```js
export const heroImage = photo("photo-...", 1920);
// Or use a local file in public/:
// export const heroImage = "/assets/official/hero-2026.jpg";
```

### Size recommendations

| Use | Dimensions | Format | Max file size |
|-----|------------|--------|---------------|
| Hero background | 1920×1080 min | JPG/WebP | ≤ 500 KB |
| Mobile crop | Center-weighted subject | — | Test at 390px width |

**Naming:** `hero-macfiesta-2026.jpg` → store in `public/assets/official/` if not using CMS.

---

## 3. Welcome / about image

### CMS

**Site Settings** → **About image**

### Fallback

`assets.js` → `aboutImage`

### Size recommendations

1200×900 px (4:3), JPG/WebP, ≤ 300 KB  
**Naming:** `about-campus-2026.jpg`

---

## 4. Gallery images

### Preferred: Admin uploads

1. **Admin** → **Manage Gallery** → Add items with image + title + category
2. When gallery API returns data, homepage shows **real uploads** (up to 12 on home)
3. Full gallery at `/gallery`

### Fallback placeholders

Only used when the gallery API is empty. Defined in:

- `frontend/src/utils/assets.js` → `galleryPlaceholders`
- Normalized via `galleryUtils.js`

### Size recommendations

| Use | Dimensions | Format |
|-----|------------|--------|
| Grid thumbnail | 800×800 min | JPG/WebP |
| Lightbox | 1600px long edge | JPG/WebP |

**Naming:** `gallery-{category}-{sequence}.jpg`  
Examples: `gallery-stage-01.jpg`, `gallery-cultural-02.jpg`

---

## 5. Sponsor logos

### CMS

**Admin** → **Website Content** → **Sponsors** → upload **Logo** per sponsor

Homepage and `/sponsors` use API data when available.

### Fallback

`assets.js` → `sponsorPlaceholders` (name only, no logo file)

### Size recommendations

| Use | Dimensions | Format |
|-----|------------|--------|
| Sponsor logo | 400×200 px max | PNG (transparent) or SVG |
| Display height | 48px on site | — |

**Naming:** `sponsor-{slug}.png`  
Example: `sponsor-title-partner.png`

---

## 6. Guest photos

### CMS

**Admin** → **Website Content** → **Guest Profiles** → upload image

Homepage shows the **first active** guest.

### Fallback

`assets.js` → `guestPlaceholder`  
`constants.js` → `GUEST_PROFILES[0].image`

### Size recommendations

600×800 px (3:4 portrait), JPG/WebP, ≤ 200 KB  
**Naming:** `guest-{slug}.jpg`  
Example: `guest-akhil-marar.jpg`

---

## 7. Theme section image

### CMS

**Admin** → **Website Content** → **Theme** → upload image

### Fallback

`categoryImages.cultural` in `assets.js`

### Size recommendations

1920×1080 px, JPG/WebP, ≤ 400 KB  
**Naming:** `theme-retro-fiesta-2026.jpg`

---

## 8. Rewind section tiles

Four homepage tiles (Music Band, Cultural Events, Fashion, DJ Night) use images from:

`frontend/src/utils/constants.js` → `REWIND_HIGHLIGHTS`

Each entry has an `image` field pointing to `categoryImages.*` in `assets.js`.

To use official photos, either:

1. Add files under `public/assets/official/rewind/` and set full paths in `REWIND_HIGHLIGHTS`, or  
2. Extend CMS later (currently constants + assets fallback)

**Naming:** `rewind-music-band.jpg`, `rewind-cultural.jpg`, `rewind-fashion.jpg`, `rewind-dj-night.jpg`  
Recommended: 800×600 px each

---

## 9. Contact details

### CMS (live on site when saved)

**Admin** → **Site Settings**:

- Contact email  
- Contact phone  
- Venue, location  
- Instagram / YouTube / Facebook URLs  

### Code defaults

`frontend/src/utils/brand.js` → `BRAND` object (email, phone, venue, social links)

Update `brand.js` before launch if CMS is not yet filled.

---

## 10. Event images (not homepage, but related)

Per-event posters: **Admin** → **Manage Events** → upload **Image**

Fallback category images: `assets.js` → `categoryImages` and `getEventFallbackImage()`

**Naming:** `event-{slug}.jpg` — 900×560 px (16:10)

---

## 11. Page header backgrounds

Secondary pages use `PAGE_IMAGES` in `assets.js` (Events, Schedule, Gallery, etc.).  
Replace via CMS where available, or update `PAGE_IMAGES` keys in `assets.js`.

---

## Checklist before official launch

- [ ] Replace `public/brand/*.svg` and `favicon.svg`
- [ ] Upload hero + about images in Site Settings
- [ ] Upload theme image
- [ ] Add all sponsors with logos in CMS
- [ ] Add guest profile(s) with official photo
- [ ] Upload gallery photos (replace Unsplash placeholders)
- [ ] Update contact email/phone/social in Site Settings
- [ ] Review `brand.js` for correct college name, dates, URLs
- [ ] Replace rewind tile images in `constants.js` if needed
- [ ] Run `npm run build` and verify homepage on mobile

---

## Technical notes

- All placeholder photos currently use **Unsplash** URLs in `assets.js` — safe for development only.
- Homepage loads images from **CMS API first**, then falls back to `assets.js` / `constants.js`.
- Uploaded CMS files are served from Django `MEDIA_URL` (typically `/media/...`).
- Do not commit large binary assets to git if using CMS; use `public/assets/official/` only for static deploy bundles.

For design tokens and component classes, see `frontend/DESIGN_SYSTEM.md`.
