// Navigation data model — Super Admin Workspaces

import {
  RiHome5Line,
  RiCompass3Line,
  RiGlobalLine,
  RiGroupLine,
  RiFlashlightLine,
  RiWalletLine,
  RiMegaphoneLine,
  RiFileChartLine,
  RiSettings3Line,
  RiUserHeartLine,
  RiScales3Line,
} from "react-icons/ri";

export interface NavPage {
  id: string;
  label: string;
  badge?: string;
  desc?: string;
}

export interface NavModule {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  desc: string;
  pages: NavPage[];
}

export const MODULES: NavModule[] = [
  {
    id: "dashboard",
    icon: RiHome5Line,
    label: "Dashboard",
    desc: "Command Center & Live Telemetry",
    pages: [],
  },
  {
    id: "volunteers.hq",
    icon: RiUserHeartLine,
    label: "Volunteer HQ",
    desc: "Complete Volunteer Control, Shift & Duty Roster",
    pages: [
      { id: "volunteers.hq.dashboard", label: "Volunteer Operations Hub", badge: "Live", desc: "Duty telemetry & live tracking" },
      { id: "volunteers.hq.roster", label: "Volunteer Staff Roster", desc: "Manage accounts & RBAC permissions" },
      { id: "volunteers.hq.tasks", label: "Task & Duty Assignments", desc: "Assign events, venues & checklists" },
      { id: "volunteers.hq.attendance", label: "Attendance & Duty Log", desc: "Clock in/out logs & total hours" },
    ],
  },
  {
    id: "judges.command",
    icon: RiScales3Line,
    label: "Judge Command",
    desc: "Judge Allocation, Scorecard Builder & Results",
    pages: [
      { id: "judges.command.dashboard", label: "Judge Command Center", badge: "Live", desc: "Judging status & scorecard telemetry" },
      { id: "judges.command.roster", label: "Judge Directory & Profiles", desc: "Manage judge credentials & events" },
      { id: "judges.command.builder", label: "Score Sheet Builder", desc: "Custom evaluation criteria & weights" },
      { id: "judges.command.results", label: "Result Review & Approval", desc: "Approve winner scorecards & ties" },
    ],
  },

  {
    id: "festival",
    icon: RiCompass3Line,
    label: "Festival Management",
    desc: "Events, Media, Schedule, Results & Festival Control",
    pages: [
      { id: "events", label: "Events & Competitions", badge: "Live", desc: "Create, edit, queue sheets & rules" },
      { id: "events.media", label: "Event Photos & Video Manager", badge: "Media", desc: "Change cover photo, teaser video & gallery for events" },
      { id: "schedule", label: "Festival Schedule Builder", desc: "Drag & drop day timeline manager" },
      { id: "results", label: "Results & Winner Scorecards", desc: "Publish results & objection management" },
      { id: "certificates", label: "Certificate Generator", desc: "Auto-issue participation & winner PDFs" },
      { id: "festival.master", label: "Festival Control & Branding", desc: "Dates, countdowns, theme & toggles" },
    ],
  },
  {
    id: "website",
    icon: RiGlobalLine,
    label: "Website CMS & Media",
    desc: "Media Gallery, Banners & Website Content",
    pages: [
      { id: "cms.hero", label: "Homepage Hero & Video Banner", badge: "Live", desc: "Headline copy & video loop" },
      { id: "cms.about", label: "About Page Content", desc: "History, vision, mission & team" },
      { id: "cms.sponsors", label: "Sponsor Logos & Links", desc: "Platinum, Gold & Silver partners" },
      { id: "cms.gallery", label: "Photo & Video Gallery Studio", desc: "Upload photos & videos separately" },
      { id: "cms.faqs", label: "FAQ Manager", desc: "Frequently asked questions" },
      { id: "cms.contact", label: "Footer & Contact Details", desc: "Campus address, email & social links" },
    ],
  },


  {
    id: "participants",
    icon: RiGroupLine,
    label: "Participants",
    desc: "Online & Spot Registrations & Roster",
    pages: [
      { id: "registrations", label: "Registrations & QR Passes", badge: "Live", desc: "Online & spot registration gateway" },
      { id: "participants", label: "Participant Roster", desc: "Individual & team database" },
      { id: "colleges", label: "College Directory", desc: "Participating institutions & rankings" },
    ],
  },
  {
    id: "operations",
    icon: RiFlashlightLine,
    label: "Operations & Logistics",
    desc: "Hostels, Transportation, Food & Volunteers",
    pages: [
      { id: "accommodation", label: "Accommodation & Hostels", desc: "Male & female room allocation" },
      { id: "transportation", label: "Transport & Pickup Routes", desc: "Bus routes, drivers & arrival status" },
      { id: "food", label: "Food & Meal Coupons", desc: "Veg/Non-Veg meal verification" },
      { id: "volunteers", label: "Volunteer Roster", desc: "Duty allocation & department leads" },
    ],
  },
  {
    id: "finance",
    icon: RiWalletLine,
    label: "Finance & Accounting",
    desc: "Bank Ledger, Receipts & Refunds",
    pages: [
      { id: "finance.overview", label: "Income & Expense Statements", desc: "Bank-style accounting ledger" },
      { id: "finance.payments", label: "Pending Payment Review", badge: "Action", desc: "Verify UPI & Razorpay receipts" },
      { id: "finance.refunds", label: "Refund Management", desc: "Process refund requests" },
    ],
  },
  {
    id: "communication",
    icon: RiMegaphoneLine,
    label: "Communication",
    desc: "Push Notifications, SMS & Alerts",
    pages: [
      { id: "announcements", label: "Broadcasts & Emergency Alerts", badge: "Live", desc: "Push, SMS, email & emergency broadcast" },
    ],
  },
  {
    id: "reports",
    icon: RiFileChartLine,
    label: "Reports Center",
    desc: "PDF Statements, Excel & CSV Data",
    pages: [
      { id: "reports.events", label: "Events & Attendance Report", desc: "Participation statistics" },
      { id: "reports.finance", label: "Financial Accounts Statement", desc: "Full accounting summary" },
      { id: "reports.registrations", label: "Delegate Registration Export", desc: "CSV & PDF export" },
      { id: "reports.downloads", label: "System Downloads", desc: "Pre-generated PDF reports" },
    ],
  },
  {
    id: "ai.copilot",
    icon: RiFlashlightLine,
    label: "AI Control Copilot",
    desc: "Predictive Analytics & Anomaly Detection",
    pages: [
      { id: "ai.insights", label: "AI Registration Insights", badge: "AI", desc: "Predictive trend analysis" },
      { id: "ai.conflicts", label: "Smart Schedule Optimizer", desc: "Auto-detect venue & time overlaps" },
    ],
  },
  {
    id: "settings",
    icon: RiSettings3Line,
    label: "System Settings",
    desc: "User Roles, Payment Keys & Backup",
    pages: [
      { id: "cms.site_controls", label: "Site Controls", badge: "⚡", desc: "Registration open/close & maintenance mode toggles" },
      { id: "settings.roles", label: "User Roles & Permissions", desc: "Super admin, finance & event leads" },
      { id: "settings.payment", label: "Payment Gateway Credentials", desc: "Razorpay API keys" },
      { id: "settings.system", label: "Backup & System Logs", desc: "One-click DB backup & audit trail" },
      { id: "profile", label: "Super Admin Profile", desc: "Account security & password" },
    ],
  },
];

export function getModuleForPage(pageId: string): NavModule | undefined {
  return MODULES.find(
    (m) => m.id === pageId || m.pages.some((p) => p.id === pageId)
  );
}

export function getPageLabel(pageId: string): string {
  for (const m of MODULES) {
    if (m.id === pageId) return m.label;
    const p = m.pages.find((p) => p.id === pageId);
    if (p) return p.label;
  }
  return "Dashboard";
}
