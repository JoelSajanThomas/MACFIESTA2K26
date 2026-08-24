# MacFiesta Pro — Deployment Guide

Generic production deployment for the Django API + React frontend.  
Host examples (Render / Neon / Vercel) are optional; commands below work on any Linux/Windows server with Python 3.11+ and Node 20+.

Related: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) · [MOBILE_APK.md](./MOBILE_APK.md) · [SECRET_ROTATION.md](./SECRET_ROTATION.md)

---

## 1. Environment templates (no real secrets in git)

| File | Purpose |
|------|---------|
| `backend/.env.example` | Backend production placeholders |
| `frontend/.env.example` | Local / Capacitor API URL |
| `frontend/.env.production.example` | Production frontend build URL |

Copy examples to `.env` on the host only. Never commit filled `.env` files.

### Backend required for `DEBUG=False`

`SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `FRONTEND_BASE_URL`, SMTP (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` / `EMAIL_USE_SSL`, `DEFAULT_FROM_EMAIL`).

### Frontend required at build time

`VITE_API_BASE_URL=https://your-api-host/api`

### Seeding only

`COMMITTEE_SEED_PASSWORD` — temporary; force change on first login.

---

## 2. Generic backend commands

```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate
# Linux/macOS: source venv/bin/activate
pip install -r requirements.txt

# Configure environment (export vars or use .env)
python manage.py check
python manage.py check --deploy   # with DEBUG=False and prod env set
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Optional CMS seed
python manage.py seed_cms

# Committee desks (requires COMMITTEE_SEED_PASSWORD)
export COMMITTEE_SEED_PASSWORD='use-a-strong-temporary-password'
python manage.py seed_committee_accounts
python manage.py seed_committee_accounts --disable-testuser

# Audit StaffProfile coverage (no passwords printed)
python manage.py audit_staff_profiles

# Superuser if needed
python manage.py createsuperuser

# App server (example)
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

Restart the process manager after migrate/collectstatic (systemd, Render, etc.).

---

## 3. Generic frontend commands

```bash
cd frontend
npm ci
# or: npm install

# Production / staging build — API URL baked in at build time
export VITE_API_BASE_URL=https://your-api-host/api
npm run lint
npm run build
# Serve dist/ via Nginx, Vercel, Netlify, etc.
```

Windows PowerShell:

```powershell
cd frontend
npm ci
$env:VITE_API_BASE_URL="https://your-api-host/api"
npm run lint
npm run build
```

---

## 4. Optional cloud sketch (not required)

| Layer | Example |
|-------|---------|
| API | Render web service, root `backend`, `bash build.sh` |
| DB | Neon / managed Postgres → `DATABASE_URL` |
| Frontend | Vercel, root `frontend`, env `VITE_API_BASE_URL` |

See prior sections in git history / `render.yaml` if using that blueprint.

---

## 5. Staging smoke-test checklist

### Public

- [ ] Home loads (hero, no horizontal scroll on phone)
- [ ] Events list + event detail
- [ ] Schedule
- [ ] Results (only published)
- [ ] Gallery
- [ ] Committees
- [ ] Contact

### Participant

- [ ] Create account
- [ ] Login / logout
- [ ] Register for an event (individual; team if offered)
- [ ] Registration number assigned
- [ ] Digital pass / QR opens and prints
- [ ] Student dashboard lists registration
- [ ] Cancel registration
- [ ] Waitlist when event is full; promotion after cancel (or admin promote)

### Staff

- [ ] Core login → full modules
- [ ] Finance → payment Pending/Paid/Waived
- [ ] Restricted committee (e.g. food/cultural) cannot open unauthorized modules / APIs
- [ ] Verification: search by registration number; mark attendance
- [ ] Reports: download CSV
- [ ] Results: draft then publish; public page updates
- [ ] Announcement create/publish for launch day

### Reports (server CSV)

Use:

```http
GET /api/admin/reports/registrations.csv
GET /api/admin/reports/attendance/?export=csv
```

**Do not use** `?format=csv` (conflicts with DRF content negotiation).

### Mobile (~360–390px)

- [ ] Login form usable
- [ ] Event registration submit button reachable
- [ ] Pass / QR readable
- [ ] Admin verification search + result (no overflow; full-width inputs)

---

## 6. Security reminders

- `DEBUG=False` in production
- Unique `SECRET_KEY` from environment only
- Restrict CORS/CSRF to real frontend origins
- Change all seeded committee passwords after first login
- Run `python manage.py audit_staff_profiles` before opening registrations
- Do not deploy `_inspect_old_backend/` or `backup.tar.gz`

---

## 7. Validation commands (pre-deploy)

```bash
cd backend
python manage.py check
python manage.py check --deploy   # prod-like env
python manage.py showmigrations
python -m compileall .

cd ../frontend
npm run lint
npm run build
```
