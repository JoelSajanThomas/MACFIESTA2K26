# MacFiesta Pro — Design System

Official visual identity reference for MacFiesta Pro. Tokens live in `src/utils/designSystem.js`, `src/utils/brand.js`, and CSS `:root` in `App.css`.

## Logo usage

| Variant | File | Use |
|---------|------|-----|
| Mark only | `public/brand/logo-mark.svg` | Favicon, compact nav on mobile |
| Lockup | `public/brand/logo-lockup.svg` | Hero, marketing headers |
| Footer | `public/brand/logo-footer.svg` | Site footer, dark backgrounds |

**Rules**

- Minimum clear space: height of the “M” mark on all sides.
- Do not stretch, rotate, or recolor the logo outside brand gold/navy.
- On photos, place lockup over the hero overlay (`hero-overlay-strong`), never directly on busy imagery without overlay.
- Use `<BrandLogo variant="lockup|mark|footer" />` — do not embed raster logos.

## Color palette

| Token | Hex | Role |
|-------|-----|------|
| `--navy-950` | `#04040f` | Page background |
| `--navy-900` | `#0a0a1c` | Footer, deep sections |
| `--surface` | `#12121f` | Cards, panels |
| `--surface-raised` | `#18182a` | Elevated cards |
| `--gold-500` | `#d4af37` | Primary accent, CTAs |
| `--gold-400` | `#e0c158` | Hover, eyebrows |
| `--white` | `#f8f7fc` | Headings |
| `--muted` | `rgba(248,247,252,0.65)` | Body secondary |
| `--border-subtle` | `rgba(255,255,255,0.08)` | Borders |

Category accent colors are defined in `cmsUtils.js` (`CATEGORY_COLORS`).

## Typography

| Element | Font | Size (desktop) | Weight |
|---------|------|----------------|--------|
| Display / H1 | `--font-display` (Playfair) | `clamp(2.8rem, 8vw, 4.5rem)` | 700 |
| Section title | `--font-display` | `clamp(1.75rem, 4vw, 2.5rem)` | 700 |
| Eyebrow | `--font-body` | `0.72rem`, letter-spacing `0.16em` | 600 |
| Body | `--font-body` (DM Sans) | `1rem` | 400 |
| Small / labels | `--font-body` | `0.72–0.84rem` | 500 |

Line height: `1.2` headings, `1.65` body.

## Buttons

| Class | Use |
|-------|-----|
| `.btn-gold` | Primary action — register, save, submit |
| `.btn-outline` | Secondary — view schedule, cancel |
| `.btn-card` | Compact card footer CTA |
| `.btn-ghost` | Tertiary / nav-adjacent |

All buttons: `min-height 44px`, `border-radius 999px` (pill) or `8px` (nav). Focus: gold `outline` 2px (`:focus-visible` in `index.css`).

## Cards

| Class | Use |
|-------|-----|
| `.event-card-premium` | Event listings |
| `.detail-panel` | Detail pages, forms |
| `.sponsor-card` | Sponsor grid |
| `.highlight-card` | Homepage highlights |
| `.cms-dashboard-card` | Admin CMS hub |

Shared: `border-radius: var(--radius)` (12px), `border: 1px solid var(--border-subtle)`, subtle shadow `0 4px 24px rgba(0,0,0,0.18)`.

## Badges

| Class | Meaning |
|-------|---------|
| `.event-badge.open` | Registration open |
| `.event-badge.closed` | Registration closed |
| `.event-badge.results-published` | Results live |
| `.event-badge.seats-low` | ≤10 seats left |
| `.event-cat-badge` | Category label on card image |

## Icons

Use `<FestIcon name="…" />` with names from `iconUtils.js` (`globe`, `mic`, `laptop`, `music`, etc.). Icons sit in `.highlight-icon-wrap` or `.rewind-icon-wrap` (52–56px rounded square, gold tint background). Never use emoji in new UI.

## Section spacing

- Default section: `padding: 4.5rem 0` (`.section`)
- Container max-width: `1200px` (`.container`)
- Section heading margin-bottom: `2.5rem`
- Grid gaps: `1.25–1.5rem`

## Image overlays

- Hero: `linear-gradient` dark overlay (`hero-overlay-strong`) — 72% → 96% opacity.
- Event cards: `.event-card-image-overlay` — bottom gradient for badge legibility.
- Page headers: same treatment via `PageHeader` component.
- Photography: Unsplash placeholders via `assets.js` — consistent `w=1200&q=80&fit=crop`. Replace by updating `assets.js` or CMS upload fields.

## Animation timing

- Scroll reveal: `0.5s ease-out` (respects `prefers-reduced-motion`)
- Hover transitions: `0.2s` color/border/shadow
- Seats bar fill: `0.4s ease`
- Avoid looping animations on content; hero floaters disabled in production polish.

## Accessibility

- Skip link: `.skip-link` → `#main-content`
- Focus rings on all interactive elements
- `aria-label` on icon-only controls
- Form errors: `role="alert"`; success: `role="status"` + `aria-live="polite"`

## Admin CMS

Forms use `.admin-form`, `.admin-form-field`, `.form-success`, `.admin-image-preview`. Tables use `.admin-table` with bulk actions in `.admin-table-toolbar`.

---

For implementation tokens in JS, import from `designSystem.js`. For fest copy defaults, see `brand.js` and `cmsUtils.js` fallbacks.
