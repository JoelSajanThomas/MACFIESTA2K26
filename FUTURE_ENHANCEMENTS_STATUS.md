# Future Enhancements — Implementation Status

**Product context:** MacFiesta Pro is the **production** replacement for the legacy MacFiesta website and manual fest workflows — not an academic / MCA demo project.

MacFiesta Pro keeps **manual payment at the registration desk** as its primary payment process.

Several features originally listed under Future Enhancements have been implemented in a lightweight, operational form. They support festival desks without turning the application into a full ERP.

---

## Features available now

### 1. Registration cancellation and waitlist promotion

Students can cancel eligible registrations from the Student Dashboard.

When a confirmed participant cancels:

1. The registration is marked as cancelled.
2. The system checks for waitlisted participants.
3. The next eligible waitlisted registration is automatically promoted.
4. The promoted participant’s status is updated.
5. Event availability / counts stay consistent with confirmed seats.

Administrators also have a manual **Promote** action for waitlisted rows.

### 2. Team-member registration

Team events collect additional member details (names, phones, and related fields) linked to the leader’s registration so coordinators see the full team.

### 3. Food preferences

During registration, participants can set food preference (vegetarian / non-vegetarian / Jain / none) and optional notes. Values appear in admin reports for the Food Committee. This is preference capture — not a meal-coupon system.

### 4. Accommodation requests

Participants can indicate accommodation is required, number of people, and a short note. Hospitality uses registration records and CSV reports; room allocation stays offline.

### 5. Transportation requests

Participants can request transport and add pickup / travel notes. Planning stays manual; no routes or vehicle ERP.

### 6. Digital participant pass

Available at `/pass/:id` from the Student Dashboard and after successful registration.

Typically shows: name, registration number, event, college, payment status, ops flags, and QR for desk payment / verification.

### 7. Printable certificates

Published results expose `/certificates/:resultId` for print / save-as-PDF via the browser.

### 8. Committees page

Public page at `/committees` for Core Team and committee heads (roles and contacts). Update contacts when the organizing team changes.

### 9. Administrative reports

Admin → **Reports**: attendance, payment, food, accommodation, transport, and related fields with CSV export for Core, Finance, Food, Hospitality, Transport, and event heads.

### 10. Waived payment status

In addition to Pending / Paid (and Failed / Refunded), staff can set **Waived** for official fee exemptions. A waived registration is treated as financially cleared without a desk cash entry.

---

## Features deliberately deferred

| Area | Why deferred for now |
| --- | --- |
| Online payment gateway | Desk collection remains simpler to verify on campus |
| SMS / WhatsApp | Use site + announcements + email when SMTP is configured |
| Food-coupon ERP | Preferences only |
| Accommodation ERP | Requests only |
| Transportation ERP | Requests only |
| Judge portal | Coordinators enter approved results in Admin |
| Push notifications | Announcements + dashboard |
| Field-level RBAC | Committee **module** permissions are live; finer field-level rules deferred |

**Committee login system (implemented):** same `/login`, committee-scoped Admin sidebar + API gates. See [docs/ADMIN_GUIDE.md](./docs/ADMIN_GUIDE.md).

---

## Payment policy (production)

1. Participant registers online → payment status **Pending**.
2. Reports to finance / registration desk with reg # or QR.
3. Staff collect fee → mark **Paid**, or mark **Waived** when exempted.
4. Status appears on dashboard and digital pass.

---

## Implementation summary

| Feature | Status |
| --- | --- |
| Manual desk payment | Production |
| Paid / Pending / Waived | Production |
| Cancel + auto waitlist promote | Production |
| Manual admin promote | Production |
| Team-member details | Production |
| Food preferences | Lightweight (production) |
| Accommodation requests | Lightweight (production) |
| Transportation requests | Lightweight (production) |
| Digital pass + QR | Production |
| Printable certificates | Production |
| Committees page | Production |
| Ops reports + CSV | Production |
| Per-committee accounts + module API gates | Production |
| Online gateway / SMS / ERP modules / judge portal / push / field-level RBAC | Deferred |

---

## Related docs

- [PRODUCTION_STATUS.md](./PRODUCTION_STATUS.md) — main operational document  
- [OFFICIAL_LAUNCH_CHECKLIST.md](./OFFICIAL_LAUNCH_CHECKLIST.md) — brand / assets cutover  
- [DEPLOYMENT.md](./DEPLOYMENT.md) — production host, env, media, APK  
- [docs/ADMIN_GUIDE.md](./docs/ADMIN_GUIDE.md) — desk and committee usage  
