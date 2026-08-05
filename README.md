# MacFiesta Pro

Official production platform replacing the legacy MacFiesta website for MACFAST.

Digitizes registrations, events, QR verification, results, reporting, and admin operations. Registration fees remain **manual desk payment** by design.

## Quick start (local)

```powershell
# Backend
cd backend
.\venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

- Website: http://127.0.0.1:5173/
- API / Django Admin: http://127.0.0.1:8000/admin/

## Documentation map

```
MacFiestaPro/
├── README.md                         ← You are here
├── PRODUCT_OVERVIEW.md               ← Product purpose & architecture summary
├── PRODUCTION_STATUS.md              ← Main operational doc (status + launch)
├── DEPLOYMENT.md                     ← Hosting, env, media, APK
├── OFFICIAL_LAUNCH_CHECKLIST.md      ← Brand / assets cutover (optional companion)
├── FUTURE_ENHANCEMENTS_STATUS.md     ← Shipped lightweight vs deferred ERP
├── API_DOCUMENTATION.md              ← REST API surface
├── TESTING_SUMMARY.md                ← Smoke / test notes
├── CHANGELOG.md
├── LICENSE
└── docs/
    ├── ARCHITECTURE.md
    ├── DATABASE_SCHEMA.md
    ├── USER_GUIDE.md                 ← Participants & public site
    ├── ADMIN_GUIDE.md                ← Staff, desks, committees
    └── archive/                      ← MCA / viva materials (not primary)
```

Start with **[PRODUCTION_STATUS.md](./PRODUCTION_STATUS.md)** for go-live readiness.
