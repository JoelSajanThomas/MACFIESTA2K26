import { useLocation, Link, useNavigate } from "react-router-dom";
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
  RiLogoutBoxLine,
  RiShieldUserLine,
} from "react-icons/ri";
import { isLoggedIn, getCurrentUser } from "../services/api";
import { AUTH_CHANGE_EVENT, logout, isUnauthorized } from "../utils/auth";

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
  const navigate = useNavigate();
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
        setUser(null);
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

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowLogoutToast(true);
    setTimeout(() => setShowLogoutToast(false), 2500);
    navigate("/");
  };

  if (isStandalone) return null;

  const isPassActive = pathname?.startsWith("/register");
  const dashHref = user
    ? user.is_staff || user.is_superuser
      ? "/admin"
      : "/student-dashboard"
    : "/login";

  const rightTabs = user
    ? [
        {
          label: user.is_staff || user.is_superuser ? "Console" : "My HUD",
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

      <div className="fixed bottom-3 left-0 right-0 z-[90] xl:hidden pointer-events-none pb-[env(safe-area-inset-bottom)] px-3 sm:px-4">
        <nav
          aria-label="Mobile Navigation Dock"
          className="max-w-[420px] sm:max-w-md mx-auto pointer-events-auto relative bg-[#05050A]/90 backdrop-blur-md border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(0,212,255,0.08)] flex items-center justify-between px-2 py-1 font-excon"
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
                  to={tab.href}
                  className="relative flex items-center justify-center py-2 px-4 rounded-full transition-all duration-300 group"
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-dock-active-pip"
                      className="absolute -top-1 w-5 h-1 rounded-full bg-arc-cyan shadow-[0_0_12px_#00D4FF]"
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    />
                  )}
                  <Icon
                    className={`text-xl transition-all duration-200 ${
                      isActive
                        ? "text-arc-cyan scale-110 drop-shadow-[0_0_10px_#00D4FF]"
                        : "text-white/70 group-hover:text-white"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Center Elevated Arc Reactor Pass Button */}
          <div className="relative -mt-6 mx-1 shrink-0">
            <Link
              to="/register"
              className="group relative flex flex-col items-center focus:outline-none"
              aria-label="Festival Entry Pass"
            >
              {/* Pulsing Backlight Glow */}
              <div className="absolute -inset-1 rounded-full bg-marvel-red/30 blur-md group-hover:bg-marvel-red/50 transition-colors animate-pulse" />

              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 flex items-center justify-center shadow-[0_0_25px_rgba(237,29,36,0.6),0_0_15px_rgba(0,212,255,0.4)] ${
                  isPassActive
                    ? "bg-gradient-to-tr from-marvel-red via-metallic-gold to-arc-cyan"
                    : "bg-gradient-to-tr from-marvel-red via-[#ED1D24] to-arc-cyan"
                }`}
              >
                {/* Inner Reactor Disc */}
                <div className="w-full h-full rounded-full bg-black/60 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden border border-white/20">
                  <RiTicketFill
                    className={`text-xl sm:text-2xl transition-transform duration-300 group-hover:scale-110 ${
                      isPassActive
                        ? "text-metallic-gold drop-shadow-[0_0_10px_#FFD700]"
                        : "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    }`}
                  />
                </div>
              </motion.div>
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
                  className="relative flex items-center justify-center py-2 px-4 rounded-full transition-all duration-300 group"
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-dock-active-pip"
                      className="absolute -top-1 w-5 h-1 rounded-full bg-arc-cyan shadow-[0_0_12px_#00D4FF]"
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    />
                  )}
                  <Icon
                    className={`text-xl transition-all duration-200 ${
                      isActive
                        ? "text-arc-cyan scale-110 drop-shadow-[0_0_10px_#00D4FF]"
                        : "text-white/60 group-hover:text-white"
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
