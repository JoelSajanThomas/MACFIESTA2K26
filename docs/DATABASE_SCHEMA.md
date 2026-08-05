# Database schema (overview)

Primary relationship:

```
User ──< Registration >── Event
              │
              ├── TeamMember (0..N)
              ├── payment_* / verified_* / waitlist / cancel fields
              └── food / accommodation / transport ops fields

Event ──< Result
```

## Core models

| Model | App | Role |
|-------|-----|------|
| User | Django auth | Participants and staff |
| Event | events | Competitions / schedule source |
| Registration | registrations | User ↔ event; reg #; payment; verification |
| TeamMember | registrations | Extra members on team registrations |
| Result | results | Positions / winners (publish via event flag) |
| GalleryImage | gallery | Fest media |
| Announcement | announcements | Public notices |
| CMS models | cms | SiteSetting, sponsors, guests, theme, FAQs, homepage sections, … |

## Registration ops fields (lightweight)

- `food_preference`, `food_notes`
- `needs_accommodation`, `accommodation_count`, `accommodation_notes`
- `needs_transport`, `transport_note`
- `payment_status` including `waived`
- `waitlist_position`, `cancelled_at`, `verified_at` / `verified_by`

Active duplicate registration is enforced in the serializer (cancelled rows may re-register).

Source of truth: Django models under `backend/*/models.py` and migrations.
