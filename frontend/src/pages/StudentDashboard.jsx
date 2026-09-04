import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiShieldFlashLine,
  RiShieldCheckLine,
  RiUserStarLine,
  RiMailLine,
  RiTrophyLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiMapPinLine,
  RiTicketLine,
  RiQrCodeLine,
  RiCloseLine,
  RiArrowRightLine,
  RiFileList3Line,
  RiAlertFill,
  RiErrorWarningLine,
  RiNotification3Line,
  RiCheckLine,
} from "react-icons/ri";
import StatusChip from "../components/theme/StatusChip";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import PaymentProofPanel from "../components/PaymentProofPanel";
import TeamDashboardCard from "../components/TeamDashboardCard";
import { BackgroundVideo } from "../components/ui/BackgroundVideo";
import { usePageSeo } from "../hooks/usePageSeo";
import {
  getCurrentUser,
  getMyRegistrations,
  getEvents,
  getPublicFestConfig,
  isLoggedIn,
  cancelRegistration,
  getMyInvitations,
  respondTeamInvitation,
} from "../services/api";
import { applyPublicFestConfig, MACFIESTA_PAYMENT, calculateBatchFees } from "../utils/registrationFees";
import { isUnauthorized, logout } from "../utils/auth";
import { formatScheduleTime } from "../utils/scheduleUtils";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StudentDashboard() {
  const [authState, setAuthState] = useState("checking");
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "individual" | "teams"

  const [busyId, setBusyId] = useState(null);
  const [payment, setPayment] = useState(() => ({ ...MACFIESTA_PAYMENT }));
  const [expandedPayId, setExpandedPayId] = useState(null);
  const [cancelModalTarget, setCancelModalTarget] = useState(null);
  const [respondingInviteId, setRespondingInviteId] = useState(null);

  usePageSeo({
    title: "Participant Command Center · MacFiesta 2026",
    description: "Manage registered missions, team squads, Captain dashboards, access verified QR passes, and track payment verifications.",
  });

  useEffect(() => {
    getPublicFestConfig()
      .then((res) => {
        applyPublicFestConfig(res.data);
        setPayment({ ...MACFIESTA_PAYMENT });
      })
      .catch(() => {});
  }, []);

  function handleCancelClick(reg) {
    setCancelModalTarget(reg);
  }

  async function confirmCancelRegistration() {
    if (!cancelModalTarget) return;
    const regId = cancelModalTarget.id;
    setBusyId(regId);
    setError("");
    try {
      await cancelRegistration(regId);
      setRegistrations((prev) => prev.filter((r) => r.id !== regId));
      setCancelModalTarget(null);
      load();
    } catch (err) {
      const data = err?.response?.data;
      const msg = data?.detail || (typeof data === "string" ? data : "Could not cancel registration.");
      setError(msg);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRespondInvite(invitationId, action) {
    setRespondingInviteId(invitationId);
    try {
      await respondTeamInvitation({ invitation_id: invitationId, action });
      setInvitations((prev) => prev.filter((inv) => inv.invitation_id !== invitationId));
      load();
    } catch (err) {
      alert(err?.response?.data?.detail || "Could not respond to invitation.");
    } finally {
      setRespondingInviteId(null);
    }
  }

  const load = useCallback(() => {
    if (!isLoggedIn()) {
      setAuthState("guest");
      return;
    }

    setError("");
    Promise.all([
      getCurrentUser(),
      getMyRegistrations(),
      getEvents(),
      getMyInvitations().catch(() => ({ data: [] })),
    ])
      .then(([userRes, regsRes, eventsRes, invitesRes]) => {
        const eventsList = Array.isArray(eventsRes.data)
          ? eventsRes.data
          : eventsRes.data?.results || [];
        const eventMap = Object.fromEntries(eventsList.map((e) => [e.id, e]));
        const regsList = Array.isArray(regsRes.data)
          ? regsRes.data
          : regsRes.data?.results || [];
        const merged = regsList.map((r) => ({
          ...r,
          eventData: eventMap[r.event],
        }));
        setUser(userRes.data);
        setRegistrations(merged);
        setInvitations(invitesRes.data || []);
        setAuthState("ready");
      })
      .catch((err) => {
        if (isUnauthorized(err)) {
          logout();
          setAuthState("guest");
          return;
        }
        setError("Could not load your dashboard.");
        setAuthState("error");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (authState === "checking") {
    return (
      <div className="bg-[#05050A] min-h-screen pt-32 pb-16 flex items-center justify-center font-excon">
        <LoadingState message="Initializing S.H.I.E.L.D. Agent Terminal…" />
      </div>
    );
  }

  if (authState === "guest") {
    return (
      <div className="bg-[#05050A] min-h-screen pt-28 pb-20 relative overflow-hidden font-excon">
        <BackgroundVideo
          src="/MARVEL/Video Project 6.mp4"
          fallbackSrc="/MARVEL/Video Project 4.mp4"
          opacity="opacity-45"
        />
        <div className="max-w-3xl mx-auto px-4 relative z-10 space-y-8 text-center pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. SECURE PROTOCOL</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">AGENT</span>{" "}
            <span className="gradient-text-gold">TERMINAL</span>
          </h1>
          <div className="marvel-card p-8 rounded-3xl border border-white/15 bg-[#0A0D1A]/95 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            <EmptyState
              icon="🔐"
              title="Authentication Clearance Required"
              message="Sign in with your delegate account to view your enrolled missions, squad dashboards, verified QR entry passes, and payment receipts."
              action={
                <Link
                  to="/login?next=/student-dashboard"
                  className="px-8 py-3.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] font-excon-black inline-flex items-center gap-2"
                >
                  <span>Authenticate Clearance (Login)</span>
                  <RiArrowRightLine />
                </Link>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  if (authState === "error") {
    return (
      <div className="bg-[#05050A] min-h-screen pt-32 pb-16 flex items-center justify-center font-excon px-4">
        <div className="max-w-md w-full">
          <ErrorState message={error} onRetry={load} />
        </div>
      </div>
    );
  }

  const teamRegistrations = registrations.filter(
    (r) => r.registration_type === "team" || (r.eventData?.max_team_size || r.max_team_size || 1) > 1
  );
  const individualRegistrations = registrations.filter(
    (r) => r.registration_type === "individual" && (r.eventData?.max_team_size || r.max_team_size || 1) <= 1
  );

  const displayedRegistrations =
    activeTab === "teams"
      ? teamRegistrations
      : activeTab === "individual"
      ? individualRegistrations
      : registrations;

  return (
    <div className="bg-[#05050A] min-h-screen pt-24 pb-36 sm:pb-24 relative overflow-hidden font-excon">
      {/* Cinematic Marvel Background Atmosphere */}
      <BackgroundVideo
        src="/MARVEL/Video Project 6.mp4"
        fallbackSrc="/MARVEL/Video Project 4.mp4"
        opacity="opacity-40"
      />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[350px] rounded-full bg-metallic-gold/5 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[350px] rounded-full bg-arc-cyan/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* ─── Hero Section Header ─── */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span className="hidden sm:inline">S.H.I.E.L.D. AGENT TELEMETRY · PARTICIPANT HUB</span>
            <span className="sm:hidden">AGENT HUB</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">MY AGENT</span>{" "}
            <span className="gradient-text-gold">DASHBOARD</span>
          </h1>

          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-metallic-gold to-transparent origin-center" />

          <p className="text-white/70 text-xs sm:text-sm font-space max-w-xl mx-auto leading-relaxed">
            Welcome, <strong className="text-metallic-gold">{user?.full_name || user?.email || "Agent"}</strong>. Review your individual &amp; squad missions, track member invitations, manage QR passes, and verify fee clearances.
          </p>
        </div>

        {/* ─── Pending Squad Invitations Banner (if any) ─── */}
        {invitations.length > 0 && (
          <div className="marvel-card p-5 sm:p-6 rounded-3xl border border-arc-cyan/40 bg-[#0A0D1A]/95 shadow-[0_0_40px_rgba(0,210,255,0.15)] space-y-4">
            <div className="flex items-center gap-2.5 text-arc-cyan font-black uppercase text-xs tracking-wider font-mono">
              <RiNotification3Line className="text-base animate-bounce" />
              <span>Pending Squad Invitations ({invitations.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invitations.map((inv) => (
                <div
                  key={inv.invitation_id}
                  className="p-4 rounded-2xl bg-black/60 border border-arc-cyan/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] text-arc-cyan uppercase font-mono font-bold block">
                      {inv.event_title}
                    </span>
                    <h4 className="text-base font-black text-white uppercase font-excon-bold">
                      Team {inv.team_name}
                    </h4>
                    <p className="text-xs text-white/60 font-mono">
                      Invited by Captain: <strong className="text-metallic-gold">{inv.captain_name}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={respondingInviteId === inv.invitation_id}
                      onClick={() => handleRespondInvite(inv.invitation_id, "accept")}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase transition-all shadow-md font-excon-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RiCheckLine />
                      <span>Accept</span>
                    </button>
                    <button
                      type="button"
                      disabled={respondingInviteId === inv.invitation_id}
                      onClick={() => handleRespondInvite(inv.invitation_id, "decline")}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-bold transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Telemetry Overview Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Registered Missions Counter */}
          <div className="marvel-card p-5 rounded-2xl border border-metallic-gold/40 bg-[#0A0D1A]/95 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-metallic-gold font-mono">
                ENROLLED MISSIONS
              </span>
              <div className="text-4xl font-black text-white font-excon-black">
                {registrations.length}
              </div>
              <span className="text-xs text-white/50 font-space">
                {teamRegistrations.length} Teams · {individualRegistrations.length} Solo
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-metallic-gold/10 border border-metallic-gold/30 text-metallic-gold flex items-center justify-center text-2xl shadow-inner">
              <RiTrophyLine />
            </div>
          </div>

          {/* Delegate Identity Profile */}
          <div className="sm:col-span-2 md:col-span-2 marvel-card p-5 rounded-2xl border border-white/15 bg-[#0A0D1A]/95 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-arc-cyan/10 border border-arc-cyan/30 text-arc-cyan flex items-center justify-center text-2xl shrink-0 shadow-inner">
                <RiUserStarLine />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-arc-cyan font-mono">
                  VERIFIED DELEGATE PROFILE
                </span>
                <h3 className="text-lg font-black text-white font-excon-bold">
                  {user?.full_name || user?.username || "MacFiesta Delegate"}
                </h3>
                <p className="text-xs text-white/60 font-mono flex items-center gap-1.5">
                  <RiMailLine className="text-white/40" />
                  <span>{user?.email || "—"}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase font-mono">
                <RiShieldCheckLine />
                <span>Authorized</span>
              </span>
            </div>
          </div>
        </div>

        {/* ─── Registrations Section with Tabs ─── */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-metallic-gold/10 border border-metallic-gold/30 text-metallic-gold flex items-center justify-center">
                <RiFileList3Line className="text-lg" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-excon-black">
                  My Registrations &amp; Squads
                </h2>
                <span className="text-[11px] text-white/50 font-space">
                  Manage team rosters, Captain dashboards, and digital passes
                </span>
              </div>
            </div>

            {/* Filter Tabs — scrollable on mobile */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/10 font-mono text-xs overflow-x-auto scrollbar-hide -mx-0.5 px-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-xl font-bold uppercase transition-all ${
                  activeTab === "all"
                    ? "bg-metallic-gold text-black shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                All ({registrations.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("teams")}
                className={`px-3.5 py-1.5 rounded-xl font-bold uppercase transition-all ${
                  activeTab === "teams"
                    ? "bg-metallic-gold text-black shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Squads ({teamRegistrations.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("individual")}
                className={`px-3.5 py-1.5 rounded-xl font-bold uppercase transition-all ${
                  activeTab === "individual"
                    ? "bg-metallic-gold text-black shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Solo ({individualRegistrations.length})
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <RiCloseLine className="text-base shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-white/60 hover:text-white uppercase text-[10px] font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {displayedRegistrations.length === 0 ? (
            <div className="marvel-card p-10 rounded-3xl border border-white/15 bg-[#0A0D1A]/95 text-center space-y-4">
              <EmptyState
                icon="📋"
                title="No missions found in this category."
                message="Explore the festival lineup and claim your entry pass or assemble a squad today!"
                action={
                  <Link
                    to="/events"
                    className="px-6 py-3 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] font-excon-black inline-flex items-center gap-2"
                  >
                    <span>Browse All Events</span>
                    <RiArrowRightLine />
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="space-y-8">
              {displayedRegistrations.map((reg) => {
                const isTeam =
                  reg.registration_type === "team" ||
                  (reg.eventData?.max_team_size || reg.max_team_size || 1) > 1;

                if (isTeam) {
                  return (
                    <TeamDashboardCard
                      key={reg.id}
                      registration={reg}
                      allRegistrations={registrations}
                      currentUser={user}
                      payment={payment}
                      onRefresh={load}
                      onCancel={handleCancelClick}
                      isCancelling={busyId === reg.id}
                    />
                  );
                }

                const ev = reg.eventData;
                const detailPath = ev ? `/events/${ev.slug || ev.id}` : "/events";
                const batchRegs = reg.payment_batch_id
                  ? registrations.filter((r) => r.payment_batch_id === reg.payment_batch_id)
                  : [reg];
                const batchFees = calculateBatchFees(batchRegs);

                return (
                  <motion.article
                    key={reg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="marvel-card p-6 sm:p-7 rounded-3xl border border-white/15 bg-[#0A0D1A]/95 shadow-xl backdrop-blur-2xl space-y-6"
                  >
                    {/* Header: Title + Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-metallic-gold/10 text-metallic-gold border border-metallic-gold/30 text-[10px] font-mono font-bold uppercase">
                            Reg #{reg.registration_number}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-white/5 text-white/70 border border-white/10 text-[10px] font-space font-bold uppercase">
                            SOLO MISSION
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black uppercase text-white font-excon-black">
                          {reg.event_title || ev?.title || "MacFiesta Event"}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <StatusChip status={reg.payment_status} />
                        {reg.is_waiting_list && <StatusChip status="waitlisted" />}
                        {(reg.verification_attendance_marked || reg.attendance_marked) && (
                          <StatusChip status="verified" label="Gate Checked-In" />
                        )}
                        {reg.event_attendance_marked && (
                          <StatusChip status="confirmed" label="Event Arena Attended" />
                        )}
                        {reg.approval_status === "cancelled" && <StatusChip status="cancelled" />}
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs font-space">
                      <div className="space-y-1">
                        <span className="block text-[10px] uppercase font-bold text-white/40 flex items-center gap-1 font-mono">
                          <RiCalendarEventLine className="text-metallic-gold" /> Date
                        </span>
                        <span className="text-white font-bold">{ev ? formatDate(ev.event_date) : "—"}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[10px] uppercase font-bold text-white/40 flex items-center gap-1 font-mono">
                          <RiTimeLine className="text-metallic-gold" /> Time
                        </span>
                        <span className="text-white font-bold">{ev ? formatScheduleTime(ev.event_time) : "—"}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[10px] uppercase font-bold text-white/40 flex items-center gap-1 font-mono">
                          <RiMapPinLine className="text-metallic-gold" /> Venue
                        </span>
                        <span className="text-white font-bold truncate block">{ev?.venue || "Main Stage / Arena"}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[10px] uppercase font-bold text-white/40 font-mono">
                          Participant
                        </span>
                        <span className="text-metallic-gold font-bold truncate block">
                          {reg.participant_name || user?.full_name || "Delegate"}
                        </span>
                      </div>
                    </div>

                    {/* Separate Payment Summary Breakdown Strip */}
                    {reg.payment_status !== "paid" &&
                      reg.payment_status !== "waived" &&
                      reg.approval_status !== "cancelled" &&
                      Number(batchFees.paymentAmountTotal || reg.payment_amount) > 0 && (
                        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-metallic-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-white/60">
                              Mission Fee: <strong className="text-metallic-gold font-bold">₹{batchFees.eventFeeTotal.toLocaleString("en-IN")}</strong>
                            </span>
                            {batchFees.hasAccommodation && (
                              <span className="text-white/60">
                                Stay &amp; Food: <strong className="text-arc-cyan font-bold">₹{batchFees.hospitalityTotal.toLocaleString("en-IN")}</strong>
                              </span>
                            )}
                          </div>
                          <div className="text-white/70">
                            Total Payable: <strong className="text-metallic-gold text-sm font-black">₹{batchFees.paymentAmountTotal.toLocaleString("en-IN")}</strong>
                          </div>
                        </div>
                      )}

                    {/* Actions Row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                      {reg.approval_status === "approved" && (reg.payment_status === "paid" || reg.payment_status === "waived" || !(Number(reg.payment_amount) > 0)) ? (
                        <Link
                          to={`/pass/${reg.id}`}
                          className="w-full sm:w-auto px-5 py-2.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] font-excon-black inline-flex items-center justify-center gap-2 text-center"
                        >
                          <RiQrCodeLine className="text-sm" />
                          <span>View Entry Pass</span>
                        </Link>
                      ) : (
                        <div className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold inline-flex items-center justify-center gap-1.5 text-center">
                          <RiShieldFlashLine className="text-amber-400" />
                          <span>Pass Locked (Pending Approval)</span>
                        </div>
                      )}

                      <Link
                        to={detailPath}
                        className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider rounded-xl transition-all font-excon-bold inline-flex items-center justify-center gap-1.5 text-center"
                      >
                        <RiTicketLine />
                        <span>Event Details</span>
                      </Link>

                      {reg.payment_status !== "paid" &&
                        reg.payment_status !== "waived" &&
                        reg.approval_status !== "cancelled" &&
                        Number(reg.payment_amount) > 0 && (
                          <button
                            type="button"
                            className="w-full sm:w-auto px-4 py-2.5 bg-metallic-gold/15 hover:bg-metallic-gold/30 text-metallic-gold border border-metallic-gold/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all font-excon-bold cursor-pointer text-center"
                            onClick={() =>
                              setExpandedPayId(expandedPayId === reg.id ? null : reg.id)
                            }
                          >
                            {expandedPayId === reg.id ? "Hide Payment Details" : "💳 Pay / Upload Proof"}
                          </button>
                        )}

                      {!reg.attendance_marked && reg.approval_status !== "cancelled" && (
                        <button
                          type="button"
                          className="w-full sm:w-auto px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs uppercase tracking-wider rounded-xl transition-all font-excon-bold sm:ml-auto cursor-pointer text-center"
                          disabled={busyId === reg.id}
                          onClick={() => handleCancelClick(reg)}
                        >
                          {busyId === reg.id ? "Cancelling…" : "Cancel Reg"}
                        </button>
                      )}
                    </div>

                    {/* Expandable Payment & Verification Proof Panel */}
                    {expandedPayId === reg.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-4 border-t border-white/10"
                      >
                        <PaymentProofPanel
                          registration={reg}
                          registrations={batchRegs}
                          paymentAmountTotal={batchFees.paymentAmountTotal}
                          eventFeeTotal={batchFees.eventFeeTotal}
                          accommodationFeeTotal={batchFees.accommodationFeeTotal}
                          foodFeeTotal={batchFees.foodFeeTotal}
                          hospitalityTotal={batchFees.hospitalityTotal}
                          payment={payment}
                          onUpdated={(data) => {
                            if (Array.isArray(data)) {
                              const updatedMap = Object.fromEntries(data.map((d) => [d.id, d]));
                              setRegistrations((prev) =>
                                prev.map((r) => (updatedMap[r.id] ? { ...r, ...updatedMap[r.id] } : r))
                              );
                            } else if (data?.id) {
                              setRegistrations((prev) =>
                                prev.map((r) => (r.id === data.id ? { ...r, ...data } : r))
                              );
                            } else {
                              load();
                            }
                          }}
                        />
                      </motion.div>
                    )}
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Marvel Themed Cancellation Confirmation Modal */}
      {cancelModalTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-[#070913] border border-red-500/40 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.25)] overflow-hidden font-excon text-left">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

            <div className="p-6 sm:p-7 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-2xl text-red-400 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    <RiErrorWarningLine />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest font-mono mb-1">
                      <RiAlertFill />
                      <span>CANCELLATION PROTOCOL</span>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight font-excon-black">
                      Cancel Registration?
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCancelModalTarget(null)}
                  disabled={busyId === cancelModalTarget.id}
                  className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <RiCloseLine size={20} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 text-xs font-space">
                <span className="text-white/50 text-[10px] uppercase font-bold font-mono block">
                  Event / Mission:
                </span>
                <span className="text-white font-bold text-sm block">
                  {cancelModalTarget.event_title || cancelModalTarget.eventData?.title || "MacFiesta Mission"}
                </span>
                {cancelModalTarget.team_name && (
                  <span className="text-metallic-gold font-bold text-xs block font-mono">
                    Squad: Team {cancelModalTarget.team_name}
                  </span>
                )}
                <span className="text-white/60 text-[11px] block">
                  Reg #{cancelModalTarget.registration_number}
                </span>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs space-y-2 text-red-300 font-space leading-relaxed">
                <div className="flex items-center gap-2 font-bold uppercase font-mono text-red-400">
                  <RiAlertFill className="shrink-0 text-sm" />
                  <span>AMOUNT IS STRICTLY NON-REFUNDABLE</span>
                </div>
                <p className="text-white/80 text-[11px]">
                  Any registration or accommodation amount paid is <strong>non-refundable</strong> under festival regulations.
                </p>
                <p className="text-white/60 text-[11px]">
                  If your slot was confirmed, it will immediately be released and allocated to the next waitlisted delegate.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalTarget(null)}
                  disabled={busyId === cancelModalTarget.id}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all font-excon-bold cursor-pointer"
                >
                  Keep Registration
                </button>
                <button
                  type="button"
                  onClick={confirmCancelRegistration}
                  disabled={busyId === cancelModalTarget.id}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] font-excon-black cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  {busyId === cancelModalTarget.id ? "Cancelling…" : "Confirm Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
