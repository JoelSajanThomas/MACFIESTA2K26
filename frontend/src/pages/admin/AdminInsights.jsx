import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import {
  getDashboardStats,
  getEvents,
  getAdminRegistrations,
  getAnnouncements,
} from "../../services/api";
import { useAdminStaff } from "../../components/admin/AdminStaffContext";
import { dashboardRoleLabel, filterAdminNav } from "../../utils/committeeAccess";

import {
  RiShieldFlashLine,
  RiQrCodeLine,
  RiWalletLine,
  RiHotelBedLine,
  RiCompass3Line,
  RiFileChartLine,
  RiToggleLine,
  RiSparklingLine,
  RiTimeLine,
  RiUserHeartLine,
} from "react-icons/ri";

function money(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

const ACTION_ICONS = {
  "Payments": RiWalletLine,
  "Review Pending Payments": RiWalletLine,
  "Events": RiCompass3Line,
  "Registrations": RiUserHeartLine,
  "QR Check-in": RiQrCodeLine,
  "Scan QR": RiQrCodeLine,
  "Hospitality": RiHotelBedLine,
  "Schedule": RiTimeLine,
  "Reports": RiFileChartLine,
  "Site Controls": RiToggleLine,
};

function DeskHome({ title, subtitle, kpis, actions, canControl = false, children }) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* S.H.I.E.L.D. MASTER COMMAND HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-black/90 via-[#0A0D1A] to-[#05050A] border border-arc-cyan/30 shadow-[0_0_40px_rgba(0,212,255,0.15)] backdrop-blur-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-[450px] h-[250px] bg-marvel-red/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[200px] bg-arc-cyan/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="space-y-3 relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-metallic-gold text-black shadow-[0_0_12px_rgba(255,215,0,0.3)] flex items-center gap-1.5 font-mono">
              <RiShieldFlashLine className="animate-pulse" /> S.H.I.E.L.D. COMMAND HQ
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-arc-cyan/15 text-arc-cyan border border-arc-cyan/40 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> LIVE TELEMETRY
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight font-excon-black">
            <span className="shimmer-text">COMMAND</span>{" "}
            <span className="gradient-text-gold">{title}</span>
          </h1>

          <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-mono max-w-2xl">
            {subtitle} · Unified tactical operational dashboard for MACFIESTA. Monitor registrations, verify participant credentials, and manage live event operations.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap lg:flex-col gap-2.5 shrink-0">
          {canControl && (
            <Link
              to="/admin/controls"
              className="px-4 py-2.5 rounded-xl bg-metallic-gold hover:bg-white text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all flex items-center gap-2"
            >
              <RiToggleLine className="text-base" /> Site Controls
            </Link>
          )}
          <Link
            to="/admin/verification"
            className="px-4 py-2.5 rounded-xl bg-black/60 hover:bg-white/10 text-arc-cyan border border-arc-cyan/40 font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all flex items-center gap-2"
          >
            <RiQrCodeLine className="text-base" /> QR Gate Scan
          </Link>
        </div>
      </div>

      {/* METRIC KPI STAT CARDS */}
      {kpis?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <article key={k.label} className="admin-kpi-card group cursor-default">
              <strong className="group-hover:scale-105 transition-transform origin-left">{k.value}</strong>
              <span className="truncate block mt-1">{k.label}</span>
            </article>
          ))}
        </div>
      )}

      {/* QUICK OPERATIONAL ACTIONS */}
      {actions?.length > 0 && (
        <div className="glass-aurora p-6 rounded-3xl border border-white/10 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-metallic-gold flex items-center gap-2">
            <RiSparklingLine className="text-sm text-metallic-gold" />
            <span>Quick Tactical Actions</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {actions.map((a) => {
              const Icon = ACTION_ICONS[a.label] || RiCompass3Line;
              return (
                <Link
                  key={a.to + a.label}
                  to={a.to}
                  className={`admin-action-btn flex items-center justify-center gap-2 text-xs py-3.5${a.primary ? " admin-action-btn--primary" : ""}`}
                >
                  <Icon className="text-base shrink-0" />
                  <span className="truncate">{a.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}

export default function AdminInsights() {
  const staff = useAdminStaff();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getEvents().catch(() => ({ data: [] })),
      getAdminRegistrations().catch(() => ({ data: [] })),
      getAnnouncements().catch(() => ({ data: [] })),
    ])
      .then(([statsRes, eventsRes, regsRes, annRes]) => {
        setStats(statsRes.data);
        setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
        const regs = regsRes.data;
        setRegistrations(Array.isArray(regs) ? regs : regs?.results || []);
        setAnnouncements(Array.isArray(annRes.data) ? annRes.data : []);
      })
      .catch(() => setError("Unable to connect to server. Try again."))
      .finally(() => setLoading(false));
  }, []);

  const committee = staff?.is_superuser ? "core" : staff?.committee || "core";
  const modules = useMemo(() => staff?.modules || [], [staff?.modules]);
  const nav = useMemo(() => filterAdminNav(modules, committee), [modules, committee]);
  const allowed = useMemo(() => new Set(nav.map((n) => n.to)), [nav]);
  const welcomeName = staff?.display_name || staff?.username || "Coordinator";
  const role = dashboardRoleLabel(committee, staff?.is_superuser);
  const payment = stats?.payment_summary || {};

  const activeRegs = useMemo(
    () => registrations.filter((r) => r.approval_status !== "cancelled"),
    [registrations]
  );

  if (loading) return <LoadingState message="Loading…" />;
  if (error) return <ErrorState message={error} />;

  const today = new Date().toDateString();
  const verifiedToday = activeRegs.filter(
    (r) =>
      r.payment_status === "paid" &&
      r.payment_verified_at &&
      new Date(r.payment_verified_at).toDateString() === today
  ).length;
  const pendingPay = activeRegs.filter((r) => r.payment_status === "pending").length;
  const rejectedPay = activeRegs.filter(
    (r) => r.payment_status === "rejected" || r.payment_status === "failed"
  ).length;
  const stayReqs = activeRegs.filter((r) => r.needs_accommodation).length;
  const boys = activeRegs.filter((r) => r.needs_accommodation && r.gender === "male").length;
  const girls = activeRegs.filter((r) => r.needs_accommodation && r.gender === "female").length;
  const pendingAlloc = activeRegs.filter(
    (r) => r.needs_accommodation && (!r.accommodation_status || r.accommodation_status === "pending")
  ).length;
  const foodReqs = activeRegs.filter((r) => r.food_preference && r.food_preference !== "none");
  const veg = foodReqs.filter((r) => r.food_preference === "veg").length;
  const nonVeg = foodReqs.filter((r) => r.food_preference === "non_veg").length;
  const eventsToday = (events || []).filter((e) => {
    if (!e.event_date) return false;
    return new Date(e.event_date).toDateString() === today;
  }).length;
  const resultsPending = (events || []).filter(
    (e) => !e.is_result_published && (e.status === "completed" || e.status === "ongoing")
  ).length;

  const can = (path) => allowed.has(path);

  if (committee === "finance") {
    return (
      <DeskHome
        title="Finance Desk"
        subtitle={`Hello, ${welcomeName}`}
        kpis={[
          { value: pendingPay, label: "Pending payments" },
          { value: verifiedToday, label: "Verified today" },
          { value: rejectedPay, label: "Rejected" },
          { value: money(stats?.verified_revenue), label: "Total verified amount" },
        ]}
        actions={[
          can("/admin/payments") && { to: "/admin/payments", label: "Review Pending Payments", primary: true },
          can("/admin/registrations") && { to: "/admin/registrations", label: "Search Registration" },
          can("/admin/reports") && { to: "/admin/reports", label: "Payment Report" },
        ].filter(Boolean)}
      />
    );
  }

  if (committee === "food") {
    return (
      <DeskHome
        title="Food Desk"
        subtitle={`Hello, ${welcomeName}`}
        kpis={[
          { value: foodReqs.length, label: "Total meals" },
          { value: veg, label: "Veg" },
          { value: nonVeg, label: "Non-veg" },
          { value: foodReqs.filter((r) => r.food_preference === "jain").length, label: "Jain / other" },
        ]}
        actions={[
          can("/admin/hospitality") && { to: "/admin/hospitality?tab=food", label: "View Food List", primary: true },
          can("/admin/reports") && { to: "/admin/reports", label: "Print / Reports" },
          can("/admin/announcements") && { to: "/admin/announcements", label: "Announcements" },
        ].filter(Boolean)}
      />
    );
  }

  if (committee === "hospitality") {
    return (
      <DeskHome
        title="Hospitality Desk"
        subtitle={`Hello, ${welcomeName}`}
        kpis={[
          { value: stayReqs, label: "Accommodation requests" },
          { value: boys, label: "Boys" },
          { value: girls, label: "Girls" },
          { value: pendingAlloc, label: "Pending allocation" },
        ]}
        actions={[
          can("/admin/hospitality") && { to: "/admin/hospitality?tab=boys", label: "Boys Hostel", primary: true },
          can("/admin/hospitality") && { to: "/admin/hospitality?tab=girls", label: "Girls Hostel" },
          can("/admin/registrations") && { to: "/admin/registrations", label: "Search Student" },
          can("/admin/reports") && { to: "/admin/reports", label: "Accommodation Report" },
          can("/admin/verification") && { to: "/admin/verification", label: "Check-in" },
        ].filter(Boolean)}
      />
    );
  }

  if (committee === "event") {
    return (
      <DeskHome
        title="Event Desk"
        subtitle={`Hello, ${welcomeName}`}
        kpis={[
          { value: eventsToday || stats?.events_today || 0, label: "Events today" },
          { value: stats?.total_registrations ?? activeRegs.length, label: "Participants" },
          { value: stats?.attended ?? "—", label: "Checked in" },
          { value: resultsPending, label: "Results pending" },
        ]}
        actions={[
          can("/admin/events") && { to: "/admin/events", label: "Events", primary: true },
          can("/admin/events") && { to: "/admin/events", label: "Participants" },
          can("/admin/results") && { to: "/admin/results", label: "Set Winners" },
          can("/admin/schedule") && { to: "/admin/schedule", label: "Schedule" },
          can("/admin/verification") && { to: "/admin/verification", label: "Scan / Check-in" },
        ].filter(Boolean)}
      />
    );
  }

  if (committee === "program") {
    return (
      <DeskHome
        title="Program Desk"
        subtitle={`Hello, ${welcomeName}`}
        kpis={[
          { value: eventsToday || stats?.events_today || 0, label: "Today's events" },
          { value: (events || []).filter((e) => e.status === "ongoing").length, label: "Running now" },
          { value: (events || []).filter((e) => e.status === "upcoming").length, label: "Upcoming" },
        ]}
        actions={[
          can("/admin/schedule") && { to: "/admin/schedule", label: "Schedule", primary: true },
          can("/admin/schedule") && { to: "/admin/schedule?print=1", label: "Queue Sheet" },
          can("/admin/announcements") && { to: "/admin/announcements", label: "Announcement" },
          can("/admin/events") && { to: "/admin/events", label: "Events" },
        ].filter(Boolean)}
      />
    );
  }

  if (committee === "cultural") {
    return (
      <DeskHome
        title="Cultural Desk"
        subtitle={`Hello, ${welcomeName}`}
        kpis={[
          { value: (events || []).filter((e) => String(e.category || "").toLowerCase() === "arts").length, label: "Arts / cultural events" },
          { value: stats?.total_registrations ?? "—", label: "Participants" },
          { value: resultsPending, label: "Results pending" },
        ]}
        actions={[
          can("/admin/events") && { to: "/admin/events?category=arts", label: "Events", primary: true },
          can("/admin/results") && { to: "/admin/results", label: "Set Winners" },
          can("/admin/gallery") && { to: "/admin/gallery", label: "Gallery" },
          can("/admin/announcements") && { to: "/admin/announcements", label: "Announcements" },
        ].filter(Boolean)}
      />
    );
  }

  if (committee === "publicity") {
    return (
      <DeskHome
        title="Publicity Desk"
        subtitle={`Hello, ${welcomeName}`}
        kpis={[
          { value: announcements.length, label: "Announcements" },
          { value: stats?.total_gallery_images ?? "—", label: "Gallery items" },
        ]}
        actions={[
          can("/admin/announcements") && { to: "/admin/announcements", label: "Announcements", primary: true },
          can("/admin/gallery") && { to: "/admin/gallery", label: "Gallery" },
          can("/admin/content/sponsors") && { to: "/admin/content/sponsors", label: "Sponsors" },
          can("/admin/content/guests") && { to: "/admin/content/guests", label: "Guests" },
          can("/admin/content") && { to: "/admin/content", label: "Website Content" },
        ].filter(Boolean)}
      />
    );
  }

  if (committee === "invitation") {
    return (
      <DeskHome
        title="Invitation Desk"
        subtitle={`Hello, ${welcomeName}`}
        kpis={[{ value: "—", label: "Open guest list for live counts" }]}
        actions={[
          can("/admin/content/guests") && { to: "/admin/content/guests", label: "Guest List", primary: true },
          can("/admin/content/guests") && { to: "/admin/content/guests/new", label: "Add Guest" },
          can("/admin/announcements") && { to: "/admin/announcements", label: "Announcements" },
          can("/admin/content") && { to: "/admin/content", label: "Website Content" },
        ].filter(Boolean)}
      />
    );
  }

  if (committee === "verification") {
    return (
      <DeskHome
        title="Verification Desk"
        subtitle={`Hello, ${welcomeName}`}
        kpis={[
          { value: stats?.attended ?? "—", label: "Checked in" },
          { value: payment.pending ?? pendingPay, label: "Payment pending" },
          { value: stats?.total_registrations ?? "—", label: "Registrations" },
        ]}
        actions={[
          can("/admin/verification") && { to: "/admin/verification", label: "Scan QR", primary: true },
          can("/admin/registrations") && { to: "/admin/registrations", label: "Search Registration" },
        ].filter(Boolean)}
      />
    );
  }

  // Core admin
  return (
    <DeskHome
      title={role}
      subtitle={`Hello, ${welcomeName} — live operations overview`}
      canControl={Boolean(staff?.is_superuser || committee === "core")}
      kpis={[
        { value: stats?.total_registrations ?? "—", label: "Total registrations" },
        { value: payment.pending ?? "—", label: "Payments pending" },
        { value: payment.paid ?? "—", label: "Payments verified" },
        { value: stats?.attended ?? "—", label: "Checked in" },
        { value: stats?.accommodation_requests ?? "—", label: "Accommodation" },
        { value: stats?.food_requests ?? "—", label: "Food requests" },
        { value: stats?.events_today ?? "—", label: "Events today" },
        { value: money(stats?.verified_revenue), label: "Verified revenue" },
      ]}
      actions={[
        can("/admin/events") && { to: "/admin/events", label: "Events" },
        can("/admin/registrations") && { to: "/admin/registrations", label: "Registrations" },
        can("/admin/payments") && { to: "/admin/payments", label: "Payments", primary: true },
        can("/admin/verification") && { to: "/admin/verification", label: "QR Check-in" },
        can("/admin/hospitality") && { to: "/admin/hospitality", label: "Hospitality" },
        can("/admin/schedule") && { to: "/admin/schedule", label: "Schedule" },
        can("/admin/results") && { to: "/admin/results", label: "Results" },
        can("/admin/reports") && { to: "/admin/reports", label: "Reports" },
        can("/admin/users") && { to: "/admin/users", label: "Staff" },
        can("/admin/content") && { to: "/admin/content", label: "Website CMS" },
      ].filter(Boolean)}
    >
      {activeRegs.length > 0 && (
        <div className="glass-aurora p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-metallic-gold flex items-center gap-2">
              <RiUserHeartLine className="text-sm text-metallic-gold" />
              <span>Recent Participant Registrations</span>
            </h2>
            <Link
              to="/admin/registrations"
              className="text-xs font-bold text-arc-cyan hover:underline uppercase tracking-wider"
            >
              View All ({activeRegs.length}) →
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="admin-table w-full text-left">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>ID Number</th>
                  <th>Event</th>
                  <th>College</th>
                  <th>Payment</th>
                  <th>Approval</th>
                </tr>
              </thead>
              <tbody>
                {activeRegs.slice(0, 6).map((r) => (
                  <tr key={r.id}>
                    <td className="font-bold text-white">{r.participant_name}</td>
                    <td className="font-mono text-arc-cyan text-xs">{r.registration_number}</td>
                    <td className="text-white/80">{r.event_title}</td>
                    <td className="text-white/60 text-xs truncate max-w-[200px]">{r.college_name}</td>
                    <td>
                      <span className={`status-chip ${r.payment_status === "paid" ? "status-chip--paid" : "status-chip--pending"}`}>
                        {r.payment_status || "pending"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-chip ${r.approval_status === "approved" ? "status-chip--approved" : "status-chip--warning"}`}>
                        {r.approval_status || "submitted"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DeskHome>
  );
}

