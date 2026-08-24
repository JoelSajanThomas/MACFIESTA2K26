"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiHome5Line,
  RiHome5Fill,
  RiCompass3Line,
  RiCompass3Fill,
  RiTimeLine,
  RiTimeFill,
  RiTrophyLine,
  RiTrophyFill,
  RiTicketFill,
} from "react-icons/ri";

const LEFT_TABS = [
  { label: "Home", href: "/", icon: RiHome5Line, activeIcon: RiHome5Fill },
  { label: "Missions", href: "/events", icon: RiCompass3Line, activeIcon: RiCompass3Fill },
];

const RIGHT_TABS = [
  { label: "Timeline", href: "/schedule", icon: RiTimeLine, activeIcon: RiTimeFill },
  { label: "Scores", href: "/scoreboard", icon: RiTrophyLine, activeIcon: RiTrophyFill },
];

export function MobileBottomBar() {
  const pathname = usePathname();

  // Hide on admin and standalone dashboards to prevent overlapping console UI
  const isStandalone =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/volunteer") ||
    pathname?.startsWith("/volunteers") ||
    pathname?.startsWith("/judge") ||
    pathname?.startsWith("/judges");

  if (isStandalone) return null;

  const isPassActive = pathname?.startsWith("/signup");

  return (
    <div className="fixed bottom-3 left-0 right-0 z-[90] xl:hidden pointer-events-none pb-[env(safe-area-inset-bottom)] px-3 sm:px-4">
      <nav
        aria-label="Mobile Navigation Dock"
        className="max-w-[370px] sm:max-w-md mx-auto pointer-events-auto relative bg-transparent backdrop-blur-md border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(0,212,255,0.08)] flex items-center justify-between px-2 py-1 font-excon"
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-arc-cyan/40 to-transparent pointer-events-none" />

        {/* Left 2 Tabs */}
        <div className="flex items-center justify-around flex-1">
          {LEFT_TABS.map((tab) => {
            const isActive = tab.href === "/" ? pathname === "/" : pathname?.startsWith(tab.href);
            const Icon = isActive ? tab.activeIcon : tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-300 group"
              >
                {/* Active Top Neon Laser Pip */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-dock-active-pip"
                    className="absolute -top-1 w-5 h-1 rounded-full bg-arc-cyan shadow-[0_0_12px_#00D4FF]"
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}

                <div className="flex flex-col items-center gap-0.5">
                  <Icon
                    className={`text-lg transition-all duration-200 ${
                      isActive
                        ? "text-arc-cyan scale-110 drop-shadow-[0_0_10px_#00D4FF]"
                        : "text-white/70 group-hover:text-white"
                    }`}
                  />
                  <span
                    className={`text-[8.5px] uppercase tracking-wider font-bold truncate max-w-[54px] transition-colors ${
                      isActive ? "text-arc-cyan font-excon-bold" : "text-white/60 group-hover:text-white/90"
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Center Elevated Arc Reactor Pass Button */}
        <div className="relative -mt-6 mx-1 shrink-0">
          <Link
            href="/signup"
            className="group relative flex flex-col items-center focus:outline-none"
            aria-label="Festival Entry Pass"
          >
            {/* Pulsing Backlight Glow */}
            <div className="absolute -inset-1 rounded-full bg-marvel-red/30 blur-md group-hover:bg-marvel-red/50 transition-colors animate-pulse" />

            <motion.div
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-full p-0.5 flex items-center justify-center shadow-[0_0_25px_rgba(237,29,36,0.6),0_0_15px_rgba(0,212,255,0.4)] ${
                isPassActive
                  ? "bg-gradient-to-tr from-marvel-red via-metallic-gold to-arc-cyan"
                  : "bg-gradient-to-tr from-marvel-red via-[#ED1D24] to-arc-cyan"
              }`}
            >
              {/* Inner Reactor Disc */}
              <div className="w-full h-full rounded-full bg-black/60 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden border border-white/20">
                {/* Rotating Arc Reactor Core Ring */}
                <div className="absolute inset-0 rounded-full border border-marvel-red/60 animate-spin-slow pointer-events-none" />

                <RiTicketFill
                  className={`text-xl sm:text-2xl transition-transform duration-300 group-hover:scale-110 ${
                    isPassActive
                      ? "text-metallic-gold drop-shadow-[0_0_10px_#FFD700]"
                      : "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  }`}
                />
              </div>
            </motion.div>

            <span className="text-[8px] uppercase tracking-widest font-black text-metallic-gold mt-1 font-excon-black drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]">
              Pass
            </span>
          </Link>
        </div>

        {/* Right 2 Tabs */}
        <div className="flex items-center justify-around flex-1">
          {RIGHT_TABS.map((tab) => {
            const isActive = pathname?.startsWith(tab.href);
            const Icon = isActive ? tab.activeIcon : tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-300 group"
              >
                {/* Active Top Neon Laser Pip */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-dock-active-pip"
                    className="absolute -top-1 w-5 h-1 rounded-full bg-arc-cyan shadow-[0_0_12px_#00D4FF]"
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}

                <div className="flex flex-col items-center gap-0.5">
                  <Icon
                    className={`text-lg transition-all duration-200 ${
                      isActive
                        ? "text-arc-cyan scale-110 drop-shadow-[0_0_10px_#00D4FF]"
                        : "text-white/60 group-hover:text-white"
                    }`}
                  />
                  <span
                    className={`text-[8.5px] uppercase tracking-wider font-bold truncate max-w-[54px] transition-colors ${
                      isActive ? "text-arc-cyan font-excon-bold" : "text-white/50 group-hover:text-white/80"
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

