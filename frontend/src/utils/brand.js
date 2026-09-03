/**
 * MacFiesta Pro — 2026 brand: Marvel × DC (modern cinematic, not retro).
 * Official logos / character art are never embedded; theme naming only.
 * Contact phones/emails/social come from VITE_* env (fallback empty / CMS).
 */

import { SUPERHERO_THEME } from "../theme/superheroTheme";

function envStr(name, fallback = "") {
  const raw = import.meta.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  return String(raw).trim();
}

export const BRAND = {
  festName: "MacFiesta",
  shortName: "MacFiesta",
  festNameUpper: "MACFIESTA",
  festYear: 2026,
  year: 2026,
  festFullName: "MACFIESTA 2026",
  themeName: SUPERHERO_THEME.name,
  themeLabel: SUPERHERO_THEME.titleDisplay,
  themeSubtitle: SUPERHERO_THEME.subtitle,
  tagline: SUPERHERO_THEME.tagline,
  altTagline: SUPERHERO_THEME.altTagline,
  subtitle: "National-level school and college festival",
  collegeName: "MACFAST",
  collegeFullName: "Mar Athanasios College for Advanced Studies",
  officialWebsite: envStr("VITE_OFFICIAL_WEBSITE", "https://macfiesta.macfast.org/"),
  venue: envStr("VITE_VENUE", "MACFAST Campus, Thiruvalla"),
  location: envStr("VITE_LOCATION", "Thiruvalla, Kerala, India"),
  email: envStr("VITE_CONTACT_EMAIL", ""),
  phone: envStr("VITE_CONTACT_PHONE", ""),
  contactEmail: envStr("VITE_CONTACT_EMAIL", ""),
  contactPhone: envStr("VITE_CONTACT_PHONE", ""),
  registrationHelpEmail: envStr("VITE_REGISTRATION_HELP_EMAIL", ""),
  registrationHelpPhone: envStr("VITE_REGISTRATION_HELP_PHONE", ""),
  webTeamCredit: "Managed by MacFiesta Web Team",

  importantDates: {
    registrationOpens: envStr("VITE_REGISTRATION_OPENS", "2026-08-01"),
    festStart: envStr("VITE_FEST_START", "2026-09-24"),
    festEnd: envStr("VITE_FEST_END", "2026-09-25"),
    resultsDesk: "During fest days at the result desk",
  },

  socialLinks: {
    website: envStr("VITE_OFFICIAL_WEBSITE", "https://macfiesta.macfast.org/"),
    instagram: envStr("VITE_INSTAGRAM_URL", "https://instagram.com/macfiesta2k26"),
    youtube: envStr("VITE_YOUTUBE_URL", "https://youtube.com/@macfiesta4285?si=pxB1LrqPgitwLjly"),
    facebook: envStr("VITE_FACEBOOK_URL", "https://facebook.com/macfiesta"),
  },

  logo: {
    mark: "/logo.png",
    lockup: "/logo.png",
    footer: "/logo.png",
    favicon: "/logo.png",
    src: "/logo.png",
    alt: "MacFiesta 2K26 — United to Excel",
    initials: "MF",
    text: "MacFiesta",
  },

  colors: {
    navy950: SUPERHERO_THEME.colors.void,
    navy900: SUPERHERO_THEME.colors.navy,
    navy800: SUPERHERO_THEME.colors.charcoal,
    gold: SUPERHERO_THEME.colors.gold,
    goldLight: SUPERHERO_THEME.colors.goldSoft,
    goldDark: "#d4a017",
    white: SUPERHERO_THEME.colors.white,
    muted: SUPERHERO_THEME.colors.muted,
    accent: SUPERHERO_THEME.colors.electricBlue,
    heroRed: SUPERHERO_THEME.colors.heroRed,
    electricBlue: SUPERHERO_THEME.colors.electricBlue,
    purple: SUPERHERO_THEME.colors.purple,
  },

  typography: {
    display: SUPERHERO_THEME.typography.display,
    hud: SUPERHERO_THEME.typography.hud,
    body: SUPERHERO_THEME.typography.body,
  },

  spacing: {
    sectionY: "4.5rem",
    containerPad: "1.25rem",
  },

  radius: {
    sm: "2px",
    md: "4px",
    lg: "8px",
  },

  factions: SUPERHERO_THEME.factions,
};

export const {
  festName,
  shortName,
  festYear,
  year,
  festFullName,
  tagline,
  collegeName,
  officialWebsite,
  venue,
  contactEmail,
  contactPhone,
  email,
  phone,
} = BRAND;

export const FEST_DATE = new Date(`${BRAND.importantDates.festStart}T09:00:00`);

export function formatFestDateRange() {
  const start = new Date(`${BRAND.importantDates.festStart}T12:00:00`);
  const end = new Date(`${BRAND.importantDates.festEnd}T12:00:00`);
  if (
    Number.isFinite(start.getTime()) &&
    Number.isFinite(end.getTime()) &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    const month = start.toLocaleDateString("en-GB", { month: "long" });
    return `${start.getDate()}–${end.getDate()} ${month} ${start.getFullYear()}`;
  }
  const opts = { day: "numeric", month: "long", year: "numeric" };
  return `${start.toLocaleDateString("en-GB", opts)} – ${end.toLocaleDateString("en-GB", opts)}`;
}

