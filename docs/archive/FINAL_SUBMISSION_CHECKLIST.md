# MacFiesta Pro — Production Launch Checklist

MacFiesta Pro is the **production** replacement for the legacy MacFiesta site. Use this checklist before cutting over DNS / public traffic. Feature status: [FUTURE_ENHANCEMENTS_STATUS.md](./FUTURE_ENHANCEMENTS_STATUS.md). Brand/content cutover: [OFFICIAL_LAUNCH_CHECKLIST.md](./OFFICIAL_LAUNCH_CHECKLIST.md).


---

## 1. Replace production placeholders

### Frontend — `.env.production` (local file, **do not commit secrets**)

```env
VITE_API_BASE_URL=https://your-real-backend-domain/api
```

### Backend — host environment (Render / server)

```env
DEBUG=False
SECRET_KEY=your-secure-production-secret
ALLOWED_HOSTS=your-backend-domain.com
FRONTEND_BASE_URL=https://your-frontend-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
CSRF_TRUSTED_ORIGINS=https://your-frontend-domain.com

SERVE_MEDIA=True
MEDIA_URL=/media/
# MEDIA_ROOT is set in settings.py (backend/media); override only if needed

EMAIL_HOST=...
EMAIL_PORT=587
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=MacFiesta Pro <noreply@your-domain.com>
```

**Never commit real secrets to GitHub.** Keep `.env` / `.env.production` gitignored; use dashboard env vars on Render/Vercel.

Templates only: `frontend/.env.production.example`, `backend/.env.example`.

---

## 2. Complete the manual walkthrough

Use [TESTING_SUMMARY.md](./TESTING_SUMMARY.md) on **browser and phone**:

- [ ] New account creation  
- [ ] Login and logout  
- [ ] Wrong credentials  
- [ ] Forgot / reset password  
- [ ] Event registration (**future event dates**)  
- [ ] Waitlist on a full event  
- [ ] Registration number and QR display  
- [ ] Student dashboard  
- [ ] Admin event creation  
- [ ] Result publishing  
- [ ] Gallery upload  
- [ ] Announcement publishing  
- [ ] CMS editing  
- [ ] Mobile navigation and Android back button  
- [ ] Uploaded images after refresh  

---

## 3. Deploy and live smoke test

After frontend + backend deploy, repeat:

Create account → Login → Open event → Register → View registration + QR → Admin publishes announcement/result → User sees updates.

Also confirm:

- [ ] Password-reset links use **real** `FRONTEND_BASE_URL`  
- [ ] Uploaded media still loads after backend restart (note: ephemeral disk on free Render — plan S3 later if needed)

---

## 4. Build the signed Android release

```powershell
cd frontend
# .env.production must have the real VITE_API_BASE_URL first
npm run build
npx cap sync android
npx cap open android
```

Android Studio: **Build → Generate Signed App Bundle or APK → release**.  
Store the **keystore and passwords** safely.

Confirm Capacitor has **no** LAN `server.url`.

---

## 5. Viva materials

### Screenshots

Home · Events list/details · Create account · Registration confirmation + QR · Student dashboard · Admin dashboard · CMS · Results · Gallery · Announcements

### Architecture

```
React / Android App
        ↓ REST API (JWT)
Django REST Framework
        ↓
Database + Media Storage
```

### ER diagram

Use the **real** relationships in [MCA_SUBMISSION_PACK.md](./MCA_SUBMISSION_PACK.md) § Database ER (from project models — not a generic assumed schema).

### Docs already prepared

| File | Purpose |
|------|---------|
| [MCA_SUBMISSION_PACK.md](./MCA_SUBMISSION_PACK.md) | Abstract, objectives, stack, API, future scope |
| [TESTING_SUMMARY.md](./TESTING_SUMMARY.md) | Automated + manual tests |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Hosting + APK |

---

## Final verdict

| Area | Status |
|------|--------|
| Application (production feature set) | Ready for launch hardening |
| Automated functional checks | Passed |
| Remaining | Manual UI, real env/deploy, live smoke, signed release |
| Recommendation | **No new modules** — deploy, screenshots, docs, presentation only |

**Out of scope (Future Enhancements only):** payment gateway, hostel, transport, finance ERP, volunteer ERP, grievances, bank-style reports.
