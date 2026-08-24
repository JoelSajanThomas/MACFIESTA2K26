/**
 * MacFiesta original multiverse roster — display-only.
 * Theme wording: Marvel × DC. Visuals: MacFiesta originals only.
 */

export const UNIVERSES = {
  red: {
    id: "red",
    label: "Red Universe",
    themeSide: "Marvel",
    line: "Power. Courage. Impact.",
    colors: { primary: "#e11d2e", secondary: "#f0c14b", dark: "#0a0406" },
    emblem: "/assets/image all/original/emblems/red-universe.svg",
    background: "/assets/image all/original/backgrounds/red-universe-city.svg",
  },
  blue: {
    id: "blue",
    label: "Blue Universe",
    themeSide: "DC",
    line: "Strategy. Vision. Precision.",
    colors: { primary: "#1e6bff", secondary: "#c8d0dc", dark: "#050a16" },
    emblem: "/assets/image all/original/emblems/blue-universe.svg",
    background: "/assets/image all/original/backgrounds/blue-universe-city.svg",
  },
};

export const RED_HEROES = [
  { id: "scarlet-orbit", name: "Scarlet Orbit", title: "Cosmic Energy Commander", universe: "red", energy: "orbit-core", image: "/assets/image all/original/hero-scarlet-orbit.webp", emblem: "/assets/image all/original/emblems/red-universe.svg" },
  { id: "crimson-forge", name: "Crimson Forge", title: "Armored Technology Warrior", universe: "red", energy: "forge-sparks", image: "/assets/image all/original/heroes/crimson-forge.svg", emblem: "/assets/image all/original/emblems/tech.svg" },
  { id: "ember-pulse", name: "Ember Pulse", title: "Fire & Rhythm Performer", universe: "red", energy: "ember-wave", image: "/assets/image all/original/heroes/ember-pulse.svg", emblem: "/assets/image all/original/emblems/cultural.svg" },
  { id: "solar-vanguard", name: "Solar Vanguard", title: "Leadership & Strategy Hero", universe: "red", energy: "solar-flare", image: "/assets/image all/original/heroes/solar-vanguard.svg", emblem: "/assets/image all/original/emblems/management.svg" },
  { id: "velocity-arc", name: "Velocity Arc", title: "Speed & Sports Hero", universe: "red", energy: "speed-trail", image: "/assets/image all/original/heroes/velocity-arc.svg", emblem: "/assets/image all/original/emblems/dance.svg" },
  { id: "inferno-beat", name: "Inferno Beat", title: "Music & Dance Guardian", universe: "red", energy: "beat-pulse", image: "/assets/image all/original/heroes/inferno-beat.svg", emblem: "/assets/image all/original/emblems/music.svg" },
];

export const BLUE_HEROES = [
  { id: "cobalt-vigil", name: "Cobalt Vigil", title: "Night Protector & Strategist", universe: "blue", energy: "vigil-aura", image: "/assets/image all/original/hero-cobalt-vigil.webp", emblem: "/assets/image all/original/emblems/blue-universe.svg" },
  { id: "azure-circuit", name: "Azure Circuit", title: "AI & Coding Hero", universe: "blue", energy: "circuit-grid", image: "/assets/image all/original/heroes/azure-circuit.svg", emblem: "/assets/image all/original/emblems/tech.svg" },
  { id: "thunder-crest", name: "Thunder Crest", title: "Lightning Event Guardian", universe: "blue", energy: "thunder-bolt", image: "/assets/image all/original/heroes/thunder-crest.svg", emblem: "/assets/image all/original/emblems/general.svg" },
  { id: "frost-sentinel", name: "Frost Sentinel", title: "Calm Disciplined Defender", universe: "blue", energy: "frost-ring", image: "/assets/image all/original/heroes/frost-sentinel.svg", emblem: "/assets/image all/original/emblems/photography.svg" },
  { id: "neon-phantom", name: "Neon Phantom", title: "Gaming & Digital Arts Hero", universe: "blue", energy: "neon-glitch", image: "/assets/image all/original/heroes/neon-phantom.svg", emblem: "/assets/image all/original/emblems/gaming.svg" },
  { id: "lunar-echo", name: "Lunar Echo", title: "Music & Creative Expression", universe: "blue", energy: "echo-wave", image: "/assets/image all/original/heroes/lunar-echo.svg", emblem: "/assets/image all/original/emblems/music.svg" },
];

export const ALL_HEROES = [...RED_HEROES, ...BLUE_HEROES];

/** Display-only category → guardian mapping (DB category keys unchanged). */
export const CATEGORY_GUARDIANS = {
  tech: "azure-circuit",
  technology: "azure-circuit",
  management: "solar-vanguard",
  cultural: "ember-pulse",
  dance: "velocity-arc",
  music: "lunar-echo",
  gaming: "neon-phantom",
  food: "crimson-forge",
  literary: "cobalt-vigil",
  literature: "cobalt-vigil",
  photography: "frost-sentinel",
  general: "thunder-crest",
  arts: "ember-pulse",
  sports: "velocity-arc",
  workshops: "crimson-forge",
  stage: "inferno-beat",
  creative: "lunar-echo",
};

