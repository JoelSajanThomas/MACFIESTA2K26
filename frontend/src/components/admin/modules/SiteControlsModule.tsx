"use client";

import { useFestivalControl } from "@/lib/festivalStore";
import { useState } from "react";
import {
  RiToggleLine,
  RiAlertLine,
  RiUserReceivedLine,
  RiCheckboxCircleLine,
  RiCheckDoubleLine,
} from "react-icons/ri";

export function SiteControlsModule() {
  const { settings, updateSettings } = useFestivalControl();
  const [statusMsg, setStatusMsg] = useState("");

  const flash = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3500);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Toast */}
      {statusMsg && (
        <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold rounded-xl animate-pulse flex items-center gap-2">
          <RiCheckDoubleLine className="text-base" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-2">
          <RiToggleLine /> SYSTEM SETTINGS — SITE CONTROLS
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Registration & Maintenance Controls
        </h2>
        <p className="text-xs text-white/40">
          Toggle participant registration open/closed and enable maintenance mode. Changes take effect instantly site-wide.
        </p>
      </div>

      {/* Toggle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Registration Toggle */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-8 space-y-6 transition-all duration-500 ${
            settings.registrationOpen
              ? "bg-emerald-950/40 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.12)]"
              : "bg-rose-950/30 border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.08)]"
          }`}
        >
          <div className={`absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-500 ${
            settings.registrationOpen ? "opacity-100" : "opacity-0"
          } bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_60%)]`} />

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                settings.registrationOpen
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-400 border-rose-500/30"
              }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                  settings.registrationOpen ? "bg-emerald-400" : "bg-rose-400"
                }`} />
                {settings.registrationOpen ? "Registrations Open" : "Registrations Closed"}
              </div>
              <h3 className="text-lg font-black text-white uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                Participant Registration
              </h3>
              <p className="text-xs text-white/50 leading-relaxed">
                {settings.registrationOpen
                  ? "Registration portal is live. Students can sign up for events and purchase passes."
                  : "Registration portal is closed. All sign-up buttons and forms are disabled site-wide."}
              </p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              settings.registrationOpen
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
            }`}>
              <RiUserReceivedLine size={28} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white/70">
                {settings.registrationOpen ? "Click to CLOSE registrations" : "Click to OPEN registrations"}
              </p>
              <p className="text-[10px] text-white/30">Instantly updates across all pages</p>
            </div>
            <button
              type="button"
              onClick={() => {
                updateSettings({ registrationOpen: !settings.registrationOpen });
                flash(settings.registrationOpen
                  ? "✓ Registrations are now CLOSED site-wide!"
                  : "✓ Registrations are now OPEN site-wide!");
              }}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 cursor-pointer border-2 shadow-lg flex-shrink-0 ${
                settings.registrationOpen
                  ? "bg-emerald-500 border-emerald-400 shadow-emerald-500/40"
                  : "bg-white/10 border-white/20"
              }`}
            >
              <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                settings.registrationOpen ? "left-[calc(100%-1.75rem)]" : "left-0.5"
              }`} />
            </button>
          </div>
        </div>

        {/* Maintenance Mode Toggle */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-8 space-y-6 transition-all duration-500 ${
            settings.maintenanceMode
              ? "bg-amber-950/40 border-amber-500/40 shadow-[0_0_40px_rgba(245,179,1,0.15)]"
              : "bg-zinc-900/40 border-white/10"
          }`}
        >
          <div className={`absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-500 ${
            settings.maintenanceMode ? "opacity-100" : "opacity-0"
          } bg-[radial-gradient(circle_at_top_right,rgba(245,179,1,0.12),transparent_60%)]`} />

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                settings.maintenanceMode
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
                  : "bg-white/5 text-zinc-400 border-white/10"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  settings.maintenanceMode ? "bg-amber-400 animate-ping" : "bg-zinc-500"
                }`} />
                {settings.maintenanceMode ? "Maintenance ACTIVE" : "Site Online"}
              </div>
              <h3 className="text-lg font-black text-white uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                Maintenance Mode
              </h3>
              <p className="text-xs text-white/50 leading-relaxed">
                {settings.maintenanceMode
                  ? "ACTIVE — all public pages show the Spider-Man maintenance screen. Only admins can access the site."
                  : "Site is fully online. Enable maintenance mode for upgrades or emergency downtime."}
              </p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              settings.maintenanceMode
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_20px_rgba(245,179,1,0.3)]"
                : "bg-white/5 text-zinc-500 border border-white/10"
            }`}>
              <RiAlertLine size={28} className={settings.maintenanceMode ? "animate-pulse" : ""} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white/70">
                {settings.maintenanceMode ? "Click to bring site BACK ONLINE" : "Click to enable MAINTENANCE MODE"}
              </p>
              <p className="text-[10px] text-white/30">Shows Spider-Man maintenance page to all visitors</p>
            </div>
            <button
              type="button"
              onClick={() => {
                updateSettings({ maintenanceMode: !settings.maintenanceMode });
                flash(settings.maintenanceMode
                  ? "✓ Site is now LIVE and fully online!"
                  : "⚠️ MAINTENANCE MODE enabled — site is now offline to public!");
              }}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 cursor-pointer border-2 shadow-lg flex-shrink-0 ${
                settings.maintenanceMode
                  ? "bg-amber-500 border-amber-400 shadow-amber-500/40"
                  : "bg-white/10 border-white/20"
              }`}
            >
              <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                settings.maintenanceMode ? "left-[calc(100%-1.75rem)]" : "left-0.5"
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="glass p-6 rounded-2xl border border-white/10 bg-[#0A0D1A]">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <RiCheckboxCircleLine className="text-arc-cyan" /> Current Site Status
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className={`p-4 rounded-2xl border ${
            settings.registrationOpen ? "bg-emerald-950/30 border-emerald-500/20" : "bg-rose-950/20 border-rose-500/15"
          }`}>
            <p className="text-zinc-400 uppercase font-bold text-[10px] mb-1">Registration Status</p>
            <p className={`font-black text-sm ${
              settings.registrationOpen ? "text-emerald-400" : "text-rose-400"
            }`}>{settings.registrationOpen ? "✓ OPEN" : "✗ CLOSED"}</p>
          </div>
          <div className={`p-4 rounded-2xl border ${
            settings.maintenanceMode ? "bg-amber-950/30 border-amber-500/20" : "bg-zinc-900/30 border-white/5"
          }`}>
            <p className="text-zinc-400 uppercase font-bold text-[10px] mb-1">Maintenance Mode</p>
            <p className={`font-black text-sm ${
              settings.maintenanceMode ? "text-amber-400" : "text-zinc-400"
            }`}>{settings.maintenanceMode ? "⚠ ACTIVE" : "● OFFLINE"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
