"use client";

import { useState, useEffect } from "react";
import { getSocket } from "./socket";
import { api } from "./api";

// ── 1. Festival Core & Hero Settings ─────────────────────────────────
export interface FestivalSettings {
  name: string;
  edition: string;
  tagline: string;
  subtitle: string;
  motto: string;
  logoUrl: string;
  faviconUrl: string;
  homepageBanner: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  venueAddress: string;
  registrationOpen: boolean;
  maintenanceMode: boolean;
  countdownEnabled: boolean;
  socialInstagram: string;
  socialYoutube: string;
  socialLinkedin: string;
  // Hero CMS Additions
  heroTitle: string;
  heroName: string;
  heroSubtitle: string;
  heroDesc: string;
  bgType: "video" | "image" | "3d";
  videoBgUrl: string;
  wallpaperUrl: string;
  themeToggle: "marvel" | "haunted" | "minimal" | "dark" | "light";
  ctaPrimaryText: string;
  ctaPrimaryUrl: string;
  ctaSecondaryText: string;
  ctaSecondaryUrl: string;
  floatingIronManEnabled: boolean;
  heroOverlayOpacity: number;
}

// ── 2. Timeline Settings ──────────────────────────────────────────────
export interface TimelineSettings {
  festStartDate: string;
  festEndDate: string;
  regOpenDate: string;
  regCloseDate: string;
  spotRegDate: string;
  resultPubDate: string;
  certificateDate: string;
  autoCloseRegistration: boolean;
  autoPublishResults: boolean;
  countdownStyle: "neon" | "minimal" | "cyber" | "marvel";
}

// ── 3. Theme Settings ──────────────────────────────────────────────────
export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  borderRadius: string;
  shadowIntensity: string;
  animationSpeed: string;
  presetTheme: "marvel" | "haunted" | "minimal" | "dark" | "light";
  glassmorphismBlur: number;
  neonGlowIntensity: number;
}

// ── 4. Navbar CMS Data ────────────────────────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  visible: boolean;
  order: number;
}

export interface NavbarSettings {
  logoUrl: string;
  logoText: string;
  stickyMode: boolean;
  glassEffect: boolean;
  blurAmount: number;
  items: NavItem[];
}

// ── 5. Homepage Section ────────────────────────────────────────────────
export interface HomepageSection {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

// ── 6. Department CMS Data ────────────────────────────────────────────
export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  logoUrl: string;
  description: string;
  coordinatorName: string;
  coordinatorPhone: string;
  facultyName: string;
  eventCount: number;
}

// ── 7. Sponsor CMS Data ────────────────────────────────────────────────
export interface SponsorItem {
  id: string;
  name: string;
  tier: "Title" | "Platinum" | "Gold" | "Silver" | "Bronze";
  logoUrl: string;
  website: string;
  amount: number;
  active: boolean;
  order: number;
}

// ── 8. Testimonial CMS Data ────────────────────────────────────────────
export interface TestimonialItem {
  id: string;
  name: string;
  college: string;
  rating: number;
  comment: string;
  photoUrl: string;
  approved: boolean;
}

// ── 9. FAQ Item ────────────────────────────────────────────────────────
export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

// ── 9b. Guest / Chief Guest Item ───────────────────────────────────────
export interface GuestItem {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
  category?: string;
  sessionTime?: string;
  badge?: string;
  active: boolean;
  order: number;
  bio?: string;
}

// ── 10. Announcement Item ─────────────────────────────────────────────
export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  type: "popup" | "banner" | "toast" | "alert";
  active: boolean;
  scheduledTime: string;
}

// ── 11. Animation Controls ────────────────────────────────────────────
export interface AnimationSettings {
  enableFramerMotion: boolean;
  enableScrollEffects: boolean;
  enableHoverEffects: boolean;
  enableParticleEffects: boolean;
  loadingScreenEnabled: boolean;
}

// ── 12. SEO Settings ──────────────────────────────────────────────────
export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  twitterHandle: string;
  robotsTxt: string;
}

// ── 13. Form Builder Custom Field ─────────────────────────────────────
export interface CustomFormField {
  id: string;
  label: string;
  type: "text" | "number" | "dropdown" | "checkbox" | "file" | "date";
  required: boolean;
  options?: string[];
}

// ── 14. Media Library Item ────────────────────────────────────────────
export interface MediaLibraryItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "pdf";
  folder: string;
  tags: string[];
}

