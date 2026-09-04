import { useState } from "react";
import { Link } from "react-router-dom";
import {
  RiToggleLine,
  RiCheckDoubleLine,
  RiRadarLine,
  RiLockPasswordLine,
  RiDeleteBin7Line,
  RiShieldFlashLine,
  RiDatabase2Line,
  RiDownload2Line,
  RiUserReceivedLine,
  RiAlertLine,
} from "react-icons/ri";
import { useFestivalControl } from "../../lib/festivalStore";
import { useAdminStaff } from "../../components/admin/AdminStaffContext";
import PurgeDataModal from "../../components/admin/PurgeDataModal";
import { downloadSystemBackup } from "../../services/api";

export default function AdminControls() {
  const staff = useAdminStaff();
  const { settings, updateSettings } = useFestivalControl();
  const [statusMsg, setStatusMsg] = useState("");
  const [purgeModalOpen, setPurgeModalOpen] = useState(false);

  const isSuperuser = Boolean(staff?.is_superuser || staff?.committee === "core");

  const flash = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 4000);
  };

  if (!isSuperuser) {
    return (
      <div className="admin-ops-page admin-access-denied max-w-lg mx-auto text-center py-12 space-y-4">
        <header className="admin-ops-header">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-2xl text-rose-400">
            <RiLockPasswordLine />
          </div>
          <h1 className="text-2xl font-black text-rose-400 uppercase font-excon-black">Super Admin Access Required</h1>
          <p className="text-white/60 text-xs mt-2">
            Site Controls, Registration Toggles, and Maintenance Protocols are restricted exclusively to Super Administrators.
          </p>
        </header>
        <Link to="/admin/insights" className="admin-action-btn admin-action-btn--primary inline-block">
          Return to My Desk
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Toast Flash Alert */}
      {statusMsg && (
        <div className="px-4 py-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold rounded-2xl animate-pulse flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <RiCheckDoubleLine className="text-lg" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-aurora p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
          <RiToggleLine className="text-metallic-gold" />
          <span>S.H.I.E.L.D. TACTICAL COMMAND &amp; SITE PROTOCOLS</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight font-excon-black">
          Site Controls &amp; Protocol Toggles
        </h1>
        <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-2xl">
          Instantly control public festival access. Toggle participant event registrations open/closed and switch the entire platform into Spider-Sense Maintenance Mode.
        </p>
      </div>

      {/* Control Switch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Registration Status Control */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 space-y-6 transition-all duration-500 ${
            settings.registrationOpen
              ? "bg-emerald-950/40 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
              : "bg-rose-950/30 border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.12)]"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  settings.registrationOpen
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    settings.registrationOpen ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                />
                {settings.registrationOpen ? "Registrations Active (OPEN)" : "Registrations Locked (CLOSED)"}
              </div>
              <h2 className="text-xl font-black text-white uppercase font-excon-black">
                Participant Registration
              </h2>
              <p className="text-xs text-white/70 leading-relaxed">
                {settings.registrationOpen
                  ? "Registration portal is live. Students can browse competitions, sign up, and purchase festival passes."
                  : "Registration portal is closed. Sign-up buttons and checkout forms are blocked across the entire site."}
              </p>
            </div>
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl ${
                settings.registrationOpen
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
              }`}
            >
              <RiUserReceivedLine />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white/90">
                {settings.registrationOpen ? "Click switch to CLOSE registrations" : "Click switch to OPEN registrations"}
              </p>
              <p className="text-[10px] text-white/40">Takes effect instantly for all visitors</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !settings.registrationOpen;
                updateSettings({ registrationOpen: next });
                flash(next ? "✓ Registrations are now OPEN site-wide!" : "⚠️ Registrations are now CLOSED site-wide!");
              }}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 cursor-pointer border-2 shadow-lg flex-shrink-0 ${
                settings.registrationOpen
                  ? "bg-emerald-500 border-emerald-400 shadow-emerald-500/40"
                  : "bg-white/10 border-white/20"
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                  settings.registrationOpen ? "left-[calc(100%-1.75rem)]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. Maintenance Mode Control */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 space-y-6 transition-all duration-500 ${
            settings.maintenanceMode
              ? "bg-amber-950/40 border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.2)]"
              : "bg-[#0A0D1A] border-white/10"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  settings.maintenanceMode
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : "bg-white/5 text-white/60 border-white/10"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    settings.maintenanceMode ? "bg-amber-400 animate-ping" : "bg-emerald-400"
                  }`}
                />
                {settings.maintenanceMode ? "⚠ Maintenance Mode ACTIVE" : "● Site Publicly Online"}
              </div>
              <h2 className="text-xl font-black text-white uppercase font-excon-black">
                Maintenance Mode
              </h2>
              <p className="text-xs text-white/70 leading-relaxed">
                {settings.maintenanceMode
                  ? "ACTIVE — All public visitor traffic is intercepted and redirected to the Spider-Man maintenance screen. Only logged-in admins can access."
                  : "Normal Operations — The public website is fully accessible to all visitors and students."}
              </p>
            </div>
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl ${
                settings.maintenanceMode
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-white/5 text-white/40 border border-white/10"
              }`}
            >
              <RiAlertLine className={settings.maintenanceMode ? "animate-pulse text-amber-400" : ""} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white/90">
                {settings.maintenanceMode ? "Click switch to restore ONLINE site" : "Click switch to ACTIVATE maintenance"}
              </p>
              <p className="text-[10px] text-white/40">Displays Spider-Man protocol screen</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !settings.maintenanceMode;
                updateSettings({ maintenanceMode: next });
                flash(next ? "⚠️ MAINTENANCE MODE ENABLED — Site is now offline to the public!" : "✓ Site is now restored to LIVE public access!");
              }}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 cursor-pointer border-2 shadow-lg flex-shrink-0 ${
                settings.maintenanceMode
                  ? "bg-amber-500 border-amber-400 shadow-amber-500/40"
                  : "bg-white/10 border-white/20"
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                  settings.maintenanceMode ? "left-[calc(100%-1.75rem)]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

      </div>

      {/* Live Telemetry Summary */}
      <div className="glass-aurora p-6 rounded-3xl border border-white/10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-metallic-gold mb-4 flex items-center gap-2">
          <RiRadarLine className="animate-spin text-sm" />
          <span>Active Protocol Telemetry</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-excon">
          <div className="p-4 bg-black/40 border border-white/10 rounded-2xl">
            <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Registration Status</span>
            <strong className={`text-sm font-black mt-1 block ${settings.registrationOpen ? "text-emerald-400" : "text-rose-400"}`}>
              {settings.registrationOpen ? "✓ OPEN FOR REGISTRATIONS" : "✕ REGISTRATIONS CLOSED"}
            </strong>
          </div>
          <div className="p-4 bg-black/40 border border-white/10 rounded-2xl">
            <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Platform State</span>
            <strong className={`text-sm font-black mt-1 block ${settings.maintenanceMode ? "text-amber-400" : "text-emerald-400"}`}>
              {settings.maintenanceMode ? "⚠ MAINTENANCE SCREEN SHOWN" : "✓ PUBLIC ONLINE"}
            </strong>
          </div>
          <div className="p-4 bg-black/40 border border-white/10 rounded-2xl">
            <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider">Admin Bypass</span>
            <strong className="text-sm font-black text-cyan-400 mt-1 block">
              ENABLED FOR OPERATORS
            </strong>
          </div>
        </div>
      </div>

      {/* System Database Snapshot & Backup Export */}
      <div className="p-6 sm:p-8 rounded-3xl border border-arc-cyan/30 bg-arc-cyan/5 relative overflow-hidden shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-arc-cyan/40 bg-arc-cyan/10 text-arc-cyan text-[10px] font-black uppercase tracking-widest font-mono">
              <RiDatabase2Line />
              <span>CORE RESILIENCE • DATA SNAPSHOT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-excon-black">
              System Database Backup
            </h2>
            <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
              Export an encrypted, complete JSON database snapshot of all events, participants, payments, registrations, content records, and audit trails for offline archiving or disaster recovery.
            </p>
          </div>

          <a
            href={downloadSystemBackup()}
            download
            className="px-5 py-3 rounded-2xl bg-arc-cyan/20 hover:bg-arc-cyan border border-arc-cyan/50 text-arc-cyan hover:text-black text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shrink-0 shadow-lg cursor-pointer font-excon-black no-underline"
          >
            <RiDownload2Line className="text-base" />
            <span>Download Database Backup</span>
          </a>
        </div>
      </div>

      {/* Danger Zone: Clear Registered Participant Data */}
      <div className="p-6 sm:p-8 rounded-3xl border border-rose-500/30 bg-rose-950/20 relative overflow-hidden shadow-[0_0_40px_rgba(244,63,94,0.12)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest font-mono">
              <RiShieldFlashLine />
              <span>DANGER ZONE • QUANTUM RESET</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-excon-black">
              Clear All Registered User Data
            </h2>
            <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
              Permanently wipe all registered participant accounts, event registrations, fast-track passes, team entries, and hostel bookings. Requires Super Admin password verification before execution.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPurgeModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/50 hover:border-rose-400 text-rose-300 hover:text-white text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shrink-0 shadow-lg cursor-pointer font-excon-black hover:shadow-[0_0_25px_rgba(244,63,94,0.4)]"
          >
            <RiDeleteBin7Line className="text-base" />
            <span>Purge All Registered Data</span>
          </button>
        </div>
      </div>

      {/* Purge Verification Modal */}
      <PurgeDataModal
        open={purgeModalOpen}
        onClose={() => setPurgeModalOpen(false)}
        onSuccess={() => {
          flash(`✓ Successfully purged registered participant records.`);
        }}
      />
    </div>
  );
}

