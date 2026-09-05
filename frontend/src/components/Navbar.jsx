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
  RiInstagramLine,
  RiFacebookCircleLine,
  RiYoutubeLine,
  RiFlashlightLine,
  RiCompass3Line,
  RiTimeLine,
  RiTrophyLine,
  RiHotelBedLine,
  RiPhoneLine,
  RiMegaphoneLine,
  RiTicketLine,
} from "react-icons/ri";
import { getCurrentUser, isLoggedIn } from "../services/api";
import { AUTH_CHANGE_EVENT, logout, isUnauthorized } from "../utils/auth";
import { BRAND } from "../utils/brand";
import { getCartItems, clearCart } from "../utils/eventCart";

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

const MOBILE_TACTICAL_TILES = [
  { href: "/events", label: "Missions", subtitle: "23 Arena Battles", icon: RiCompass3Line, color: "text-marvel-red" },
  { href: "/schedule", label: "Timeline", subtitle: "Day 1 & 2 Agenda", icon: RiTimeLine, color: "text-arc-cyan" },
  { href: "/scoreboard", label: "Scoreboard", subtitle: "Multiverse Ranks", icon: RiTrophyLine, color: "text-metallic-gold" },
  { href: "/accommodation", label: "Quarters", subtitle: "Hostel & Meals", icon: RiHotelBedLine, color: "text-arc-cyan" },
  { href: "/rules", label: "Protocol", subtitle: "Rulebook Dossier", icon: RiFileListLine, color: "text-white" },
  { href: "/announcements", label: "Live Intel", subtitle: "S.H.I.E.L.D. Alerts", icon: RiMegaphoneLine, color: "text-marvel-red" },
  { href: "/brochure", label: "Brochure", subtitle: "Official Dossier PDF", icon: RiBookOpenLine, color: "text-metallic-gold" },
  { href: "/results", label: "Hall of Heroes", subtitle: "Winner Records", icon: RiMedalLine, color: "text-metallic-gold" },
  { href: "/gallery", label: "Archives", subtitle: "Photo & Video Vault", icon: RiGalleryLine, color: "text-arc-cyan" },
  { href: "/faq", label: "JARVIS FAQ", subtitle: "Agent Help Desk", icon: RiQuestionLine, color: "text-white" },
  { href: "/contact", label: "HQ Comms", subtitle: "Campus Hotline", icon: RiPhoneLine, color: "text-arc-cyan" },
  { href: "/about", label: "About Fest", subtitle: "MACFAST Origin", icon: RiFlashlightLine, color: "text-metallic-gold" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(() => getCartItems().length);
  const isAuth = Boolean(user || isLoggedIn());

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
    const handleCartChange = (event) => setCartCount((event.detail || getCartItems()).length);
    window.addEventListener("macfiesta-cart-change", handleCartChange);
    return () => window.removeEventListener("macfiesta-cart-change", handleCartChange);
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
        clearCart();
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
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 relative ${active
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
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${dropdownOpen
                    ? "text-arc-cyan bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
              >
                <span>HQ HUB</span>
                <RiArrowDownSLine
                  className={`text-xs transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-arc-cyan" : ""
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
            {cartCount > 0 && (
              <Link to="/checkout" className="relative w-9 h-9 rounded-full bg-metallic-gold/15 border border-metallic-gold/50 text-metallic-gold flex items-center justify-center hover:bg-metallic-gold hover:text-black transition-all" title={`${cartCount} missions in checkout`} aria-label={`${cartCount} missions in checkout`}>
                <RiTicketLine />
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-marvel-red text-white text-[9px] font-black flex items-center justify-center">{cartCount}</span>
              </Link>
            )}
            {isAuth ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user?.is_staff || user?.is_superuser ? "/admin" : "/student-dashboard"}
                  className="px-4 py-1.5 text-[11px] font-black text-black bg-arc-cyan rounded-full hover:bg-white transition-all uppercase tracking-wider shadow-[0_0_15px_#00D4FF]"
                >
                  {user?.is_staff || user?.is_superuser ? "Command Console" : "Dashboard"}
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
                <a
                  href={BRAND.socialLinks.instagram || "https://www.instagram.com/macfiestaofficial/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 text-[11px] font-bold text-arc-cyan border border-arc-cyan/60 rounded-full hover:bg-arc-cyan/15 transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,212,255,0.25)] hover:shadow-[0_0_18px_rgba(0,212,255,0.5)] cursor-pointer"
                >
                  <RiInstagramLine className="text-xs" />
                  <span>FOLLOW US</span>
                </a>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-[11px] font-black text-black bg-metallic-gold rounded-full hover:bg-white transition-all duration-300 tracking-wider uppercase shadow-[0_0_15px_rgba(212,175,55,0.5)] hover:shadow-[0_0_22px_rgba(212,175,55,0.8)]"
                >
                  AGENT LOGIN
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            {cartCount > 0 && (
              <Link to="/checkout" className="relative w-8 h-8 rounded-full bg-metallic-gold/15 border border-metallic-gold/50 text-metallic-gold flex items-center justify-center" title={`${cartCount} missions in checkout`} aria-label={`${cartCount} missions in checkout`}>
                <RiTicketLine className="text-sm" />
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-marvel-red text-white text-[8px] font-black flex items-center justify-center">{cartCount}</span>
              </Link>
            )}
            {!isAuth ? (
              <Link
                to="/register"
                className="px-3 py-1 text-[10px] font-black text-black bg-gradient-to-r from-metallic-gold to-[#f59e0b] rounded-full tracking-wider uppercase shadow-[0_0_12px_rgba(212,175,55,0.4)] flex items-center gap-1"
              >
                <RiTicketLine className="text-xs" />
                <span>Pass</span>
              </Link>
            ) : (
              <Link
                to={user?.is_staff || user?.is_superuser ? "/admin" : "/student-dashboard"}
                className="w-7 h-7 rounded-full bg-marvel-red/20 border border-marvel-red/60 text-marvel-red flex items-center justify-center text-[10px] font-black uppercase shadow-[0_0_8px_rgba(237,29,36,0.4)]"
                title={user?.full_name || user?.username || "Agent"}
              >
                {(user?.full_name || user?.username || "A").slice(0, 1).toUpperCase()}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${mobileMenuOpen
                  ? "bg-marvel-red/20 border-marvel-red text-marvel-red shadow-[0_0_12px_rgba(237,29,36,0.4)]"
                  : "bg-white/5 border-white/15 text-white/80 hover:text-arc-cyan hover:border-arc-cyan/40"
                }`}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <RiCloseLine size={20} /> : <RiMenuLine size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* S.H.I.E.L.D. Mobile Command Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[99] bg-[#040409]/98 backdrop-blur-2xl flex flex-col p-4 sm:p-5 lg:hidden overflow-hidden w-full max-w-full font-space"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {/* Ambient Corner Glows */}
            <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-marvel-red/15 blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-arc-cyan/15 blur-[90px] pointer-events-none" />

            {/* Top HUD Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10 w-full shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-arc-cyan animate-pulse shadow-[0_0_8px_#00D4FF]" />
                <span className="text-[10px] font-black text-arc-cyan tracking-[0.2em] uppercase font-orbitron">
                  S.H.I.E.L.D. COMMAND HUB
                </span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-white/10 text-metallic-gold border border-white/15">
                  2K26
                </span>
              </div>
              <button
                type="button"
                onClick={closeMobile}
                className="p-1.5 rounded-full bg-white/5 border border-white/15 text-white/80 hover:text-marvel-red hover:border-marvel-red transition-all cursor-pointer"
                aria-label="Close menu"
              >
                <RiCloseLine size={18} />
              </button>
            </div>

            {/* Scrollable Command Content */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3.5 relative z-10 w-full no-scrollbar">

              {/* Agent Identity Card */}
              {isAuth ? (
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 relative overflow-hidden">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-9 h-9 rounded-full bg-arc-cyan/20 border border-arc-cyan/50 flex items-center justify-center text-arc-cyan font-black text-xs shrink-0 shadow-[0_0_10px_rgba(0,212,255,0.3)] font-orbitron">
                      {(user?.full_name || user?.username || "A").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-white truncate">
                          {user?.full_name || user?.username || "Agent"}
                        </p>
                        <span className="text-[8px] font-bold text-arc-cyan bg-arc-cyan/15 px-1.5 py-0.2 rounded uppercase tracking-wider">
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-[10px] text-white/50 truncate font-mono">
                        {user?.email || "Authenticated Agent"}
                      </p>
                    </div>
                  </div>

                  {/* Dashboard + Logout Action Strip */}
                  <div className="grid grid-cols-2 gap-2 w-full pt-1">
                    <Link
                      to={user?.is_staff || user?.is_superuser ? "/admin" : "/student-dashboard"}
                      onClick={closeMobile}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-[10.5px] font-black bg-arc-cyan text-black rounded-lg tracking-wider uppercase shadow-[0_0_12px_rgba(0,212,255,0.35)] hover:bg-white transition-all"
                    >
                      {user?.is_staff || user?.is_superuser ? (
                        <><RiShieldUserLine className="text-xs" /><span>Console</span></>
                      ) : (
                        <><RiDashboardLine className="text-xs" /><span>Dashboard</span></>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={() => { closeMobile(); logout(); setUser(null); navigate("/"); }}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-[10.5px] font-bold bg-white/5 border border-white/15 text-white/70 hover:text-marvel-red hover:border-marvel-red/40 rounded-lg tracking-wider uppercase transition-all cursor-pointer"
                    >
                      <RiLogoutBoxLine className="text-xs" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-gradient-to-r from-marvel-red/10 via-white/[0.02] to-arc-cyan/10 border border-white/10 space-y-2 text-center">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-metallic-gold font-orbitron">
                    MULTIVERSE ARENA PASS
                  </div>
                  <p className="text-[10.5px] text-white/70 leading-tight">
                    Earth&apos;s premier collegiate fest at MACFAST. Join the battle!
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/login"
                      onClick={closeMobile}
                      className="flex items-center justify-center gap-1 py-1.5 px-2.5 text-[10.5px] font-bold bg-white/5 border border-white/20 text-white rounded-lg tracking-wider uppercase hover:border-white transition-all"
                    >
                      <RiUserLine className="text-xs" />
                      <span>Login</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobile}
                      className="flex items-center justify-center gap-1 py-1.5 px-2.5 text-[10.5px] font-black bg-gradient-to-r from-metallic-gold to-[#f59e0b] text-black rounded-lg tracking-wider uppercase shadow-[0_0_14px_rgba(212,175,55,0.4)]"
                    >
                      <RiShieldFlashLine className="text-xs" />
                      <span>Get Pass</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Tactical Navigation Grid */}
              <div className="space-y-1.5">
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 text-left px-1">
                  TACTICAL DIRECTORY
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {MOBILE_TACTICAL_TILES.map((tile) => {
                    const isActive = tile.href === "/" ? pathname === "/" : pathname?.startsWith(tile.href);
                    const Icon = tile.icon;

                    return (
                      <Link
                        key={tile.href}
                        to={tile.href}
                        onClick={closeMobile}
                        className={`p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between min-h-[64px] group relative overflow-hidden ${isActive
                            ? "bg-white/[0.08] border-arc-cyan/60 shadow-[0_0_12px_rgba(0,212,255,0.2)]"
                            : "bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06]"
                          }`}
                      >
                        {isActive && (
                          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-arc-cyan animate-ping" />
                        )}
                        <div className="flex items-center justify-between w-full">
                          <Icon className={`text-base ${tile.color} transition-transform group-hover:scale-110`} />
                        </div>
                        <div className="mt-1">
                          <span className={`block text-xs font-bold tracking-wide uppercase font-space transition-colors ${isActive ? "text-white font-black" : "text-white/85 group-hover:text-white"
                            }`}>
                            {tile.label}
                          </span>
                          <span className="block text-[8.5px] text-white/45 truncate">
                            {tile.subtitle}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Social Alliances & Campus Coordinates */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between px-1 text-[9px] text-white/40 uppercase tracking-widest font-mono">
                  <span>FOLLOW PROTOCOL</span>
                  <span>MACFAST • 2026</span>
                </div>
                <div className="flex items-center justify-center gap-3 py-1">
                  <a
                    href={BRAND.socialLinks.instagram || "https://www.instagram.com/macfiestaofficial/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-arc-cyan hover:border-arc-cyan/40 transition-all"
                    aria-label="Instagram"
                  >
                    <RiInstagramLine size={16} />
                  </a>
                  <a
                    href={BRAND.socialLinks.facebook || "https://www.facebook.com/macfiesta/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-arc-cyan hover:border-arc-cyan/40 transition-all"
                    aria-label="Facebook"
                  >
                    <RiFacebookCircleLine size={16} />
                  </a>
                  <a
                    href={BRAND.socialLinks.youtube || "https://www.youtube.com/@macfiesta"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-arc-cyan hover:border-arc-cyan/40 transition-all"
                    aria-label="YouTube"
                  >
                    <RiYoutubeLine size={16} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
