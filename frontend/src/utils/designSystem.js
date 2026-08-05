/**
 * MacFiesta Pro — Design system tokens (mirrors App.css :root).
 * Use for JS-driven styling; CSS remains source of truth for components.
 */

import { BRAND } from "./brand";

export const DESIGN = {
  colors: {
    navy950: "#04040f",
    navy900: "#08081a",
    navy800: "#0f0f24",
    navy700: "#161632",
    surface: "#12121f",
    surfaceRaised: "#18182a",
    gold400: "#e8c547",
    gold500: "#d4af37",
    gold600: "#c9a227",
    white: "#f8f7fc",
    muted: "#9490a8",
    mutedDark: "#5c5870",
    borderSubtle: "rgba(255, 255, 255, 0.08)",
    overlayDark: "rgba(4, 4, 15, 0.75)",
  },

  typography: {
    fontDisplay: BRAND.typography.display,
    fontBody: BRAND.typography.body,
    scale: {
      eyebrow: "0.75rem",
      body: "1rem",
      bodySm: "0.92rem",
      h1: "clamp(2rem, 5vw, 3.25rem)",
      h2: "clamp(1.75rem, 4vw, 2.75rem)",
      h3: "1.25rem",
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
    containerPad: "1.5rem",
    stackSm: "0.5rem",
    stackMd: "1rem",
    stackLg: "1.5rem",
    stackXl: "2.5rem",
  },

  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    pill: "999px",
  },

  shadow: {
    card: "0 4px 24px rgba(0, 0, 0, 0.28)",
    cardHover: "0 8px 32px rgba(0, 0, 0, 0.35)",
    nav: "0 4px 24px rgba(0, 0, 0, 0.25)",
  },

  motion: {
    fast: "0.15s ease",
    base: "0.25s ease",
    slow: "0.4s ease",
  },

  layout: {
    container: "1200px",
    navHeight: "72px",
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

  imageOverlay: "linear-gradient(180deg, rgba(4,4,15,0.55) 0%, rgba(4,4,15,0.88) 100%)",
};

export default DESIGN;
