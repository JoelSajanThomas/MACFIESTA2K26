# Admin Guide (staff, desks & committees)

## Committee login system

All users authenticate through the same `/login` page. After authentication, MacFiesta Pro determines the user’s assigned committee and permission set. Each committee member sees a customized Admin Dashboard with only the modules for their role. Backend API permissions enforce the same restrictions, so protected URLs and write endpoints stay blocked even if someone navigates to them manually.

Create or refresh desk accounts (passwords are **not** stored in this guide — see the seed command / private deployment notes):

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py seed_committee_accounts
```

Optional local-only test account:

```powershell
python manage.py seed_committee_accounts --dev-testuser
```

Set the seed password via environment variable `COMMITTEE_SEED_PASSWORD` when deploying. Change every seeded password immediately after first login.

## Committee accounts

Each committee is assigned a dedicated staff account.

| Committee | Username | Access |
|-----------|----------|--------|
| Core Team | `core` | Full administration |
| Finance | `finance` | Registrations, Verification, Reports |
| Food | `food` | Reports, Announcements |
| Hospitality | `hospitality` | Registrations, Verification, Reports |
| Event | `event` | Events, Registrations, Results, Schedule, Verification |
| Program | `program` | Events, Schedule, Announcements, Results |
| Cultural | `cultural` | Events, Results, Gallery, Announcements |
| Publicity | `publicity` | Announcements, Gallery, CMS, Sponsors |
| Invitation | `invitation` | Announcements, Guests, CMS |
| Verification | `verification` | Participant Verification and Registrations |

Assign a real head’s details in Django Admin → Users → Staff profile (committee, display name, phone).

### Example permissions

| Committee | Main modules |
|-----------|----------------|
| Core Team | Full system administration |
| Finance | Registrations, payment status, verification, reports |
| Event | Events, schedule, registrations, results |
| Program | Schedule, announcements, results |
| Cultural | Events, gallery, results |
| Publicity | Gallery, sponsors, CMS, announcements |
| Hospitality | Verification, registrations, reports |
| Food | Reports, food preferences (via reports), announcements |
| Invitation | Guests, CMS, announcements |
| Verification | QR / registration-number verification, registrations |

## Desk workflows

**Finance:** Registrations → Paid / Waived  
**Verification:** Verification → reg # / QR  
**Food / Hospitality / Transport planning:** Reports → CSV  
**Publicity:** Announcements, Gallery, Website Content  

## After each edition

- Rotate all committee passwords before the next fest.
- Disable staff accounts that should no longer have access.
- Keep backups before registrations open and before results publish; retain fest-period dumps for audit.
- During the fest, glance at auth / API error logs if desks report login or permission issues.

## Related

- [PRODUCTION_STATUS.md](../PRODUCTION_STATUS.md)
- [USER_GUIDE.md](./USER_GUIDE.md)
- [DEPLOYMENT.md](../DEPLOYMENT.md)
