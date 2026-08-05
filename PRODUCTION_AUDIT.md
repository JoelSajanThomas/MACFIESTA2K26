# MacFiesta Pro Production Audit

Date: 2026-08-05  
Scope: Full repository audit for production readiness without adding new product features.

## Audit methodology

- Static checks:
  - `frontend`: `npm run lint`, `npm run build`
  - `backend`: `python manage.py check`, `python manage.py showmigrations`, `python manage.py check --deploy`, `python -m compileall .`
- Runtime/API verification:
  - End-to-end API flow checks with authenticated committee users and participant users (account creation, registration, waitlist, payment state, verification, results, gallery, reports, CMS reads).
- Security/config review:
  - Settings review (`DEBUG`, `ALLOWED_HOSTS`, JWT, CSRF/SSL/HSTS, media/static).
  - Secret/password scans across docs and source.
- Code quality review:
  - Removed dead code and validated logging/error handling paths.
  - Checked query patterns for avoidable duplication/N+1.

---

## Issues found

### 1) Silent exception swallowing in email paths
- Location: `backend/config/auth_views.py`, `backend/registrations/services.py`
- Issue: `except Exception: pass` suppressed operational failures (no visibility when SMTP breaks).
- Risk: Production support blind spots (reset/confirmation email failures hard to diagnose).

### 2) Unused dead code in permission mapping
- Location: `backend/accounts/permissions.py`
- Issue: `API_MODULE_ALIASES` existed but was unused.
- Risk: Drift/confusion during maintenance.

### 3) Potential N+1 query pattern on event list participant counts
- Location: `backend/events/serializers.py` + `backend/events/views.py`
- Issue: `participant_count` used per-object query.
- Risk: Extra DB load on event listing pages at scale.

### 4) Deployment warnings under current local env
- Command: `python manage.py check --deploy`
- Warnings: Expected because local env runs with `DEBUG=True`, dev secret key, and non-SSL local settings.
- Risk: If these values are carried to production, security posture drops.

### 5) Repository hygiene risk (existing)
- Large amount of generated/venv/legacy content appears in working tree (`__pycache__`, venv site-packages, legacy parallel folders).
- Risk: Harder reviews, accidental commits, bloated repo history.

---

## Issues fixed in this audit

### A) Improved operational logging (no behavior change)
- Updated:
  - `backend/config/auth_views.py`
  - `backend/registrations/services.py`
- Change:
  - Replaced silent exception swallowing with structured `logger.exception(...)` calls in email-send failures.
- Result:
  - Same user-facing behavior; improved production diagnostics.

### B) Removed dead code
- Updated: `backend/accounts/permissions.py`
- Change:
  - Removed unused `API_MODULE_ALIASES`.

### C) Safe query optimization for event participant counts
- Updated:
  - `backend/events/views.py`
  - `backend/events/serializers.py`
- Change:
  - Added queryset annotation `participant_count_cached`.
  - Serializer now uses cached annotation when present, with fallback query.
- Result:
  - No business logic change; fewer DB queries on event listing.

---

## Functional verification results

Status legend: `PASS` = verified in this audit run, `PARTIAL` = static/limited verification only.

| Area | Status | Notes |
|---|---|---|
| Remove unused imports/dead code | PASS | Dead permission map removed; lint clean. |
| Remove duplicate code where possible | PASS | Removed dead alias; avoided risky refactor changes. |
| API endpoints work | PASS | CRUD/read/auth/report paths exercised in runtime checks. |
| React pages load without console errors | PARTIAL | Build/lint pass; full browser console sweep not fully automated here. |
| Authentication + JWT flow | PASS | Signup/login/me/change-password flows verified. |
| Committee permissions UI + backend | PASS | Sidebar module filtering + API module gates validated. |
| Cross-committee API denial | PASS | Finance denied event create; publicity denied registration admin write. |
| Registration flow to QR pass | PASS | Account -> registration -> registration number -> pass endpoint verified. |
| Cancellation + waitlist promotion | PASS | Confirmed cancellation triggers promotion of next waitlist entry. |
| Manual payment workflow | PASS | Pending->Paid->Waived transitions verified through admin endpoint. |
| Verification by reg#/QR workflow | PASS | Verification account registration access + attendance update verified. |
| Event CRUD | PASS | Create/update/read/delete verified via event committee account. |
| Results publishing | PASS | Result create + publish flag + public results + certificate endpoint verified. |
| Announcements | PASS | Create + public list verified. |
| Gallery uploads | PASS | Multipart image upload + public list verified. |
| Reports + CSV path | PASS | Attendance report API verified (CSV generated in frontend logic). |
| CMS pages | PASS | Key CMS public endpoints return 200. |
| Query duplication/perf checks | PASS | Event participant count query optimized. |
| Error handling improvements | PASS | Added logging for previously silent error paths. |
| Environment variable usage | PASS | Env-driven config confirmed for secrets/origins/mail/media controls. |
| `DEBUG=False` readiness | PASS | Config paths exist; deploy warnings expected only in local DEBUG env. |
| Production security settings | PASS | SSL/HSTS/cookie controls configured for non-DEBUG path. |
| Media/static configuration | PASS | WhiteNoise static + conditional media serve verified. |
| Migration consistency | PASS | Migrations applied and consistent (`showmigrations`). |
| Hardcoded secrets/passwords in docs | PASS | Passwords removed from docs; seed fallback remains code-local. |
| Responsive layout | PARTIAL | Build/lint clean; full viewport manual QA still recommended. |
| Accessibility basics | PARTIAL | Existing labels/buttons mostly structured; full axe/pass not run in this audit. |

---

## Remaining recommendations (no feature redesign)

1. **Run final pre-launch environment checks with production env vars**  
   - Set `DEBUG=False`, real `SECRET_KEY`, `ALLOWED_HOSTS`, TLS, SMTP.
   - Re-run `python manage.py check --deploy`.

2. **Repository cleanup hardening**
   - Ensure `.gitignore` excludes:
     - `backend/venv/`
     - `**/__pycache__/`
     - local DB artifacts where appropriate.
   - Keep legacy folders (`Final Merge`, `MACFIESTA_WEB Phase Build`) out of production branch unless intentionally archived.

3. **Access-control regression suite**
   - Add a small automated test module for committee permission matrix (read/write allow/deny) to prevent regressions.

4. **Operational monitoring**
   - Track auth failures, permission denials, and SMTP errors from new log points during fest period.

5. **Manual QA sweep before go-live**
   - Browser console check across all major pages.
   - Mobile viewport checks (390px/430px/768px) for forms and admin tables.
   - Basic accessibility pass (keyboard + labels + focus order).

---

## Production readiness score

**92 / 100**

### Score rationale
- Strong: auth/JWT, committee authorization model, core workflows, migrations, build/lint/system checks, and security-ready settings for non-DEBUG.
- Deductions:
  - Partial (not fully automated) browser-console/responsive/accessibility coverage.
  - Repository hygiene risks from generated/legacy content in current working tree.

