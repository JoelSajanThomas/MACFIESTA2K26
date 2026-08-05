# MacFiesta Pro — Full Application Guide (User, Admin & Committees)

This describes **how the application works today**, plus how your **Core Team** and **Heads** fit into fest operations when MacFiesta Pro replaces the old site.

---

## 1. What MacFiesta Pro is

MacFiesta Pro is the digital front door and desk for the fest:

| Audience | What they use |
|----------|----------------|
| **Public visitors** | Website: home, events, schedule, results, gallery, sponsors, announcements, about, contact |
| **Participants (students)** | Create account → login → register for events → dashboard + registration number / QR |
| **Staff / coordinators** | Admin panel: events, registrations, verification, results, gallery, announcements, CMS |
| **Committees (Core Team & Heads)** | Same **staff login** today (not separate hospitality apps). Contacts listed below for desk / Contact page |

It is **not** a full ERP: no separate Finance / Food / Hospitality login portals, payment gateway, or hostel system. Those stay as **people + desk process**, with optional future modules.

---

## 2. Public side (no login)

Anyone can open the site (browser or Android app) and browse:

1. **Home** — fest branding, countdown, theme, guests, sponsors (CMS-driven)  
2. **Events** — list + filters → **Event details** (rules, venue, fee, spots)  
3. **Schedule** — day-wise from event dates/times  
4. **Results** — published winners only  
5. **Gallery / Announcements / Sponsors**  
6. **About / History / Contact / Terms / Privacy**  
7. **Login** / **Create Account**

**Register Now** without an account → user is told they need an account and offered:

- **Login**, or  
- **Create Account**  
(then returned to the event via `?next=`)

---

## 3. New user journey (participant)

```
Home / Events
    → Open an event
    → Register for this Event
    → [Not logged in]
         → Login  OR  Create Account
    → Fill registration form
         (type, name, college, email, phone; team name if team)
    → Success
         → Registration number
         → QR (from registration number)
         → Link to Student Dashboard
```

### Create Account
- Path: `/register`  
- Fields: username, email, password, confirm password  
- On success: JWT saved → can register for events immediately  

### Login
- Path: `/login`  
- Username + password  
- **Forgot Password?** → email reset (or fest desk / Django admin reset)  
- Staff → Admin; student → Student Dashboard (or `?next=` event page)

### After registration
- **Student Dashboard** (`/student-dashboard`): own events, payment status badge, waiting-list flag, registration number  
- Payment is **desk/manual** (`pending` / `paid` / …) — not an online gateway  

### Waitlist
- If event is full and waitlist is enabled → user joins waitlist; status shows on dashboard  

### Logout
- Clears tokens; admin and “my registrations” require login again  

---

## 4. Admin / coordinator side

**Who:** Django users with `is_staff` (or superuser).  
**Entry:** Login → redirected to `/admin/insights`  
**Gate:** Non-staff see “access denied”; guests redirected to login.

### Admin modules (what each committee uses in practice)

| Admin area | Typical use |
|------------|-------------|
| **Insights** | Counts, payment summary, quick links |
| **Events** | Create/edit events, open/close registration, fees, waitlist, result publish flag |
| **Registrations** | Filter, CSV export, set payment / approval / attendance / waitlist |
| **Verification** | Look up by **registration number** (desk check-in; QR encodes this number) |
| **Results** | Add winners; publish via event flag → public Results page |
| **Schedule** | Read-only view of event timetable (edit dates on Events) |
| **Gallery** | Upload fest photos |
| **Announcements** | Live notices for the public site |
| **Website Content (CMS)** | Logo, hero, theme, guests, sponsors, homepage sections, terms/privacy |
| **Users** | Sample UI only — **real staff accounts** are created in Django Admin (`/admin/`) |

### How a staff account is created
1. Superuser opens Django Admin (`http://backend/admin/`)  
2. Create User → set password → check **Staff status**  
3. That person logs into the **same** MacFiesta Login page → Admin panel  

There is **no** separate “Hospitality login page” or “Finance login page” in the current app.

---

## 5. Committees — how they map to the app today

Your committees are **organisational roles**. In MacFiesta Pro they share the **staff admin panel** (or work offline with Contact numbers). Suggested mapping:

