# Architecture

```
[ React SPA (Vite) ]  ←→  HTTPS / JWT  ←→  [ Django REST API ]
        │                                        │
        │                                        ├── PostgreSQL (prod) / SQLite (dev)
        │                                        ├── Media (MEDIA_ROOT + SERVE_MEDIA)
        │                                        └── WhiteNoise (static)
        │
        └── Capacitor Android (optional) loads built dist + VITE_API_BASE_URL
```

## Layers

| Layer | Responsibility |
|-------|----------------|
| Presentation | React pages, dashboards, Axios client |
| API | Django REST Framework + SimpleJWT |
| Domain | Events, Registrations, Results, Gallery, Announcements, CMS |
| Persistence | Relational DB; file media for images |

## Key flows

1. **Public browse** — unauthenticated GETs for events, CMS, results, gallery.
2. **Register** — JWT → POST registration → registration number + QR pass.
3. **Desk** — staff PATCH payment / attendance; Verification looks up reg #.
4. **Publish** — staff results + event “result published” → public Results + certificates.

See [PRODUCT_OVERVIEW.md](../PRODUCT_OVERVIEW.md) and [API_DOCUMENTATION.md](../API_DOCUMENTATION.md).
