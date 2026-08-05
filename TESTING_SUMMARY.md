# MacFiesta Pro — Testing Summary (Production)

**Scope:** Production fest portal (auth, events, registration, admin/CMS, media, desk ops). Full ERP modules remain deferred — see [FUTURE_ENHANCEMENTS_STATUS.md](./FUTURE_ENHANCEMENTS_STATUS.md).

**Date:** 2026-07-29

## Automated API smoke (local)

| Scenario | Result | Notes |
|----------|--------|-------|
| Create account | Pass | `POST /api/auth/register/` returns JWT |
| Login | Pass | `POST /api/auth/login/` |
| Forgot password + confirm | Pass | Email console/DEBUG link; re-login OK |
| Staff login | Pass | Committee usernames in Admin Guide; passwords not documented |
| Register for event | Pass | Requires **future** `event_date` |
| Join waitlist | Pass | Capacity 1 + `waiting_list_enabled` → second user waitlisted |
| View my registrations | Pass | `GET /api/registrations/` |
| QR payload | Pass | Registration number present; **display QR** in UI (no in-app scanner) |
| Publish result | Pass | Admin create + `is_result_published` |
| Upload gallery image | Pass | Multipart `POST /api/gallery/` → 201 |
| Create announcement | Pass | Admin POST |
| Edit CMS site settings | Pass | PATCH tagline |
| JWT refresh | Pass | `POST /api/auth/refresh/` |
| Invalid token rejected | Pass | 401 (logout / expiry behaviour) |
| Media URL serve | Pass | `/media/...` works with `SERVE_MEDIA` |

Raw log: `e2e-smoke-results.json` (partial first run; registration re-verified after dating events correctly).

## Manual UI checklist (browser / phone)

Do these on `http://localhost:5173` with backend running:

1. **Create Account** → `/register` → lands on Events or `?next=` target  
2. **Login** → `/login` → staff → Admin; student → dashboard  
3. **Forgot Password** → `/forgot-password` → use DEBUG reset link or SMTP email → `/reset-password`  
4. **Register Event** while logged out → see **Login** and **Create Account**  
5. **Register** while logged in → success panel shows **registration number + QR + dashboard CTA**  
6. **Waitlist** → fill event (`max_participants` small, waitlist on) → second account joins waitlist  
7. **Student dashboard** → registration details / payment badge  
8. **Admin → Results** → add winner; set event **Result published** → check `/results`  
9. **Admin → Gallery** → upload image → `/gallery`  
10. **Admin → Announcements** → create/edit → `/announcements`  
11. **Admin → Website Content** → edit site settings / homepage sections  
12. **Logout** → tokens cleared; `/admin` denied; protected APIs 401  

### QR note

The app **generates** a QR from the registration number after success. A dedicated in-app volunteer QR-camera module is still optional; desk verification uses the registration number (Admin → Verification) or any external QR reader against that code.

## Known test data tip

Events with **past** `event_date` reject new registrations even if `is_registration_open=True`. For demos, set event dates in the future in Admin → Events.

## Production verification (after deploy)

Repeat: account creation, login, password-reset **email**, registration, media upload, CMS edit, gallery, results, announcements.
