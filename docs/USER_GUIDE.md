# User Guide (participants & public)

## Public site (no login)

Browse Home, Events, Schedule, Results, Gallery, Sponsors, Announcements, About, Committees, Contact, Terms, Privacy.

**Register for an event** without an account → Login or Create Account (return via `?next=`).

## Create account

Path: `/register` — username, email, password. On success JWT is stored and you can register immediately.

## Login

Path: `/login` — username + password. Forgot password uses email reset (SMTP in production). Staff accounts open the Admin dashboard; participants open Student Dashboard (or `?next=`).

## Event registration

1. Open an event → Register.
2. Individual or team (team name + optional member names/phones).
3. Optional: food preference / notes, accommodation count & notes, transport note.
4. Success → registration number, QR, links to dashboard and digital pass (`/pass/:id`).

Payment stays **Pending** until the finance desk marks **Paid** (or **Waived**).

## Student Dashboard

`/student-dashboard` — your events, payment / waitlist status, cancel (when allowed), open digital pass.

## Results & certificates

Published winners appear on Results. Eligible entries link to a printable certificate (`/certificates/:id`).

## Committees

`/committees` lists Core Team and heads for fest coordination contacts.
