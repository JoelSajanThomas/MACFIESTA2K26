# Secret Rotation & Post-Exposure Actions

Date: 2026-08-05

Private keys / secret-bearing files were previously present in the working tree and may still exist in Git history. Treat them as **compromised**.

## Immediate external actions (operators)

1. **SSL certificate + private key** (`macfastfullchain.pem` / `macfastprivkey.pem` found under legacy frontend certs)
   - If these were ever used in production or staging: revoke/reissue at the certificate authority and redeploy new certs.
   - Do not reuse the deleted private key.

2. **SMTP credentials** (previously hardcoded in legacy `settings.py` snapshots)
   - Rotate Gmail/app passwords (or provider SMTP credentials) that appeared in legacy folders.
   - Update production env: `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`.

3. **Django `SECRET_KEY`**
   - Generate a new long random value for production.
   - Set `SECRET_KEY` in the host environment (never commit it).
   - Local DEBUG fallback in source was rotated; do not rely on it in production.

4. **Database passwords**
   - Rotate any Postgres (or other) credentials that may have been used with earlier deployments.
   - Update `DATABASE_URL` on the host.

5. **Committee seed password**
   - The old hardcoded seed value was removed from source.
   - Always set `COMMITTEE_SEED_PASSWORD` in the environment before `seed_committee_accounts`.
   - After seeding, force first-login password changes and rotate again for each desk.

6. **API keys / tokens**
   - Rotate any Razorpay (or other) keys that appeared in legacy snapshots — even if unused by the current app.
   - Invalidate old JWT signing material by rotating `SECRET_KEY` (SimpleJWT uses Django’s signing key).

7. **Git history**
   - Rotating secrets is mandatory even if history still contains old values.
   - Optional later: scrub history with `git filter-repo` / BFG **only** if the remote allows force-push and all collaborators agree. Prefer rotation over history rewrite for a private deploy.

## In-repo changes completed

- Rotated local DEBUG `SECRET_KEY` fallback.
- Removed hardcoded committee seed password; seeding now requires `COMMITTEE_SEED_PASSWORD`.
- Deleted legacy `.env` and TLS key/cert files from the working tree.
- Redacted legacy settings snapshots.
- Moved `Final Merge/` and `MACFIESTA_WEB Phase Build/` out of the active repository (see archive path below).

## Legacy folders

Archived outside the active repo to:

`../MacFiestaPro-legacy-archive/`

These trees are historical only. Do not deploy or import secrets from them.

## Final deployment order

1. Commit the cleaned repository  
2. Push to the private/official repository  
3. Configure production environment variables  
4. Provision the production database  
5. Run migrations  
6. Collect static files  
7. Restart the application server  
8. Confirm `DEBUG=False` and HTTPS  
9. Test SMTP  
10. Create committee accounts (`COMMITTEE_SEED_PASSWORD` + `seed_committee_accounts --disable-testuser`)  
11. Change all seeded passwords  
12. Run the production smoke test  
13. Take a database backup  
14. Open registrations  

Further development is not required for go-live; proceed with deployment and live testing.
