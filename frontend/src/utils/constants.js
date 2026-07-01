export const FEST_YEAR = 2025;
export const FEST_DATE = new Date("2025-09-24T09:00:00");
export const OFFICIAL_SITE = "https://macfiesta.macfast.org/";

export const FEST_TAGLINE = "Where Legends Rise";
export const FEST_SUBTITLE = `${FEST_YEAR}'s Most Awaited Fest!`;
export const FEST_THEME = "Retro Fiesta";
export const FEST_THEME_DESC =
  "The silver screen is calling — our fest is your backstage pass to cinematic adventure. Movie-themed events, epic quests, and challenges inspired by legendary films await.";

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1920&q=80";

export const EVENT_FORMATS = [
  {
    id: "solo",
    label: "Solo",
    desc: "Unleash your individual power — the glory is all yours!",
    link: "/events",
  },
  {
    id: "duo",
    label: "Duo",
    desc: "Grab your partner and get ready to dominate the leaderboard together!",
    link: "/events",
  },
  {
    id: "trio",
    label: "Trio",
    desc: "Get your trio ready — it's time to win!",
    link: "/events",
  },
  {
    id: "squad",
    label: "Squad",
    desc: "Assemble your squad — it's time for a four-person showdown!",
    link: "/events",
  },
  {
    id: "group",
    label: "Group",
    desc: "Rally the whole crew — this is a battle royale for the ages!",
    link: "/events",
  },
];

export const CATEGORIES = [
  { id: "tech", label: "Technology", slug: "tech", color: "#6c5ce7" },
  { id: "arts", label: "Arts", slug: "arts", color: "#e17055" },
  { id: "music", label: "Music", slug: "music", color: "#00cec9" },
  { id: "dance", label: "Dance", slug: "dance", color: "#fd79a8" },
  { id: "gaming", label: "Gaming", slug: "gaming", color: "#a29bfe" },
  { id: "management", label: "Management", slug: "management", color: "#fdcb6e" },
  { id: "literary", label: "Literary", slug: "literary", color: "#74b9ff" },
  { id: "photography", label: "Photography", slug: "photography", color: "#55efc4" },
  { id: "sports", label: "Sports", slug: "sports", color: "#ffeaa7" },
  { id: "workshops", label: "Workshops", slug: "workshops", color: "#fab1a0" },
];

export const REWIND_HIGHLIGHTS = [
  { title: "Music Band", icon: "🎸" },
  { title: "Cultural Events", icon: "🎭" },
  { title: "Fashion", icon: "👗" },
  { title: "DJ Night", icon: "🎧" },
];