| Committee / Head | Day-to-day in MacFiesta Pro | Outside the app |
|------------------|----------------------------|-----------------|
| **Core Team** | Full admin / CMS oversight; create staff users | Escalation, overall coordination |
| **Event Head** | Events CRUD, registration open/close, verification | On-ground event desks |
| **Program Head** | Schedule accuracy, announcements for program changes | Stage / program desk |
| **Cultural Head** | Cultural events + results for those events | Cultural venue ops |
| **Finance Head** | Registrations → set **payment_status**; CSV export | Cash desk, receipts (manual) |
| **Publicity & Hospitality Head** | Announcements, CMS content; Verification for guests/participants | Accommodation/hospitality **desk process** (not in software) |
| **Invitation Head** | Publicity via announcements / contact info | Invitations offline |
| **Food Head** | Announcements if needed | Food coupons / counters **offline** (not in software) |

### Core Team

| Name | Background | Phone |
|------|------------|-------|
| Anu Tiji | MBA (Dhruva Batch) | +91 83300 65374 |
| Shibin | MCA | +91 94007 15903 |
| Emil | M.Sc. Food | +91 79028 21846 |

### Heads

| Role | Name | Phone |
|------|------|-------|
| Finance Head | Gokul (Bio) | +91 75598 33490 |
| Cultural Head | Dany (BCA S5) | +91 85909 19670 |
| Program Head | Vishnu (MBA Adwita) | +91 89219 60471 |
| Event Head | Arjun Santhosh (MCA) | +91 85909 39674 |
| Publicity & Hospitality Head | Arjun Sudeesh (B.Com) | +91 80867 12381 |
| Invitation Head | Albin (MSW) | +91 62359 30968 |
| Food Head | Akshai Das (B.Sc. Food) | +91 75939 29551 |

**Practical setup for fest day**

1. Create one **staff** account per Head (or shared desk accounts).  
2. All use `/login` → Admin.  
3. Publish Core Team + Heads on **Contact / About** (or CMS) so public can call the right person.  
4. Do **not** promise separate Hospitality/Finance portals unless you build them later (Future Scope).

---

## 6. Volunteer / hospitality — what exists vs what people expect

### What people often expect
- Separate “Volunteer login”  
- Hospitality dashboard (rooms, food, queues)  
- Finance-only screens  

### What MacFiesta Pro has now
- **One login page** for everyone  
- **Student** vs **Staff** after login  
- Staff share the **admin** tools above  
- Volunteer “quick links” on Insights are shortcuts into Registrations — **not** a full volunteer ERP  

### Recommended process for Hospitality / Food / Finance desks
1. Head gets a **staff** login.  
2. Use **Verification** + registration number / QR at the desk.  
3. Finance updates **payment status** on Registrations.  
4. Hospitality/Food run their lists offline or from CSV export; use Contact numbers for escalation.  

If a supervisor later asks for role-based volunteer portals, list that under **Future Enhancements** (do not expand scope unless required).

---

## 7. Axios / API (for developers)

Frontend calls Django through **Axios** in `frontend/src/services/api.js`:

- Public GETs (events, results, CMS, …)  
- Auth: register, login, refresh, password reset  
- Student: create/list registrations  
- Admin: CRUD events/results/gallery/announcements/CMS + registration updates  

Base URL: Vite proxy `/api` in dev; `VITE_API_BASE_URL` in production.

---

## 8. End-to-end story (one sentence each)

1. **Visitor** browses the fest site with no account.  
2. **New student** creates an account, opens an event, registers, gets a registration number + QR.  
3. **Student** checks status on the dashboard.  
4. **Event / Program Head** manages events and announcements in Admin.  
5. **Finance Head** marks payments on Registrations.  
6. **Hospitality / Food** use verification + offline process; contacts are Core Team / Heads.  
7. **Public** sees updated results, gallery, and announcements after staff publish them.

---

## 9. Related docs

- [PRODUCTION_STATUS.md](../../PRODUCTION_STATUS.md)
- [TESTING_SUMMARY.md](../../TESTING_SUMMARY.md)
- [PRODUCT_OVERVIEW.md](../../PRODUCT_OVERVIEW.md)
- [FUTURE_ENHANCEMENTS_STATUS.md](../../FUTURE_ENHANCEMENTS_STATUS.md)
- [OFFICIAL_LAUNCH_CHECKLIST.md](../../OFFICIAL_LAUNCH_CHECKLIST.md)
- [DEPLOYMENT.md](../../DEPLOYMENT.md)
- [USER_GUIDE.md](../USER_GUIDE.md)
- [ADMIN_GUIDE.md](../ADMIN_GUIDE.md)
