/**
 * MacFiesta Pro — Official brand configuration.
 * Replace values here when official MACFAST/MacFiesta assets are finalized.
 */

export const BRAND = {
  festName: "MacFiesta",
  shortName: "MacFiesta",
  festNameUpper: "MACFIESTA",
  festYear: 2026,
  year: 2026,
  festFullName: "MACFIESTA 2026",
  tagline: "Where Legends Rise",
  subtitle: "2026's Most Awaited Fest",
  collegeName: "MACFAST",
  collegeFullName: "Mar Athanasios College for Advanced Studies",
  officialWebsite: "https://macfiesta.macfast.org/",
  venue: "MACFAST Campus, Thiruvalla",
  location: "Pathanamthitta, Kerala, India",
  email: "fest@macfast.ac.in",
  phone: "+91 98765 43210",
  contactEmail: "fest@macfast.ac.in",
  contactPhone: "+91 98765 43210",
  registrationHelpEmail: "registrations@macfast.ac.in",
  registrationHelpPhone: "+91 98765 43211",
  webTeamCredit: "Managed by MacFiesta Web Team",

  importantDates: {
    registrationOpens: "2026-08-01",
    festStart: "2026-09-24",
    festEnd: "2026-09-26",
    resultsDesk: "During fest days at the result desk",
  },

  socialLinks: {
    website: "https://macfiesta.macfast.org/",
    instagram: "https://instagram.com/macfiesta",
    youtube: "https://youtube.com/@macfiesta",
    facebook: "https://facebook.com/macfiesta",
  },

  logo: {
    mark: "/assets/official/macfiesta-mark.png",
    lockup: "/assets/official/macfiesta-logo.png",
    footer: "/assets/official/macfiesta-logo.png",
    favicon: "/assets/official/macfiesta-logo-192.png",
    src: "/assets/official/macfiesta-mark.png",
    alt: "MacFiesta — United to Excel",
    initials: "MF",
    text: "MacFiesta",
  },

  colors: {
    navy950: "#04040f",
    navy900: "#08081a",
    navy800: "#0f0f24",
    gold: "#d4af37",
    goldLight: "#e8c547",
    goldDark: "#b8941f",
    white: "#f8f7fc",
    muted: "#9490a8",
    accent: "#6c3fcf",
  },

  typography: {
    display: '"Playfair Display", Georgia, serif',
    body: '"DM Sans", system-ui, sans-serif',
  },

  spacing: {
    sectionY: "5rem",
    containerPad: "1.5rem",
  },

  radius: {
    sm: "8px",
    md: "16px",
    lg: "24px",
  },
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
