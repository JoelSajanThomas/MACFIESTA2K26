# Repository Hygiene Report

Date: 2026-08-05  
Scope: Cleanup-only pass (no feature, route, permission, UI, model, or business-logic changes).

## 1) Files removed

### Generated/runtime artifacts removed from repository tracking
- Untracked from git index (staged deletions): **7,531 files**
  - `backend/venv/**`
  - `**/__pycache__/**`
  - `*.pyc`
  - `backend/db.sqlite3`
- Local generated directories/files removed from workspace:
  - `frontend/node_modules/`
  - `frontend/dist/`
  - `backend/.venv/` (temporary validation venv removed after checks)
  - regenerated `__pycache__`/`*.pyc` removed after validation

### Sensitive legacy files deleted
- `MACFIESTA_WEB Phase Build/frontend/.env`
- `Final Merge/Final Frontend/src/.cert/macfastprivkey.pem`
- `Final Merge/Final Frontend/src/.cert/macfastfullchain.pem`

## 2) .gitignore changes

Updated root `.gitignore` to cover:
- Python/Django artifacts (`__pycache__`, `*.py[cod]`, coverage, pytest/mypy/ruff caches)
- Virtual environments (`venv`, `.venv`, `backend/venv`, `backend/.venv`)
- Local DB/media/static artifacts (`*.sqlite3`, `media`, `staticfiles`)
- React/Vite/Node artifacts (`node_modules`, `dist`, `dist-ssr`, `.vite`)
- Env/secrets files (`.env*`) while preserving:
  - `!.env.example`
  - `!**/.env.example`
  - `!**/.env.production.example`
- Logs/temp/backup patterns (`*.log`, `*.tmp`, `*.bak`, `*.old`)
- IDE/OS artifacts (`.vscode`, `.idea`, `.DS_Store`, `Thumbs.db`, etc.)
- Binary key/cert artifacts (`*.pem`, `*.key`, `*.crt`, `*.p12`)

## 3) Secrets scan result

### Scan performed
- Pattern scans for:
  - `SECRET_KEY=...`
  - SMTP passwords
  - Razorpay secrets
  - committee seed password literals
  - known previously exposed credential strings

### Result
- **No real leaked credentials** found after cleanup.
- Remaining matches are placeholder/dev-safe values only:
  - Active app fallback in `backend/config/settings.py` (Django dev fallback when `DEBUG=True`)
  - Redacted placeholders (`change-me`, `change-me-local-only`) in legacy snapshot settings
  - Documentation examples for `COMMITTEE_SEED_PASSWORD` (non-secret placeholders)

## 4) `.env.example` verification

- Kept intact:
  - `backend/.env.example`
  - `frontend/.env.example`
- Both files contain placeholders only; no secrets embedded.

## 5) Legacy/archive review

### Kept intentionally
- `docs/archive/` (required academic/archival docs retained as requested)

### Legacy product trees (decision: archived outside repo)
Moved to `../MacFiestaPro-legacy-archive/` (sibling of active repo):
- `Final Merge/`
- `MACFIESTA_WEB Phase Build/`

### Cleaned before archive
- Removed secret-bearing files (`.env`, TLS private key/cert).
- Redacted hardcoded secrets in legacy `settings.py` snapshots.

## 6) Duplicate/obsolete/temp file checks

- No `*.bak`, `*.old`, `*.tmp` files currently present.
- No tracked local `.env` files remain.
- No `node_modules`, `dist`, or `__pycache__` directories remain in workspace.

## 7) Manual review — resolved

Legacy trees are archived outside the active repository. See `SECRET_ROTATION.md` for post-exposure rotation and the deployment order.

## 8) Final validation results

Required validations were executed during this pass:

- Frontend:
  - `npm run lint` ✅
  - `npm run build` ✅
- Backend:
  - `python manage.py check` ✅ (run via temporary isolated venv)
  - `python manage.py showmigrations` ✅ (run via temporary isolated venv)
  - `python -m compileall .` ✅

Notes:
- Because generated venv content was cleaned, a temporary backend `.venv` was created for validation and then removed to keep workspace clean.

## 9) Git status summary after cleanup

- Staged deletions from cleanup patterns: **7,531**
- All staged deletions are generated/sensitive artifacts targeted by hygiene rules.
- Existing non-hygiene source/document changes from prior development remain in working tree (intentionally untouched in this cleanup-only pass).