// ── Default State Builders ─────────────────────────────────────────────
const DEFAULT_SETTINGS: FestivalSettings = {
  name: "MacFiesta",
  edition: "2K26",
  tagline: "Where Legends Rise",
  subtitle: "2026's Most Awaited Inter-Collegiate Fest!",
  motto: "United to Excel",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  homepageBanner: "/MARVEL/Video Project 4.mp4",
  aboutText: "MacFiesta is the premier national inter-collegiate festival hosted by MACFAST, bringing together thousands of delegates across technology, culture, and sports.",
  contactEmail: "macfiesta@macfast.org",
  contactPhone: "+91 94470 00000",
  venueAddress: "MACFAST Campus, Tiruvalla, Pathanamthitta, Kerala 689101",
  registrationOpen: true,
  maintenanceMode: false,
  countdownEnabled: true,
  socialInstagram: "https://instagram.com/macfiestaofficial",
  socialYoutube: "https://youtube.com/@macfiesta",
  socialLinkedin: "https://linkedin.com/company/macfast",
  heroTitle: "WELCOME TO",
  heroName: "MACFIESTA",
  heroSubtitle: "MARVELVERSE",
  heroDesc: "Unleash your superpower across 26 national inter-collegiate tech, cultural, gaming & management challenges.",
  bgType: "image",
  videoBgUrl: "/MARVEL/Video Project 4.mp4",
  wallpaperUrl: "/MARVEL/3025924746959430.jpg",
  themeToggle: "marvel",
  ctaPrimaryText: "Join Mission Now",
  ctaPrimaryUrl: "/events",
  ctaSecondaryText: "Explore Schedule",
  ctaSecondaryUrl: "/schedule",
  floatingIronManEnabled: true,
  heroOverlayOpacity: 0.85,
};

const DEFAULT_TIMELINE: TimelineSettings = {
  festStartDate: "2026-09-24T09:00:00",
  festEndDate: "2026-09-25T22:00:00",
  regOpenDate: "2026-08-01T00:00:00",
  regCloseDate: "2026-09-22T23:59:59",
  spotRegDate: "2026-09-24T08:00:00",
  resultPubDate: "2026-09-25T18:00:00",
  certificateDate: "2026-09-26T10:00:00",
  autoCloseRegistration: true,
  autoPublishResults: true,
  countdownStyle: "marvel",
};

const DEFAULT_THEME: ThemeSettings = {
  primaryColor: "#ED1D24",
  secondaryColor: "#00D4FF",
  backgroundColor: "#05050A",
  fontFamily: "Inter",
  borderRadius: "16px",
  shadowIntensity: "high",
  animationSpeed: "normal",
  presetTheme: "marvel",
  glassmorphismBlur: 16,
  neonGlowIntensity: 90,
};

const DEFAULT_NAVBAR: NavbarSettings = {
  logoUrl: "/logo.png",
  logoText: "MACFIESTA 2K26",
  stickyMode: true,
  glassEffect: true,
  blurAmount: 12,
  items: [
    { id: "nav-1", label: "Home", href: "/", visible: true, order: 0 },
    { id: "nav-2", label: "Missions", href: "/events", visible: true, order: 1 },
    { id: "nav-3", label: "Timeline", href: "/schedule", visible: true, order: 2 },
    { id: "nav-4", label: "Scoreboard", href: "/scoreboard", visible: true, order: 3 },
    { id: "nav-5", label: "Stay", href: "/accommodation", visible: true, order: 4 },
    { id: "nav-6", label: "Archives", href: "/gallery", visible: true, order: 5 },
    { id: "nav-7", label: "Command HQ", href: "/contact", visible: true, order: 6 },
  ],
};

const DEFAULT_SECTIONS: HomepageSection[] = [
  { id: "hero", title: "Hero Banner", visible: true, order: 0 },
  { id: "about", title: "About Festival", visible: true, order: 1 },
  { id: "infinity", title: "Infinity Gauntlet Challenge", visible: true, order: 2 },
  { id: "featured_events", title: "Featured Events Grid", visible: true, order: 3 },
  { id: "schedule_preview", title: "Schedule Preview", visible: true, order: 4 },
  { id: "gallery", title: "Photo & Video Gallery", visible: true, order: 5 },
  { id: "sponsors", title: "Sponsors & Partners", visible: true, order: 6 },
  { id: "faq", title: "Frequently Asked Questions", visible: true, order: 7 },
  { id: "cta", title: "Registration Call to Action", visible: true, order: 8 },
];

