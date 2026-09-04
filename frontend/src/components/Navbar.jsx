import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiMenuLine,
  RiCloseLine,
  RiArrowDownSLine,
  RiShieldFlashLine,
  RiGalleryLine,
  RiBookOpenLine,
  RiQuestionLine,
  RiFileListLine,
  RiMedalLine,
  RiLogoutBoxLine,
  RiDashboardLine,
  RiShieldUserLine,
  RiUserLine,
} from "react-icons/ri";
import { getCurrentUser, isLoggedIn } from "../services/api";
import { AUTH_CHANGE_EVENT, logout, isUnauthorized } from "../utils/auth";

const mainNavItems = [
  { href: "/", label: "MISSION CONTROL" },
  { href: "/events", label: "MISSIONS" },
  { href: "/schedule", label: "TIMELINE" },
  { href: "/scoreboard", label: "SCOREBOARD" },
  { href: "/accommodation", label: "QUARTERS" },
  { href: "/contact", label: "COMMS" },
];

const dropdownNavItems = [
  { href: "/gallery", label: "Visual Vault", icon: RiGalleryLine },
  { href: "/results", label: "Hall of Heroes", icon: RiMedalLine },
  { href: "/brochure", label: "Directive PDF", icon: RiBookOpenLine },
  { href: "/rules", label: "Protocol Rules", icon: RiFileListLine },
  { href: "/faq", label: "JARVIS FAQ", icon: RiQuestionLine },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [user, setUser] = useState(null);

  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    navigate("/");
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Top Laser Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-marvel-red via-arc-cyan to-metallic-gold z-[100] transition-all duration-75 shadow-[0_0_10px_#00D4FF]"
        style={{ width: `${scrollProgress}%` }}
      />

      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent py-3 sm:py-4"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 md:gap-4">
          
          {/* Brand Logo & Title */}
          <Link
            to="/"
            className="flex items-center gap-2 group shrink-0 focus:outline-none"
            aria-label="MACFIESTA Home"
          >
            <img
              src="/logo.png"
              alt="MACFIESTA"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:scale-105 transition-transform shrink-0"
              loading="eager"
            />
            <span
              className="text-lg sm:text-2xl font-black uppercase font-anton tracking-wider text-metallic-gold group-hover:text-white transition-colors [text-shadow:_0_1px_3px_rgba(0,0,0,0.7)]"
            >
              MACFIESTA
            </span>
          </Link>

          {/* Desktop Capsule Nav Menu */}
          <div className="hidden lg:flex items-center gap-1 bg-[#090912]/80 border border-white/10 rounded-full px-2 py-1 shadow-[0_0_20px_rgba(0,0,0,0.6)] backdrop-blur-xl font-space">
            {mainNavItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 relative ${
                    active
                      ? "text-white bg-gradient-to-r from-marvel-red to-[#b30e14] shadow-[0_0_15px_rgba(237,29,36,0.6)]"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-arc-cyan animate-pulse shadow-[0_0_6px_#00D4FF]" />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* HQ HUB Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  dropdownOpen
                    ? "text-arc-cyan bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>HQ HUB</span>
                <RiArrowDownSLine
                  className={`text-xs transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180 text-arc-cyan" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-[#070710]/95 border border-white/15 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl space-y-0.5 font-space z-50"
                  >
                    {dropdownNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white/80 hover:text-arc-cyan hover:bg-white/5 transition-all uppercase tracking-wider"
                        >
                          <Icon className="text-xs text-metallic-gold" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Right Auth / Action Buttons */}
          <div className="hidden lg:flex items-center gap-2.5 font-space">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user.is_staff || user.is_superuser ? "/admin" : "/student-dashboard"}
                  className="px-4 py-1.5 text-[11px] font-black text-black bg-arc-cyan rounded-full hover:bg-white transition-all uppercase tracking-wider shadow-[0_0_15px_#00D4FF]"
                >
                  {user.is_staff || user.is_superuser ? "Command Console" : "Agent HUD"}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2.5 py-1 text-[10px] font-bold text-white/50 hover:text-marvel-red transition-colors tracking-widest uppercase cursor-pointer"
                >
                  Abort
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-[11px] font-bold text-arc-cyan border border-arc-cyan/60 rounded-full hover:bg-arc-cyan/15 transition-all uppercase tracking-wider flex items-center gap-1 shadow-[0_0_12px_rgba(0,212,255,0.25)] hover:shadow-[0_0_18px_rgba(0,212,255,0.5)]"
                >
                  <RiShieldFlashLine className="text-xs" />
                  <span>S.H.I.E.L.D. LINK</span>
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-[11px] font-black text-black bg-metallic-gold rounded-full hover:bg-white transition-all duration-300 tracking-wider uppercase shadow-[0_0_15px_rgba(212,175,55,0.5)] hover:shadow-[0_0_22px_rgba(212,175,55,0.8)]"
                >
                  AGENT LOGIN
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            {!user ? (
              <Link
                to="/login"
                className="px-2.5 py-1 text-[10px] font-black text-black bg-metallic-gold rounded-full tracking-wider uppercase shadow-[0_0_10px_rgba(212,175,55,0.4)]"
              >
                Login
              </Link>
            ) : (
              <Link
                to={user.is_staff || user.is_superuser ? "/admin" : "/student-dashboard"}
                className="px-2.5 py-1 text-[10px] font-bold bg-marvel-red text-white rounded-full tracking-wider uppercase shadow-[0_0_10px_#ED1D24]"
              >
                HUD
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-arc-cyan hover:border-arc-cyan/40 transition-all cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <RiCloseLine size={22} /> : <RiMenuLine size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[99] bg-[#05050A]/97 backdrop-blur-2xl flex flex-col p-4 sm:p-6 lg:hidden overflow-hidden w-full max-w-full"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {/* Ambient Lighting */}
            <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-marvel-red/15 blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-arc-cyan/15 blur-[90px] pointer-events-none" />

            {/* Mobile Header */}
            <div className="flex items-center justify-between pt-2 pb-3 border-b border-white/10 relative z-10 w-full">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-arc-cyan animate-pulse shadow-[0_0_8px_#00D4FF]" />
                <span className="text-[10px] font-bold text-arc-cyan tracking-[0.2em] uppercase font-space">
                  MISSION COMMAND
                </span>
              </div>
              <button
                type="button"
                onClick={closeMobile}
                className="p-1.5 rounded-full bg-white/5 border border-white/15 text-white/80 hover:text-arc-cyan hover:border-arc-cyan transition-colors"
                aria-label="Close menu"
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            {/* Nav Links Stack */}
            <nav className="flex flex-col items-center justify-center gap-1.5 py-4 flex-1 overflow-y-auto relative z-10 w-full font-space">
              {mainNavItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="w-full text-center"
                >
                  <Link
                    to={item.href}
                    onClick={closeMobile}
                    className={`block py-1 text-base sm:text-lg font-bold tracking-wider uppercase transition-all duration-200 ${
                      pathname === item.href
                        ? "text-marvel-red glow-text-red font-black"
                        : "text-white/80 hover:text-arc-cyan"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* Sub-links row */}
              <div className="flex flex-wrap justify-center gap-1.5 pt-3 w-full border-t border-white/10 font-space">
                {dropdownNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={closeMobile}
                    className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-metallic-gold hover:border-metallic-gold uppercase tracking-wider transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Mobile Footer Actions */}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-3 relative z-10 font-space pb-[max(1rem,env(safe-area-inset-bottom))] w-full">
              {user ? (
                <>
                  {/* User Profile Card */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-arc-cyan/30 to-metallic-gold/30 border border-arc-cyan/40 flex items-center justify-center shrink-0 shadow-[0_0_14px_rgba(0,212,255,0.3)]">
                      <span className="text-sm font-black text-arc-cyan font-excon-black uppercase">
                        {(user.first_name?.[0] || user.username?.[0] || "A").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white uppercase font-excon-bold truncate">
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.first_name || user.username || "Agent"}
                      </p>
                      <p className="text-[10px] text-white/50 font-mono truncate">{user.email || ""}</p>
                      {(user.is_staff || user.is_superuser) && (
                        <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-marvel-red/20 text-marvel-red border border-marvel-red/30 font-bold uppercase mt-0.5">
                          <RiShieldUserLine className="text-[9px]" /> Staff
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dashboard + Logout */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Link
                      to={user.is_staff || user.is_superuser ? "/admin" : "/student-dashboard"}
                      onClick={closeMobile}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-black bg-gradient-to-r from-arc-cyan to-arc-cyan/80 text-black rounded-full tracking-wider uppercase shadow-[0_0_15px_rgba(0,212,255,0.35)]"
                    >
                      {user.is_staff || user.is_superuser ? (
                        <><RiShieldUserLine className="text-xs" /><span>Console</span></>
                      ) : (
                        <><RiDashboardLine className="text-xs" /><span>My HUD</span></>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={() => { closeMobile(); logout(); setUser(null); navigate("/"); }}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-black bg-gradient-to-r from-marvel-red/90 to-marvel-red text-white rounded-full tracking-wider uppercase shadow-[0_0_15px_rgba(237,29,36,0.4)] cursor-pointer hover:shadow-[0_0_25px_rgba(237,29,36,0.7)] transition-all"
                    >
                      <RiLogoutBoxLine className="text-xs" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold bg-white/5 border border-white/20 text-white rounded-full tracking-wider uppercase hover:border-white hover:bg-white/10 transition-all"
                  >
                    <RiUserLine className="text-xs" />
                    <span>Agent Login</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobile}
                    className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-black bg-metallic-gold text-black rounded-full tracking-wider uppercase shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transition-all"
                  >
                    <RiShieldFlashLine className="text-xs" />
                    <span>Register Pass</span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
