/** Public page copy — sample/reference content only (no real participant data). */

function asset(path) {
  return `/assets/official/${path}`;
}

export const MACFAST_ABOUT = {
  welcomeTitle: "Welcome to MACFAST",
  welcomeBody:
    "Mar Athanasios College for Advanced Studies (MACFAST), Thiruvalla, hosts Macfiesta — a national platform where student teams compete across technology, culture, sports, and management.",
  visionTitle: "Vision",
  visionBody:
    "To nurture holistic leaders through academic excellence, innovation, and vibrant campus life that celebrates talent from every corner of the country.",
  missionTitle: "Mission",
  missionBody:
    "To provide world-class learning environments, foster inter-college collaboration, and stage Macfiesta as a benchmark national fest experience.",
};

export const CAMPUS_LIFE_IMAGES = [
  { src: asset("categories/general.webp"), title: "Campus Grounds", alt: "MACFAST campus grounds" },
  { src: asset("categories/cultural.webp"), title: "Cultural Life", alt: "Cultural activities on campus" },
  { src: asset("categories/sports.webp"), title: "Sports Arena", alt: "Sports facilities at MACFAST" },
  { src: asset("pages/schedule.webp"), title: "Student Life", alt: "Students on MACFAST campus" },
];

export const FEST_HISTORY = [
  {
    year: "Foundation",
    title: "Foundation of MACFAST",
    body: "MACFAST was established as a centre for advanced studies, building a campus culture that would later host Kerala's celebrated inter-college fest.",
  },
  {
    year: "Genesis",
    title: "Genesis of Macfiesta",
    body: "Macfiesta began as a college fest bringing together technical, cultural, and literary competitions under one national banner.",
  },
  {
    year: "Growth",
    title: "Uniting Talents",
    body: "Participation expanded beyond Kerala as colleges from across India registered for flagship events and main-stage showcases.",
  },
  {
    year: "2024",
    title: "Retro Fiesta",
    body: "The Retro Fiesta edition celebrated throwback themes, DJ nights, and record registration numbers — captured in the fest rewind gallery.",
  },
];

export const EVENT_GUIDELINES = [
  "Register only through MacFiesta Pro or authorised fest desks.",
  "Carry your college ID and registration confirmation to every event.",
  "Report at the venue at least 15 minutes before the scheduled start.",
  "Team events require all members present at check-in; substitutes only if rules allow.",
  "Respect coordinators, judges, and venue capacity limits.",
  "Fest management may disqualify teams for misconduct or false registrations.",
];

export const PRIZE_POOL_SAMPLE = [
  { tier: "Main Stage Events", amount: "₹1,00,000+", note: "Combined pool across flagship competitions" },
  { tier: "Tech & Gaming", amount: "₹50,000+", note: "Coding, gaming, and innovation tracks" },
  { tier: "Cultural & Arts", amount: "₹40,000+", note: "Dance, music, fashion, and literary events" },
  { tier: "Sports & Management", amount: "₹25,000+", note: "Indoor and management games" },
];

export const GALLERY_VIDEO_SAMPLES = [
  {
    id: "v1",
    title: "Fest Highlights Reel",
    src: asset("hero/hero-480p.mp4"),
    poster: asset("hero/hero-poster.webp"),
  },
];

/** Sample coordinator accounts for admin UI demos — not real users. */
export const SAMPLE_COORDINATORS = [
  { id: "s1", name: "Fest Coordinator (Sample)", role: "Super Admin", email: "coordinator.sample@macfast.test" },
  { id: "s2", name: "Events Desk (Sample)", role: "Events", email: "events.sample@macfast.test" },
  { id: "s3", name: "Finance Desk (Sample)", role: "Finance", email: "finance.sample@macfast.test" },
  { id: "s4", name: "Volunteer Lead (Sample)", role: "Volunteer", email: "volunteer.sample@macfast.test" },
];

/** Illustrative gender split when profile gender is not collected — demo only. */
export const SAMPLE_GENDER_DISTRIBUTION = [
  { label: "Male", value: 52, sample: true },
  { label: "Female", value: 45, sample: true },
  { label: "Prefer not to say", value: 3, sample: true },
];
