# MacFiesta Pro — Official Launch Checklist (brand & content)

Companion to the **operational** launch checklist in [PRODUCTION_STATUS.md](./PRODUCTION_STATUS.md).

Use this guide for branding, assets, and content when MacFiesta Pro replaces the legacy MacFiesta website.


---

## 1. Replace placeholder images

All placeholder URLs live in **`frontend/src/utils/assets.js`**.

| Asset | Variable | Replace with |
|-------|----------|--------------|
| Hero background | `heroImage` | `/official/hero.jpg` |
| About section | `aboutImage` | `/official/about.jpg` |
| CTA banner | `ctaImage` | `/official/cta.jpg` |
| Sponsors header | `sponsorsBackgroundImage` | `/official/sponsors-bg.jpg` |
| Default event image | `defaultEventImage` | `/official/event-default.jpg` |
| Category fallbacks | `categoryImages` | Per-category files in `/public/official/` |
| Gallery placeholders | `galleryPlaceholders` | Remove when live gallery is uploaded via admin |
| Sponsor placeholders | `sponsorPlaceholders` | Official sponsor logos in `/public/official/sponsors/` |

**Steps:**

1. Add official files to `frontend/public/official/` (or `frontend/public/brand/` for logo).
2. Update paths in `assets.js` — e.g. `heroImage: "/official/hero.jpg"`.
3. Run `npm run build` and verify images load in production.

**Logo:** Replace `frontend/public/brand/logo.svg` and update `BRAND.logo.src` in `frontend/src/utils/brand.js` if the path changes.

---

## 2. Update official branding

Edit **`frontend/src/utils/brand.js`**:

- `festName`, `festYear`, `tagline`
- `collegeName`, `venue`, `location`
- `contactEmail`, `contactPhone`, `registrationHelpEmail`, `registrationHelpPhone`
- `socialLinks` (Instagram, YouTube, Facebook, official website)
- `importantDates` (registration opens, fest start/end)
- `colors` and `typography` (also mirrored in `App.css` CSS variables)

After editing, search the codebase for any remaining hardcoded fest text — most pages now read from `brand.js` or re-export via `constants.js`.

---

## 3. Create admin users

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py createsuperuser
```

Staff users (`is_staff=True`) can access:

- `/admin-dashboard` — overview
- `/admin/events`, `/admin/results`, `/admin/announcements`, `/admin/gallery`, `/admin/registrations`

Non-staff users see **Access denied**. Logged-out users are redirected to login.

---

## 4. Add events (web admin)

1. Log in as staff → **Admin** → **Events** (or `/admin/events`).
2. Click **Add event**.
3. Fill: title, slug, category, description, rules, venue, date, time, max participants, fee.
4. Upload an event image (optional — category placeholder used if empty).
5. Toggle **Registration open** and **Result published** as needed.
6. Save — event appears on `/events` and home featured section immediately.

---

## 5. Publish results

1. Go to `/admin/results` → **Add result**.
2. Select event from dropdown.
3. Enter participant name, college, position (1/2/3), optional remarks.
4. On the event, set **Result published** = true in `/admin/events/:id/edit`.
5. Results appear on `/results` and event detail page.

---

## 6. Upload gallery

1. Go to `/admin/gallery` → **Add image**.
2. Enter title and upload image (preview shown before save).
3. Images appear on `/gallery` and home gallery preview.

**Production note:** On Render free tier, uploaded media is ephemeral. Use S3/Cloudinary or persistent disk for official launch.

---

## 7. Manage announcements

1. Go to `/admin/announcements`.
2. Add title, message, set **Active** for public visibility.
3. Public page shows **Last updated** timestamp from latest announcement.

---

## 8. Deploy backend

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full steps.

Quick checklist:

- [ ] `DATABASE_URL` set (Neon PostgreSQL)
- [ ] `SECRET_KEY` set (random, not default)
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` includes Render hostname
- [ ] `CORS_ALLOWED_ORIGINS` includes Vercel frontend URL
- [ ] Run migrations via `build.sh`
- [ ] Create superuser on production shell

---

## 9. Deploy frontend

1. Set `VITE_API_BASE_URL=https://your-backend.onrender.com/api` in Vercel env.
2. Copy from `frontend/.env.production.example`.
3. Deploy: `npm run build` (Vercel runs this automatically).
4. Verify API calls hit production backend, not localhost.

---

## 10. Final launch checklist

### Content
- [ ] Official logo in `/public/brand/`
- [ ] Hero, about, and CTA images replaced
- [ ] All events added with correct dates, venues, rules
- [ ] Sponsors page updated with real partner names/logos
- [ ] Contact emails and phone numbers verified in `brand.js`

### Admin & security
- [ ] Superuser created; test staff login
- [ ] Non-staff cannot POST/PUT/DELETE via API (401/403)
- [ ] Public GET works without auth
- [ ] Registrations: students see only their own; admin sees all + CSV export

### UX & mobile
- [ ] No horizontal scroll at 390px, 430px, 768px
- [ ] Registration form usable on mobile
- [ ] Admin tables readable on mobile (card layout)
- [ ] Gallery lightbox works on touch devices

### Technical
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `python manage.py check` passes
- [ ] Login, student dashboard, and public pages work end-to-end

### Go-live
- [ ] DNS / domain pointed to Vercel (if custom domain)
- [ ] Old site redirect plan documented
- [ ] Registration help contact tested
- [ ] Announcements published for launch day
- [ ] All migrations applied on production (incl. `registrations.0004_production_ops_fields`)
- [ ] App server restarted after migrate
- [ ] `DEBUG=False`, `ALLOWED_HOSTS`, SMTP configured
- [ ] `collectstatic` run; media uploads verified
- [ ] E2E: registration → pass/QR → desk verify → payment status
- [ ] Admin reports / CSV export checked
- [ ] Results publication checked
- [ ] Database backup taken before opening registrations

See also [PRODUCTION_STATUS.md](./PRODUCTION_STATUS.md) for infrastructure / config / functional go-live checks.

**Support:** Registration desk — see `BRAND.registrationHelpEmail` and `BRAND.registrationHelpPhone` in `brand.js`.

