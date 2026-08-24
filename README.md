# MacFiesta Pro

Official festival platform for MACFAST — registrations, events, QR verification, results, and admin operations. Registration fees are collected as **manual desk payment**.

## Quick start

```powershell
# Backend
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

- Website: http://127.0.0.1:5173/
- API / Django Admin: http://127.0.0.1:8000/admin/

## Documentation

| Doc | Purpose |
|-----|---------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Hosting, env, media, APK |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | REST API |
| [docs/ADMIN_GUIDE.md](./docs/ADMIN_GUIDE.md) | Staff, desks, committees |
| [docs/USER_GUIDE.md](./docs/USER_GUIDE.md) | Participants & public site |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System overview |
| [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Data model |
| [MOBILE_APK.md](./MOBILE_APK.md) | Capacitor / Android build |
| [SECRET_ROTATION.md](./SECRET_ROTATION.md) | Credential rotation |
| [CHANGELOG.md](./CHANGELOG.md) | Release notes |

## Stack

- **Backend:** Django + Django REST Framework
- **Frontend:** React (Vite)
- **Mobile:** Capacitor (Android)
