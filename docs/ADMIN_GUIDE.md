# Admin Guide (staff, desks & committees)

## Committee login system

Each operations committee has a dedicated desk login page, plus a shared portal:

- Portal: `/desks`
- Desk login: `/desk/<committee>/login`  
  Examples: `/desk/hospitality/login`, `/desk/event/login`

After sign-in, MacFiesta opens the Admin Dashboard filtered to that committee’s modules. Backend APIs enforce the same module permissions.

Student / general accounts still use `/login`.

### Create desk admin accounts

1. Copy `backend/.env.example` → `backend/.env`
2. Set desk passwords in `.env` (never commit this file):

```env
DESK_PASSWORD_TEMPLATE=your-strong-local-{committee}-password
# Or set each desk separately:
# DESK_PASSWORD_FINANCE=...
# DESK_PASSWORD_FOOD=...
```

3. Seed:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py seed_committee_desk_admins
```

Passwords are read from `.env` and **never printed** by the command. Share credentials with heads out-of-band (password manager / sealed note).

Optional: deactivate legacy short usernames (`finance`, `food`, …):

```powershell
python manage.py seed_committee_desk_admins --deactivate-legacy-shortnames
```

Legacy shared seed (older short usernames) still uses `COMMITTEE_SEED_PASSWORD` in `.env`:

```powershell
python manage.py seed_committee_accounts
```

**Rotate every password before public launch.** Do not reuse local/staging passwords in production.

## Committee module access

| Committee | Main modules |
|-----------|----------------|
| Finance | Registrations, payment status, verification, reports |
| Food | Reports, announcements |
| Hospitality | Verification, registrations, reports |
| Event | Events, schedule, registrations, results, verification |
| Program | Schedule, announcements, results |
| Cultural | Events, gallery, results |
| Publicity | Gallery, sponsors, CMS, announcements |
| Invitation | Guests, CMS, announcements |

Assign a real head’s details in Django Admin → Users → Staff profile (display name, phone).

## Desk workflows

**Finance:** Registrations → Paid / Waived  
**Verification tools:** available on Finance / Hospitality / Event desks  
**Food / Hospitality planning:** Reports → CSV  
**Publicity:** Announcements, Gallery, Website Content  
**Event / Program / Cultural:** Events, Schedule, Results as listed above  

## Secrets checklist

Keep all of these in `backend/.env` / host env only:

- `SECRET_KEY`, `DATABASE_URL`
- SMTP `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD`
- Payment UPI / bank fields
- `DESK_PASSWORD_*` / `DESK_PASSWORD_TEMPLATE` / `COMMITTEE_SEED_PASSWORD`
- `REGISTRATION_SIGNER_SALT`

## After each edition

- Rotate all committee passwords before the next fest.
- Disable staff accounts that should no longer have access.
- Keep backups before registrations open and before results publish; retain fest-period dumps for audit.
- During the fest, glance at auth / API error logs if desks report login or permission issues.

## Related

- User guide: `docs/USER_GUIDE.md`
- Deployment: `DEPLOYMENT.md`