export const GUEST_PROFILES = [
  {
    name: "Akhil Marar",
    role: "Director and Writer",
    bio: "Meet the director who didn't just play the game but mastered it, walking away as the winner of Bigg Boss Malayalam Season 5. Akhil Marar is here for a session you won't forget.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
];

export const GALLERY_PLACEHOLDERS = [
  { id: "p1", title: "Main Stage Lights", category: "stage", uploaded_at: "2025-09-20T18:00:00Z", src: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=700&q=80" },
  { id: "p2", title: "Cultural Night", category: "cultural", uploaded_at: "2025-09-21T20:00:00Z", src: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=700&q=80" },
  { id: "p3", title: "Crowd Energy", category: "crowd", uploaded_at: "2025-09-21T21:30:00Z", src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=700&q=80" },
  { id: "p4", title: "Tech Showcase", category: "tech", uploaded_at: "2025-09-22T10:00:00Z", src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&q=80" },
  { id: "p5", title: "Fashion Walk Stage", category: "cultural", uploaded_at: "2025-09-22T16:00:00Z", src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=700&q=80" },
  { id: "p6", title: "Winner Podium", category: "winners", uploaded_at: "2025-09-23T17:00:00Z", src: "https://images.unsplash.com/photo-1523580495183-5f5a5c1c4c0e?w=700&q=80" },
  { id: "p7", title: "DJ Night Crowd", category: "crowd", uploaded_at: "2025-09-23T22:00:00Z", src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=700&q=80" },
  { id: "p8", title: "Coding Arena", category: "tech", uploaded_at: "2025-09-24T09:00:00Z", src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa90?w=700&q=80" },
  { id: "p9", title: "Grand Finale Stage", category: "stage", uploaded_at: "2025-09-24T19:00:00Z", src: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=700&q=80" },
];

export const ANNOUNCEMENT_PLACEHOLDERS = [
  {
    id: "ph1",
    title: "Macfiesta 2025 Registrations Open",
    message: "Browse all competitions and secure your slot before events fill up. Live participant counts are updated on MacFiesta Pro.",
    is_active: true,
    created_at: "2025-09-01T09:00:00Z",
    isPlaceholder: true,
  },
  {
    id: "ph2",
    title: "Retro Fiesta Theme Revealed",
    message: "This year's cinematic theme brings movie-inspired events, quests, and main-stage experiences across campus.",
    is_active: true,
    created_at: "2025-09-05T11:00:00Z",
    isPlaceholder: true,
  },
  {
    id: "ph3",
    title: "Guest Session: Akhil Marar",
    message: "Don't miss the exclusive director's session with Bigg Boss Malayalam Season 5 winner Akhil Marar.",
    is_active: true,
    created_at: "2025-09-10T14:00:00Z",
    isPlaceholder: true,
  },
];

export const SPONSORS = [
  { name: "Presented By", tier: "Title" },
  { name: "Official Sponsor", tier: "Gold" },
  { name: "Official Sponsor", tier: "Gold" },
  { name: "Official Sponsor", tier: "Silver" },
  { name: "Official Sponsor", tier: "Silver" },
  { name: "Official Sponsor", tier: "Partner" },
];

export const SPONSOR_TIERS = [
  {
    title: "Presented By",
    size: "large",
    sponsors: [
      { name: "MACFAST", tag: "Host Institution" },
    ],
  },
  {
    title: "Title Sponsors",
    size: "large",
    sponsors: [
      { name: "Title Partner One", tag: "Platinum" },
      { name: "Title Partner Two", tag: "Platinum" },
    ],
  },
  {
    title: "Event Partners",
    size: "default",
    sponsors: [
      { name: "Event Partner A", tag: "Gold" },
      { name: "Event Partner B", tag: "Gold" },
      { name: "Event Partner C", tag: "Silver" },
      { name: "Event Partner D", tag: "Silver" },
    ],
  },
  {
    title: "Media Partners",
    size: "default",
    sponsors: [
      { name: "Media Partner X", tag: "Broadcast" },
      { name: "Media Partner Y", tag: "Digital" },
      { name: "Media Partner Z", tag: "Print" },
    ],
  },
];

export const TESTIMONIALS = [
  {
    quote: "Macfiesta transformed MACFAST into a national-stage festival. The energy was unreal.",
    name: "Student Delegate",
    role: "Inter-college Participant",
  },
  {
    quote: "From solo battles to squad showdowns — every format brought something unique to the floor.",
    name: "Event Coordinator",
    role: "Macfiesta Team",
  },
  {
    quote: "Retro Fiesta theme made last year feel like a blockbuster. Can't wait for this edition.",
    name: "Cultural Club",
    role: "MACFAST",
  },
];

export const FAQ_ITEMS = [
  {
    q: "What is Macfiesta?",
    a: "Macfiesta is the national-level fest of MACFAST — expecting students from across the country representing diverse institutions and regions.",
  },
  {
    q: "What event formats are available?",
    a: "Compete solo, as a duo, trio, squad, or full group. Browse Events to find competitions that match your team size.",
  },
  {
    q: "How do I register?",
    a: "Click Register Now, browse events on MacFiesta Pro, and complete registration before slots fill. Live status is shown on each card.",
  },
  {
    q: "When will results be published?",
    a: "Results appear on the Results page as soon as coordinators declare winners for each competition.",
  },
  {
    q: "Where is the official fest website?",
    a: "Visit macfiesta.macfast.org for announcements, guest profiles, and the latest fest updates.",
  },
];

export const CATEGORY_IMAGES = {
  tech: "https://images.unsplash.com/photo-1517694712202-14dd9538aa90?w=800&q=80",
  arts: "https://images.unsplash.com/photo-1460661419341-fba85d44f917?w=800&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
  management: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
  general: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
  default: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
};
