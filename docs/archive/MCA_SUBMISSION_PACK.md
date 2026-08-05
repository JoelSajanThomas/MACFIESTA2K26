# MacFiesta Pro — MCA Viva / Submission Pack (ARCHIVED REFERENCE)

> **Status:** Archived. Use [../../PRODUCTION_STATUS.md](../../PRODUCTION_STATUS.md) and [../../PRODUCT_OVERVIEW.md](../../PRODUCT_OVERVIEW.md).


---

## 1. Project abstract

**MacFiesta Pro** is a full-stack web and Android-capable progressive web application for managing a college tech/cultural fest. It provides a public marketing site, JWT-authenticated participant registration, and a staff CMS/admin desk for events, results, gallery, announcements, and homepage content. The system is built with React 19, Vite, Django 5, Django REST Framework, and Capacitor for Android packaging.


---

## 2. Objectives

1. Deliver a modern public fest website (home, events, schedule, results, gallery, sponsors, CMS-driven content).  
2. Enable secure participant **Create Account / Login / Forgot Password** with JWT.  
3. Support event registration with capacity control and waiting list.  
4. Provide staff tools for registrations, verification by registration number, results publishing, gallery, announcements, and CMS.  
5. Package for web deploy and Android (Capacitor) with production environment configuration.  
6. Keep scope academic: exclude payment gateways and full fest ERP (hostel, transport, finance, etc.) as **future scope**.

---

## 3. System architecture (describe / draw)

```
[ React SPA (Vite) ]  ←→  HTTPS/JWT  ←→  [ Django REST API ]
        │                                      │
        │                                      ├── SQLite (dev) / PostgreSQL (prod)
        │                                      ├── Media files (MEDIA_ROOT)
        │                                      └── WhiteNoise (static)
        │
        └── Capacitor Android WebView (loads built `dist` + API URL)
```

**Layers:** Presentation (React) → API (DRF) → Domain models (Events, Registrations, CMS, …) → Persistence.

---

## 4. Database ER (from project models — not assumed)

**Relationships (only FKs in the codebase):**

```
django.contrib.auth.User
        │ 1
        │
        │ N   Registration.user (CASCADE, no related_name)
        ▼
   Registration ──── N:1 ──── Event
        │                       │ 1
        │ unique(user, event)   │
        │ unique(registration_number)
        │                       │ N   Result.event (related_name='results')
        │                       ▼
        │                    Result

Event.slug unique
Event ← Registration.event (related_name='registrations')
```

**Standalone (no FKs):** `GalleryImage`, `Announcement`, plus CMS models  
`SiteSetting`, `FestivalHighlight`, `EventCategoryContent`, `EventFormat`, `GuestProfile`, `ThemeSection`, `Testimonial`, `FAQ`, `Sponsor`, `HomepageSection` (`section_key` unique), `FestRewindItem`.

---

## 5. Technology stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router, Axios, Framer Motion |
| Backend | Django 5, DRF, SimpleJWT, django-cors-headers |
| DB | SQLite (dev), PostgreSQL via `DATABASE_URL` (prod) |
| Static/media | WhiteNoise (static); `MEDIA_URL` + file serve (`SERVE_MEDIA`) |
| Mobile | Capacitor Android |
| Deploy | Render (API), Vercel (frontend), Neon (optional Postgres) |

---

## 6. API overview

| Area | Endpoints (examples) |
|------|----------------------|
| Auth | `POST /api/auth/register/`, `/login/`, `/refresh/`, `/password-reset/`, `/password-reset/confirm/`, `GET /api/auth/me/` |
| Events | `/api/events/` CRUD (write: staff) |
| Registrations | `/api/registrations/` (auth); `/api/admin/registrations/` (staff) |
| Results / Gallery / Announcements | `/api/results/`, `/api/gallery/`, `/api/announcements/` |
| CMS | `/api/cms/site-settings/`, sponsors, guests, theme, homepage-sections, … |
| Stats | `/api/public/stats/`, `/api/dashboard/stats/` |

---

## 7. Screenshots to capture

1. Home (CMS hero)  
2. Create Account + Login + Forgot Password  
3. Event detail + registration success (number + QR)  
4. Student dashboard  
5. Admin insights  
6. Admin events / registrations / verification  
7. Results + Gallery + Announcements (public)  
8. CMS site settings edit  
9. Android APK home (optional)

---

## 8. Installation / deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** and **[TESTING_SUMMARY.md](./TESTING_SUMMARY.md)**.

**Local quick start**

```powershell
# Backend
cd backend
.\venv\Scripts\Activate
python manage.py migrate
python manage.py runserver 0.0.0.0:8000

# Frontend
cd frontend
npm install
npm run dev
```

**Production env (minimum)**

Frontend build:

```env
VITE_API_BASE_URL=https://your-backend-domain/api
```

Backend:

```env
DEBUG=False
SECRET_KEY=...
ALLOWED_HOSTS=your-backend-domain
CORS_ALLOWED_ORIGINS=https://your-frontend-domain
CSRF_TRUSTED_ORIGINS=https://your-frontend-domain
FRONTEND_BASE_URL=https://your-frontend-domain
SERVE_MEDIA=True
# EMAIL_HOST / EMAIL_PORT / EMAIL_HOST_USER / EMAIL_HOST_PASSWORD / DEFAULT_FROM_EMAIL
```

**Production APK**

```powershell
cd frontend
# set VITE_API_BASE_URL in .env.production
npm run build
npx cap sync android
# Android Studio → Generate Signed Bundle / APK (release), not debug
```

Confirm `capacitor.config.json` has **no** `server.url` LAN IP.

---

## 9. Testing summary

See **[TESTING_SUMMARY.md](./TESTING_SUMMARY.md)**.

---

## 10. Future enhancements (out of current MCA scope)

- Payment gateway (Razorpay/Stripe) and automated receipts  
- Accommodation / hostel allocation  
- Transport booking  
- Food coupons + volunteer scan desks  
- Finance/accounting and bank-style reports  
- Volunteer ERP and attendance  
- Grievance / program objection workflow  
- Push notifications and full offline PWA (service worker)  
- Cloud object storage for durable multi-instance media  

---

## Final assessment (MCA)

| Criteria | Level |
|----------|--------|
| Architecture | Very good |
| Feature completeness (scoped) | Very good |
| Admin/CMS | Strong |
| Authentication | Complete |
| Deployment readiness | Good (after production env vars) |
| Overall | Ready for submission after final manual UI testing and deploy smoke |
