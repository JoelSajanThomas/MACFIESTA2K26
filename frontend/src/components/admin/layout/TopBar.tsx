"use client";

import { useState, useRef, useEffect } from "react";
import {
  RiSearchLine,
  RiCommandLine,
  RiNotification4Line,
  RiLogoutBoxLine,
  RiMenuLine,
  RiArrowDownSLine,
  RiCalendarCheckLine,
  RiTimeLine,
  RiCheckLine,
  RiShieldFlashLine,
  RiGridFill,
} from "react-icons/ri";

interface TopBarProps {
  activePage: string;
  onOpenCommandPalette: () => void;
  onOpenMobileSidebar: () => void;
  onOpenNotifications: () => void;
  onOpenMenuMatrix?: () => void;
  onQuickAction?: (action: string) => void;
  socketConnected?: boolean;
  user?: any;
  onLogout?: () => void;
}

export function TopBar({
  onOpenCommandPalette,
  onOpenMobileSidebar,
  onOpenNotifications,
  onOpenMenuMatrix,
  user,
  onLogout,
}: TopBarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [editedDateTime, setEditedDateTime] = useState<string>("");
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }) +
        " · " +
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="h-14 bg-black/90 border-b border-arc-cyan/30 px-3 lg:px-6 flex items-center justify-between gap-4 shrink-0 select-none z-30 sticky top-0 font-mono shadow-[0_0_25px_rgba(0,0,0,0.9)] backdrop-blur-md">
      {/* Left: Mobile Menu, Menu Matrix Button & Current Date & Time */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          suppressHydrationWarning={true}
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <RiMenuLine size={20} />
        </button>

        {/* Tactical Menu Matrix Launcher */}
        {onOpenMenuMatrix && (
          <button
            type="button"
            suppressHydrationWarning={true}
            onClick={onOpenMenuMatrix}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-marvel-red text-white hover:bg-white hover:text-black font-extrabold text-[11px] uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_#ED1D24]"
            title="Open Tactical Admin Menu Matrix"
          >
            <RiGridFill size={15} className="animate-pulse" />
            <span className="hidden sm:inline">Menu Matrix</span>
          </button>
        )}

        {/* Current Date & Time (Editable Chip) */}
        <button
          type="button"
          suppressHydrationWarning={true}
          onClick={() => {
            setEditedDateTime(new Date().toISOString().slice(0, 16));
            setDateModalOpen(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/80 border border-arc-cyan/40 hover:border-arc-cyan text-[11px] font-mono text-white/90 hover:text-arc-cyan transition-all cursor-pointer shadow-[0_0_12px_rgba(0,212,255,0.15)]"
          title="Click to adjust system festival date & time"
        >
          <RiCalendarCheckLine size={14} className="text-metallic-gold animate-pulse" />
          <span>{currentDateTime || "Aug 8, 2026 · 10:00 AM"}</span>
        </button>
      </div>


      {/* Center: Search */}
      <button
        type="button"
        suppressHydrationWarning={true}
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-arc-cyan/25 hover:border-arc-cyan rounded-xl text-xs text-white/50 hover:text-white transition-all cursor-pointer max-w-md w-full shadow-inner"
      >
        <RiSearchLine size={15} className="text-arc-cyan" />
        <span className="flex-1 text-left truncate">Search missions, agents, scores, rules...</span>
        <kbd className="hidden lg:flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono bg-black/80 rounded-md text-metallic-gold border border-metallic-gold/40">
          <RiCommandLine size={10} /> K
        </kbd>
      </button>

      {/* Right: Notifications, Profile, Logout */}
      <div className="flex items-center gap-2">
        {/* Mobile Search button */}
        <button
          type="button"
          suppressHydrationWarning={true}
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
        >
          <RiSearchLine size={18} />
        </button>

        {/* Notifications */}
        <button
          type="button"
          suppressHydrationWarning={true}
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-white/70 hover:text-arc-cyan hover:bg-arc-cyan/10 transition-colors cursor-pointer border border-transparent hover:border-arc-cyan/30"
          title="Notifications"
        >
          <RiNotification4Line size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-marvel-red animate-ping shadow-[0_0_8px_#ED1D24]" />
        </button>

        {/* Admin Profile & Logout */}
        <div ref={profileRef} className="relative ml-1">
          <button
            type="button"
            suppressHydrationWarning={true}
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-arc-cyan/30"
          >
            <div className="w-8 h-8 rounded-xl bg-marvel-red text-white font-black text-xs flex items-center justify-center shadow-[0_0_12px_#ED1D24]">
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </div>
            <span className="hidden sm:inline-block text-xs font-bold text-white truncate max-w-[110px] tracking-wider uppercase">
              {user?.name || "Commander"}
            </span>
            <RiArrowDownSLine size={14} className="text-white/50 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-black/95 border border-arc-cyan/40 rounded-2xl shadow-2xl z-50 p-2 space-y-1 backdrop-blur-2xl">
              <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                <p className="text-xs font-black text-white uppercase tracking-wider truncate">{user?.name || "Administrator"}</p>
                <p className="text-[10px] text-white/50 truncate font-mono">{user?.email || "admin@macfast.org"}</p>
                <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-black px-2.5 py-0.5 rounded-full bg-marvel-red/20 text-marvel-red border border-marvel-red/40 uppercase">
                  <RiShieldFlashLine /> {user?.role?.toUpperCase() || "SUPER ADMIN"}
                </span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  suppressHydrationWarning={true}
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-marvel-red hover:bg-marvel-red/15 transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <RiLogoutBoxLine size={16} />
                  <span>Abort Mission (Sign Out)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editable Date & Time Modal */}
      {dateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0A0D1A] border border-arc-cyan/40 p-6 rounded-3xl max-w-sm w-full space-y-5 shadow-[0_0_50px_rgba(0,212,255,0.2)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                <RiTimeLine className="text-metallic-gold" /> Adjust Mission Operational Time
              </h3>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-white/60">
                Festival Operational Datetime
              </label>
              <input
                type="datetime-local"
                suppressHydrationWarning={true}
                value={editedDateTime}
                onChange={(e) => setEditedDateTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-arc-cyan/30 rounded-xl text-white text-xs font-mono focus:border-arc-cyan focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                suppressHydrationWarning={true}
                onClick={() => setDateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold cursor-pointer uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                suppressHydrationWarning={true}
                onClick={() => {
                  if (editedDateTime) {
                    const dt = new Date(editedDateTime);
                    setCurrentDateTime(
                      dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
                      " · " +
                      dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                    );
                  }
                  setDateModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-metallic-gold hover:bg-white text-black text-xs font-extrabold flex items-center gap-1.5 cursor-pointer uppercase tracking-widest shadow-[0_0_15px_#FFD700]"
              >
                <RiCheckLine size={16} /> Update Time
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

