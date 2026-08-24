/** Original multiverse category emblems — not based on any studio IP. */

const ICONS = {
  tech: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 4l16 8v12c0 10-7 18-16 20-9-2-16-10-16-20V12l16-8z" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="22" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M24 16v12M18 22h12" stroke="currentColor" strokeWidth="2" />
      <path d="M14 14l4 3M34 14l-4 3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  technology: null, // alias set below
  arts: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M10 34c0-10 8-18 18-18 2 0 4 .4 6 1" stroke="currentColor" strokeWidth="2" />
      <circle cx="28" cy="16" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 36l8-10 6 4 10-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 40h28" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  music: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M18 36V12l20-4v24" stroke="currentColor" strokeWidth="2" />
      <circle cx="14" cy="36" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="34" cy="32" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M24 8l4 8M36 10l-3 7" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
    </svg>
  ),
  dance: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="10" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M24 14l-8 10 4 2-2 14M24 14l8 8-2 4 6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 22h8M28 20h8" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    </svg>
  ),
  gaming: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M8 20c0-4 3-8 8-8h16c5 0 8 4 8 8v8c0 6-4 10-10 10h-4l-2 4h-4l-2-4h-4c-6 0-10-4-10-10v-8z" stroke="currentColor" strokeWidth="2" />
      <path d="M16 24h6M19 21v6M30 22v4M34 24h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  management: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M8 38V12l16-6 16 6v26" stroke="currentColor" strokeWidth="2" />
      <path d="M16 38V22h16v16" stroke="currentColor" strokeWidth="2" />
      <path d="M16 28h16M24 22v16" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  literary: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M10 8h12c4 0 6 2 6 6v24c-2-2-4-3-6-3H10V8zM38 8H26c-4 0-6 2-6 6v24c2-2 4-3 6-3h12V8z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 16h6M14 22h8M28 16h6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  literature: null,
  photography: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="6" y="14" width="36" height="26" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="27" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="27" r="3" fill="currentColor" />
      <path d="M16 14l3-6h10l3 6" stroke="currentColor" strokeWidth="2" />
      <path d="M34 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  food: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M12 18c0-6 5-10 12-10s12 4 12 10v4H12v-4z" stroke="currentColor" strokeWidth="2" />
      <path d="M10 22h28v4c0 8-6 14-14 14S10 34 10 26v-4z" stroke="currentColor" strokeWidth="2" />
      <path d="M18 12v4M24 10v6M30 12v4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  sports: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" />
      <path d="M8 24h32M24 8c6 4 10 10 10 16s-4 12-10 16c-6-4-10-10-10-16s4-12 10-16z" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  workshops: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M20 8l4-4 4 4v6l6 4-2 6-6-2-4 6-4-6-6 2-2-6 6-4V8z" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="20" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 36h16M20 36v6M28 36v6" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  cultural: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M8 36V16l16-8 16 8v20" stroke="currentColor" strokeWidth="2" />
      <path d="M16 36V22h16v14" stroke="currentColor" strokeWidth="2" />
      <path d="M24 8v8" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  general: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 6l14 8v12c0 9-6 16-14 18-8-2-14-9-14-18V14l14-8z" stroke="currentColor" strokeWidth="2" />
      <path d="M18 24l4 4 8-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

ICONS.technology = ICONS.tech;
ICONS.literature = ICONS.literary;

export default function CategoryIcon({ id }) {
  const key = String(id || "tech").toLowerCase();
  return (
    <span className="multiverse-cat-icon">
      {ICONS[key] || ICONS.general}
    </span>
  );
}
