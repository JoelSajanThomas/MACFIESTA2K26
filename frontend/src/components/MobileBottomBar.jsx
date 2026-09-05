import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  RiUserLine,
  RiUserFill,
  RiShieldUserLine,
} from "react-icons/ri";
import { isLoggedIn, getCurrentUser } from "../services/api";
import { AUTH_CHANGE_EVENT, isUnauthorized, logout } from "../utils/auth";
import { clearCart } from "../utils/eventCart";

const LEFT_TABS = [
  { label: "Home", href: "/", icon: RiHome5Line, activeIcon: RiHome5Fill },
  { label: "Events", href: "/events", icon: RiCompass3Line, activeIcon: RiCompass3Fill },
];

const RIGHT_TABS_GUEST = [
  { label: "Schedule", href: "/schedule", icon: RiTimeLine, activeIcon: RiTimeFill },
  { label: "Scores", href: "/scoreboard", icon: RiTrophyLine, activeIcon: RiTrophyFill },
];

export default function MobileBottomBar() {
  const { pathname } = useLocation();
  const [user, setUser] = useState(null);
  const [showLogoutToast, setShowLogoutToast] = useState(false);

  const isStandalone =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/volunteer") ||
    pathname?.startsWith("/volunteers") ||
    pathname?.startsWith("/judge") ||
    pathname?.startsWith("/judges");

  useEffect(() => {
    function loadUser() {
      if (!isLoggedIn()) {
        clearCart();
        setUser((prev) => {
          if (prev) {
            setShowLogoutToast(true);
            setTimeout(() => setShowLogoutToast(false), 2500);
          }
          return null;
        });
        return;
      }
      getCurrentUser()
        .then((res) => setUser(res.data))
        .catch((err) => {
          if (isUnauthorized(err)) logout();
          setUser(null);
        });
    }
    loadUser();
    window.addEventListener(AUTH_CHANGE_EVENT, loadUser);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, loadUser);
  }, []);

  if (isStandalone) return null;

  const isAuth = Boolean(user || isLoggedIn());
  const centerHref = isAuth
    ? (user?.is_staff || user?.is_superuser ? "/admin" : "/student-dashboard")
    : "/register";
  const isPassActive = pathname?.startsWith(centerHref);
  const dashHref = isAuth
    ? (user?.is_staff || user?.is_superuser ? "/admin" : "/student-dashboard")
    : "/login";

  const rightTabs = user
    ? [
        {
          label: user.is_staff || user.is_superuser ? "Console" : "Dashboard",
          href: dashHref,
          icon: user.is_staff || user.is_superuser ? RiShieldUserLine : RiUserLine,
          activeIcon: user.is_staff || user.is_superuser ? RiShieldUserLine : RiUserFill,
        },
        {
          label: "Scores",
          href: "/scoreboard",
          icon: RiTrophyLine,
          activeIcon: RiTrophyFill,
        },
      ]
    : RIGHT_TABS_GUEST;

  return (
    <>
      {/* Logout Toast */}
      <AnimatePresence>
        {showLogoutToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-5 py-2.5 rounded-full bg-[#0A0D1A] border border-marvel-red/40 text-white text-[11px] font-bold uppercase tracking-widest font-mono shadow-[0_0_20px_rgba(237,29,36,0.4)] whitespace-nowrap xl:hidden"
          >
            🛡️ Agent logged out
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-2.5 left-0 right-0 z-[90] xl:hidden pointer-events-none pb-[env(safe-area-inset-bottom)] px-3">
        <nav
          aria-label="Mobile Navigation Dock"
          className="max-w-[420px] mx-auto pointer-events-auto relative bg-[#070712]/92 backdrop-blur-2xl border border-white/15 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(0,212,255,0.12)] flex items-center justify-between px-2 py-1 font-space"
        >
          {/* Top Laser Accent Glow Line */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-arc-cyan/60 to-transparent pointer-events-none" />

          {/* Left 2 Tabs */}
          <div className="flex items-center justify-around flex-1">
            {LEFT_TABS.map((tab) => {
              const isActive = tab.href === "/" ? pathname === "/" : pathname?.startsWith(tab.href);
              const Icon = isActive ? tab.activeIcon : tab.icon;

              return (
                <Link
                  key={tab.href}
                  to={tab.href}
                  className="relative flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 group flex-1"
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-dock-active-pip"
                      className="absolute -top-1 w-5 h-0.5 rounded-full bg-arc-cyan shadow-[0_0_10px_#00D4FF]"
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    />
                  )}
                  <Icon
                    className={`text-lg transition-all duration-200 ${
                      isActive
                        ? "text-arc-cyan scale-110 drop-shadow-[0_0_8px_#00D4FF]"
                        : "text-white/60 group-hover:text-white"
                    }`}
                  />
                  <span
                    className={`text-[8.5px] font-bold tracking-wider uppercase transition-colors mt-0.5 ${
                      isActive ? "text-arc-cyan font-black" : "text-white/45 group-hover:text-white/80"
                    }`}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Center Elevated Arc Reactor Pass Button */}
          <div className="relative -mt-5 mx-1 shrink-0">
            <Link
              to={centerHref}
              className="group relative flex flex-col items-center focus:outline-none"
              aria-label={isAuth ? (user?.is_staff || user?.is_superuser ? "Command Console" : "Agent Dashboard") : "Festival Entry Pass"}
            >
              {/* Pulsing Backlight Glow */}
              <div className="absolute -inset-1 rounded-full bg-marvel-red/35 blur-md group-hover:bg-marvel-red/60 transition-colors animate-pulse" />

              <motion.div
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className={`relative w-12 h-12 rounded-full p-[1.5px] flex items-center justify-center shadow-[0_0_22px_rgba(237,29,36,0.65),0_0_12px_rgba(0,212,255,0.4)] ${
                  isPassActive
                    ? "bg-gradient-to-tr from-marvel-red via-metallic-gold to-arc-cyan animate-spin-slow"
                    : "bg-gradient-to-tr from-marvel-red via-[#ED1D24] to-arc-cyan"
                }`}
              >
                {/* Inner Reactor Disc */}
                <div className="w-full h-full rounded-full bg-[#070712] flex flex-col items-center justify-center relative overflow-hidden border border-white/25">
                  <RiTicketFill
                    className={`text-xl transition-transform duration-200 group-hover:scale-110 ${
                      isPassActive
                        ? "text-metallic-gold drop-shadow-[0_0_10px_#FFD700]"
                        : "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    }`}
                  />
                </div>
              </motion.div>
              <span className="text-[7.5px] font-black uppercase tracking-[0.16em] text-metallic-gold font-orbitron mt-0.5 drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]">
                {isAuth ? "DECK" : "PASS"}
              </span>
            </Link>
          </div>

          {/* Right Tabs */}
          <div className="flex items-center justify-around flex-1">
            {rightTabs.map((tab) => {
              const isActive = pathname?.startsWith(tab.href);
              const Icon = isActive ? tab.activeIcon : tab.icon;

              return (
                <Link
                  key={tab.href}
                  to={tab.href}
                  className="relative flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 group flex-1"
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-dock-active-pip"
                      className="absolute -top-1 w-5 h-0.5 rounded-full bg-arc-cyan shadow-[0_0_10px_#00D4FF]"
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    />
                  )}
                  <Icon
                    className={`text-lg transition-all duration-200 ${
                      isActive
                        ? "text-arc-cyan scale-110 drop-shadow-[0_0_8px_#00D4FF]"
                        : "text-white/60 group-hover:text-white"
                    }`}
                  />
                  <span
                    className={`text-[8.5px] font-bold tracking-wider uppercase transition-colors mt-0.5 ${
                      isActive ? "text-arc-cyan font-black" : "text-white/45 group-hover:text-white/80"
                    }`}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
