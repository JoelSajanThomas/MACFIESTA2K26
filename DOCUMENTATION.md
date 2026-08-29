# MacFiesta Pro — Complete Technical & Production Documentation

**MACFAST National Intercollegiate Fest Platform**  
*Comprehensive System Architecture, REST API Reference, Database Schema, Frontend, Backend, Mobile (Capacitor), Security, Deployment, and Operations Manual.*

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Backend Documentation](#5-backend-documentation)
6. [REST API Documentation](#6-rest-api-documentation)
7. [Database Documentation](#7-database-documentation)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Frontend Documentation](#9-frontend-documentation)
10. [Mobile Application (Capacitor)](#10-mobile-application-capacitor)
11. [UI/UX Documentation](#11-uiux-documentation)
12. [Feature Documentation](#12-feature-documentation)
13. [Admin Panel Documentation](#13-admin-panel-documentation)
14. [Security Documentation](#14-security-documentation)
15. [Performance Optimization](#15-performance-optimization)
16. [Error Handling](#16-error-handling)
17. [Testing Documentation](#17-testing-documentation)
18. [Deployment Guide](#18-deployment-guide)
19. [Installation Guide](#19-installation-guide)
20. [Configuration Guide](#20-configuration-guide)
21. [User Manual](#21-user-manual)
22. [Admin Manual](#22-admin-manual)
23. [Developer Guide](#23-developer-guide)
24. [Code Documentation](#24-code-documentation)
25. [Sequence Diagrams](#25-sequence-diagrams)
26. [Flowcharts](#26-flowcharts)
27. [Screenshots Section](#27-screenshots-section)
28. [Known Limitations](#28-known-limitations)
29. [Future Enhancements](#29-future-enhancements)
30. [Conclusion](#30-conclusion)
31. [Appendix](#31-appendix)

---

# 1. Project Overview

### 1.1 Project Name
**MacFiesta Pro** ("MacFiesta 2026") — Official Digital Operations & Festival Management Platform for MACFAST (Mar Athanasios College for Advanced Studies Tiruvalla).

### 1.2 Purpose
MacFiesta Pro is an end-to-end event management, registration, verification, hospitality, and live fest engagement platform designed for national-level intercollegiate festivals. It bridges digital student participation with ground-level volunteer and committee operations.

### 1.3 Problem Statement
Large-scale collegiate fests typically suffer from:
- Long physical queues for on-spot verification and paper tickets.
- Data mismatch between payment proofs, registrations, and gate check-ins.
- Uncoordinated committee operations (finance, hospitality, events, results).
- Delayed publishing of leaderboards and certificates.
- Fragmented mobile vs. web delegate experience.

### 1.4 Objectives
- Provide a responsive, cinematic, superhero-themed web application and native Android mobile app.
- Provide secure student self-service (event registration, batch checkout, payment submission, digital pass issuance).
- Enforce strict server-side Role-Based Access Control (RBAC) across distinct committee desks.
- Implement cryptographically signed QR code digital passes to eliminate gate forgery.
- Provide offline/manual payment reconciliation without requiring commercial third-party payment gateways.
- Enable instantaneous result publishing and automated achievement certificate generation.

### 1.5 Target Users
1. **Delegates & Students:** School and college students registering for individual/team events, requesting hospitality, downloading passes and certificates.
2. **Committee Administrators & Volunteers:**
   - *Core Team / Superusers:* Full fest governance, site configuration, user audits.
   - *Finance Desk:* Manual UPI/Bank payment proof verification, reconciliation.
   - *Verification Desk:* Gate scanning of HMAC QR passes, badge issuance, attendance marking.
   - *Event & Program Desks:* Event schedules, capacity caps, winner entries.
   - *Hospitality Desk:* Hostel bed allocation, check-ins, food preferences tracking.
   - *Publicity & Media:* Announcements, sponsors, live gallery uploads.

### 1.6 Scope
MacFiesta Pro encompasses event management, team registrations, hostel booking, attendee verification, attendance reporting, live scoreboards, dynamic CMS content, and administrative analytics.

---

# 2. System Architecture

```mermaid
flowchart TB
    subgraph Client_Layer [Client Layer]
        WebClient["Web Browser (React 19 + Vite)"]
        MobileClient["Android App (Capacitor Shell)"]
    end

    subgraph Gateway_Proxy [Reverse Proxy & Static Layer]
        ViteDev["Vite Dev Server (:5173 / Proxy)"]
        WhiteNoise["WhiteNoise Static Engine (Prod)"]
    end

    subgraph Backend_Layer [Django 5.2 Application Layer]
        WSGI["Gunicorn / Django WSGI"]
        AuthMiddleware["JWT Authentication (SimpleJWT)"]
        RBAC["Committee Module RBAC (HasModule)"]
        DRF["Django REST Framework ViewSets"]
        Signer["TimestampSigner (HMAC Salted)"]
    end

    subgraph Data_Layer [Data & Storage Layer]
        DB[("Database: SQLite (Dev) / PostgreSQL (Prod)")]
        MediaStorage["Local / Hosted Media Storage"]
    end

    WebClient -->|HTTPS / REST API| DRF
    MobileClient -->|HTTPS / REST API| DRF
    WebClient -.->|Development Proxy| ViteDev
    ViteDev -.->|Forward /api| DRF

    DRF --> AuthMiddleware
    AuthMiddleware --> RBAC
    RBAC --> DRF
    DRF --> Signer
    DRF --> DB
    DRF --> MediaStorage
```

### 2.1 Request Flow
1. Client issues an HTTP request to `https://<domain>/api/<resource>/`.
2. `CorsMiddleware` checks the origin against `CORS_ALLOWED_ORIGINS` / `CORS_ALLOW_ALL_ORIGINS`.
3. `JWTAuthentication` validates the `Authorization: Bearer <access_token>` header.
4. Custom permission classes (`IsAdminOrReadOnly`, `HasStaffModule`, `HasModule`) verify user role and committee profile.
5. Serializers perform input parsing, model validation, and sanitized DB queries.
6. DRF views return standardized JSON payloads with appropriate HTTP status codes.

---

# 3. Technology Stack

### 3.1 Backend
- **Framework:** Django `5.2.15`
- **REST Framework:** Django REST Framework `3.17.1`
- **Authentication:** `djangorestframework-simplejwt 5.5.1`
- **Database Engine:** `dj-database-url 2.3.0`, `psycopg2-binary 2.9.12` (PostgreSQL), `sqlite3` (Development)
- **CORS Handling:** `django-cors-headers 4.9.0`
- **Static File Serving:** `whitenoise 6.9.0`
- **Image Processing:** `Pillow 12.3.0`
- **WSGI Application Server:** `gunicorn 23.0.0`
- **Environment Management:** `python-dotenv 1.1.1`

### 3.2 Frontend
- **Runtime & Library:** React `19.2.7`, React DOM `19.2.7`
- **Build Tool:** Vite `8.1.2`, `@vitejs/plugin-react 6.0.3`
- **Routing:** `react-router-dom 7.18.1`
- **Styling:** Tailwind CSS `4.3.3`, `@tailwindcss/vite 4.3.3`, Custom CSS (Glassmorphism & Marvel themes)
- **HTTP Client:** `axios 1.18.1`
- **Animations:** `framer-motion 12.42.2`, `canvas-confetti 1.9.4`
- **QR Scanning & PDF:** `html5-qrcode 2.3.8`, `jspdf 4.2.1`, `jspdf-autotable 5.0.8`
- **Icons:** `react-icons 5.7.0`

### 3.3 Mobile (Android)
- **Cross-Platform Runtime:** Capacitor `@capacitor/core 8.4.1`
- **CLI & Platform:** `@capacitor/cli 8.4.1`, `@capacitor/android 8.4.1`
- **Native Plugins:** `@capacitor/status-bar 8.0.2`

---

# 4. Project Structure

```
MacFiestaPro/
├── API_DOCUMENTATION.md         # API route overview
├── DEPLOYMENT.md                # Server & cloud deployment manual
├── MOBILE_APK.md                # Android APK build & signing guide
├── SECRET_ROTATION.md           # Security credential rotation guide
├── README.md                    # Project README
├── render.yaml                  # Cloud deployment configuration
├── backend/                     # Django REST Framework Backend
│   ├── manage.py                # Django CLI utility
│   ├── requirements.txt         # Pinned backend dependencies
│   ├── .env.example             # Backend environment template
│   ├── api_urls.py              # Root API URL routing table
│   ├── config/                  # Core project settings & WSGI
│   │   ├── settings.py          # Unified settings (Dev/Prod)
│   │   ├── urls.py              # Top-level Django URLs
│   │   ├── auth_views.py        # Throttled Auth & Reset views
│   │   ├── permissions.py       # Legacy permission proxies
│   │   └── validators.py        # File & image upload validators
│   ├── accounts/                # User profiles, RBAC & Committee desks
│   ├── events/                  # Events catalog, capacity & categories
│   ├── registrations/           # Registrations, passes, QR signing & verification
│   ├── results/                 # Event results, rankings & winners
│   ├── accommodation/           # Hostels, delegates booking & room allocation
│   ├── gallery/                 # Media library (photos/videos)
│   ├── announcements/           # Live noticeboard & stage calls
│   ├── cms/                     # Dynamic homepage content & site settings
│   └── dashboard/               # Aggregated administrative insights
└── frontend/                    # React 19 + Vite Frontend
    ├── package.json             # NPM dependencies & scripts
    ├── vite.config.js           # Vite configuration & dev proxy
    ├── tsconfig.json            # TypeScript & path alias configuration
    ├── .env.example             # Frontend environment template
    ├── android/                 # Capacitor Android native project
    ├── public/                  # Static images, audio & MARVEL assets
    └── src/                     # React source code
        ├── App.jsx              # Central router and lazy-loaded routes
        ├── main.jsx             # Entry point
        ├── components/          # Reusable UI & Admin modules
        ├── pages/               # Application page views
        ├── services/            # Axios API layer with JWT interceptor
        ├── theme/               # Marvel superhero multiverse tokens
        └── utils/               # QR builders, formatters, PDF generators
```

---

# 5. Backend Documentation

### 5.1 Django Apps
1. **`accounts`:** Custom `StaffProfile` linking Django `User` models to committee types (`core`, `finance`, `food`, `hospitality`, `event`, `program`, `cultural`, `publicity`, `invitation`, `verification`). Provides `user_modules()` resolution.
2. **`events`:** `Event` model containing categories (`tech`, `arts`, `sports`, `management`, `general`), audience segmentation (`school`, `college`), rules, timings, fees, and registration capacity limits.
3. **`registrations`:** Core operational engine. Handles individual/team registrations, waitlists, batch payments, HMAC pass signing, desk check-in lookups, and CSV report export.
4. **`results`:** `Result` records linked to events, winner details, scores, and position choices (`first`, `second`, `third`, `special`).
5. **`accommodation`:** `Hostel` models and `AccommodationBooking` requests with automated booking ID generation (`HST-2026-XXXX`).
6. **`gallery`:** Media assets categorized into `cultural`, `technical`, `gaming`, and `pro-show`.
7. **`announcements`:** Urgent broadcast messages displayed on student noticeboards.
8. **`cms`:** Complete site content engine (`SiteSetting`, `FestivalHighlight`, `EventFormat`, `GuestProfile`, `ThemeSection`, `Testimonial`, `FAQ`, `Sponsor`, `HomepageSection`, `FestRewindItem`).
9. **`dashboard`:** Statistical queries returning revenue, gender distribution, food preference counts, and attendance metrics.

### 5.2 Custom Management Commands
- `python manage.py seed_cms`: Populates default superhero copy, FAQs, festival highlights, guests, and theme content.
- `python manage.py seed_committee_accounts`: Seeds designated administrative accounts for all committee desks.
- `python manage.py audit_staff_profiles`: Scans staff accounts to ensure valid profile associations and active module permissions.
- `python manage.py sync_macfiesta_2026_events`: Synchronizes official MacFiesta 2026 event rules, venues, and timings.

---

# 6. REST API Documentation

| Method | Endpoint | Auth Required | Description | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/auth/login/` | None | Exchange credentials for JWT access + refresh tokens | `200`, `401`, `429` |
| `POST` | `/api/auth/refresh/` | None | Rotate refresh token for a fresh access token | `200`, `401`, `429` |
| `POST` | `/api/auth/register/` | None | Register a new delegate account | `201`, `400`, `429` |
| `GET` | `/api/auth/me/` | Bearer Token | Fetch authenticated user details, role & modules | `200`, `401` |
| `POST` | `/api/auth/password-reset/` | None | Request password reset token via email | `200`, `404`, `429` |
| `POST` | `/api/auth/password-reset/confirm/` | None | Confirm password reset using OTP token | `200`, `400` |
| `POST` | `/api/auth/change-password/` | Bearer Token | Change password for logged-in user | `200`, `400` |
| `GET` | `/api/events/` | None | List active events with participant counts | `200` |
| `POST` | `/api/events/` | Staff (`events`) | Create a new event | `201`, `400`, `403` |
| `GET` | `/api/events/<id>/` | None | Retrieve specific event details | `200`, `404` |
| `PATCH` | `/api/events/<id>/` | Staff (`events`) | Update event schedule, venue, or fees | `200`, `400`, `403` |
| `DELETE` | `/api/events/<id>/` | Staff (`events`) | Delete event (blocked with `409` if regs exist) | `204`, `409`, `403` |
| `GET` | `/api/registrations/` | Bearer Token | List user's active event registrations | `200`, `401` |
| `POST` | `/api/registrations/` | Bearer Token | Register for an individual/team event | `201`, `400`, `401` |
| `POST` | `/api/registrations/batch/` | Bearer Token | Batch register across multiple events in one checkout | `201`, `400`, `401` |
| `POST` | `/api/registrations/<id>/cancel/` | Bearer Token | Cancel an active registration | `200`, `400`, `403` |
| `POST` | `/api/registrations/<id>/submit-payment/` | Bearer Token | Upload payment screenshot and transaction ID | `200`, `400` |
| `GET` | `/api/registrations/<id>/pass/` | Bearer Token | Retrieve digital pass with signed HMAC token | `200`, `404` |
| `GET` | `/api/admin/registrations/` | Staff (`registrations`)| View and filter all fest registrations | `200`, `403` |
| `GET` | `/api/admin/verification/lookup/` | Staff (`verification`) | Lookup attendee by registration number or HMAC QR | `200`, `404`, `403` |
| `POST` | `/api/admin/verification/check-in/` | Staff (`verification`) | Mark attendance and check-in attendee | `200`, `400`, `403` |
| `GET` | `/api/admin/reports/attendance/` | Staff (`reports`) | Fetch attendance report (supports `?export=csv`) | `200`, `403` |
| `GET` | `/api/certificates/<result_id>/` | None | Public certificate data for published results | `200`, `404` |
| `GET` | `/api/results/` | None | List published festival results & leaderboard | `200` |
| `POST` | `/api/results/` | Staff (`results`) | Record event winners and scores | `201`, `400`, `403` |
| `GET` | `/api/hostels/` | None | View list of available hostels and tariffs | `200` |
| `POST` | `/api/accommodation/bookings/` | None | Submit a hostel accommodation request | `201`, `400` |
| `GET` | `/api/dashboard/stats/` | Staff (`insights`) | Retrieve comprehensive festival analytics | `200`, `403` |
| `GET` | `/api/public/config/` | None | Public payment details, add-on fees & QR host | `200` |
| `GET` | `/api/public/stats/` | None | Public homepage aggregate counts | `200` |

---

# 7. Database Documentation

### 7.1 Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o| StaffProfile : "has"
    User ||--o{ Registration : "creates"
    User ||--o{ AccommodationBooking : "submits"
    
    Event ||--o{ Registration : "has"
    Event ||--o{ Result : "produces"
    
    Registration ||--o{ TeamMember : "contains"
    
    Hostel ||--o{ AccommodationBooking : "accommodates"
    
    User ||--o{ Registration : "verifies (payment_verified_by)"
    User ||--o{ Registration : "verifies (verified_by)"

    Event {
        int id PK
        string title
        string slug UK
        string category
        string audience
        date event_date
        time event_time
        int max_participants
        decimal registration_fee
        boolean is_result_published
    }

    Registration {
        int id PK
        string registration_number UK
        string participant_name
        string college_name
        string payment_status
        string approval_status
        string payment_transaction_id
        string payment_batch_id
        boolean attendance_marked
        datetime verified_at
    }

    StaffProfile {
        int id PK
        string committee
        string display_name
        boolean must_change_password
    }

    Result {
        int id PK
        string position
        string participant_name
        string college_name
        text remarks
    }

    Hostel {
        int id PK
        string name
        string gender
        decimal tariff_per_night
        int total_capacity
        int available_beds
    }

    AccommodationBooking {
        int id PK
        string booking_id UK
        string full_name
        string status
        date check_in_date
        date check_out_date
    }
```

---

# 8. Authentication & Authorization

### 8.1 JWT Lifecycle
- Authenticated endpoints require `Authorization: Bearer <access_token>`.
- Access tokens expire after 1 hour; refresh tokens expire after 7 days.
- When an API request encounters a `401 Unauthorized`, Axios triggers `refreshAccessToken()`, obtains a new token pair from `/api/auth/refresh/`, updates `localStorage`, and replays the failed request seamlessly.

### 8.2 Role-Based Access Control (RBAC) Matrix

| Committee | Insights | Events | Registrations | Results | Verification | Hospitality | Reports | Announcements | CMS |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Core Team / Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Finance Desk** | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Verification Desk** | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Event Desk** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Hospitality Desk** | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Cultural Desk** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Publicity Desk** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

# 9. Frontend Documentation

### 9.1 React 19 + Vite Architecture
- **Router:** Single-page navigation powered by `react-router-dom` with route-level code splitting via `React.lazy` and `Suspense`.
- **API Client:** Axios singleton configured with short-lived in-memory caching (`cachedGet` with 60s TTL) to prevent duplicate fetch requests during navigation.
- **Form State Management:** Controlled components with instantaneous client-side validation and clear error states.
- **Theming:** Custom superhero Marvel aesthetics with animated cinematic backgrounds (`Marvel3DScrollCanvas`), particle systems (`ParticleAtmosphere`), and cursor illumination (`CursorGlow`).

---

# 10. Mobile Application (Capacitor)

### 10.1 Architecture
The native Android build wraps the optimized React production bundle (`dist/`) inside a hardware-accelerated WebView using `@capacitor/android`.

### 10.2 Android Configuration & Permissions
`android/app/src/main/AndroidManifest.xml` enforces:
- `android.permission.INTERNET`
- `android:usesCleartextTraffic="true"` (with `network_security_config` for local LAN debugging).

---

# 11. UI/UX Documentation

- **Theme:** "Multiverse of Legends" (Dark, cinematic Marvel aesthetics with gold/arc-cyan highlights).
- **Color Palette:**
  - Background Dark: `#05050A`, `#0B0C10`
  - Metallic Gold: `#D4AF37`, `#F3E5AB`
  - Arc Cyan / Reactor Glow: `#45A29E`, `#66FCF1`
  - Crimson Red: `#E62429`
- **Typography:** Modern geometric sans fonts (`Inter`, `Excon`, `Cinzel`).
- **Responsiveness:** Full breakpoint support (Mobile 360px+, Tablet 768px+, Desktop 1024px+, Ultra-wide 1440px+).

---

# 12. Feature Documentation

### 12.1 Digital Pass & Cryptographic QR Verification
- Upon registration and payment verification, delegates receive a digital pass (`/pass/:id`).
- Pass tokens are signed via Django's `TimestampSigner` (HMAC salt).
- Gate volunteers scanning the QR pass instantly verify attendee identity, check-in status, and event details without possibility of client-side ticket tampering.

### 12.2 Manual Offline Payment Flow
- Fees are paid directly via UPI QR or at physical desks.
- Delegates upload payment receipts and reference numbers.
- Finance committee reviews transaction logs in the admin dashboard and marks records `Paid` with a single click.

---

# 13. Admin Panel Documentation

Desks available under `/admin`:
- **Insights:** Real-time registration counts, verified revenue, gender ratio, food preferences, and hostel requests.
- **Registrations Desk:** Searchable tabular roster with status filters and CSV export.
- **Verification Desk:** Camera QR scanner and instant manual lookup.
- **Events & Results:** Event scheduling, capacity management, winner score entry.
- **Hospitality:** Hostel capacity tracker and bed allocation.
- **CMS Management:** Live site configuration, theme toggles, and sponsor banners.

---

# 14. Security Documentation

- **Password Storage:** Django PBKDF2 / Argon2 cryptographic hashers.
- **API Throttling:** Strict rate-limiting on authentication routes (`60/min` dev, `10/min` prod).
- **CORS / CSRF:** Explicit allowed origin white-listing; secure HTTP-only cookies in production.
- **Injection Prevention:** Parameterized ORM queries prevent SQL injection; React DOM auto-escaping neutralizes XSS.

---

# 15. Performance Optimization

- **Route Splitting:** 100% of routes lazy-loaded as isolated JavaScript chunks.
- **Client Cache:** In-memory request memoization reduces redundant backend round-trips.
- **Asset Compression:** WhiteNoise gzip/brotli compression on static assets.
- **Build Times:** Vite transforms and minifies the complete suite in ~1.15 seconds.

---

# 16. Error Handling

- **Backend:** DRF standard exception handlers return structured JSON (`{"detail": "..."}`) with proper HTTP status codes (`400`, `401`, `403`, `404`, `409`, `429`, `500`).
- **Frontend:** Global `ErrorState` and `EmptyState` components display actionable recovery prompts.

---

# 17. Testing Documentation

The repository includes automated test suites covering:
- Security hardening & unauthorized event mutation (`accounts/tests_desk_rbac.py`, `registrations/tests_security.py`).
- Attendance marking and duplicate registration rejection.
- Password reset token leakage prevention.
- All 23 test suites pass cleanly: `Ran 23 tests in 65s, OK`.

---

# 18. Deployment Guide

### Production Server (Linux / Render / PaaS)
```bash
# Backend Setup
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2

# Frontend Setup
cd frontend
npm ci
export VITE_API_BASE_URL="https://your-api-domain.com/api"
npm run build
```

---

# 19. Installation Guide

### Prerequisites
- Python `3.11+`
- Node.js `20+` & npm `10+`

### Local Development Quickstart
```bash
# 1. Clone repo
git clone https://github.com/JoelSajanThomas/MACFIESTAPRO.git
cd MACFIESTAPRO

# 2. Start Backend
cd backend
python -m venv .venv
.\.venv\Scripts\activate   # Windows (or source .venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_cms
python manage.py runserver 8000

# 3. Start Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to explore the application.

---

# 20. Configuration Guide

Key environment configuration variables:
- `DEBUG`: `True` for dev, `False` for production.
- `SECRET_KEY`: Long, cryptographically random string.
- `DATABASE_URL`: PostgreSQL connection URI (`postgres://user:pass@host:5432/db`).
- `ALLOWED_HOSTS`: Comma-separated list of hostnames.
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of client domains.
- `VITE_API_BASE_URL`: Base API endpoint URL for client builds.

---

# 21. User Manual

1. **Browsing Events:** Navigate to `/events` to filter competitions by category (Tech, Arts, Sports, Management) and audience (College / School Day).
2. **Registration:** Click "Register Now", enter delegate details, select food/stay preferences, and proceed to checkout.
3. **Submitting Payment:** Scan the provided UPI QR code on the payment page, pay the exact amount, and input your transaction reference ID.
4. **Accessing Pass:** View your pass at `/student-dashboard` or `/pass/:id` and present the QR code at the registration desk on fest day.
5. **Certificates:** Access published results at `/results` and download your verifiable achievement certificate.

---

# 22. Admin Manual

1. **Staff Login:** Visit `/login`, log in with your committee credentials.
2. **Checking in Attendees:** Open `/admin/verification`, scan the delegate's QR pass, and click **Verify & Check-In**.
3. **Verifying Payments:** Go to `/admin/payments`, inspect the submitted transaction reference, and click **Verify Payment**.
4. **Publishing Winners:** Go to `/admin/results`, select the completed event, enter 1st/2nd/3rd place winners, and toggle **Publish Results**.

---

# 23. Developer Guide

- **Adding a New Model:** Define the model in `<app>/models.py`, generate migrations (`python manage.py makemigrations <app>`), apply them (`python manage.py migrate`), and expose them via DRF `ModelViewSet` and serializers.
- **Adding a New Page:** Create the component in `frontend/src/pages/`, register the lazy import in `frontend/src/App.jsx`, and add the route entry in `AppRoutes`.

---

# 24. Code Documentation

- **`registrations/signing.py`:** Contains `sign_registration_number()` and `resolve_registration_lookup()` using Django's HMAC timestamp signer to secure public passes against counterfeit generation.
- **`accounts/drf.py`:** Implements `HasModule` and `IsAdminOrReadOnly` custom DRF permissions matching committee assignments dynamically.
- **`services/api.js`:** Encapsulates all backend REST calls and provides an Axios response interceptor for token auto-refresh.

---

# 25. Sequence Diagrams

### 25.1 Event Registration & Verification Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Frontend as React Client
    participant Backend as Django REST API
    participant DB as Database
    actor Volunteer as Verification Desk

    Student->>Frontend: Selects Event & Fills Details
    Frontend->>Backend: POST /api/registrations/ (JWT Auth)
    Backend->>DB: Check Capacity & Prevent Duplicates
    Backend->>DB: Insert Registration (Status: Pending)
    Backend-->>Frontend: 201 Created (Registration #)
    
    Student->>Frontend: Submits UPI Payment Reference
    Frontend->>Backend: POST /api/registrations/:id/submit-payment/
    Backend->>DB: Update Payment Status to Pending Verification
    
    Volunteer->>Frontend: Scans Student Pass QR
    Frontend->>Backend: GET /api/admin/verification/lookup/?q=<HMAC_Token>
    Backend->>Backend: Verify HMAC Signature & Unsign Token
    Backend->>DB: Query Attendee & Payment Status
    Backend-->>Frontend: 200 OK (Registration Details)
    Volunteer->>Backend: POST /api/admin/verification/check-in/
    Backend->>DB: Set attendance_marked=True
    Backend-->>Frontend: 200 OK (Checked In)
```

---

# 26. Flowcharts

### 26.1 Delegate Journey Flowchart

```mermaid
flowchart TD
    Start([Visit MacFiesta]) --> AuthCheck{Logged In?}
    AuthCheck -- No --> Register[Create Student Account / Login]
    AuthCheck -- Yes --> Browse[Browse Events & Categories]
    
    Register --> Browse
    Browse --> Select[Select Event & Add-ons]
    Select --> Checkout[Submit Registration & Upload UPI Proof]
    Checkout --> Pending[Payment Verified by Finance Desk]
    Pending --> Pass[Digital Hero Pass Issued with HMAC QR]
    Pass --> FestDay[Arrive on Fest Day]
    FestDay --> CheckIn[Scan QR at Gate / Mark Attendance]
    CheckIn --> Compete[Participate in Events]
    Compete --> Results[View Leaderboard / Download Certificate]
```

---

# 27. Screenshots Section

*(Placeholders for documentation and academic project report submissions)*

- **Figure 1: Cinematic Hero Landing Page**  
  `[Screenshot: /screenshots/home_hero_landing.png]`  
  *Description: Modern Marvel-themed hero section with animated radar controls and countdown timer.*

- **Figure 2: Event Registration & Checkout**  
  `[Screenshot: /screenshots/event_registration_checkout.png]`  
  *Description: Individual/team registration modal with accommodation and food preference options.*

- **Figure 3: Cryptographically Signed Hero Pass**  
  `[Screenshot: /screenshots/hero_pass_qr.png]`  
  *Description: Delegate pass showing personalized registration number and secure QR barcode.*

- **Figure 4: Committee Admin Insights Dashboard**  
  `[Screenshot: /screenshots/admin_insights_dashboard.png]`  
  *Description: Real-time analytics view displaying total delegates, verified revenue, and attendance.*

- **Figure 5: Gate Verification & QR Scanner Desk**  
  `[Screenshot: /screenshots/admin_qr_verification.png]`  
  *Description: Integrated camera scanner for instant gate lookups and check-in confirmation.*

---

# 28. Known Limitations

1. **Manual Payment Reconciliation:** Payments require manual verification by the Finance desk since commercial payment gateways (e.g. Razorpay) are omitted by design for institutional desk settlement.
2. **Media Storage:** In the local default configuration, media uploads are saved to disk (`/media/`). Cloud deployments should configure object storage (e.g. AWS S3 / Cloudinary) for permanent multi-instance hosting.

---

# 29. Future Enhancements

1. **Native Push Notifications:** Integration of Firebase Cloud Messaging (FCM) via Capacitor for real-time stage call announcements.
2. **Offline Mode for Verification Desks:** Service worker and SQLite caching for gate scanning in case of temporary Wi-Fi outages.
3. **Automated WhatsApp Alerts:** Twilio / WhatsApp Business API integration for instant pass delivery upon registration.

---

# 30. Conclusion

MacFiesta Pro delivers a high-performance, robust, secure, and visually stunning fest management solution. By pairing a scalable Django REST Framework architecture with a dynamic React 19 web frontend and Capacitor Android mobile application, the platform successfully solves registration, verification, hospitality, and event governance challenges for large-scale intercollegiate festivals.

---

# 31. Appendix

### Pinned Dependencies
- **Backend:** `Django==5.2.15`, `djangorestframework==3.17.1`, `djangorestframework-simplejwt==5.5.1`, `django-cors-headers==4.9.0`, `dj-database-url==2.3.0`, `psycopg2-binary==2.9.12`, `whitenoise==6.9.0`, `gunicorn==23.0.0`, `Pillow==12.3.0`.
- **Frontend:** `react==19.2.7`, `react-router-dom==7.18.1`, `framer-motion==12.42.2`, `axios==1.18.1`, `@capacitor/core==8.4.1`, `@capacitor/android==8.4.1`, `jspdf==4.2.1`, `tailwindcss==4.3.3`.

### Key CLI Commands
- Run backend: `python manage.py runserver`
- Run frontend: `npm run dev`
- Run tests: `python manage.py test`
- Build frontend: `npm run build`
- Sync Capacitor: `npx cap sync android`
