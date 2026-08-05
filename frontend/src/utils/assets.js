/** Official MacFiesta media — all paths under /assets/official/ */

const O = (path) => `/assets/official/${path}`;

export const heroImage = O("hero/hero-poster.webp");
export const heroVideo = O("hero/hero-720p.mp4");
export const heroVideoMobile = O("hero/hero-480p.mp4");
export const aboutImage = O("about/about.webp");
export const ctaImage = O("pages/sponsors-bg.webp");
export const sponsorsBackgroundImage = O("pages/sponsors-bg.webp");
export const defaultEventImage = O("events/event-01.webp");

export const categoryImages = {
  tech: O("categories/tech.webp"),
  arts: O("categories/arts.webp"),
  music: O("categories/music.webp"),
  dance: O("categories/dance.webp"),
  gaming: O("categories/gaming.webp"),
  management: O("categories/management.webp"),
  literary: O("categories/literary.webp"),
  photography: O("categories/photography.webp"),
  sports: O("categories/sports.webp"),
  workshops: O("categories/workshops.webp"),
  cultural: O("categories/cultural.webp"),
  crowd: O("categories/crowd.webp"),
  stage: O("categories/stage.webp"),
  winners: O("categories/winners.webp"),
  general: O("categories/general.webp"),
  default: defaultEventImage,
};

const GALLERY_META = [
  { title: "Main Stage — Opening Night", category: "stage" },
  { title: "Cultural Night Performances", category: "cultural" },
  { title: "Open Air Crowd", category: "crowd" },
  { title: "Tech Arena Finals", category: "tech" },
  { title: "Dance Floor", category: "cultural" },
  { title: "Result Desk Ceremony", category: "winners" },
  { title: "DJ Night", category: "crowd" },
  { title: "Coding Marathon", category: "tech" },
  { title: "Grand Finale Stage", category: "stage" },
  { title: "Gaming Lounge", category: "tech" },
];

export const galleryPlaceholders = GALLERY_META.map((item, i) => ({
  id: `g${i + 1}`,
  title: item.title,
  category: item.category,
  uploaded_at: `2025-09-${String(20 + (i % 5)).padStart(2, "0")}T18:00:00Z`,
  src: O(`gallery/gallery-${String(i + 1).padStart(2, "0")}.webp`),
  alt: `${item.title} at Macfiesta`,
}));

export const sponsorPlaceholders = [
  { name: "MACFAST", tier: "Host", logo: O("sponsors/sponsor-macfast.png"), alt: "MACFAST sponsor logo" },
  { name: "Federal Bank", tier: "Title", logo: O("sponsors/sponsor-federal.png"), alt: "Federal Bank sponsor logo" },
  { name: "HDFC Bank", tier: "Title", logo: O("sponsors/sponsor-hdfc.png"), alt: "HDFC Bank sponsor logo" },
  { name: "Coca-Cola", tier: "Gold", logo: O("sponsors/sponsor-cocacola.png"), alt: "Coca-Cola sponsor logo" },
  { name: "Campus Partner", tier: "Gold", logo: O("sponsors/sponsor-02.png"), alt: "Campus partner sponsor logo" },
  { name: "Event Partner", tier: "Silver", logo: O("sponsors/sponsor-03.png"), alt: "Event partner sponsor logo" },
];

export function getEventFallbackImage(category) {
  if (!category) return categoryImages.default;
  return categoryImages[category] || categoryImages.default;
}

export const PAGE_IMAGES = {
  hero: heroImage,
  about: aboutImage,
  cta: ctaImage,
  sponsors: sponsorsBackgroundImage,
  results: O("pages/results.webp"),
  events: categoryImages.tech,
  schedule: O("pages/schedule.webp"),
  gallery: O("pages/gallery-header.webp"),
  login: O("pages/login.webp"),
  campus: categoryImages.general,
  crowd: categoryImages.crowd,
  stage: categoryImages.stage,
};

export const guestPlaceholder = O("guests/guest-akhil-marar.webp");
export const themeImage = O("theme/retro-01.webp");
export const officialLogo = O("macfiesta-logo.png");
export const HERO_IMAGE = heroImage;
export const CATEGORY_IMAGES = categoryImages;
export const GALLERY_PLACEHOLDERS = galleryPlaceholders;

export const rewindImages = {
  music: O("rewind/rewind-music.webp"),
  cultural: O("rewind/rewind-cultural.webp"),
  fashion: O("rewind/rewind-fashion.webp"),
  djNight: O("rewind/rewind-dj-night.webp"),
};

export function getCategoryImage(category) {
  return getEventFallbackImage(category);
}
