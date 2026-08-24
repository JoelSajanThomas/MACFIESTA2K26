/** Public page copy — sample/reference content only (no real participant data). */

function asset(path) {
  return `/assets/image all/official/${path}`;
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
  {
    year: "2026",
    title: "Marvel × DC",
    body: "MacFiesta 2026 goes fully modern cinematic — Marvel × DC — Heroes Rise. Legends Compete. Two universes, one ultimate fest.",
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

/** Informational trophies — not a scoring engine. */
export const BEST_PARTICIPATING_SCHOOL = {
  title: "Best Participating School — Overall Trophy",
  day: "Day 1 — School Event Day",
  points: [
    "Awarded at the end of Day 1",
    "Based on overall points earned across events",
    "Additional points for active participation",
    "Encourages schools to participate in multiple events",
  ],
};

export const BEST_PARTICIPATING_COLLEGE = {
  title: "Best Participating College — Overall Trophy",
  day: "Day 2 — College Event Day",
  points: [
    "Awarded at the end of Day 2",
    "Based on overall points earned across events",
    "Additional points for active participation",
  ],
};

/**
 * Mini Games & Activity Zone — public information only.
 * Not competitive Event records (excluded from results / main registration catalogue).
 */
export const MINI_GAMES_ZONE = {
  title: "Mini Games & Activity Zone",
  subtitle: "Common activity zone across the fest",
  activities: [
    "Target Throw",
    "Ping-Pong Cup Toss",
    "Knock the Cans",
    "Ring Toss",
    "Bell Protocol",
    "Carrom",
    "Spin the Wheel",
    "Rubik's Cube",
  ],
  pricing: [
    "Most games: ₹10",
    "Bell Protocol: ₹20",
    "Some activities: Free",
  ],
};