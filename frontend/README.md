# MacFiesta Pro — Frontend

MacFiesta Pro is the official event platform for **MACFAST MacFiesta**, a national-level college fest. This React frontend connects to a Django REST Framework backend for live events, registrations, results, and coordinator tools.

## Tech Stack

- React 18
- Vite
- JavaScript (no TypeScript)
- React Router
- Axios
- Framer Motion

## Prerequisites

- Node.js 18+
- MacFiesta Pro Django backend running at `http://127.0.0.1:8000`

## Setup

```bash
cd frontend
npm install
```

Copy the environment example and adjust if your backend URL differs:

```bash
cp .env.example .env
```

Default `.env`:

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Run Development Server

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build for Production

```bash
npm run build
npm run preview
```

## Backend URL

The API base URL is read from `VITE_API_BASE_URL`. If unset, it falls back to:

```
http://127.0.0.1:8000/api
```

Start the backend from the project root:

```bash
cd ../backend
python manage.py runserver
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Premium homepage |
| `/events` | Browse all competitions |
| `/events/:idOrSlug` | Event details and registration |
| `/schedule` | Day-wise event timetable |
| `/results` | Published winners and podium |
| `/gallery` | Fest photo gallery |
| `/announcements` | Official fest updates |
| `/sponsors` | Sponsor tiers and partnership CTA |
| `/about` | About MacFiesta |
| `/contact` | Contact cards and inquiry form |
| `/login` | JWT login |
| `/student-dashboard` | Student registrations (login required) |
| `/admin-dashboard` | Coordinator dashboard (staff only) |

## Features

- Premium festival homepage with countdown, categories, and highlights
- Event browsing with category filters and live participant counts
- JWT authentication with role-based redirects
- Event registration for logged-in students
- Student dashboard with registration history and payment status
- Admin/coordinator dashboard with stats, tables, and quick actions
- Results system with podium layout and filters
- Schedule page with day grouping and search
- Gallery with masonry layout and lightbox
- Announcements feed with placeholder fallback
- Sponsors page with tiered partner cards
- Reusable loading, error, and empty states across data pages
- Responsive navbar with logout and dashboard links
- SEO meta tags and MF favicon branding

## Test Account

If seeded in the backend:

- Username: `testuser`
- Password: `testpass123`
- Staff account — redirects to admin dashboard after login

## Project Structure

```
src/
├── components/     # UI, dashboard, schedule, results, gallery
├── pages/          # Route-level pages
├── services/api.js # Axios API client
└── utils/          # Constants, auth helpers, data utilities
```

## Official Fest Site

[macfiesta.macfast.org](https://macfiesta.macfast.org/)
