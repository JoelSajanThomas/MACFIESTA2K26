# API Documentation

Base path: `/api/`  
Auth: JWT (`Authorization: Bearer <access>`). Obtain tokens via login or register.

## Auth

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| POST | `/api/auth/register/` | Public | Create account; returns JWT |
| POST | `/api/auth/login/` | Public | JWT obtain pair |
| POST | `/api/auth/refresh/` | Public | Refresh access token |
| POST | `/api/auth/password-reset/` | Public | Request reset email |
| POST | `/api/auth/password-reset/confirm/` | Public | Confirm with token |
| GET | `/api/auth/me/` | User | Current user + staff flag |

## Events & public content

| Method | Path | Auth |
|--------|------|------|
| GET/POST/… | `/api/events/` | Read public; write staff |
| GET/POST/… | `/api/results/` | Read public (published); write staff |
| GET/POST/… | `/api/gallery/` | Read public; write staff |
| GET/POST/… | `/api/announcements/` | Read public; write staff |
| GET | `/api/public/stats/` | Public |
| GET/… | `/api/cms/*` | CMS models (site-settings, sponsors, …) |

## Registrations (participant)

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| GET | `/api/registrations/` | User | Own registrations |
| POST | `/api/registrations/` | User | Register (team members, food/stay/transport fields) |
| POST | `/api/registrations/<id>/cancel/` | User | Cancel; may auto-promote waitlist |
| GET | `/api/registrations/<id>/pass/` | User | Digital pass payload |

## Admin / desk

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| GET | `/api/admin/registrations/` | Staff | All registrations |
| PATCH | `/api/admin/registrations/<id>/` | Staff | Payment, approval, attendance, … |
| POST | `/api/admin/events/<event_id>/promote-waitlist/` | Staff | Manual promote |
| GET | `/api/admin/reports/attendance/` | Staff | Ops report JSON |
| GET | `/api/dashboard/stats/` | Staff | Admin insights |

## Certificates

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/certificates/<result_id>/` | Public (published results only) |

Frontend client: `frontend/src/services/api.js` (Axios). Dev proxy: Vite `/api` → `http://127.0.0.1:8000`.
