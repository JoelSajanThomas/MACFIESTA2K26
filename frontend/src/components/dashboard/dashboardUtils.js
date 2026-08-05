export const QUICK_ACTIONS = [
  {
    title: "Edit Hero & Branding",
    desc: "Fest name, hero copy, contact, and images",
    href: "/admin/content/site-settings",
    external: false,
    icon: "🎨",
  },
  {
    title: "Manage Homepage Sections",
    desc: "Show/hide sections and edit titles",
    href: "/admin/content/homepage-sections",
    external: false,
    icon: "🏠",
  },
  {
    title: "Manage Highlights",
    desc: "Festival highlight cards",
    href: "/admin/content/highlights",
    external: false,
    icon: "✨",
  },
  {
    title: "Manage Guests",
    desc: "Guest profiles and theme section",
    href: "/admin/content/guests",
    external: false,
    icon: "⭐",
  },
  {
    title: "Manage Sponsors",
    desc: "Partner and sponsor listings",
    href: "/admin/content/sponsors",
    external: false,
    icon: "🤝",
  },
  {
    title: "Manage FAQs",
    desc: "Frequently asked questions",
    href: "/admin/content/faqs",
    external: false,
    icon: "❓",
  },
  {
    title: "Manage Testimonials",
    desc: "Delegate and coordinator quotes",
    href: "/admin/content/testimonials",
    external: false,
    icon: "💬",
  },
  {
    title: "Website Content Hub",
    desc: "All CMS sections in one place",
    href: "/admin/content",
    external: false,
    icon: "📝",
  },
  {
    title: "Manage Events",
    desc: "Add, edit, or remove competitions",
    href: "/admin/events",
    external: false,
    icon: "📅",
  },
  {
    title: "Manage Results",
    desc: "Publish and update winner records",
    href: "/admin/results",
    external: false,
    icon: "🏆",
  },
  {
    title: "Manage Announcements",
    desc: "Post fest updates for students",
    href: "/admin/announcements",
    external: false,
    icon: "📢",
  },
  {
    title: "Manage Gallery",
    desc: "Upload and organize fest photos",
    href: "/admin/gallery",
    external: false,
    icon: "📷",
  },
  {
    title: "View Registrations",
    desc: "Search registrations and export CSV",
    href: "/admin/registrations",
    external: false,
    icon: "📋",
  },
  {
    title: "View Public Site",
    desc: "Open the Macfiesta public website",
    href: "/",
    external: false,
    icon: "🌐",
  },
];

export const POSITION_LABELS = {
  first: "1st Prize",
  second: "2nd Prize",
  third: "3rd Prize",
  special: "Special Mention",
};

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
