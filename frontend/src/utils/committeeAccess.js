/** Admin nav items keyed by committee module from /auth/me. */

export const ADMIN_NAV = [
  { to: "/admin/insights", label: "Insights", module: "insights", end: true },
  { to: "/admin/events", label: "Events", module: "events" },
  { to: "/admin/registrations", label: "Event Registrations", module: "registrations" },
  { to: "/admin/results", label: "Results", module: "results" },
  { to: "/admin/schedule", label: "Event Schedule", module: "schedule" },
  { to: "/admin/users", label: "Users", module: "users" },
  { to: "/admin/verification", label: "Verification", module: "verification" },
  { to: "/admin/reports", label: "Reports", module: "reports" },
  { to: "/admin/content/sponsors", label: "Sponsors", module: "sponsors" },
  { to: "/admin/content/guests", label: "Guests List", module: "guests" },
  { to: "/admin/content", label: "Website Content", module: "content", end: true },
  { to: "/admin/announcements", label: "Announcements", module: "announcements" },
  { to: "/admin/gallery", label: "Gallery", module: "gallery" },
];

export function filterAdminNav(modules) {
  const set = new Set(modules || []);
  return ADMIN_NAV.filter((item) => set.has(item.module));
}

export function defaultAdminPath(modules) {
  const nav = filterAdminNav(modules);
  return nav[0]?.to || "/admin/insights";
}

export function pathAllowed(pathname, modules) {
  const set = new Set(modules || []);
  if (pathname === "/admin" || pathname === "/admin/") {
    return set.has("insights");
  }
  const match = ADMIN_NAV.find((item) => {
    if (item.end) return pathname === item.to;
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  });
  if (!match) return true;
  return set.has(match.module);
}
