/** Admin nav items keyed by committee module from /auth/me. */



export const ADMIN_NAV = [
  { to: "/admin/insights", label: "Home", module: "insights", end: true, group: "Operations" },
  { to: "/admin/controls", label: "Site Controls", module: "insights", group: "Operations", superuserOnly: true },
  { to: "/admin/events", label: "Events", module: "events", group: "Operations" },
  { to: "/admin/registrations", label: "Registrations", module: "registrations", group: "Operations" },
  { to: "/admin/institutions", label: "Colleges & Schools", module: "registrations", group: "Operations" },
  { to: "/admin/payments", label: "Payments", module: "registrations", group: "Operations", financeOnly: true },
  { to: "/admin/hospitality", label: "Hospitality", module: "registrations", group: "Operations", hospitalityOnly: true },
  { to: "/admin/verification", label: "Verification", module: "verification", group: "Operations" },
  { to: "/admin/results", label: "Results", module: "results", group: "Operations" },
  { to: "/admin/schedule", label: "Schedule", module: "schedule", group: "Operations" },
  { to: "/admin/announcements", label: "Announcements", module: "announcements", group: "Website" },
  { to: "/admin/gallery", label: "Gallery", module: "gallery", group: "Website" },
  { to: "/admin/content/sponsors", label: "Sponsors", module: "sponsors", group: "Website" },
  { to: "/admin/content/guests", label: "Guests", module: "guests", group: "Website" },
  { to: "/admin/content", label: "Website CMS", module: "content", end: true, group: "Website" },
  { to: "/admin/users", label: "Staff / Volunteers", module: "users", group: "Management", superuserOnly: true },
  { to: "/admin/participant-list", label: "User List", module: "users", group: "Management", superuserOnly: true },
  { to: "/admin/audit-logs", label: "Audit Logs", module: "insights", group: "Management", superuserOnly: true },
  { to: "/admin/reports", label: "Reports", module: "reports", group: "Management" },
];



const ROLE_LABELS = {
  core: "Core Admin",
  finance: "Finance Desk",
  food: "Food Desk",
  hospitality: "Hospitality Desk",
  event: "Event Desk",
  program: "Program Desk",
  cultural: "Cultural Desk",
  publicity: "Publicity Desk",
  invitation: "Invitation Desk",
  verification: "Verification Desk",
};



const GROUP_ORDER = ["Operations", "Website", "Management"];



export function dashboardRoleLabel(committee, isSuperuser = false) {
  if (isSuperuser) return "Core Admin";
  return ROLE_LABELS[committee] || "Staff Desk";
}



export function filterAdminNav(modules, committee = null, isSuperuser = false) {
  const set = new Set(modules || []);

  return ADMIN_NAV.filter((item) => {
    if (!set.has(item.module)) return false;

    if (item.superuserOnly && !isSuperuser && committee !== "core") {
      return false;
    }

    if (item.financeOnly && committee && !["finance", "core"].includes(committee)) {
      if (committee !== "finance" && committee !== "core") return false;
    }

    if (item.hospitalityOnly && committee && !["hospitality", "food", "core"].includes(committee)) {
      return false;
    }

    return true;
  });
}



export function groupedAdminNav(modules, committee = null, isSuperuser = false) {
  const nav = filterAdminNav(modules, committee, isSuperuser);

  return GROUP_ORDER.map((group) => ({
    group,
    items: nav.filter((item) => item.group === group),
  })).filter((g) => g.items.length > 0);
}



/** Mobile bottom nav (max ~5). */