const DEFAULT_DEPARTMENTS: DepartmentItem[] = [
  { id: "dept-mca", name: "Computer Applications (MCA)", code: "MCA", logoUrl: "/MARVEL/4081455907815375.png", description: "Hosts Byte & Code Hackathon, Spider Coding & AI Sprints.", coordinatorName: "Prof. Rajesh Kumar", coordinatorPhone: "+91 94471 11111", facultyName: "Dr. Thomas Varghese", eventCount: 8 },
  { id: "dept-mba", name: "Management Studies (MBA)", code: "MBA", logoUrl: "/MARVEL/300685712645038155.png", description: "Organizes Corporate Showdown, Case Study & Startup Pitch.", coordinatorName: "Prof. Priya Nair", coordinatorPhone: "+91 94472 22222", facultyName: "Dr. Mathew John", eventCount: 6 },
  { id: "dept-bio", name: "Biosciences & Research", code: "BIO", logoUrl: "/MARVEL/Doctor Strange.png", description: "Leads Bio-Quiz, Innovation Expo & Research Paper Presentation.", coordinatorName: "Prof. Saji George", coordinatorPhone: "+91 94473 33333", facultyName: "Dr. Anita Joseph", eventCount: 5 },
  { id: "dept-cul", name: "Cultural & Arts Committee", code: "CUL", logoUrl: "/MARVEL/Spider-man.png", description: "Manages Dusk 'N Dawn Pro Show, Choreo Dance & Beatboxing.", coordinatorName: "Prof. Arun Kurian", coordinatorPhone: "+91 94474 44444", facultyName: "Dr. Susan Philip", eventCount: 7 },
];

