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
export const FEST_THEME = "MACFIESTA 2026 — MARVEL × DC";
export const FEST_THEME_DESC =
  "Two days of competition, creativity, technology, culture, and entertainment come together at MACFAST as students rise to take on the MacFiesta arena.";

export const EVENT_FORMATS = [
  {
    id: "solo",
    label: "Solo",
    desc: "Compete individually and represent your skill.",
    link: "/events",
  },
  {
    id: "duo",
    label: "Duo",
    desc: "Team up with one partner.",
    link: "/events",
  },
  {
    id: "trio",
    label: "Trio",
    desc: "Compete as a three-member team.",
    link: "/events",
  },
  {
    id: "squad",
    label: "Squad",
    desc: "Designed for gaming, technology, and team challenges.",
    link: "/events",
  },
  {
    id: "group",
    label: "Group",
    desc: "Built for performances and larger team competitions.",
    link: "/events",
  },
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
  { title: "Music", image: rewindImages.music, alt: "MacFiesta music performance" },
  { title: "Cultural Events", image: rewindImages.cultural, alt: "MacFiesta cultural events" },
  { title: "Fashion", image: rewindImages.fashion, alt: "MacFiesta fashion show" },
  { title: "DJ Night", image: rewindImages.djNight, alt: "MacFiesta DJ night" },
];

export const GUEST_PROFILES = [
  {
    name: "Sayip OP",
    role: "Kerala Gamer · Eagle Gaming",
    bio: "BGMI streamer and Kerala gaming creator Sayip OP joins MacFiesta 2026 for a special Eagle Gaming session featuring gameplay, interaction, and live audience engagement.",
    image: guestPlaceholder,
    alt: "Sayip OP at MacFiesta 2026",
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
    title: "Guest Session — Sayip OP",
    message: "Eagle Gaming guest night with Kerala gamer Sayip OP — gameplay vibes at the fest arena.",
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
  { quote: "The 24-hour hackathon was absolute insanity! Gigabit fiber, midnight refreshments, and judges who grilled our system design to its limits. Best tech fest experience!", name: "Adithya Menon", role: "CET Trivandrum | 24H Hackathon Lead" },
  { quote: "The stage lighting and acoustic setup at the MACFAST amphitheatre rivaled major music festivals! 3,000+ students roaring through our set gave our crew goosebumps.", name: "Sneha Elizabeth", role: "St. Teresa's College | Synchro Dance Captain" },
  { quote: "Most college fests treat esports as an afterthought, but MacFiesta built a legit tournament arena with 240Hz rigs, zero latency, and live shoutcasting.", name: "Gautham Krishna", role: "TKM College of Engg | Valorant LAN Champions" },
  { quote: "Coming from Bangalore, we were blown away by the operational precision. The digital QR pass took 3 seconds at Mission Control, and the Best Manager stress rounds were genuinely industry-standard.", name: "Meera Nambiar", role: "Christ University Bangalore | Best Manager Finalist" },
  { quote: "World-class sound engineering on the main stage. Monster line arrays, crystal-clear in-ear monitors, and an electric crowd that didn't stop screaming until midnight.", name: "Kevin George", role: "Mar Ivanios Trivandrum | Battle of the Bands" },
  { quote: "The campus-wide Infinity Protocol hunt had dozens of teams sprinting across campus for 4 straight hours solving high-IQ cryptic ciphers. The adrenaline rush was unreal!", name: "Devika R.", role: "St. Joseph's Devagiri | Marvel Infinity Hunt Winner" },
];

export const FAQ_ITEMS = [
  { q: "What is Macfiesta?", a: `Macfiesta is the national-level inter-college fest of ${BRAND.collegeName}. Student teams from colleges across India compete across campus venues.` },
  { q: "How do I register?", a: "Log in, open Events, pick a competition, and complete the registration form. Slots are limited per event." },
  { q: "Where are events held?", a: `Competitions run at the main stage, tech arena, cultural halls, and outdoor venues across ${BRAND.collegeName} campus.` },
  { q: "When are results published?", a: "Coordinators publish winners at the result desk after each event. Results appear on the Results page." },
  { q: "Who do I contact for help?", a: `Email ${BRAND.registrationHelpEmail} or call ${BRAND.registrationHelpPhone} during fest days.` },
];
