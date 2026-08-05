import { mediaUrl } from "../services/api";
import { BRAND, FEST_DATE } from "./brand";
import {
  EVENT_FORMATS,
  CATEGORIES,
  GUEST_PROFILES,
  FEST_THEME,
  FEST_THEME_DESC,
  REWIND_HIGHLIGHTS,
  TESTIMONIALS,
  FAQ_ITEMS,
  SPONSORS,
  SPONSOR_TIERS,
} from "./constants";
import { heroImage, aboutImage, themeImage } from "./assets";

const CATEGORY_COLORS = [
  "#5b7cfa", "#e07a5f", "#2ec4b6", "#e879a9", "#9b8afb",
  "#d4a843", "#5ba3e8", "#4ec9a0", "#e8c547", "#d4956a",
];

function slugify(text = "") {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "category";
}

export function resolveSiteSettings(apiList = []) {
  const s = apiList[0];
  if (!s) {
    return {
      fest_name: BRAND.festName,
      fest_year: BRAND.festYear,
      tagline: BRAND.tagline,
      college_name: BRAND.collegeName,
      hero_title: BRAND.festNameUpper,
      hero_subtitle: BRAND.subtitle,
      hero_description: "Three days of national-level competitions, cultural showcases, and campus energy at MACFAST, Thiruvalla.",
      fest_date: FEST_DATE.toISOString().slice(0, 10),
      venue: BRAND.venue,
      location: BRAND.location,
      contact_email: BRAND.contactEmail,
      contact_phone: BRAND.contactPhone,
      official_website: BRAND.officialWebsite,
      instagram_url: BRAND.socialLinks.instagram,
      youtube_url: BRAND.socialLinks.youtube,
      facebook_url: BRAND.socialLinks.facebook,
      hero_image_url: heroImage,
      about_image_url: aboutImage,
      about_title: "Three days. One campus. Every arena.",
      about_body: "Macfiesta brings together student teams from across India for tech battles, cultural nights, and main-stage performances — hosted at Mar Athanasios College for Advanced Studies, Thiruvalla.",
      logo_image_url: BRAND.logo.mark,
      terms_body: "",
      privacy_body: "",
    };
  }
  return {
    ...s,
    hero_image_url: mediaUrl(s.hero_image) || heroImage,
    about_image_url: mediaUrl(s.about_image) || aboutImage,
    logo_image_url: mediaUrl(s.logo_image) || BRAND.logo.mark,
    terms_body: s.terms_body || "",
    privacy_body: s.privacy_body || "",
  };
}

export function resolveHighlights(items = []) {
  const active = items.filter((h) => h.is_active !== false);
  if (!active.length) {
    return [
      { icon: "globe", title: "National Participation", description: "Student teams from colleges across India compete at MACFAST campus venues over three festival days." },
      { icon: "mic", title: "Main Stage & Cultural Night", description: "Evening performances, fashion walks, and DJ night at the open-air main stage." },
      { icon: "clipboard", title: "Live Fest Desk", description: "Registration counts, schedules, and results — updated in real time on MacFiesta Pro." },
    ];
  }
  return active.map((h) => ({ icon: h.icon, title: h.title, description: h.description, desc: h.description }));
}

export function resolveCategoryContents(items = []) {
  const active = items.filter((c) => c.is_active !== false);
  if (!active.length) return CATEGORIES;
  return active.map((c, i) => ({
    id: c.id,
    label: c.name,
    name: c.name,
    slug: slugify(c.name),
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    icon: c.icon,
    description: c.description,
    image: mediaUrl(c.image),
  }));
}

export function resolveEventFormats(items = []) {
  const active = items.filter((f) => f.is_active !== false);
  if (!active.length) {
    return EVENT_FORMATS.map((f) => ({
      label: f.label,
      title: f.label,
      description: f.desc,
      desc: f.desc,
      link: f.link,
    }));
  }
  return active.map((f) => ({
    id: f.id,
    label: f.label,
    title: f.title,
    description: f.description,
    desc: f.description,
    link: "/events",
  }));
}

