"use client";

import { useState } from "react";
import {
  RiSettings4Line,
  RiTimeLine,
  RiPaletteLine,
  RiCheckDoubleLine,
  RiSaveLine,
  RiToggleLine,
  RiGlobalLine,
  RiRefreshLine,
} from "react-icons/ri";
import { useFestivalControl } from "@/lib/festivalStore";

export function FestivalManagement() {
  const [activeTab, setActiveTab] = useState<"master" | "timeline" | "theme">("master");
  const { settings, timeline, theme, updateSettings, updateTimeline, updateTheme } = useFestivalControl();
  const [flashMsg, setFlashMsg] = useState("");

  const triggerFlash = (msg: string) => {
    setFlashMsg(msg);
    setTimeout(() => setFlashMsg(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#F5B301] text-zinc-950">
              Master Control
            </span>
            <span className="text-xs text-zinc-400 font-semibold">Live Website Sync</span>
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
            Festival Control & Global Timeline Manager
          </h2>
          <p className="text-xs text-zinc-400">
            Single source of truth for MacFiesta branding, countdowns, timelines, and website design.
          </p>
        </div>

        {flashMsg && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full flex items-center gap-1">
            <RiCheckDoubleLine size={16} /> {flashMsg}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 glass p-2.5 rounded-2xl border border-white/10">
        {[
          { id: "master", label: "Master Settings & Branding", icon: RiSettings4Line },
          { id: "timeline", label: "Date & Time Control (Timeline)", icon: RiTimeLine },
          { id: "theme", label: "Theme & Design System", icon: RiPaletteLine },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#F5B301] text-zinc-950 shadow-[0_0_15px_rgba(245,179,1,0.25)]"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Master Settings */}
      {activeTab === "master" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            triggerFlash("✓ Master Settings synchronized live across public website!");
          }}
          className="glass p-6 rounded-2xl border border-white/10 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-heading)" }}>
              Festival Core Parameters
            </h3>
            <span className="text-[10px] text-[#F5B301] font-mono font-bold uppercase">
              Instant Public Website Update
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Festival Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => updateSettings({ name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#F5B301] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Festival Edition</label>
              <input
                type="text"
                value={settings.edition}
                onChange={(e) => updateSettings({ edition: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#F5B301] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Motto</label>
              <input
                type="text"
                value={settings.motto}
                onChange={(e) => updateSettings({ motto: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#F5B301] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Festival Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => updateSettings({ tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#F5B301] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Festival Subtitle</label>
              <input
                type="text"
                value={settings.subtitle}
                onChange={(e) => updateSettings({ subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#F5B301] focus:outline-none"
              />
            </div>
          </div>

          {/* Master Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Registration Gateway</p>
                <p className="text-[10px] text-white/40">Accept public signups</p>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ registrationOpen: !settings.registrationOpen })}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                  settings.registrationOpen ? "bg-emerald-500 text-zinc-950" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {settings.registrationOpen ? "OPEN" : "CLOSED"}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Maintenance Mode</p>
                <p className="text-[10px] text-white/40">Show maintenance banner</p>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ maintenanceMode: !settings.maintenanceMode })}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                  settings.maintenanceMode ? "bg-amber-500 text-zinc-950" : "bg-white/10 text-white/50"
                }`}
              >
                {settings.maintenanceMode ? "ACTIVE" : "OFF"}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Public Countdown</p>
                <p className="text-[10px] text-white/40">Display timer on home</p>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ countdownEnabled: !settings.countdownEnabled })}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                  settings.countdownEnabled ? "bg-[#F5B301] text-zinc-950" : "bg-white/10 text-white/50"
                }`}
              >
                {settings.countdownEnabled ? "ENABLED" : "DISABLED"}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer">
              <RiSaveLine size={16} /> Save Master Settings
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Timeline Manager */}
      {activeTab === "timeline" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            triggerFlash("✓ Global Timeline updated! Auto-countdowns and date triggers synchronized.");
          }}
          className="glass p-6 rounded-2xl border border-white/10 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-heading)" }}>
              Festival Global Timeline & Key Milestones
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">
              Auto Countdown Synchronized
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Festival Opening Date & Time</label>
              <input
                type="datetime-local"
                value={timeline.festStartDate}
                onChange={(e) => updateTimeline({ festStartDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#F5B301] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Festival Concluding Date & Time</label>
              <input
                type="datetime-local"
                value={timeline.festEndDate}
                onChange={(e) => updateTimeline({ festEndDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#F5B301] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Online Registration Open Date</label>
              <input
                type="datetime-local"
                value={timeline.regOpenDate}
                onChange={(e) => updateTimeline({ regOpenDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#F5B301] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Registration Deadline</label>
              <input
                type="datetime-local"
                value={timeline.regCloseDate}
                onChange={(e) => updateTimeline({ regCloseDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#F5B301] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Result Publishing Schedule</label>
              <input
                type="datetime-local"
                value={timeline.resultPubDate}
                onChange={(e) => updateTimeline({ resultPubDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#F5B301] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Certificate Availability Date</label>
              <input
                type="datetime-local"
                value={timeline.certificateDate}
                onChange={(e) => updateTimeline({ certificateDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#F5B301] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer">
              <RiSaveLine size={16} /> Save Timeline Controls
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Theme Manager */}
      {activeTab === "theme" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            triggerFlash("✓ Theme design tokens updated across public pages!");
          }}
          className="glass p-6 rounded-2xl border border-white/10 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-heading)" }}>
              Festival Theme & Brand Tokens
            </h3>
            <span className="text-[10px] text-[#F5B301] font-mono font-bold uppercase">
              Global Color Palette Control
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Primary Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.secondaryColor}
                  onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.secondaryColor}
                  onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Border Radius Token</label>
              <select
                value={theme.borderRadius}
                onChange={(e) => updateTheme({ borderRadius: e.target.value })}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-white text-xs font-semibold"
              >
                <option value="8px">Compact (8px)</option>
                <option value="12px">Rounded (12px)</option>
                <option value="16px">Modern Pill (16px)</option>
                <option value="24px">Extra Rounded (24px)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer">
              <RiSaveLine size={16} /> Save Theme Tokens
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
