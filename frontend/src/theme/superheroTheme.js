/**
 * MacFiesta Pro 2026 — Official fest theme: MARVEL × DC
 * Modern cinematic comic energy (not retro).
 *
 * Visuals use ORIGINAL artwork only — no official studio logos,
 * character costumes, posters, or trademarked symbols.
 */

export const SUPERHERO_THEME = {
  name: "Marvel × DC",
  year: 2026,
  titleDisplay: "MACFIESTA 2026 — MARVEL × DC",
  tagline: "Heroes Rise. Legends Compete.",
  altTagline: "Two Universes. One Ultimate Fest.",
  subtitle: "MARVEL × DC — SUPERHERO UNIVERSE",
  styleNote: "modern-cinematic", // not retro

  factions: {
    marvel: {
      id: "marvel",
      name: "Marvel Universe",
      short: "Marvel",
      champion: "Scarlet Orbit",
      motto: "Power. Teamwork. Legend.",
      color: "#e11d2e",
      soft: "#ff4d5a",
    },
    dc: {
      id: "dc",
      name: "DC Universe",
      short: "DC",
      champion: "Cobalt Vigil",
      motto: "Justice. Strength. Legacy.",
      color: "#1e6bff",
      soft: "#4d8cff",
    },
  },

  colors: {
    void: "#03040a",
    navy: "#070b16",
    charcoal: "#0e1422",
    panel: "#141b2c",
    panelRaised: "#1a2238",
    heroRed: "#e11d2e",
    heroRedSoft: "#ff4d5a",
    electricBlue: "#1e6bff",
    electricBlueSoft: "#4d8cff",
    gold: "#f0c14b",
    goldSoft: "#ffd666",
    silver: "#c8d0dc",
    purple: "#7c3aed",
    purpleDeep: "#2e1065",
    cyan: "#22d3ee",
    white: "#f4f6fb",
    muted: "#9aa3b5",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#38bdf8",
  },

  typography: {
    display: '"Oswald", "Arial Narrow", sans-serif',
    hud: '"Rajdhani", "Segoe UI", sans-serif',
    body: '"Source Sans 3", "Segoe UI", system-ui, sans-serif',
  },

  categoryDisplay: {
    tech: "Technology Division",
    technology: "Technology Division",
    management: "Management Division",
    cultural: "Cultural Division",
    creative: "Creative Division",
    gaming: "Gaming Division",
    dance: "Cultural Division",
    music: "Music Division",
    literary: "Creative Division",
    literature: "Creative Division",
    food: "Food Operations",
    general: "General Events",
    arts: "Arts Division",
    sports: "Sports Force",
    photography: "Lens Division",
    workshops: "Workshop Corps",
    stage: "Main Stage",
  },

  committeeDisplay: {
    core: "Core Command",
    finance: "Finance Division",
    event: "Event Operations",
    cultural: "Cultural Force",
    hospitality: "Hospitality Unit",
    publicity: "Publicity Command",
    verification: "Verification Squad",
    invitation: "Invitation Unit",
    food: "Food Division",
    program: "Program Force",
  },

  pageTitles: {
    home: "Marvel × DC",
    events: "Event Arenas",
    schedule: "Fest Schedule",
    gallery: "Fest Gallery",
    results: "Hall of Heroes",
    dashboard: "Hero Command Center",
    admin: "Mission Control",
    login: "Secure Portal",
    register: "Create Account",
    pass: "Hero Pass",
    committees: "Committees",
    sponsors: "Sponsors",
    contact: "Contact",
  },

  status: {
    pending: { label: "Pending", tone: "warning" },
    under_review: { label: "Under Review", tone: "info" },
    paid: { label: "Verified", tone: "success" },
    waived: { label: "Waived", tone: "info" },
    verified: { label: "Verified", tone: "success" },
    waitlisted: { label: "Waitlist", tone: "purple" },
    cancelled: { label: "Cancelled", tone: "danger" },
    published: { label: "Published", tone: "gold" },
    draft: { label: "Draft", tone: "muted" },
    failed: { label: "Rejected", tone: "danger" },
    rejected: { label: "Rejected", tone: "danger" },
    refunded: { label: "Refunded", tone: "muted" },
    allocated: { label: "Allocated", tone: "info" },
    checked_in: { label: "Checked In", tone: "success" },
    checked_out: { label: "Checked Out", tone: "muted" },
    none: { label: "Not required", tone: "muted" },
    approved: { label: "Active", tone: "success" },
  },
};

export default SUPERHERO_THEME;
