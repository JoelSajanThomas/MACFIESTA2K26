"use client";

import { useState } from "react";
import {
  RiSettings3Line,
  RiShieldFlashLine,
  RiKeyLine,
  RiMailLine,
  RiSmartphoneLine,
  RiDatabase2Line,
  RiDownloadLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiSaveLine,
  RiCheckLine,
  RiCloseLine,
  RiEyeLine,
  RiEyeOffLine,
  RiUser3Line,
  RiAddLine,
  RiEditLine,
  RiToggleLine,
  RiAlertLine,
  RiCheckDoubleLine,
  RiWifiLine,
  RiHistoryLine,
  RiUserReceivedLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { useFestivalControl } from "@/lib/festivalStore";

// ─── Static Data ─────────────────────────────────────────────────────────────
const ADMIN_USERS_DEFAULT = [
  { id: 1, name: "Super Administrator", email: "admin@macfast.org", role: "Super Admin", status: "active", lastLogin: "2 min ago" },
  { id: 2, name: "Finance Controller", email: "finance@macfast.org", role: "Finance Admin", status: "active", lastLogin: "1h ago" },
  { id: 3, name: "Event Coordinator", email: "events@macfast.org", role: "Event Lead", status: "active", lastLogin: "3h ago" },
  { id: 4, name: "Volunteer Head", email: "volunteer@macfast.org", role: "Volunteer Lead", status: "inactive", lastLogin: "2 days ago" },
];

const ROLE_COLORS: Record<string, string> = {
  "Super Admin": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Finance Admin": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Event Lead": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Volunteer Lead": "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const AUDIT_LOG = [
  { action: "Approved registration #R-2041", user: "Super Admin", time: "5 min ago", type: "success" },
  { action: "Published results for Battle of Bands", user: "Event Lead", time: "30 min ago", type: "success" },
  { action: "Sent emergency broadcast alert", user: "Super Admin", time: "1h ago", type: "warning" },
  { action: "Deleted duplicate registration #R-0987", user: "Finance Admin", time: "2h ago", type: "danger" },
  { action: "Updated festival schedule – Day 2", user: "Event Lead", time: "3h ago", type: "info" },
  { action: "Exported finance report PDF", user: "Finance Admin", time: "5h ago", type: "info" },
  { action: "Toggled maintenance mode ON", user: "Super Admin", time: "6h ago", type: "warning" },
  { action: "Created new event: Gaming Showdown", user: "Event Lead", time: "8h ago", type: "success" },
];

type TabId = "site_controls" | "roles" | "security" | "payment" | "notifications" | "backup" | "profile";

function getDefaultTab(activePage?: string): TabId {
  if (!activePage) return "site_controls";
  if (activePage === "cms.site_controls") return "site_controls";
  if (activePage === "settings.roles" || activePage === "settings") return "roles";
  if (activePage === "settings.payment") return "payment";
  if (activePage === "settings.system") return "backup";
  if (activePage === "profile") return "profile";
  return "site_controls";
}

interface SettingsModuleProps {
  activePage?: string;
}

export function SettingsModule({ activePage }: SettingsModuleProps) {
  const { settings, updateSettings } = useFestivalControl();
  const [activeTab, setActiveTab] = useState<TabId>(getDefaultTab(activePage));
  const [statusMsg, setStatusMsg] = useState("");
  const [showKeys, setShowKeys] = useState(false);

  // Admin users
  const [users, setUsers] = useState(ADMIN_USERS_DEFAULT);

  // Security
  const [jwtSecret, setJwtSecret] = useState("mf_production_jwt_secret_2026");
  const [sessionTimeout, setSessionTimeout] = useState("24");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState("192.168.1.0/24\n10.0.0.0/8");

  // Payment
  const [rzpKeyId, setRzpKeyId] = useState("rzp_live_••••••••••••••••");
  const [rzpKeySecret, setRzpKeySecret] = useState("••••••••••••••••••••••••");
  const [paymentCurrency, setPaymentCurrency] = useState("INR");
  const [regFee, setRegFee] = useState("199");
  const [bulkDiscount, setBulkDiscount] = useState("10");

  // Notifications
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("macfiesta@macfast.org");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [smsApiKey, setSmsApiKey] = useState("");

  // Profile
  const [profileName, setProfileName] = useState("Administrator");
  const [profileEmail, setProfileEmail] = useState("admin@macfast.org");
  const [profilePhone, setProfilePhone] = useState("+91 98765 43210");
  const [editProfile, setEditProfile] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const flash = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: "site_controls", label: "Site Controls", icon: RiToggleLine },
    { id: "roles", label: "Users & Roles", icon: RiUser3Line },
    { id: "security", label: "Security", icon: RiShieldFlashLine },
    { id: "payment", label: "Payment", icon: RiKeyLine },
    { id: "notifications", label: "Email & SMS", icon: RiMailLine },
    { id: "backup", label: "Backup & Logs", icon: RiDatabase2Line },
    { id: "profile", label: "My Profile", icon: RiUser3Line },
  ];

  return (
    <div className="space-y-6 font-mono select-none">

      {/* Toast */}
      {statusMsg && (
        <div className="px-4 py-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2 animate-pulse">
          <RiCheckDoubleLine size={16} /> {statusMsg}
        </div>
      )}

      {/* Header */}
      <div className="glass p-6 rounded-3xl border border-white/10 bg-[#0A0D1A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-[10px] font-bold uppercase tracking-widest mb-1">
            <RiSettings3Line /> SYSTEM SETTINGS
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            System Administration
          </h2>
          <p className="text-xs text-white/40">Site controls, user roles, security, payment, notifications & backups.</p>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <div className="text-right">
            <p className="text-zinc-500 uppercase font-bold text-[10px]">Active Admins</p>
            <p className="text-white font-black">{users.filter(u => u.status === "active").length}</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 uppercase font-bold text-[10px]">System</p>
            <p className="text-emerald-400 font-black">● Online</p>
          </div>
        </div>
      </div>

      {/* Tab Rail */}
      <div className="flex overflow-x-auto gap-1 bg-black/60 p-1.5 rounded-2xl border border-white/10 scrollbar-none">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? "bg-[#F5B301] text-zinc-950 shadow-lg shadow-amber-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── SITE CONTROLS ─────────────────────────────────────────── */}
      {activeTab === "site_controls" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Registration Toggle */}
            <div className={`relative overflow-hidden rounded-3xl border p-7 space-y-5 transition-all duration-500 ${
              settings.registrationOpen
                ? "bg-emerald-950/40 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.12)]"
                : "bg-rose-950/30 border-rose-500/30"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                    settings.registrationOpen
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${settings.registrationOpen ? "bg-emerald-400" : "bg-rose-400"}`} />
                    {settings.registrationOpen ? "Registrations Open" : "Registrations Closed"}
                  </div>
                  <h3 className="text-base font-black text-white uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                    Participant Registration
                  </h3>
                  <p className="text-xs text-white/50">
                    {settings.registrationOpen
                      ? "Portal is live. Students can register and purchase passes."
                      : "Portal is closed. All sign-up forms are disabled site-wide."}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  settings.registrationOpen
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                }`}>
                  <RiUserReceivedLine size={24} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <p className="text-xs text-white/50">{settings.registrationOpen ? "Click to CLOSE" : "Click to OPEN"}</p>
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ registrationOpen: !settings.registrationOpen });
                    flash(settings.registrationOpen ? "✓ Registrations CLOSED!" : "✓ Registrations OPEN!");
                  }}
                  className={`relative w-14 h-7 rounded-full transition-all cursor-pointer border-2 flex-shrink-0 ${
                    settings.registrationOpen ? "bg-emerald-500 border-emerald-400" : "bg-white/10 border-white/20"
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    settings.registrationOpen ? "left-[calc(100%-1.375rem)]" : "left-0.5"
                  }`} />
                </button>
              </div>
            </div>

            {/* Maintenance Mode Toggle */}
            <div className={`relative overflow-hidden rounded-3xl border p-7 space-y-5 transition-all duration-500 ${
              settings.maintenanceMode
                ? "bg-amber-950/40 border-amber-500/40 shadow-[0_0_40px_rgba(245,179,1,0.15)]"
                : "bg-zinc-900/40 border-white/10"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                    settings.maintenanceMode
                      ? "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
                      : "bg-white/5 text-zinc-400 border-white/10"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${settings.maintenanceMode ? "bg-amber-400 animate-ping" : "bg-zinc-500"}`} />
                    {settings.maintenanceMode ? "Maintenance ACTIVE" : "Site Online"}
                  </div>
                  <h3 className="text-base font-black text-white uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                    Maintenance Mode
                  </h3>
                  <p className="text-xs text-white/50">
                    {settings.maintenanceMode
                      ? "ACTIVE — public shows Spider-Man maintenance screen. Only admins can access."
                      : "Site is fully online. Enable for upgrades or emergency downtime."}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  settings.maintenanceMode
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-white/5 text-zinc-500 border border-white/10"
                }`}>
                  <RiAlertLine size={24} className={settings.maintenanceMode ? "animate-pulse" : ""} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <p className="text-xs text-white/50">{settings.maintenanceMode ? "Click to go ONLINE" : "Click to ENABLE maintenance"}</p>
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ maintenanceMode: !settings.maintenanceMode });
                    flash(settings.maintenanceMode ? "✓ Site is now LIVE!" : "⚠️ MAINTENANCE MODE enabled!");
                  }}
                  className={`relative w-14 h-7 rounded-full transition-all cursor-pointer border-2 flex-shrink-0 ${
                    settings.maintenanceMode ? "bg-amber-500 border-amber-400" : "bg-white/10 border-white/20"
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    settings.maintenanceMode ? "left-[calc(100%-1.375rem)]" : "left-0.5"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="glass p-5 rounded-2xl border border-white/10 bg-[#0A0D1A]">
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <RiCheckboxCircleLine className="text-arc-cyan" /> Live Site Status
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`p-4 rounded-2xl border ${settings.registrationOpen ? "bg-emerald-950/30 border-emerald-500/20" : "bg-rose-950/20 border-rose-500/15"}`}>
                <p className="text-zinc-400 uppercase font-bold text-[10px] mb-1">Registration</p>
                <p className={`font-black text-sm ${settings.registrationOpen ? "text-emerald-400" : "text-rose-400"}`}>
                  {settings.registrationOpen ? "✓ OPEN" : "✗ CLOSED"}
                </p>
              </div>
              <div className={`p-4 rounded-2xl border ${settings.maintenanceMode ? "bg-amber-950/30 border-amber-500/20" : "bg-zinc-900/30 border-white/5"}`}>
                <p className="text-zinc-400 uppercase font-bold text-[10px] mb-1">Maintenance</p>
                <p className={`font-black text-sm ${settings.maintenanceMode ? "text-amber-400" : "text-zinc-400"}`}>
                  {settings.maintenanceMode ? "⚠ ACTIVE" : "● OFF"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── USERS & ROLES ─────────────────────────────────────────── */}
      {activeTab === "roles" && (
        <div className="space-y-5">
          <div className="glass p-6 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-black text-white uppercase" style={{ fontFamily: "var(--font-heading)" }}>Admin User Accounts</h3>
              <button onClick={() => flash("✓ Admin invite sent!")} className="px-4 py-2 rounded-xl bg-[#F5B301] text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-amber-300">
                <RiAddLine size={13} /> Invite Admin
              </button>
            </div>
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5B301] to-amber-700 flex items-center justify-center text-zinc-950 font-black text-sm shrink-0">
                    {user.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-zinc-400 font-mono truncate">{user.email}</p>
                  </div>
                  <span className={`hidden sm:block px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${ROLE_COLORS[user.role] || ""}`}>{user.role}</span>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${user.status === "active" ? "bg-emerald-400" : "bg-zinc-600"}`} />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setUsers(p => p.map(u => u.id === user.id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u)); flash(`✓ ${user.name} updated`); }} className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 cursor-pointer"><RiToggleLine size={13} /></button>
                    <button onClick={() => { if (user.id === 1) return flash("⚠ Cannot remove Super Admin"); setUsers(p => p.filter(u => u.id !== user.id)); flash(`✓ Removed`); }} className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 cursor-pointer"><RiDeleteBinLine size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="glass p-6 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-4">
            <h3 className="text-sm font-black text-white uppercase border-b border-white/10 pb-3">Module Access Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-500 uppercase text-[10px] font-bold">
                    <th className="py-3 px-3 text-left">Module</th>
                    <th className="py-3 px-3 text-center">Super Admin</th>
                    <th className="py-3 px-3 text-center">Finance</th>
                    <th className="py-3 px-3 text-center">Event Lead</th>
                    <th className="py-3 px-3 text-center">Volunteer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { module: "Dashboard & Analytics", sa: true, fi: true, el: true, vo: false },
                    { module: "Events & Competitions", sa: true, fi: false, el: true, vo: false },
                    { module: "Registrations & Passes", sa: true, fi: true, el: true, vo: false },
                    { module: "Finance & Accounting", sa: true, fi: true, el: false, vo: false },
                    { module: "Hostel & Accommodation", sa: true, fi: false, el: false, vo: true },
                    { module: "Volunteer Management", sa: true, fi: false, el: false, vo: true },
                    { module: "Communication & Alerts", sa: true, fi: false, el: true, vo: false },
                    { module: "System Settings", sa: true, fi: false, el: false, vo: false },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-bold text-white">{row.module}</td>
                      {[row.sa, row.fi, row.el, row.vo].map((v, j) => (
                        <td key={j} className="py-3 px-3 text-center">
                          {v ? <RiCheckLine size={15} className="mx-auto text-emerald-400" /> : <RiCloseLine size={15} className="mx-auto text-white/20" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SECURITY ──────────────────────────────────────────────── */}
      {activeTab === "security" && (
        <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-6">
          <h3 className="text-base font-black text-white uppercase border-b border-white/10 pb-4" style={{ fontFamily: "var(--font-heading)" }}>Security & Authentication</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-zinc-400 font-bold uppercase text-[10px]">JWT Secret Signing Key</label>
              <div className="flex gap-2">
                <input type={showKeys ? "text" : "password"} value={jwtSecret} onChange={e => setJwtSecret(e.target.value)}
                  className="flex-1 px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none" />
                <button onClick={() => setShowKeys(!showKeys)} className="px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white cursor-pointer">
                  {showKeys ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                </button>
                <button onClick={() => flash("✓ JWT secret rotated!")} className="px-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 cursor-pointer font-bold">Rotate</button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-zinc-400 font-bold uppercase text-[10px]">Session Timeout (hours)</label>
              <input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} min="1" max="168"
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="block text-zinc-400 font-bold uppercase text-[10px]">Two-Factor Authentication</label>
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${twoFactorEnabled ? "bg-emerald-950/30 border-emerald-500/30" : "bg-black/40 border-white/10"}`}>
                <div>
                  <p className="font-bold text-white">{twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}</p>
                  <p className="text-zinc-500 text-[10px]">Requires OTP for all admin logins</p>
                </div>
                <button type="button" onClick={() => { setTwoFactorEnabled(!twoFactorEnabled); flash(twoFactorEnabled ? "✓ 2FA disabled" : "✓ 2FA enabled"); }}
                  className={`relative w-12 h-6 rounded-full transition-all cursor-pointer border ${twoFactorEnabled ? "bg-emerald-500 border-emerald-400" : "bg-white/10 border-white/20"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${twoFactorEnabled ? "left-[calc(100%-1.25rem)]" : "left-0.5"}`} />
                </button>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-zinc-400 font-bold uppercase text-[10px]">IP Whitelist (one per line)</label>
              <textarea rows={3} value={ipWhitelist} onChange={e => setIpWhitelist(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end border-t border-white/10 pt-4">
            <button onClick={() => flash("✓ Security settings saved!")} className="px-6 py-2.5 rounded-xl bg-[#F5B301] hover:bg-amber-300 text-zinc-950 font-black text-xs flex items-center gap-2 cursor-pointer">
              <RiSaveLine size={13} /> Save Security Settings
            </button>
          </div>
        </div>
      )}

      {/* ── PAYMENT GATEWAY ───────────────────────────────────────── */}
      {activeTab === "payment" && (
        <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-6">
          <h3 className="text-base font-black text-white uppercase border-b border-white/10 pb-4" style={{ fontFamily: "var(--font-heading)" }}>Payment Gateway — Razorpay</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-2">
              <label className="block text-zinc-400 font-bold uppercase text-[10px]">Razorpay API Key ID</label>
              <div className="flex gap-2">
                <input type={showKeys ? "text" : "password"} value={rzpKeyId} onChange={e => setRzpKeyId(e.target.value)}
                  className="flex-1 px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none" />
                <button onClick={() => setShowKeys(!showKeys)} className="px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white cursor-pointer">
                  {showKeys ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-zinc-400 font-bold uppercase text-[10px]">Razorpay Key Secret</label>
              <input type={showKeys ? "text" : "password"} value={rzpKeySecret} onChange={e => setRzpKeySecret(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="block text-zinc-400 font-bold uppercase text-[10px]">Currency</label>
              <select value={paymentCurrency} onChange={e => setPaymentCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:border-amber-400 focus:outline-none">
                <option value="INR">INR — Indian Rupee</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-zinc-400 font-bold uppercase text-[10px]">Base Registration Fee (₹)</label>
              <input type="number" value={regFee} onChange={e => setRegFee(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="block text-zinc-400 font-bold uppercase text-[10px]">Bulk Team Discount (%)</label>
              <input type="number" value={bulkDiscount} onChange={e => setBulkDiscount(e.target.value)} min="0" max="100"
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none" />
            </div>
            <div className="md:col-span-2 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3 text-xs">
              <RiAlertLine size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-400/80">Ensure you are using LIVE keys for production. Test keys (rzp_test_*) won&apos;t process real payments.</p>
            </div>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-4">
            <button onClick={() => flash("✓ Gateway connection verified!")} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-white/10">
              <RiWifiLine size={13} /> Test Connection
            </button>
            <button onClick={() => flash("✓ Payment gateway settings saved!")} className="px-6 py-2.5 rounded-xl bg-[#F5B301] hover:bg-amber-300 text-zinc-950 font-black text-xs flex items-center gap-2 cursor-pointer">
              <RiSaveLine size={13} /> Save Settings
            </button>
          </div>
        </div>
      )}

      {/* ── EMAIL & SMS ───────────────────────────────────────────── */}
      {activeTab === "notifications" && (
        <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-6">
          <h3 className="text-base font-black text-white uppercase border-b border-white/10 pb-4" style={{ fontFamily: "var(--font-heading)" }}>Email SMTP & SMS Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {[
              { label: "Email Notifications", desc: "Confirmations, OTPs & results", enabled: emailNotifs, toggle: () => { setEmailNotifs(!emailNotifs); flash(emailNotifs ? "✓ Email disabled" : "✓ Email enabled"); }, icon: RiMailLine, color: "emerald" },
              { label: "SMS Notifications", desc: "OTP delivery & emergency alerts", enabled: smsNotifs, toggle: () => { setSmsNotifs(!smsNotifs); flash(smsNotifs ? "✓ SMS disabled" : "✓ SMS enabled"); }, icon: RiSmartphoneLine, color: "blue" },
            ].map(({ label, desc, enabled, toggle, icon: Icon, color }) => (
              <div key={label} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${enabled ? `bg-${color}-950/30 border-${color}-500/30` : "bg-black/40 border-white/10"}`}>
                <div className="flex items-center gap-3">
                  <Icon size={18} className={`text-${color}-400`} />
                  <div>
                    <p className="font-bold text-white">{label}</p>
                    <p className="text-zinc-500 text-[10px]">{desc}</p>
                  </div>
                </div>
                <button type="button" onClick={toggle} className={`relative w-12 h-6 rounded-full transition-all cursor-pointer border ${enabled ? `bg-${color}-500 border-${color}-400` : "bg-white/10 border-white/20"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${enabled ? "left-[calc(100%-1.25rem)]" : "left-0.5"}`} />
                </button>
              </div>
            ))}
            <div className="space-y-2">
              <label className="block text-zinc-400 font-bold uppercase text-[10px]">SMTP Host</label>
              <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="block text-zinc-400 font-bold uppercase text-[10px]">SMTP Port</label>
              <input type="text" value={smtpPort} onChange={e => setSmtpPort(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-zinc-400 font-bold uppercase text-[10px]">Sender Email</label>
              <input type="email" value={smtpUser} onChange={e => setSmtpUser(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none" />
            </div>
            {smsNotifs && (
              <div className="space-y-2 md:col-span-2">
                <label className="block text-zinc-400 font-bold uppercase text-[10px]">SMS API Key</label>
                <input type="password" value={smsApiKey} onChange={e => setSmsApiKey(e.target.value)} placeholder="Enter SMS API key..."
                  className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none" />
              </div>
            )}
          </div>
          <div className="flex justify-between border-t border-white/10 pt-4">
            <button onClick={() => flash("✓ Test email sent!")} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-white/10">
              <RiMailLine size={13} /> Send Test Email
            </button>
            <button onClick={() => flash("✓ Notification settings saved!")} className="px-6 py-2.5 rounded-xl bg-[#F5B301] hover:bg-amber-300 text-zinc-950 font-black text-xs flex items-center gap-2 cursor-pointer">
              <RiSaveLine size={13} /> Save Settings
            </button>
          </div>
        </div>
      )}

      {/* ── BACKUP & LOGS ─────────────────────────────────────────── */}
      {activeTab === "backup" && (
        <div className="space-y-5">
          <div className="glass p-6 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-5">
            <h3 className="text-base font-black text-white uppercase border-b border-white/10 pb-4" style={{ fontFamily: "var(--font-heading)" }}>Database Backup & Exports</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Full DB Backup", desc: "All data export", icon: RiDatabase2Line, last: "2h ago" },
                { label: "Events Data CSV", desc: "All events export", icon: RiDownloadLine, last: "5h ago" },
                { label: "Registrations CSV", desc: "All participants", icon: RiDownloadLine, last: "1h ago" },
              ].map(({ label, desc, icon: Icon, last }) => (
                <div key={label} className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3 hover:border-white/20 transition-all">
                  <Icon size={20} className="text-amber-400" />
                  <div>
                    <p className="font-bold text-white text-sm">{label}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{desc}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-2 border-t border-white/5">
                    <span className="text-zinc-500 font-mono">Last: {last}</span>
                    <button onClick={() => flash(`✓ ${label} started!`)} className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 font-bold cursor-pointer">Export</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Audit Log */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <RiHistoryLine size={14} className="text-amber-400" /> Audit Trail
                </h4>
                <button onClick={() => flash("✓ Audit log exported")} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-white/10">
                  <RiDownloadLine size={12} /> Export
                </button>
              </div>
              {AUDIT_LOG.map((log, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${log.type === "success" ? "bg-emerald-400" : log.type === "warning" ? "bg-amber-400" : log.type === "danger" ? "bg-rose-400" : "bg-blue-400"}`} />
                  <p className="flex-1 text-zinc-300 font-medium">{log.action}</p>
                  <span className="text-zinc-500 font-bold hidden sm:block">{log.user}</span>
                  <span className="text-zinc-600 font-mono">{log.time}</span>
                </div>
              ))}
            </div>

            {/* Danger Zone */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3 pt-4 mt-2">
              <div className="flex items-center gap-2">
                <RiAlertLine className="text-rose-400" size={16} />
                <h4 className="font-black text-rose-400 uppercase text-xs tracking-wider">Danger Zone</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-black/40 border border-rose-500/20 space-y-2">
                  <p className="font-bold text-white">Flush Server Cache</p>
                  <p className="text-zinc-500">Clear all caches and session data</p>
                  <button onClick={() => flash("✓ Cache flushed")} className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold border border-rose-500/20 cursor-pointer flex items-center gap-1.5">
                    <RiRefreshLine size={12} /> Flush Cache
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-rose-500/20 space-y-2">
                  <p className="font-bold text-white">Clear Test Data</p>
                  <p className="text-zinc-500">Remove all test/demo registrations</p>
                  <button onClick={() => { if (confirm("Clear all test data? This cannot be undone.")) flash("✓ Test data cleared"); }} className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold border border-rose-500/20 cursor-pointer flex items-center gap-1.5">
                    <RiDeleteBinLine size={12} /> Clear Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MY PROFILE ────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-6 max-w-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-black text-white uppercase" style={{ fontFamily: "var(--font-heading)" }}>Super Admin Profile</h3>
            <button onClick={() => setEditProfile(!editProfile)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-white/10">
              <RiEditLine size={13} /> {editProfile ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5B301] to-amber-700 flex items-center justify-center text-zinc-950 font-black text-2xl shadow-lg shadow-amber-500/20">
              {profileName[0]}
            </div>
            <div>
              <p className="font-black text-white text-base">{profileName}</p>
              <p className="text-zinc-400 text-xs">{profileEmail}</p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#F5B301]/15 text-[#F5B301] border border-[#F5B301]/25">Super Admin</span>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              { label: "Full Name", value: profileName, setter: setProfileName },
              { label: "Email Address", value: profileEmail, setter: setProfileEmail },
              { label: "Phone Number", value: profilePhone, setter: setProfilePhone },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-zinc-500 font-bold text-[10px] mb-1.5 uppercase">{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={e => setter(e.target.value)}
                  disabled={!editProfile}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all ${
                    editProfile
                      ? "bg-black/60 border border-white/10 text-white focus:border-amber-400"
                      : "bg-black/30 border border-white/5 text-zinc-400 cursor-default"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Change Password */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <RiKeyLine size={13} className="text-amber-400" /> Change Password
            </h4>
            {["Current Password", "New Password", "Confirm New Password"].map(label => (
              <div key={label} className="relative">
                <label className="block text-zinc-500 font-bold text-[10px] mb-1.5">{label}</label>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 bottom-3 text-zinc-500 hover:text-zinc-300 cursor-pointer">
                  {showPwd ? <RiEyeOffLine size={15} /> : <RiEyeLine size={15} />}
                </button>
              </div>
            ))}
          </div>

          {editProfile && (
            <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
              <button onClick={() => { flash("✓ Password updated!"); }} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-bold text-xs cursor-pointer hover:bg-white/10">
                Update Password
              </button>
              <button onClick={() => { setEditProfile(false); flash("✓ Profile saved!"); }} className="px-6 py-2.5 rounded-xl bg-[#F5B301] hover:bg-amber-300 text-zinc-950 font-black text-xs flex items-center gap-2 cursor-pointer">
                <RiSaveLine size={13} /> Save Profile
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