const DEFAULT_SPONSORS: SponsorItem[] = [
  { id: "sp-1", name: "Red Bull", tier: "Title", logoUrl: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=200", website: "https://redbull.com", amount: 150000, active: true, order: 0 },
  { id: "sp-2", name: "Monster Energy", tier: "Platinum", logoUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200", website: "https://monsterenergy.com", amount: 100000, active: true, order: 1 },
  { id: "sp-3", name: "KFC Kerala", tier: "Gold", logoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200", website: "https://kfc.in", amount: 60000, active: true, order: 2 },
  { id: "sp-4", name: "Spotify", tier: "Gold", logoUrl: "https://images.unsplash.com/photo-1614680376593-902f749f7051?w=200", website: "https://spotify.com", amount: 50000, active: true, order: 3 },
];

export const DEFAULT_GUESTS: GuestItem[] = [
  {
    id: "guest-akhil",
    name: "Akhil Marar",
    role: "Celebrity Chief Guest · Filmmaker & Television Icon",
    description: "Renowned director, motivational speaker, and Bigg Boss Malayalam winner headlining the MacFiesta 2026 Grand Multiverse Inauguration.",
    imageUrl: "/assets/image all/official/guests/guest-akhil-marar.webp",
    category: "Chief Guest",
    badge: "CHIEF GUEST OF HONOR",
    sessionTime: "Grand Inauguration • Main Arena",
    active: true,
    order: 1,
  },
  {
    id: "guest-sayip",
    name: "Sayip OP",
    role: "Star Guest · BGMI Esports Streamer & Eagle Gaming",
    description: "Kerala's premier esports creator and BGMI gaming icon joining MacFiesta 2026 for a high-voltage gaming keynote and live arena showdown.",
    imageUrl: "/assets/image all/official/guests/guest-sayip-op.webp",
    category: "Star Guest",
    badge: "ESPORTS STAR GUEST",
    sessionTime: "Pro-Show Stage • Multiverse Arena",
    active: true,
    order: 2,
  },
];

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  { id: "t-1", name: "Rohan Varghese", college: "CET Trivandrum", rating: 5, comment: "MacFiesta is hands down the most energetic fest in Kerala! The Thor Gaming Arena was electric.", photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", approved: true },
  { id: "t-2", name: "Ananya Nair", college: "St. Teresa's Ernakulam", rating: 5, comment: "Loved the Marvel theme immersion! Food stalls, hospitality, and Dusk 'N Dawn concert were unforgettable.", photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", approved: true },
];

const DEFAULT_FAQS: FaqItem[] = [
  { id: "faq-1", category: "Eligibility", question: "Who can participate in MacFiesta 2K26?", answer: "Any currently enrolled undergraduate or postgraduate student with a valid college ID card can participate." },
  { id: "faq-2", category: "Hospitality", question: "Is accommodation provided for outstation delegates?", answer: "Yes! Separate male and female hostel accommodations inside MACFAST campus are available." },
  { id: "faq-3", category: "Registration", question: "Can I register on-spot during festival day?", answer: "Spot registrations will open on Sep 24 morning, subject to seat availability." },
];

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  { id: "ann-1", title: "GRAND FESTIVAL INAUGURATION", message: "MacFiesta 2K26 official inaugural ceremony kicks off at 09:30 AM in Main Auditorium!", type: "banner", active: true, scheduledTime: "2026-09-24 09:30" },
];

const DEFAULT_ANIMATIONS: AnimationSettings = {
  enableFramerMotion: true,
  enableScrollEffects: true,
  enableHoverEffects: true,
  enableParticleEffects: true,
  loadingScreenEnabled: true,
};

const DEFAULT_SEO: SeoSettings = {
  metaTitle: "MacFiesta 2K26 — Premier National Inter-Collegiate Festival",
  metaDescription: "Experience 26 national technical, cultural & gaming challenges at MACFAST Tiruvalla. Win cash prizes worth ₹20 Lakhs!",
  keywords: "MacFiesta, MACFAST, College Fest, Inter-Collegiate, Kerala Tech Fest, Esports, Hackathon",
  ogImage: "/MARVEL/3025924746959430.jpg",
  twitterHandle: "@macfiesta",
  robotsTxt: "User-agent: *\nAllow: /",
};

const DEFAULT_FORM_FIELDS: CustomFormField[] = [
  { id: "field-1", label: "College ID Card Upload", type: "file", required: true },
  { id: "field-2", label: "Food Preference", type: "dropdown", required: true, options: ["Veg", "Non-Veg"] },
];

const DEFAULT_MEDIA: MediaLibraryItem[] = [
  { id: "m-1", name: "Marvel Hero Banner", url: "/MARVEL/3025924746959430.jpg", type: "image", folder: "Hero", tags: ["marvel", "hero"] },
  { id: "m-2", name: "Video Project 4 Loop", url: "/MARVEL/Video Project 4.mp4", type: "video", folder: "Videos", tags: ["promo", "video"] },
];

// ── 15. Broadcast Sync Channel & Socket Sync ────────────────────────
let listeners: Array<() => void> = [];
let syncChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    syncChannel = new BroadcastChannel("macfiesta_cms_sync");
    syncChannel.onmessage = () => {
      notifyListeners(false);
    };
  } catch { }
}

function notifyListeners(emitSocket: boolean = true) {
  listeners.forEach((l) => l());
  if (syncChannel) {
    try {
      syncChannel.postMessage("updated");
    } catch { }
  }
  if (emitSocket && typeof window !== "undefined") {
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit("update-festival-settings", {
          settings: getFestivalSettings(),
          timeline: getTimelineSettings(),
          theme: getThemeSettings(),
        });
      }
      // Best-effort async server sync
      api.put("/festival-settings", {
        settings: getFestivalSettings(),
        timeline: getTimelineSettings(),
        theme: getThemeSettings(),
      }).catch(() => {});
    } catch { }
  }
}

// ── 16. Persistence Helper Functions ─────────────────────────────────
export function getFestivalSettings(): FestivalSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem("macfiesta_control_settings");
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveFestivalSettings(settings: Partial<FestivalSettings>) {
  const current = getFestivalSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem("macfiesta_control_settings", JSON.stringify(updated));
  } catch { }
  notifyListeners();
  return updated;
}

export function getTimelineSettings(): TimelineSettings {
  if (typeof window === "undefined") return DEFAULT_TIMELINE;
  try {
    const saved = localStorage.getItem("macfiesta_control_timeline");
    return saved ? { ...DEFAULT_TIMELINE, ...JSON.parse(saved) } : DEFAULT_TIMELINE;
  } catch {
    return DEFAULT_TIMELINE;
  }
}

export function saveTimelineSettings(timeline: Partial<TimelineSettings>) {
  const current = getTimelineSettings();
  const updated = { ...current, ...timeline };
  try {
    localStorage.setItem("macfiesta_control_timeline", JSON.stringify(updated));
  } catch { }
  notifyListeners();
  return updated;
}

