import { BRAND, FEST_DATE } from "./brand";
import {
  heroImage,
  aboutImage,
  ctaImage,
  sponsorsBackgroundImage,
  categoryImages,
  galleryPlaceholders,
  sponsorPlaceholders,
  defaultEventImage,
  getEventFallbackImage,
  getCategoryImage,
  PAGE_IMAGES,
  HERO_IMAGE,
  guestPlaceholder,
  CATEGORY_IMAGES,
  GALLERY_PLACEHOLDERS,
  rewindImages,
} from "./assets";

export { BRAND, FEST_DATE };
export {
  heroImage,
  aboutImage,
  ctaImage,
  sponsorsBackgroundImage,
  categoryImages,
  galleryPlaceholders,
  sponsorPlaceholders,
  defaultEventImage,
  getEventFallbackImage,
  getCategoryImage,
  PAGE_IMAGES,
  HERO_IMAGE,
  CATEGORY_IMAGES,
  GALLERY_PLACEHOLDERS,
};

export const FEST_YEAR = BRAND.festYear;
export const FEST_VENUE = BRAND.venue;
export const FEST_LOCATION = BRAND.location.split(",")[0];
export const OFFICIAL_SITE = BRAND.officialWebsite;
export const FEST_TAGLINE = BRAND.tagline;
export const FEST_SUBTITLE = BRAND.subtitle;
export const FEST_THEME = "Retro Fiesta";
export const FEST_THEME_DESC =
  "A vibrant throwback celebration — neon lights, classic beats, and campus nights that feel timeless.";

export const EVENT_FORMATS = [
  { id: "solo", label: "Solo", desc: "Walk in alone — one participant, one shot at the podium.", link: "/events" },
  { id: "duo", label: "Duo", desc: "Pair up with a teammate for two-person competitions.", link: "/events" },
  { id: "trio", label: "Trio", desc: "Form a three-member team for group-format events.", link: "/events" },
  { id: "squad", label: "Squad", desc: "Four students per squad — common for gaming and tech battles.", link: "/events" },
  { id: "group", label: "Group", desc: "Full crew events for cultural performances and stage acts.", link: "/events" },
];

export const CATEGORIES = [
  { id: "tech", label: "Technology", slug: "tech", color: "#5b7cfa" },
  { id: "arts", label: "Arts", slug: "arts", color: "#e07a5f" },
  { id: "music", label: "Music", slug: "music", color: "#2ec4b6" },
  { id: "dance", label: "Dance", slug: "dance", color: "#e879a9" },
  { id: "gaming", label: "Gaming", slug: "gaming", color: "#9b8afb" },
  { id: "management", label: "Management", slug: "management", color: "#d4a843" },
  { id: "literary", label: "Literary", slug: "literary", color: "#5ba3e8" },
  { id: "photography", label: "Photography", slug: "photography", color: "#4ec9a0" },
  { id: "sports", label: "Sports", slug: "sports", color: "#e8c547" },
  { id: "workshops", label: "Workshops", slug: "workshops", color: "#d4956a" },
];

export const REWIND_HIGHLIGHTS = [
  { title: "Music Band", image: rewindImages.music, alt: "Macfiesta music band performance" },
  { title: "Cultural Events", image: rewindImages.cultural, alt: "Macfiesta cultural events crowd" },
  { title: "Fashion", image: rewindImages.fashion, alt: "Macfiesta fashion show" },
  { title: "DJ Night", image: rewindImages.djNight, alt: "Macfiesta DJ night" },
];

export const GUEST_PROFILES = [
  {
    name: "Akhil Marar",
    role: "Director & Writer",
    bio: "Guest session with the Bigg Boss Malayalam Season 5 winner — an open conversation on cinema, storytelling, and campus life.",
    image: guestPlaceholder,
    alt: "Akhil Marar — Macfiesta guest",
  },
];

export const ANNOUNCEMENT_PLACEHOLDERS = [
  {
    id: "ph1",
    title: "Macfiesta 2026 — Registration Desk Open",
    message: "Visit the registration desk online: browse competitions, check venue slots, and confirm your entry before events fill up.",
    is_active: true,
    created_at: "2026-08-01T09:00:00Z",
    isPlaceholder: true,
  },
  {
    id: "ph2",
    title: "Campus Venue Map Published",
    message: "Main stage, tech arena, and cultural hall timings are now on the Schedule page.",
    is_active: true,
    created_at: "2026-08-10T11:00:00Z",
    isPlaceholder: true,
  },
  {
    id: "ph3",
    title: "Guest Session — Akhil Marar",
    message: "An evening session with director Akhil Marar at the auditorium.",
    is_active: true,
    created_at: "2026-08-15T14:00:00Z",
    isPlaceholder: true,
  },
];

export const SPONSORS = sponsorPlaceholders.map(({ name, tier, logo, alt }) => ({ name, tier, logo, alt }));

export const SPONSOR_TIERS = [
  {
    title: "Presented By",
    size: "large",
    sponsors: [{ name: BRAND.collegeName, tag: "Host Institution", logo: sponsorPlaceholders[0].logo, alt: sponsorPlaceholders[0].alt }],
  },
  {
    title: "Title Sponsors",
    size: "large",
    sponsors: [
      { name: "Federal Bank", tag: "Title", logo: sponsorPlaceholders[1].logo, alt: sponsorPlaceholders[1].alt },
      { name: "HDFC Bank", tag: "Title", logo: sponsorPlaceholders[2].logo, alt: sponsorPlaceholders[2].alt },
    ],
  },
  {
    title: "Event Partners",
    size: "default",
    sponsors: [
      { name: "Coca-Cola", tag: "Gold", logo: sponsorPlaceholders[3].logo, alt: sponsorPlaceholders[3].alt },
      { name: "Campus Partner", tag: "Gold", logo: sponsorPlaceholders[4].logo, alt: sponsorPlaceholders[4].alt },
      { name: "Event Partner", tag: "Silver", logo: sponsorPlaceholders[5].logo, alt: sponsorPlaceholders[5].alt },
    ],
  },
  {
    title: "Media Partners",
    size: "default",
    sponsors: [
      { name: "Campus Radio", tag: "Broadcast" },
      { name: "Student Media Cell", tag: "Digital" },
      { name: "Local Press", tag: "Print" },
    ],
  },
];

export const TESTIMONIALS = [
  { quote: "Last year's main stage lineup kept the whole campus buzzing till midnight.", name: "Priya N.", role: "Inter-college Delegate" },
  { quote: "MacFiesta Pro made registration tracking and publishing results straightforward.", name: "Arun K.", role: "Fest Coordinator" },
  { quote: "The tech arena and cultural night back-to-back — that's what a national fest should feel like.", name: "Cultural Club", role: "MACFAST" },
];

export const FAQ_ITEMS = [
  { q: "What is Macfiesta?", a: `Macfiesta is the national-level inter-college fest of ${BRAND.collegeName}. Student teams from colleges across India compete across campus venues.` },
  { q: "How do I register?", a: "Log in, open Events, pick a competition, and complete the registration form. Slots are limited per event." },
  { q: "Where are events held?", a: `Competitions run at the main stage, tech arena, cultural halls, and outdoor venues across ${BRAND.collegeName} campus.` },
  { q: "When are results published?", a: "Coordinators publish winners at the result desk after each event. Results appear on the Results page." },
  { q: "Who do I contact for help?", a: `Email ${BRAND.registrationHelpEmail} or call ${BRAND.registrationHelpPhone} during fest days.` },
];
