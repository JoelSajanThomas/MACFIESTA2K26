/**
 * MacFiesta Pro — Design system tokens (mirrors superhero-theme.css :root).
 */

import { BRAND } from "./brand";
import { SUPERHERO_THEME } from "../theme/superheroTheme";

export const DESIGN = {
  theme: SUPERHERO_THEME.name,
  factions: SUPERHERO_THEME.factions,
  pageTitles: SUPERHERO_THEME.pageTitles,
  colors: {
    navy950: SUPERHERO_THEME.colors.void,
    navy900: SUPERHERO_THEME.colors.navy,
    navy800: SUPERHERO_THEME.colors.charcoal,
    navy700: SUPERHERO_THEME.colors.panelRaised,
    surface: SUPERHERO_THEME.colors.panel,
    surfaceRaised: SUPERHERO_THEME.colors.panelRaised,
    gold400: SUPERHERO_THEME.colors.goldSoft,
    gold500: SUPERHERO_THEME.colors.gold,
    gold600: "#d4a017",
    heroRed: SUPERHERO_THEME.colors.heroRed,
    electricBlue: SUPERHERO_THEME.colors.electricBlue,
    purple: SUPERHERO_THEME.colors.purple,
    silver: SUPERHERO_THEME.colors.silver,
    white: SUPERHERO_THEME.colors.white,
    muted: SUPERHERO_THEME.colors.muted,
    mutedDark: "#6b7385",
    borderSubtle: "rgba(255, 255, 255, 0.1)",
    overlayDark: "rgba(5, 6, 12, 0.78)",
  },

  typography: {
    fontDisplay: BRAND.typography.display,
    fontHud: BRAND.typography.hud,
    fontBody: BRAND.typography.body,
    scale: {
      eyebrow: "0.75rem",
      body: "1rem",
      bodySm: "0.92rem",
      h1: "clamp(2.25rem, 6vw, 4rem)",
      h2: "clamp(1.75rem, 4vw, 2.75rem)",
      h3: "1.2rem",
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  spacing: {
    sectionY: "4.5rem",
    sectionYMobile: "2.75rem",
    containerPad: "1.25rem",
    stackSm: "0.5rem",
    stackMd: "1rem",
    stackLg: "1.5rem",
    stackXl: "2.5rem",
  },

  radius: {
    sm: "2px",
    md: "4px",
    lg: "8px",
    xl: "12px",
    pill: "999px",
    clip: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
  },

  shadow: {
    card: "0 10px 36px rgba(0, 0, 0, 0.35)",
    cardHover: "0 14px 40px rgba(0, 0, 0, 0.4)",
    nav: "0 8px 32px rgba(0, 0, 0, 0.45)",
    glowBlue: "0 0 24px rgba(30, 107, 255, 0.35)",
    glowRed: "0 0 24px rgba(225, 29, 46, 0.35)",
  },

  motion: {
    fast: "0.15s ease",
    base: "0.25s ease",
    slow: "0.4s ease",
  },

  layout: {
    container: "1180px",
    navHeight: "64px",
  },

  logo: {
    usage: {
      mark: "Navbar, favicon, compact UI",
      lockup: "Hero, official headers",
      footer: "Footer wordmark",
    },
  },

  buttons: {
    primary: "btn btn-gold",
    secondary: "btn btn-outline",
    ghost: "btn btn-card",
    sizes: { sm: "btn-sm", lg: "btn-lg", full: "btn-full" },
  },

  badges: {
    open: "event-badge open",
    closed: "event-badge closed",
    results: "event-badge results-published",
    category: "event-cat-badge",
  },

  categoryDisplay: SUPERHERO_THEME.categoryDisplay,
  committeeDisplay: SUPERHERO_THEME.committeeDisplay,

  imageOverlay:
    "linear-gradient(180deg, rgba(5,6,12,0.45) 0%, rgba(5,6,12,0.88) 100%)",
};

export default DESIGN;