export function resolveGuestProfiles(items = []) {
  const active = items.filter((g) => g.is_active !== false);
  if (!active.length) return GUEST_PROFILES;
  return active.map((g) => ({
    name: g.name,
    role: g.role,
    bio: g.description,
    description: g.description,
    image: mediaUrl(g.image) || GUEST_PROFILES[0]?.image,
    alt: g.name ? `${g.name} — Macfiesta guest` : GUEST_PROFILES[0]?.alt,
  }));
}

export function resolveThemeSection(items = []) {
  const active = items.filter((t) => t.is_active !== false);
  const t = active[0];
  if (!t) {
    return { eyebrow: "This year's theme", title: FEST_THEME, description: FEST_THEME_DESC, image: themeImage };
  }
  return {
    eyebrow: t.eyebrow || "This year's theme",
    title: t.title,
    description: t.description,
    image: mediaUrl(t.image),
  };
}

export function resolveTestimonials(items = []) {
  const active = items.filter((t) => t.is_active !== false);
  if (!active.length) return TESTIMONIALS;
  return active.map((t) => ({ quote: t.quote, name: t.name, role: t.role }));
}

export function resolveFaqs(items = []) {
  const active = items.filter((f) => f.is_active !== false);
  if (!active.length) return FAQ_ITEMS.map((f) => ({ q: f.q, a: f.a, question: f.q, answer: f.a }));
  return active.map((f) => ({ q: f.question, a: f.answer, question: f.question, answer: f.answer }));
}

export function resolveSponsors(items = []) {
  const active = items.filter((s) => s.is_active !== false);
  if (!active.length) return SPONSORS.map((s) => ({ name: s.name, tier: s.tier, sponsor_type: s.tier, logo: s.logo, alt: s.alt }));
  return active.map((s) => ({
    id: s.id,
    name: s.name,
    tier: s.sponsor_type,
    sponsor_type: s.sponsor_type,
    logo: mediaUrl(s.logo),
    alt: s.name ? `${s.name} sponsor logo` : undefined,
    website: s.website,
  }));
}

export function resolveSponsorTiers(items = []) {
  const sponsors = resolveSponsors(items);
  if (!items.length) return SPONSOR_TIERS;
  const groups = {};
  sponsors.forEach((s) => {
    const key = s.sponsor_type || "Partner";
    if (!groups[key]) groups[key] = [];
    groups[key].push({ name: s.name, tag: s.sponsor_type, logo: s.logo, alt: s.alt || `${s.name} sponsor logo` });
  });
  const order = ["Host", "Title", "Gold", "Silver", "Partner", "Media"];
  return order
    .filter((k) => groups[k]?.length)
    .map((k) => ({
      title: `${k} Sponsors`,
      size: k === "Host" || k === "Title" ? "large" : "default",
      sponsors: groups[k],
    }));
}

export function resolveHomepageSections(items = []) {
  if (!items.length) return null;
  const map = {};
  items.forEach((s) => { map[s.section_key] = s; });
  return map;
}

export function isSectionVisible(sectionsMap, key, defaultVisible = true) {
  if (!sectionsMap || !sectionsMap[key]) return defaultVisible;
  return sectionsMap[key].is_visible !== false;
}

export function getSectionMeta(sectionsMap, key, defaults = {}) {
  const s = sectionsMap?.[key];
  return {
    title: s?.title || defaults.title || "",
    subtitle: s?.subtitle || defaults.subtitle || "",
  };
}

export const REWIND_FALLBACK = REWIND_HIGHLIGHTS;

export function resolveFestRewind(items = []) {
  const active = items.filter((i) => i.is_active !== false);
  if (!active.length) return REWIND_HIGHLIGHTS;
  return active.map((i) => ({
    title: i.title,
    image: mediaUrl(i.image) || REWIND_HIGHLIGHTS[0]?.image,
    alt: i.title ? `${i.title} — Macfiesta rewind` : REWIND_HIGHLIGHTS[0]?.alt,
  }));
}
