# MacFiesta Pro — Deployment Guide

Deploy the **Django REST API** on [Render](https://render.com), the **database** on [Neon PostgreSQL](https://neon.tech), and the **React frontend** on [Vercel](https://vercel.com).

For branding, asset replacement, admin workflows, and go-live steps, see **[OFFICIAL_LAUNCH_CHECKLIST.md](./OFFICIAL_LAUNCH_CHECKLIST.md)**.

---

## 1. Local development

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

API: `http://127.0.0.1:8000/api/`

Optional: copy `backend/.env.example` to `backend/.env` for overrides. **Without `.env`**, the app uses:

- `DEBUG=True`
- SQLite (`backend/db.sqlite3`)
- Open CORS (all origins)
- Default dev `SECRET_KEY`

### Frontend

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

App: `http://localhost:5173/`

In development, leave `VITE_API_BASE_URL` unset so Vite proxies `/api` and `/media` to Django (`vite.config.js`).

---

## 2. Neon PostgreSQL setup

1. Create a project at [neon.tech](https://neon.tech).
2. Create a database (e.g. `macfiesta`).
3. Copy the **connection string** (PostgreSQL URL), e.g.:

   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

4. Use this as `DATABASE_URL` on Render.

**Tip:** Neon URLs often use `postgresql://`. Django accepts them via `dj-database-url`.

---

## 3. Render backend deployment

### Option A — Blueprint (`render.yaml`)

1. Push the repo to GitHub (when ready).
2. In Render: **New → Blueprint** → connect repo.
3. Set environment variables marked `sync: false` in the dashboard:
   - `DATABASE_URL` — Neon connection string
   - `ALLOWED_HOSTS` — e.g. `macfiesta-pro-api.onrender.com`
   - `CORS_ALLOWED_ORIGINS` — your Vercel URL, e.g. `https://macfiesta-pro.vercel.app`
   - `CSRF_TRUSTED_ORIGINS` — same as CORS origins (for Django admin)

### Option B — Manual web service

| Setting | Value |
|---------|--------|
| **Root directory** | `backend` |
| **Build command** | `bash build.sh` |
| **Start command** | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120` |
| **Python version** | 3.12 |

`build.sh` runs:

1. `pip install -r requirements.txt`
2. `python manage.py collectstatic --noinput`
3. `python manage.py migrate --noinput`

### Backend environment variables

| Variable | Required (prod) | Example |
|----------|-----------------|---------|
| `SECRET_KEY` | Yes | Random 50+ char string (Render can generate) |
| `DEBUG` | Yes | `false` |
| `DATABASE_URL` | Yes | Neon PostgreSQL URL |
| `ALLOWED_HOSTS` | Yes | `your-app.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | Yes | `https://your-app.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | Recommended | Same as CORS origins |
| `FRONTEND_BASE_URL` | Recommended | `https://your-app.vercel.app` (password-reset links) |
| `SERVE_MEDIA` | Optional | `true` (default) — serves `MEDIA_ROOT` over `/media/` |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` | For real reset mail | SMTP provider |
| `DEFAULT_FROM_EMAIL` | Recommended | `MacFiesta Pro <noreply@yourdomain.com>` |
| `COMMITTEE_SEED_PASSWORD` | Required to seed | Temporary password for `seed_committee_accounts` (change on first login; never commit) |
| `SECURE_SSL_REDIRECT` | Optional | `true` (default when `DEBUG=false`) |

After deploy, create a superuser (Render shell):

```bash
python manage.py createsuperuser
```

Seed committee desk accounts (passwords via env — **never commit passwords to git/docs**):

```bash
export COMMITTEE_SEED_PASSWORD='use-a-strong-temporary-password'
python manage.py migrate
python manage.py seed_committee_accounts
python manage.py seed_committee_accounts --disable-testuser
```

Each seeded staff profile has `must_change_password=True` until they complete `/change-password`. Document usernames/modules only in [docs/ADMIN_GUIDE.md](./docs/ADMIN_GUIDE.md).

**Media uploads:** With `SERVE_MEDIA=True`, `/media/` is available when `DEBUG=False`. Render’s disk is still ephemeral across redeploys — prefer S3/Cloudinary for durable multi-instance media (future enhancement).

---

## 4. Vercel frontend deployment

1. Import the GitHub repo on [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. **Framework preset:** Vite  
4. **Build command:** `npm run build`  
5. **Output directory:** `dist`

### Frontend environment variables (Vercel)

| Variable | Value |
|----------|--------|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api` |

Copy from `frontend/.env.production.example`.

6. Deploy. `vercel.json` includes SPA rewrites so React Router routes work.

---

## 5. Post-deployment checklist

- [ ] Backend health: `GET https://your-api.onrender.com/api/events/` returns JSON
- [ ] Frontend loads and fetches events
- [ ] Create account / Login / JWT works cross-origin
- [ ] Password reset email (SMTP configured) or admin reset documented
- [ ] Event registration + student dashboard
- [ ] Media upload (gallery/event image) loads via `/media/`
- [ ] CMS edit reflected on homepage
- [ ] Results / announcements / gallery public pages
- [ ] CORS: browser console shows no blocked requests
- [ ] Admin: `https://your-api.onrender.com/admin/` (add domain to `CSRF_TRUSTED_ORIGINS`)

---

## 6. Android production APK / AAB

1. Set frontend production API (never a LAN IP):

   ```env
   VITE_API_BASE_URL=https://your-backend-domain/api
   ```

2. Build and sync:

   ```powershell
   cd frontend
   npm run build
   npx cap sync android
   ```

3. Open Android Studio (`npx cap open android`) → **Build → Generate Signed Bundle / APK** (release).  
   Do **not** ship a debug APK for public / off-LAN use.

4. Confirm `capacitor.config.json` has **no** `server.url` pointing at `http://10.x.x.x`.

---

## 6. Common errors and fixes

### `DisallowedHost`

Add your Render hostname to `ALLOWED_HOSTS`:

```
ALLOWED_HOSTS=macfiesta-pro-api.onrender.com
```

### CORS blocked from Vercel

Set on Render:

```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

No trailing slash. Include `https://`.

### `SECRET_KEY environment variable is required`

Set `SECRET_KEY` on Render when `DEBUG=false`.

### Database connection failed

- Verify Neon `DATABASE_URL` includes `?sslmode=require`
- Ensure Neon project is not suspended (free tier)
- Check IP allowlist if enabled on Neon

### Static files / admin has no CSS

Run `collectstatic` — included in `build.sh`. Redeploy after changing static config.

### Frontend still calls localhost

Set `VITE_API_BASE_URL` in Vercel **Environment Variables** and redeploy.

### 404 on frontend routes (Vercel)

Ensure `frontend/vercel.json` is present with SPA rewrites.

### Migrations out of sync

In Render shell:

```bash
python manage.py migrate
```

---

## 7. Security notes

- Never commit `.env` files (listed in `.gitignore`).
- Production must use `DEBUG=false`.
- Use a unique `SECRET_KEY` per environment.
- Restrict `CORS_ALLOWED_ORIGINS` to your Vercel domain(s) only.

---

## 8. Useful commands

```powershell
# Local backend check
cd backend
python manage.py check
python manage.py collectstatic --noinput

# Local frontend production build
cd frontend
npm run build
npm run preview
```
