# Current Production Status

MacFiesta Pro is the official production platform intended to replace the legacy MacFiesta website.

The platform digitizes participant registration, event management, QR-based verification, result publication, reporting, and administrative operations while intentionally retaining manual desk payment for registration fees.

Historical MCA and viva documentation is preserved in `docs/archive/MCA_SUBMISSION_PACK.md` for archival purposes only and is no longer the primary product documentation.

**This file is the main operational document** (feature inventory + official launch checklist).

For post-exposure secret rotation and the final 14-step deploy order, see [SECRET_ROTATION.md](./SECRET_ROTATION.md).

---

## Committee login system

All users authenticate through the same `/login` page. After authentication, MacFiesta Pro determines the user’s assigned committee and permission set. Each committee member is presented with a customized Admin Dashboard showing only the modules relevant to their responsibilities. Backend API permissions enforce the same restrictions, preventing unauthorized access even if a user manually enters protected URLs.

Account inventory (usernames only — no passwords in this repository): see [docs/ADMIN_GUIDE.md](./docs/ADMIN_GUIDE.md).

---

## Implemented

- Public website (Home, Events, Schedule, Results, Gallery, Sponsors, Contact)
- User registration and authentication
- Student Dashboard
- Individual and team registrations
- Registration number generation
- QR-based digital participant pass
- Registration cancellation
- Automatic waitlist promotion
- Manual promotion by administrators
- Manual payment workflow (Pending / Paid / Waived)
- Participant verification
- Admin Dashboard
- Event management
- Registration management
- Result publishing
- Gallery management
- Announcement management
- CMS / content management
- Committees page
- Per-committee staff accounts with module-filtered admin UI and API enforcement
- Food preferences (including Jain preference and notes)
- Accommodation requests (count and notes)
- Transport requests
- CSV reports with operational fields

---

## Deferred (by design)

- Online payment gateway
- SMS / WhatsApp notifications
- Food coupon system
- Hostel / accommodation ERP
- Transport ERP
- Judge scoring portal
- Push notifications
- Ultra-fine permission matrix beyond committee modules (e.g. field-level)

---

# Official Launch Checklist

## Infrastructure

- [ ] Production database backup completed
- [ ] All migrations applied (including `registrations.0004_production_ops_fields` and `accounts` staff profiles)
- [ ] Application server restarted after migration
- [ ] Static files collected
- [ ] Media storage verified

## Configuration

- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` configured
- [ ] `SECRET_KEY` secured
- [ ] SMTP configured and tested
- [ ] Production domain configured
- [ ] HTTPS enabled

## Security (committee accounts)

- [ ] Change all seeded committee passwords
- [ ] Remove or disable the `testuser` account (do not enable `--dev-testuser` in production)
- [ ] Confirm first-login password change completes for each desk account
- [ ] Verify sidebar restrictions are backed by server-side permission checks
- [ ] Test each committee account cannot access unauthorized API endpoints

## Functional Testing

- [ ] Public website loads correctly
- [ ] User registration works
- [ ] Login/logout works
- [ ] Event registration works
- [ ] QR participant pass generated
- [ ] Manual payment workflow verified
- [ ] Payment status updates correctly (Pending / Paid / Waived)
- [ ] QR verification works
- [ ] Waitlist promotion works
- [ ] Results publication works
- [ ] Gallery upload works
- [ ] Announcements published for launch day
- [ ] Reports and CSV exports verified
- [ ] Each committee login shows only expected modules

## Go-Live

- [ ] Final production database backup taken
- [ ] Launch announcement published
- [ ] Registration officially opened
- [ ] Production monitoring enabled

Brand and official-asset cutover: [OFFICIAL_LAUNCH_CHECKLIST.md](./OFFICIAL_LAUNCH_CHECKLIST.md).

---

## Ongoing operations (each MacFiesta edition)

Continue these practices after launch and between editions:

1. **Rotate committee passwords** at the start of each MacFiesta edition.
2. **Disable accounts** belonging to organizers once the festival concludes (Django Admin → Users → uncheck Active / Staff as appropriate).
3. **Database backups** before and during the event — especially before opening registrations and before publishing results.
4. **Review logs** periodically during the festival to catch authentication or operational issues early.

Documentation and committee module access stay aligned with this production-oriented architecture; see [docs/ADMIN_GUIDE.md](./docs/ADMIN_GUIDE.md).
