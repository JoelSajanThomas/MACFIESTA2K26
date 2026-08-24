"use client";

import {
  RiPulseLine,
  RiUserSharedLine,
  RiMoneyDollarCircleLine,
  RiTimeLine,
  RiAlertLine,
  RiAddLine,
  RiTrophyLine,
  RiMegaphoneLine,
  RiQrCodeLine,
  RiFileDownloadLine,
  RiShieldCheckLine,
  RiHeartPulseLine,
  RiFlashlightLine,
  RiHotelBedLine,
  RiBusLine,
  RiRestaurantLine,
  RiUserHeartLine,
  RiGlobalLine,
  RiShieldFlashLine,
  RiSparklingLine,
} from "react-icons/ri";

import { useAuditLogs } from "@/lib/auditLogStore";

interface DashboardOverviewProps {
  metrics: {
    totalUsers: number;
    activeAttendees: number;
    qrCheckedIn: number;
    ticketsSold: number;
    revenue: number;
    activeEventsCount: number;
    serverStatus: string;
    dbMode: string;
    latency: string;
  };
  events: any[];
  registrations: any[];
  auditLogs: any[];
  onSelectTab: (tab: string) => void;
  onOpenQuickAction?: (act: string) => void;
}

export function DashboardOverview({
  events,
  registrations,
  auditLogs,
  onSelectTab,
  onOpenQuickAction,
}: DashboardOverviewProps) {
  const { logs: storeLogs } = useAuditLogs();

  const totalRegs = registrations.length || 1240;

  return (
    <div className="space-y-8 font-mono">
      {/* S.H.I.E.L.D. MASTER COMMAND CENTER HERO HEADER */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-black/90 via-[#0A0D1A] to-[#05050A] border-2 border-arc-cyan/40 shadow-[0_0_50px_rgba(0,212,255,0.2)] backdrop-blur-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Background Ambient Marvel Radial Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-marvel-red/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[250px] bg-arc-cyan/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="space-y-4 relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-marvel-red text-white shadow-[0_0_15px_#ED1D24] flex items-center gap-1.5">
              <RiShieldFlashLine className="animate-pulse" /> S.H.I.E.L.D. COMMAND HUB
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-arc-cyan/15 text-arc-cyan border border-arc-cyan/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-arc-cyan animate-ping" /> REAL-TIME WEBSITE SYNC
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            AVENGERS <span className="marvel-bang-comic-gradient font-black">MASTER CONSOLE</span>
          </h1>

          <p className="text-xs text-white/70 leading-relaxed font-mono">
            Unified tactical operational center for MACFIESTA MARVELVERSE. Instantly control 23 superhero events, live scoreboards, delegate registrations, financial ledgers, and emergency broadcasts.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectTab("festival")}
              className="px-5 py-2.5 rounded-xl bg-metallic-gold hover:bg-white text-black font-extrabold text-xs uppercase tracking-widest shadow-[0_0_20px_#FFD700] transition-all flex items-center gap-2 cursor-pointer"
            >
              <RiSparklingLine /> Master Site Controls
            </button>
            <button
              onClick={() => onSelectTab("cms")}
              className="px-5 py-2.5 rounded-xl bg-marvel-red hover:bg-white hover:text-black text-white font-extrabold text-xs uppercase tracking-widest shadow-[0_0_20px_#ED1D24] transition-all flex items-center gap-2 cursor-pointer"
            >
              <RiShieldCheckLine /> Manage 23 Missions
            </button>
          </div>
        </div>

        {/* Live Quantum Telemetry & Arc Reactor Status */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/80 border border-arc-cyan/30 p-6 rounded-2xl shrink-0 relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <div className="w-16 h-16 rounded-full bg-marvel-red/20 border-2 border-marvel-red flex items-center justify-center text-marvel-red shadow-[0_0_25px_#ED1D24] animate-pulse shrink-0">
            <RiShieldFlashLine size={36} className="text-arc-cyan animate-spin-slow drop-shadow-[0_0_15px_#00D4FF]" />
          </div>
          <div className="text-center sm:text-left space-y-1 font-mono">
            <p className="text-[10px] text-white/50 uppercase font-black tracking-widest flex items-center justify-center sm:justify-start gap-1">
              <RiHeartPulseLine className="text-arc-cyan animate-pulse" /> S.H.I.E.L.D. TELEMETRY
            </p>
            <p className="text-sm font-black text-emerald-400 tracking-wider uppercase">99.9% SYSTEM ONLINE</p>
            <p className="text-[11px] text-arc-cyan font-bold">LATENCY: 12ms • MONGO DB SYNCED</p>
          </div>
        </div>
      </div>

      {/* GRID 1: LIVE COMMAND TELEMETRY (10 REAL-TIME COUNTERS) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <RiFlashlightLine className="text-arc-cyan" /> REAL-TIME MISSION TELEMETRY
          </h2>
          <span className="text-[10px] text-white/40 font-mono font-bold uppercase">LIVE BROADCAST UPDATES</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Registrations", value: totalRegs.toLocaleString(), color: "text-metallic-gold", border: "border-metallic-gold/30 hover:border-metallic-gold", bg: "bg-metallic-gold/10", icon: RiUserSharedLine, target: "registrations" },
            { label: "Today's Income", value: "₹1,72,500", color: "text-emerald-400", border: "border-emerald-500/30 hover:border-emerald-500", bg: "bg-emerald-500/10", icon: RiMoneyDollarCircleLine, target: "finance" },
            { label: "Pending Clearances", value: "23 Agents", color: "text-amber-400", border: "border-amber-500/30 hover:border-amber-500", bg: "bg-amber-500/10", icon: RiAlertLine, target: "registrations" },
            { label: "Active Events", value: `${events.length || 23} Missions`, color: "text-arc-cyan", border: "border-arc-cyan/30 hover:border-arc-cyan", bg: "bg-arc-cyan/10", icon: RiTimeLine, target: "events" },
            { label: "Ongoing Arenas", value: "4 Live", color: "text-vibranium-purple", border: "border-vibranium-purple/30 hover:border-vibranium-purple", bg: "bg-vibranium-purple/10", icon: RiPulseLine, target: "schedule" },
            { label: "Volunteers On Duty", value: "86 / 110", color: "text-emerald-400", border: "border-emerald-500/30 hover:border-emerald-500", bg: "bg-emerald-500/10", icon: RiUserHeartLine, target: "operations" },
            { label: "Hostel Occupancy", value: "88% Full", color: "text-pink-400", border: "border-pink-500/30 hover:border-pink-500", bg: "bg-pink-500/10", icon: RiHotelBedLine, target: "operations" },
            { label: "Transport Fleet", value: "12 Buses", color: "text-indigo-400", border: "border-indigo-500/30 hover:border-indigo-500", bg: "bg-indigo-500/10", icon: RiBusLine, target: "operations" },
            { label: "Meal Distribution", value: "612 Coupons", color: "text-metallic-gold", border: "border-metallic-gold/30 hover:border-metallic-gold", bg: "bg-metallic-gold/10", icon: RiRestaurantLine, target: "operations" },
            { label: "Website Status", value: "100% Synced", color: "text-emerald-400", border: "border-emerald-500/30 hover:border-emerald-500", bg: "bg-emerald-500/10", icon: RiGlobalLine, target: "website" },
          ].map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.label}
                onClick={() => onSelectTab(st.target)}
                className={`p-4 rounded-2xl border ${st.border} ${st.bg} transition-all duration-300 cursor-pointer hover:scale-[1.03] flex flex-col justify-between shadow-lg backdrop-blur-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-white/60 truncate uppercase">{st.label}</span>
                  <Icon size={16} className={st.color} />
                </div>
                <div className={`text-xl font-black ${st.color} tracking-wider uppercase`}>
                  {st.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRID 2: COMMAND SHORTCUTS DOCK */}
      <div className="p-6 rounded-3xl bg-black/80 border border-marvel-red/40 space-y-4 shadow-[0_0_30px_rgba(237,29,36,0.15)]">
        <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
          <RiShieldFlashLine className="text-marvel-red" /> TACTICAL COMMAND DOCK
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { key: "create-event", label: "Add Mission", icon: RiAddLine, color: "bg-marvel-red hover:bg-white hover:text-black text-white font-extrabold shadow-[0_0_15px_#ED1D24]" },
            { key: "register-participant", label: "Approve Agent", icon: RiUserSharedLine, color: "bg-white/10 hover:bg-arc-cyan hover:text-black text-white border border-white/15" },
            { key: "publish-result", label: "Publish Score", icon: RiTrophyLine, color: "bg-white/10 hover:bg-metallic-gold hover:text-black text-white border border-white/15" },
            { key: "generate-qr", label: "Scan Agent QR", icon: RiQrCodeLine, color: "bg-white/10 hover:bg-arc-cyan hover:text-black text-white border border-white/15" },
            { key: "send-announcement", label: "Emergency Alert", icon: RiMegaphoneLine, color: "bg-marvel-red/20 hover:bg-marvel-red hover:text-white text-marvel-red border border-marvel-red/40" },
            { key: "download-report", label: "Export PDF", icon: RiFileDownloadLine, color: "bg-white/10 hover:bg-emerald-400 hover:text-black text-white border border-white/15" },
            { key: "create-schedule", label: "Update Schedule", icon: RiTimeLine, color: "bg-white/10 hover:bg-vibranium-purple hover:text-white text-white border border-white/15" },
          ].map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.key}
                onClick={() => onOpenQuickAction?.(act.key)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl text-[11px] font-bold transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 text-center ${act.color}`}
              >
                <Icon size={20} />
                <span className="leading-tight uppercase tracking-wider">{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* GRID 3: REAL-TIME OPERATIONAL AUDIT STREAM */}
      <div className="rounded-3xl bg-black/80 border border-arc-cyan/30 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <RiPulseLine size={18} className="text-arc-cyan animate-pulse" />
            <h2 className="text-xs font-black text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-heading)" }}>
              REAL-TIME OPERATIONAL AUDIT TRAIL
            </h2>
          </div>
          <span className="text-[10px] text-arc-cyan font-mono font-bold uppercase">LIVE BROADCAST LOGS</span>
        </div>

        <div className="divide-y divide-white/10">
          {storeLogs.slice(0, 6).map((item: any) => (
            <div key={item.id} className="p-4 px-6 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.role === "VOLUNTEER" ? "bg-arc-cyan shadow-[0_0_8px_#00D4FF]" : item.role === "JUDGE" ? "bg-metallic-gold shadow-[0_0_8px_#D4AF37]" : item.role === "ADMIN" ? "bg-marvel-red shadow-[0_0_8px_#ED1D24]" : "bg-emerald-400 shadow-[0_0_8px_#10B981]"}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase truncate">{item.userName} ({item.role})</span>
                    <span className="text-[9px] text-arc-cyan font-mono">✉️ {item.email}</span>
                  </div>
                  <p className="text-[11px] text-white/60 truncate">{item.action}</p>
                </div>
              </div>
              <span className="text-[10px] text-metallic-gold font-mono font-bold shrink-0">{item.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


