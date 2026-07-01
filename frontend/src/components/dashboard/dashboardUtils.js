const ADMIN_BASE = "http://127.0.0.1:8000/admin";

export const QUICK_ACTIONS = [
  {
    title: "Add Event",
    desc: "Create a new competition in Django Admin",
    href: `${ADMIN_BASE}/events/event/add/`,
    external: true,
    icon: "📅",
  },
  {
    title: "Add Result",
    desc: "Publish winners for an event",
    href: `${ADMIN_BASE}/results/result/add/`,
    external: true,
    icon: "🏆",
  },
  {
    title: "Upload Gallery",
    desc: "Add fest photos to the gallery",
    href: `${ADMIN_BASE}/gallery/galleryimage/add/`,
    external: true,
    icon: "📷",
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