export function getThemeSettings(): ThemeSettings {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const saved = localStorage.getItem("macfiesta_control_theme");
    return saved ? { ...DEFAULT_THEME, ...JSON.parse(saved) } : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveThemeSettings(theme: Partial<ThemeSettings>) {
  const current = getThemeSettings();
  const updated = { ...current, ...theme };
  try {
    localStorage.setItem("macfiesta_control_theme", JSON.stringify(updated));
  } catch { }
  notifyListeners();
  return updated;
}

export function getNavbarSettings(): NavbarSettings {
  if (typeof window === "undefined") return DEFAULT_NAVBAR;
  try {
    const saved = localStorage.getItem("macfiesta_control_navbar");
    return saved ? { ...DEFAULT_NAVBAR, ...JSON.parse(saved) } : DEFAULT_NAVBAR;
  } catch {
    return DEFAULT_NAVBAR;
  }
}

export function saveNavbarSettings(navbar: Partial<NavbarSettings>) {
  const current = getNavbarSettings();
  const updated = { ...current, ...navbar };
  try {
    localStorage.setItem("macfiesta_control_navbar", JSON.stringify(updated));
  } catch { }
  notifyListeners();
  return updated;
}

export function getHomepageSections(): HomepageSection[] {
  if (typeof window === "undefined") return DEFAULT_SECTIONS;
  try {
    const saved = localStorage.getItem("macfiesta_homepage_sections");
    return saved ? JSON.parse(saved) : DEFAULT_SECTIONS;
  } catch {
    return DEFAULT_SECTIONS;
  }
}

export function saveHomepageSections(sections: HomepageSection[]) {
  try {
    localStorage.setItem("macfiesta_homepage_sections", JSON.stringify(sections));
  } catch { }
  notifyListeners();
  return sections;
}

export function getDepartmentList(): DepartmentItem[] {
  if (typeof window === "undefined") return DEFAULT_DEPARTMENTS;
  try {
    const saved = localStorage.getItem("macfiesta_control_departments");
    return saved ? JSON.parse(saved) : DEFAULT_DEPARTMENTS;
  } catch {
    return DEFAULT_DEPARTMENTS;
  }
}

export function saveDepartmentList(depts: DepartmentItem[]) {
  try {
    localStorage.setItem("macfiesta_control_departments", JSON.stringify(depts));
  } catch { }
  notifyListeners();
  return depts;
}

export function getSponsorsList(): SponsorItem[] {
  if (typeof window === "undefined") return DEFAULT_SPONSORS;
  try {
    const saved = localStorage.getItem("macfiesta_control_sponsors");
    return saved ? JSON.parse(saved) : DEFAULT_SPONSORS;
  } catch {
    return DEFAULT_SPONSORS;
  }
}

export function saveSponsorsList(sponsors: SponsorItem[]) {
  try {
    localStorage.setItem("macfiesta_control_sponsors", JSON.stringify(sponsors));
  } catch { }
  notifyListeners();
  return sponsors;
}

export function getGuestsList(): GuestItem[] {
  if (typeof window === "undefined") return DEFAULT_GUESTS;
  try {
    const saved = localStorage.getItem("macfiesta_control_guests");
    return saved ? JSON.parse(saved) : DEFAULT_GUESTS;
  } catch {
    return DEFAULT_GUESTS;
  }
}

export function saveGuestsList(guests: GuestItem[]) {
  try {
    localStorage.setItem("macfiesta_control_guests", JSON.stringify(guests));
  } catch { }
  notifyListeners();
  return guests;
}

export function getTestimonialsList(): TestimonialItem[] {
  if (typeof window === "undefined") return DEFAULT_TESTIMONIALS;
  try {
    const saved = localStorage.getItem("macfiesta_control_testimonials");
    return saved ? JSON.parse(saved) : DEFAULT_TESTIMONIALS;
  } catch {
    return DEFAULT_TESTIMONIALS;
  }
}

export function saveTestimonialsList(items: TestimonialItem[]) {
  try {
    localStorage.setItem("macfiesta_control_testimonials", JSON.stringify(items));
  } catch { }
  notifyListeners();
  return items;
}

export function getFaqsList(): FaqItem[] {
  if (typeof window === "undefined") return DEFAULT_FAQS;
  try {
    const saved = localStorage.getItem("macfiesta_control_faqs");
    return saved ? JSON.parse(saved) : DEFAULT_FAQS;
  } catch {
    return DEFAULT_FAQS;
  }
}

export function saveFaqsList(faqs: FaqItem[]) {
  try {
    localStorage.setItem("macfiesta_control_faqs", JSON.stringify(faqs));
  } catch { }
  notifyListeners();
  return faqs;
}

export function getAnnouncementsList(): AnnouncementItem[] {
  if (typeof window === "undefined") return DEFAULT_ANNOUNCEMENTS;
  try {
    const saved = localStorage.getItem("macfiesta_control_announcements");
    return saved ? JSON.parse(saved) : DEFAULT_ANNOUNCEMENTS;
  } catch {
    return DEFAULT_ANNOUNCEMENTS;
  }
}

export function saveAnnouncementsList(announcements: AnnouncementItem[]) {
  try {
    localStorage.setItem("macfiesta_control_announcements", JSON.stringify(announcements));
  } catch { }
  notifyListeners();
  return announcements;
}

export function getAnimationSettings(): AnimationSettings {
  if (typeof window === "undefined") return DEFAULT_ANIMATIONS;
  try {
    const saved = localStorage.getItem("macfiesta_control_animations");
    return saved ? { ...DEFAULT_ANIMATIONS, ...JSON.parse(saved) } : DEFAULT_ANIMATIONS;
  } catch {
    return DEFAULT_ANIMATIONS;
  }
}

export function saveAnimationSettings(anims: Partial<AnimationSettings>) {
  const current = getAnimationSettings();
  const updated = { ...current, ...anims };
  try {
    localStorage.setItem("macfiesta_control_animations", JSON.stringify(updated));
  } catch { }
  notifyListeners();
  return updated;
}

export function getSeoSettings(): SeoSettings {
  if (typeof window === "undefined") return DEFAULT_SEO;
  try {
    const saved = localStorage.getItem("macfiesta_control_seo");
    return saved ? { ...DEFAULT_SEO, ...JSON.parse(saved) } : DEFAULT_SEO;
  } catch {
    return DEFAULT_SEO;
  }
}

export function saveSeoSettings(seo: Partial<SeoSettings>) {
  const current = getSeoSettings();
  const updated = { ...current, ...seo };
  try {
    localStorage.setItem("macfiesta_control_seo", JSON.stringify(updated));
  } catch { }
  notifyListeners();
  return updated;
}

export function getFormFields(): CustomFormField[] {
  if (typeof window === "undefined") return DEFAULT_FORM_FIELDS;
  try {
    const saved = localStorage.getItem("macfiesta_control_form_fields");
    return saved ? JSON.parse(saved) : DEFAULT_FORM_FIELDS;
  } catch {
    return DEFAULT_FORM_FIELDS;
  }
}

export function saveFormFields(fields: CustomFormField[]) {
  try {
    localStorage.setItem("macfiesta_control_form_fields", JSON.stringify(fields));
  } catch { }
  notifyListeners();
  return fields;
}

export function getMediaLibrary(): MediaLibraryItem[] {
  if (typeof window === "undefined") return DEFAULT_MEDIA;
  try {
    const saved = localStorage.getItem("macfiesta_control_media");
    return saved ? JSON.parse(saved) : DEFAULT_MEDIA;
  } catch {
    return DEFAULT_MEDIA;
  }
}

export function saveMediaLibrary(media: MediaLibraryItem[]) {
  try {
    localStorage.setItem("macfiesta_control_media", JSON.stringify(media));
  } catch { }
  notifyListeners();
  return media;
}

// ── 17. Main React Hook for Visual CMS & Real-Time Sync ───────────────
export function useFestivalControl() {
  const [settings, setSettingsState] = useState<FestivalSettings>(DEFAULT_SETTINGS);
  const [timeline, setTimelineState] = useState<TimelineSettings>(DEFAULT_TIMELINE);
  const [theme, setThemeState] = useState<ThemeSettings>(DEFAULT_THEME);
  const [navbar, setNavbarState] = useState<NavbarSettings>(DEFAULT_NAVBAR);
  const [sections, setSectionsState] = useState<HomepageSection[]>(DEFAULT_SECTIONS);
  const [departments, setDepartmentsState] = useState<DepartmentItem[]>(DEFAULT_DEPARTMENTS);
  const [sponsors, setSponsorsState] = useState<SponsorItem[]>(DEFAULT_SPONSORS);
  const [guests, setGuestsState] = useState<GuestItem[]>(DEFAULT_GUESTS);
  const [testimonials, setTestimonialsState] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [faqs, setFaqsState] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [announcements, setAnnouncementsState] = useState<AnnouncementItem[]>(DEFAULT_ANNOUNCEMENTS);
  const [animations, setAnimationsState] = useState<AnimationSettings>(DEFAULT_ANIMATIONS);
  const [seo, setSeoState] = useState<SeoSettings>(DEFAULT_SEO);
  const [formFields, setFormFieldsState] = useState<CustomFormField[]>(DEFAULT_FORM_FIELDS);
  const [mediaLibrary, setMediaLibraryState] = useState<MediaLibraryItem[]>(DEFAULT_MEDIA);

  const refreshAll = () => {
    setSettingsState(getFestivalSettings());
    setTimelineState(getTimelineSettings());
    setThemeState(getThemeSettings());
    setNavbarState(getNavbarSettings());
    setSectionsState(getHomepageSections());
    setDepartmentsState(getDepartmentList());
    setSponsorsState(getSponsorsList());
    setGuestsState(getGuestsList());
    setTestimonialsState(getTestimonialsList());
    setFaqsState(getFaqsList());
    setAnnouncementsState(getAnnouncementsList());
    setAnimationsState(getAnimationSettings());
    setSeoState(getSeoSettings());
    setFormFieldsState(getFormFields());
    setMediaLibraryState(getMediaLibrary());
  };

  useEffect(() => {
    refreshAll();

    // Fetch initial server state
    api.get("/festival-settings").then((res) => {
      if (res.data && res.data.success) {
        if (res.data.settings) {
          localStorage.setItem("macfiesta_control_settings", JSON.stringify(res.data.settings));
        }
        if (res.data.timeline) {
          localStorage.setItem("macfiesta_control_timeline", JSON.stringify(res.data.timeline));
        }
        if (res.data.theme) {
          localStorage.setItem("macfiesta_control_theme", JSON.stringify(res.data.theme));
        }
        refreshAll();
      }
    }).catch(() => {});

    const handleChange = () => {
      refreshAll();
    };

    listeners.push(handleChange);

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("macfiesta_")) {
        handleChange();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageEvent);
    }

    // Auto-sync from Django REST Backend
    const syncBackendData = async () => {
      try {
        // 1. Festival public config & site settings
        const [configRes, sponsorsRes, guestsRes, faqsRes, testimonialsRes, annRes] = await Promise.allSettled([
          api.get("/public/config/"),
          api.get("/cms/sponsors/"),
          api.get("/cms/guests/"),
          api.get("/cms/faqs/"),
          api.get("/cms/testimonials/"),
          api.get("/announcements/"),
        ]);

        if (configRes.status === "fulfilled" && configRes.value?.data) {
          const d = configRes.value.data;
          const updatedSettings: Partial<FestivalSettings> = {
            name: d.fest_name || "MacFiesta",
            tagline: d.fest_theme || "Where Legends Rise",
            registrationOpen: d.registration_open ?? true,
            contactEmail: d.contact_email || "fest@macfast.org",
            contactPhone: d.contact_phone || "+91 94470 12345",
          };
          saveFestivalSettings(updatedSettings);
        }

        if (sponsorsRes.status === "fulfilled" && Array.isArray(sponsorsRes.value?.data) && sponsorsRes.value.data.length > 0) {
          const sps: SponsorItem[] = sponsorsRes.value.data.map((s: any, i: number) => ({
            id: String(s.id || `sp-${i}`),
            name: s.name,
            tier: s.tier || s.sponsor_type || "Partner",
            logoUrl: s.logo || s.logo_url || "/logo.png",
            website: s.website || "#",
            amount: Number(s.amount || 0),
            active: s.is_active ?? true,
            order: s.order || i,
          }));
          saveSponsorsList(sps);
        }

        if (guestsRes.status === "fulfilled" && Array.isArray(guestsRes.value?.data) && guestsRes.value.data.length > 0) {
          const gList: GuestItem[] = guestsRes.value.data.map((g: any, i: number) => {
            let img = g.image || g.image_url;
            if (img && img.startsWith("/media/")) {
              img = `http://127.0.0.1:8000${img}`;
            } else if (!img) {
              img = i === 0 ? "/assets/image all/official/guests/guest-akhil-marar.webp" : "/assets/image all/official/guests/guest-sayip-op.webp";
            }
            return {
              id: String(g.id || `guest-${i}`),
              name: g.name,
              role: g.role || "Special Guest",
              description: g.description || "Honored guest at MacFiesta 2026.",
              imageUrl: img,
              category: g.role?.toLowerCase().includes("chief") ? "Chief Guest" : "Star Guest",
              badge: g.role?.toLowerCase().includes("chief") ? "CHIEF GUEST OF HONOR" : "STAR GUEST",
              sessionTime: "Pro-Show Stage • 24–25 Sep 2026",
              active: g.is_active ?? true,
              order: g.order || i,
            };
          });
          saveGuestsList(gList);
        }

        if (faqsRes.status === "fulfilled" && Array.isArray(faqsRes.value?.data) && faqsRes.value.data.length > 0) {
          const faqsList: FaqItem[] = faqsRes.value.data.map((f: any, i: number) => ({
            id: String(f.id || `faq-${i}`),
            category: f.category || "General",
            question: f.question,
            answer: f.answer,
          }));
          saveFaqsList(faqsList);
        }

        if (testimonialsRes.status === "fulfilled" && Array.isArray(testimonialsRes.value?.data) && testimonialsRes.value.data.length > 0) {
          const testList: TestimonialItem[] = testimonialsRes.value.data.map((t: any, i: number) => ({
            id: String(t.id || `t-${i}`),
            name: t.name || t.author_name || "Delegate",
            college: t.college || t.author_role || t.role || "MACFAST Delegate",
            role: t.role || t.author_role || t.college || "Delegate",
            rating: Number(t.rating || 5),
            comment: t.quote || t.comment || t.content || "MacFiesta 2026 brings an unparalleled celebration of technology, culture, and esports across Kerala.",
            quote: t.quote || t.comment || t.content || "MacFiesta 2026 brings an unparalleled celebration of technology, culture, and esports across Kerala.",
            photoUrl: t.photo || t.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            approved: true,
          }));
          saveTestimonialsList(testList);
        }

        if (annRes.status === "fulfilled" && Array.isArray(annRes.value?.data) && annRes.value.data.length > 0) {
          const annList: AnnouncementItem[] = annRes.value.data.map((a: any, i: number) => ({
            id: String(a.id || `ann-${i}`),
            title: a.title,
            message: a.message || a.content || "",
            type: a.type || "banner",
            active: a.is_active ?? true,
            scheduledTime: a.created_at || "",
          }));
          saveAnnouncementsList(annList);
        }

        refreshAll();
      } catch (err) {
        // Safe graceful fallback to local defaults
      }
    };

    syncBackendData();

    // Socket real-time synchronization
    const socket = getSocket();
    const handleRemoteSync = (payload: any) => {
      if (payload) {
        if (payload.settings) {
          localStorage.setItem("macfiesta_control_settings", JSON.stringify({ ...getFestivalSettings(), ...payload.settings }));
        }
        if (payload.timeline) {
          localStorage.setItem("macfiesta_control_timeline", JSON.stringify({ ...getTimelineSettings(), ...payload.timeline }));
        }
        if (payload.theme) {
          localStorage.setItem("macfiesta_control_theme", JSON.stringify({ ...getThemeSettings(), ...payload.theme }));
        }
        refreshAll();
        notifyListeners(false);
      }
    };

    socket.on("festival-settings-changed", handleRemoteSync);

    return () => {
      listeners = listeners.filter((l) => l !== handleChange);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageEvent);
      }
      socket.off("festival-settings-changed", handleRemoteSync);
    };
  }, []);

  return {
    settings,
    timeline,
    theme,
    navbar,
    sections,
    departments,
    sponsors,
    guests,
    testimonials,
    faqs,
    announcements,
    animations,
    seo,
    formFields,
    mediaLibrary,

    updateSettings: saveFestivalSettings,
    updateTimeline: saveTimelineSettings,
    updateTheme: saveThemeSettings,
    updateNavbar: saveNavbarSettings,
    updateSections: saveHomepageSections,
    updateDepartments: saveDepartmentList,
    updateSponsors: saveSponsorsList,
    updateTestimonials: saveTestimonialsList,
    updateFaqs: saveFaqsList,
    updateAnnouncements: saveAnnouncementsList,
    updateAnimations: saveAnimationSettings,
    updateSeo: saveSeoSettings,
    updateFormFields: saveFormFields,
    updateMediaLibrary: saveMediaLibrary,
  };
}