export const CHALLENGES = [
  { id: "time-fracture", name: "The Time Fracture", tone: "pressure" },
  { id: "chaos-grid", name: "The Chaos Grid", tone: "chaos" },
  { id: "shadow-algorithm", name: "The Shadow Algorithm", tone: "mystery" },
  { id: "silent-arena", name: "The Silent Arena", tone: "focus" },
  { id: "final-nexus", name: "The Final Nexus", tone: "climax" },
  { id: "broken-timeline", name: "The Broken Timeline", tone: "urgency" },
  { id: "dark-frequency", name: "The Dark Frequency", tone: "intensity" },
  { id: "infinite-trial", name: "The Infinite Trial", tone: "endurance" },
];

export const COMIC_STORY_PANELS = [
  { id: 1, title: "The Universes Awaken", body: "Red and Blue energies stir across campus as MacFiesta opens the gate." },
  { id: 2, title: "The Portal Opens", body: "A collision of universes forms — talent becomes the greatest superpower." },
  { id: 3, title: "Heroes Assemble", body: "Innovators, performers, strategists, and creators take their positions." },
  { id: 4, title: "The Competition Begins", body: "Missions launch. Legends will be written in the Hall of Heroes." },
];

export const COMMITTEE_DIVISIONS = {
  core: { label: "Core Command", emblem: "/assets/image all/original/emblems/core.svg" },
  finance: { label: "Finance Division", emblem: "/assets/image all/original/emblems/finance.svg" },
  event: { label: "Event Operations", emblem: "/assets/image all/original/emblems/event.svg" },
  program: { label: "Program Council", emblem: "/assets/image all/original/emblems/program.svg" },
  cultural: { label: "Cultural Force", emblem: "/assets/image all/original/emblems/cultural.svg" },
  publicity: { label: "Publicity Command", emblem: "/assets/image all/original/emblems/publicity.svg" },
  hospitality: { label: "Hospitality Unit", emblem: "/assets/image all/original/emblems/hospitality.svg" },
  food: { label: "Food Operations", emblem: "/assets/image all/original/emblems/food.svg" },
  invitation: { label: "Invitation Division", emblem: "/assets/image all/original/emblems/invitation.svg" },
  verification: { label: "Verification Squad", emblem: "/assets/image all/original/emblems/verification.svg" },
};

export const NAV_SUBTITLES = {
  "/": "",
  "/events": "",
  "/schedule": "",
  "/results": "",
  "/gallery": "",
  "/committees": "",
  "/login": "",
  "/announcements": "",
  "/sponsors": "",
};

export const THEMED_EMPTY = {
  events: { title: "No missions are currently available.", message: "Check back soon — new arenas open as coordinators publish events." },
  registrations: { title: "Your mission list is empty.", message: "Explore events and register to begin your MacFiesta journey." },
  results: { title: "The Hall of Heroes is awaiting its champions.", message: "Results appear here once coordinators publish placements." },
  gallery: { title: "Archives are quiet for now.", message: "Gallery frames will appear when media is published." },
  unauthorized: { title: "Your clearance level does not permit access.", message: "Sign in with an authorized account or return to the public multiverse." },
  eventFull: { title: "This mission has reached maximum capacity.", message: "Join the waitlist if available, or choose another arena." },
};

export const THEMED_ERRORS = {
  api: { title: "The command link was interrupted.", message: "Please try again in a moment." },
};

export const LOADING_MESSAGES = [
  "Opening the Multiverse…",
  "Loading missions…",
  "Preparing command center…",
  "Retrieving hero pass…",
  "Synchronizing event timeline…",
];

export function getHeroById(id) {
  return ALL_HEROES.find((h) => h.id === id) || null;
}

export function getGuardianForCategory(category) {
  const key = String(category || "general").toLowerCase();
  const heroId = CATEGORY_GUARDIANS[key] || CATEGORY_GUARDIANS.general;
  return getHeroById(heroId);
}

export function universeForCategory(category) {
  const g = getGuardianForCategory(category);
  return g?.universe === "red" ? UNIVERSES.red : UNIVERSES.blue;
}

export function missionStatusLabel(event) {
  if (event?.results_published) return "Results Published";
  if (!event?.is_registration_open) return "Mission Full";
  const max = event?.max_participants || 0;
  const count = event?.participant_count || 0;
  if (max && count >= max) return "Mission Full";
  if (max && count / max >= 0.85) return "Registration Closing";
  return "Mission Open";
}

export function challengeForIndex(i = 0) {
  return CHALLENGES[i % CHALLENGES.length];
}