export function committeeBottomNav(committee, modules = []) {

  const set = new Set(modules || []);

  const has = (m) => set.has(m);



  const maps = {

    finance: [

      { to: "/admin/insights", label: "Home" },

      { to: "/admin/payments", label: "Pending" },

      { to: "/admin/registrations", label: "Search" },

      { to: "/admin/reports", label: "Reports" },

      { to: "/admin/insights", label: "More", more: true },

    ],

    verification: [

      { to: "/admin/insights", label: "Home" },

      { to: "/admin/verification", label: "Scan" },

      { to: "/admin/registrations", label: "Search" },

      { to: "/admin/reports", label: "Reports" },

      { to: "/admin/insights", label: "More", more: true },

    ],

    event: [

      { to: "/admin/insights", label: "Home" },

      { to: "/admin/events", label: "Events" },

      { to: "/admin/verification", label: "Scan" },

      { to: "/admin/reports", label: "Reports" },

      { to: "/admin/insights", label: "More", more: true },

    ],

    hospitality: [

      { to: "/admin/insights", label: "Home" },

      { to: "/admin/hospitality", label: "Stay" },

      { to: "/admin/verification", label: "Scan" },

      { to: "/admin/reports", label: "Reports" },

      { to: "/admin/insights", label: "More", more: true },

    ],

    food: [

      { to: "/admin/insights", label: "Home" },

      { to: "/admin/hospitality?tab=food", label: "Food" },

      { to: "/admin/reports", label: "Reports" },

      { to: "/admin/announcements", label: "News" },

      { to: "/admin/insights", label: "More", more: true },

    ],

    program: [

      { to: "/admin/insights", label: "Home" },

      { to: "/admin/schedule", label: "Schedule" },

      { to: "/admin/events", label: "Events" },

      { to: "/admin/announcements", label: "News" },

      { to: "/admin/reports", label: "Reports" },

    ],

    cultural: [

      { to: "/admin/insights", label: "Home" },

      { to: "/admin/events", label: "Events" },

      { to: "/admin/results", label: "Results" },

      { to: "/admin/gallery", label: "Gallery" },

      { to: "/admin/announcements", label: "News" },

    ],

    publicity: [

      { to: "/admin/insights", label: "Home" },

      { to: "/admin/announcements", label: "News" },

      { to: "/admin/gallery", label: "Gallery" },

      { to: "/admin/content/sponsors", label: "Sponsors" },

      { to: "/admin/content", label: "CMS" },

    ],

    invitation: [

      { to: "/admin/insights", label: "Home" },

      { to: "/admin/content/guests", label: "Guests" },

      { to: "/admin/announcements", label: "News" },

      { to: "/admin/content", label: "CMS" },

      { to: "/admin/insights", label: "More", more: true },

    ],

    core: [

      { to: "/admin/insights", label: "Home" },

      { to: "/admin/events", label: "Events" },

      { to: "/admin/payments", label: "Payments" },

      { to: "/admin/verification", label: "Scan" },

      { to: "/admin/reports", label: "Reports" },

    ],

  };



  const list = maps[committee] || maps.core;

  return list.filter((item) => {

    if (item.to.includes("payments") && !has("registrations")) return false;

    if (item.to.includes("verification") && !has("verification")) return false;

    if (item.to.includes("events") && !has("events") && !item.to.includes("insights")) return false;

    if (item.to.includes("schedule") && !has("schedule")) return false;

    if (item.to.includes("reports") && !has("reports")) return false;

    if (item.to.includes("gallery") && !has("gallery")) return false;

    if (item.to.includes("announcements") && !has("announcements")) return false;

    if (item.to.includes("sponsors") && !has("sponsors")) return false;

    if (item.to.includes("guests") && !has("guests")) return false;

    if (item.to.includes("/content") && !has("content") && !has("guests") && !has("sponsors")) return false;

    if (item.to.includes("hospitality") && !has("registrations")) return false;

    return true;

  }).slice(0, 5);

}



export function defaultAdminPath(modules, committee = null) {
  const nav = filterAdminNav(modules, committee);
  return nav[0]?.to || "/admin/insights";
}

/** Post-login home for volunteers — role desk home (existing routes only). */
export function volunteerHomePath(committee, modules = []) {
  const map = {
    finance: "/admin/insights",
    food: "/admin/insights",
    hospitality: "/admin/insights",
    event: "/admin/insights",
    program: "/admin/insights",
    cultural: "/admin/insights",
    publicity: "/admin/insights",
    invitation: "/admin/insights",
    verification: "/admin/insights",
    core: "/admin/insights",
  };
  const preferred = map[committee] || "/admin/insights";
  if (pathAllowed(preferred.split("?")[0], modules, committee)) {
    return preferred;
  }
  return defaultAdminPath(modules, committee);
}

/** Where staff/volunteers should land after logout. */
export function staffLogoutPath() {
  return "/login";
}

export function pathAllowed(pathname, modules, committee = null, isSuperuser = false) {
  const set = new Set(modules || []);

  if (pathname === "/admin" || pathname === "/admin/") {
    return set.has("insights");
  }

  if (pathname.startsWith("/admin/controls") || pathname.startsWith("/admin/site-controls")) {
    return isSuperuser || committee === "core";
  }

  if (pathname.startsWith("/admin/users")) {
    return isSuperuser || committee === "core";
  }

  if (pathname.startsWith("/admin/events/") && (pathname.includes("/participants") || pathname.includes("/winners"))) {
    return set.has("events");
  }

  if (pathname.startsWith("/admin/payments") || pathname === "/admin/finance") {
    return set.has("registrations") && (!committee || ["finance", "core"].includes(committee));
  }

  if (pathname.startsWith("/admin/hospitality") || pathname === "/admin/food") {
    return (
      set.has("registrations") &&
      (!committee || ["hospitality", "food", "core"].includes(committee))
    );
  }

  if (pathname.startsWith("/admin/content")) {
    if (isSuperuser || committee === "core") return true;
    if (pathname.startsWith("/admin/content/sponsors")) return set.has("sponsors");
    if (pathname.startsWith("/admin/content/guests")) return set.has("guests");
    return set.has("content");
  }

  const match = ADMIN_NAV.find((item) => {
    if (item.end) return pathname === item.to;
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  });

  if (!match) return true;

  if (match.superuserOnly && !isSuperuser && committee !== "core") {
    return false;
  }

  return set.has(match.module);
}


