import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { CountdownTimer } from "./CountdownTimer";
import { AvengersAudioHud } from "../audio/AvengersAudioHud";
import {
  RiPlayLine,
  RiShieldFlashLine,
  RiFlashlightLine,
  RiCompass3Line,
  RiArrowDownLine,
  RiMegaphoneLine,
  RiDashboardLine,
} from "react-icons/ri";
import { useFestivalControl } from "@/lib/festivalStore";
import { getAnnouncements, isLoggedIn, getCurrentUser } from "../../services/api";
import { AUTH_CHANGE_EVENT } from "../../utils/auth";
import { ANNOUNCEMENT_PLACEHOLDERS } from "../../utils/constants";

/* ─── Reference Design Framer Motion Animation Variants ─── */
const customEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const heroTitleVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: customEase,
    },
  },
};

const heroSubtextVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.15,
      ease: customEase,
    },
  },
};

const heroCtaVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.3,
      ease: customEase,
    },
  },
};

const heroYearSlideVariants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      delay: 0.6,
      ease: customEase,
    },
  },
};

export function HeroSection() {
  const navigate = useNavigate();
  const { settings } = useFestivalControl();
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(() => isLoggedIn());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>(ANNOUNCEMENT_PLACEHOLDERS);
  const sectionRef = useRef<HTMLElement | null>(null);

  const preloadAnnouncements = () => {
    import("../../pages/Announcements");
  };

  const handleOpenAnnouncements = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    navigate("/announcements");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  const handleNavigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(path);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  useEffect(() => {
    const syncAuth = () => {
      const logged = isLoggedIn();
      setUserLoggedIn(logged);
      if (logged) {
        getCurrentUser()
          .then((res: any) => setCurrentUser(res.data))
          .catch(() => {});
      } else {
        setCurrentUser(null);
      }
    };
    syncAuth();
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
  }, []);

  useEffect(() => {
    getAnnouncements()
      .then((res: any) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const active = data.filter((a: any) => a.is_active !== false);
        if (active.length > 0) {
          setAnnouncements(active);
        }
      })
      .catch(() => { });
  }, []);

  const displayPoints = useMemo(() => {
    const list = announcements.length > 0 ? announcements : ANNOUNCEMENT_PLACEHOLDERS;
    if (list.length < 6) {
      return [...list, ...list, ...list, ...list];
    }
    return list;
  }, [announcements]);

  /* ─── Parallax ─── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Background layer moves at 30% scroll speed (y: 0% -> 30%)
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // Title/text layer moves at 60% scroll speed (y: 0% -> 60%) and fades out (opacity 1 -> 0) by 80% scroll progress
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);



  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[calc(100vh-4rem)] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-transparent pt-16 sm:pt-20 lg:pt-14 pb-2 sm:pb-4"
    >
      {/* ─── Parallax Ambient Energy Glows ─── */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 z-[1] pointer-events-none"
      >
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-marvel-red/15 blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-96 h-96 rounded-full bg-arc-cyan/15 blur-[140px]" />
      </motion.div>

      {/* ─── Main Content / Text Layer (moves at 60% scroll speed: 0% -> 60% and fades out by 80%) ─── */}
      <motion.div
        className="relative z-10 flex-grow flex flex-col justify-center max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-6 md:py-8"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-10 items-center">

          {/* Hero Text */}
          <div className="lg:col-span-8 space-y-2 sm:space-y-4 md:space-y-5 text-center lg:text-left flex flex-col items-center lg:items-start relative">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: customEase }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4.5 py-1.5 rounded-full border border-marvel-red/50 text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-[0.2em] uppercase font-space transition-all duration-300 select-none hover:border-marvel-red/80 hover:scale-105"
              style={{
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)",
                boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.35), 0 4px 16px rgba(0, 0, 0, 0.2), 0 0 12px rgba(237, 29, 36, 0.25)",
              }}
            >
              <RiShieldFlashLine className="text-[#ED1D24] animate-pulse text-xs sm:text-sm drop-shadow-[0_0_8px_#ED1D24] shrink-0" />
              <span className="text-[#ED1D24] font-black tracking-wider sm:tracking-[0.2em] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                AVENGERS HEADQUARTERS <span className="text-white/60 mx-0.5">•</span> <span className="text-[#ED1D24]">{settings.edition}</span>
              </span>
            </motion.div>

            {/* Main Title Block */}
            <div className="space-y-0.5 sm:space-y-1 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: customEase }}
              >
                <span
                  className="block font-black uppercase font-space tracking-[0.26em] text-[11px] sm:text-xs md:text-sm"
                  style={{
                    color: "#00F5FF",
                    textShadow: "0 0 12px rgba(0, 245, 255, 0.45)",
                  }}
                >
                  WELCOME TO
                </span>
              </motion.div>

              {/* Official MACFIESTA 2K26 Logo Image */}
              <motion.div
                variants={heroTitleVariants}
                initial="hidden"
                animate="visible"
                className="py-1 flex justify-center lg:justify-start"
              >
                <h1 className="sr-only">MACFIESTA 2K26</h1>
                <img
                  src="/MACFIESTA_page-0001.png?v=2"
                  alt="MACFIESTA 2K26"
                  className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 w-auto max-w-[90vw] sm:max-w-none object-contain select-none pointer-events-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] drop-shadow-[0_0_12px_rgba(0,0,0,0.8)]"
                  loading="eager"
                  draggable={false}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: customEase }}
              >
                <span
                  className="block font-black uppercase"
                  style={{
                    fontFamily: "var(--font-anton), 'Anton', sans-serif",
                    fontSize: "clamp(1.1rem, 2.6vw, 2.3rem)",
                    letterSpacing: "0.18em",
                    color: "#FFD700",
                    textShadow: "0 2px 10px rgba(0, 0, 0, 0.95), 0 0 14px rgba(255, 215, 0, 0.45)",
                    marginTop: "0.12em",
                  }}
                >
                  MARVEL VS DC
                </span>
              </motion.div>
            </div>

            {/* Subtext */}
            <motion.p
              variants={heroSubtextVariants}
              initial="hidden"
              animate="visible"
              className="text-white/95 max-w-lg mx-auto lg:mx-0 font-space text-xs sm:text-sm md:text-base leading-relaxed font-medium pt-0.5 sm:pt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
            >
              &ldquo;Every Hero Has A Mission.&rdquo; — Earth&apos;s premier national collegiate festival at MACFAST. Assemble across{" "}
              <span className="text-arc-cyan font-bold drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">23 high-level missions</span>.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={heroCtaVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-row justify-center lg:justify-start items-center gap-2 sm:gap-3.5 pt-1.5 sm:pt-2 w-full max-w-[340px] sm:max-w-md mx-auto lg:mx-0 relative z-30 pointer-events-auto"
            >
              <div className="flex-1 min-w-0">
                {userLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleNavigate(currentUser?.is_staff || currentUser?.is_superuser ? "/admin" : "/student-dashboard")}
                    className="group font-space flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-2.5 sm:py-3 rounded-full bg-[#00D4FF] hover:bg-[#33ddff] text-black font-black tracking-[0.05em] sm:tracking-[0.14em] uppercase border-0 outline-none shadow-[0_4px_20px_rgba(0,212,255,0.4)] hover:shadow-[0_6px_28px_rgba(0,212,255,0.7)] transition-all duration-300 w-full text-center cursor-pointer relative z-30 pointer-events-auto select-none hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <RiDashboardLine className="text-sm sm:text-base pointer-events-none" />
                    <span className="relative z-10 font-black tracking-[0.05em] sm:tracking-[0.14em] uppercase text-[11px] sm:text-xs md:text-sm whitespace-nowrap pointer-events-none">
                      {currentUser?.is_staff || currentUser?.is_superuser ? "Command Console" : "Dashboard"}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNavigate("/register")}
                    className="group font-space flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-2.5 sm:py-3 rounded-full bg-[#F01A21] hover:bg-[#d8141b] text-white font-bold tracking-[0.05em] sm:tracking-[0.14em] uppercase border-0 outline-none shadow-[0_4px_20px_rgba(240,26,33,0.4)] hover:shadow-[0_6px_28px_rgba(240,26,33,0.65)] transition-all duration-300 w-full text-center cursor-pointer relative z-30 pointer-events-auto select-none hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <span className="relative z-10 font-bold tracking-[0.05em] sm:tracking-[0.14em] uppercase text-[11px] sm:text-xs md:text-sm whitespace-nowrap pointer-events-none">
                      {settings.registrationOpen ? "Register Now" : "Closed"}
                    </span>
                    <RiPlayLine className="group-hover:translate-x-1 transition-transform relative z-10 shrink-0 text-xs sm:text-sm pointer-events-none" />
                  </button>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={handleNavigate("/events")}
                  className="font-space flex items-center justify-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-5 py-2.5 sm:py-3 rounded-full border-2 border-arc-cyan text-[#FFD700] hover:text-[#FFE55C] shadow-[0_0_20px_rgba(0,212,255,0.35)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] transition-all duration-300 w-full text-center cursor-pointer relative z-30 pointer-events-auto select-none hover:scale-[1.04] active:scale-[0.96] overflow-hidden group"
                  style={{
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(0, 212, 255, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%)",
                    boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.3), 0 4px 20px rgba(0, 0, 0, 0.25), 0 0 20px rgba(0, 212, 255, 0.35)",
                  }}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-arc-cyan/20 border border-arc-cyan flex items-center justify-center shrink-0 group-hover:rotate-45 transition-transform duration-300 pointer-events-none shadow-[0_0_8px_rgba(0,212,255,0.4)]">
                    <RiCompass3Line className="text-arc-cyan text-xs sm:text-sm drop-shadow-[0_0_6px_#00D4FF]" />
                  </div>
                  <span className="font-black tracking-[0.06em] sm:tracking-[0.14em] uppercase text-[11px] sm:text-xs md:text-sm whitespace-nowrap pointer-events-none text-[#FFD700] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    VIEW EVENTS
                  </span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Countdown & Music Visualizer — Stark HUD */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative w-full max-w-[340px] sm:max-w-[365px] rounded-2xl p-3 sm:p-4 space-y-2 sm:space-y-2.5 flex flex-col items-center justify-center mx-auto lg:mx-0 overflow-hidden border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.55),0_0_24px_rgba(0,212,255,0.18)] border-glow-flow"
              style={{
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                background: "linear-gradient(135deg, rgba(6, 11, 24, 0.52) 0%, rgba(2, 5, 14, 0.42) 100%)",
                boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.22), inset 0 0 24px rgba(0, 212, 255, 0.08), 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 212, 255, 0.16)",
              }}
            >
              {/* Top Dynamic Marvel vs DC Beam */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-marvel-red via-[#00D4FF] to-marvel-red pointer-events-none z-20" />

              {/* Ambient Energy Glows (Marvel Red top-left, DC/Arc Cyan bottom-right) */}
              <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-marvel-red/15 blur-[40px] pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-28 h-28 rounded-full bg-arc-cyan/15 blur-[40px] pointer-events-none" />

              {/* Corner HUD Markers with Marvel vs DC dual glow */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-marvel-red rounded-tl shadow-[0_0_8px_#ED1D24] z-20 pointer-events-none" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-arc-cyan rounded-tr shadow-[0_0_8px_#00D4FF] z-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-arc-cyan rounded-bl shadow-[0_0_8px_#00D4FF] z-20 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-marvel-red rounded-br shadow-[0_0_8px_#ED1D24] z-20 pointer-events-none" />

              {/* Header: Marvel vs DC Clash Badge & Protocol Title */}
              <div className="w-full text-center space-y-1 relative z-10">
                <div className="flex items-center justify-center gap-1.5 font-orbitron text-[8px] sm:text-[8.5px] font-black uppercase tracking-[0.2em]">
                  <span className="px-2.5 py-0.5 rounded-full bg-marvel-red/30 text-[#FF3B42] border border-marvel-red/60 shadow-[0_0_8px_rgba(237,29,36,0.35)]">
                    MARVEL
                  </span>
                  <span className="text-white/60 text-[7px] font-black">VS</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-arc-cyan/25 text-[#00D4FF] border border-arc-cyan/60 shadow-[0_0_8px_rgba(0,212,255,0.35)]">
                    DC
                  </span>
                </div>

                <h3 className="text-[11px] sm:text-xs font-black text-white tracking-[0.22em] uppercase flex items-center justify-center gap-1.5 font-orbitron">
                  <RiFlashlightLine className="text-arc-cyan shrink-0 drop-shadow-[0_0_8px_#00D4FF]" />
                  <span>MULTIVERSE COUNTDOWN</span>
                </h3>

                <p className="text-[11px] sm:text-xs font-black text-[#FFD700] font-space tracking-widest">
                  {settings.motto}
                </p>
              </div>

              <div className="flex justify-center w-full relative z-10">
                <CountdownTimer />
              </div>

              <div className="w-full relative z-10">
                <AvengersAudioHud />
              </div>
            </motion.div>
          </div>

        </div>
      </motion.div>

      {/* ─── S.H.I.E.L.D. Live Announcement Ticker ─── */}
      <Link
        to="/announcements"
        className="w-full glass py-2.5 border-y border-arc-cyan/30 overflow-hidden z-20 bg-black/35 backdrop-blur-md flex items-center relative shadow-[0_0_25px_rgba(0,212,255,0.15)] cursor-pointer select-none group block no-underline"
      >
        {/* Left Live Badge */}
        <div
          className="shrink-0 z-10 px-3 sm:px-4 py-1 ml-2 sm:ml-4 rounded-full bg-marvel-red/20 border border-marvel-red/60 text-marvel-red hover:text-black group-hover:text-black text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_8px_rgba(237,29,36,0.45)] transition-colors duration-200 font-space cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-marvel-red animate-ping" />
          <RiMegaphoneLine className="text-sm group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">LIVE ANNOUNCEMENTS</span>
          <span className="sm:hidden">ALERTS</span>
        </div>

        {/* Scrolling Announcements Marquee — Infinite Loop */}
        <div className="flex-1 overflow-hidden ml-3">
          <div className="flex w-max animate-ticker whitespace-nowrap text-[11px] sm:text-xs font-black tracking-[0.22em] uppercase font-space group-hover:[animation-play-state:paused]">
            {/* Track 1 */}
            <div className="flex shrink-0 items-center gap-10 pr-10">
              {displayPoints.map((a: any, aIdx: number) => {
                const colors = [
                  "text-metallic-gold",
                  "text-arc-cyan",
                  "text-marvel-red",
                  "text-emerald-400",
                  "text-vibranium-purple",
                  "text-cyan-300",
                  "text-amber-300",
                ];
                const starColors = [
                  "text-metallic-gold",
                  "text-arc-cyan",
                  "text-marvel-red",
                  "text-emerald-400",
                  "text-vibranium-purple",
                  "text-cyan-300",
                  "text-amber-300",
                ];
                const colorClass = colors[aIdx % colors.length];
                const starColor = starColors[(aIdx + 1) % starColors.length];
                return (
                  <span
                    key={`t1-${a.id || aIdx}-${aIdx}`}
                    className={`flex items-center gap-2.5 ${colorClass} transition-colors hover:brightness-125`}
                  >
                    <span className={`${starColor} text-xs drop-shadow-[0_0_8px_currentColor]`}>★</span>
                    <span className="tracking-[0.2em] font-black">{a.title}</span>
                  </span>
                );
              })}
            </div>

            {/* Track 2 (Seamless Duplicate for Continuous Loop) */}
            <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden="true">
              {displayPoints.map((a: any, aIdx: number) => {
                const colors = [
                  "text-metallic-gold",
                  "text-arc-cyan",
                  "text-marvel-red",
                  "text-emerald-400",
                  "text-vibranium-purple",
                  "text-cyan-300",
                  "text-amber-300",
                ];
                const starColors = [
                  "text-metallic-gold",
                  "text-arc-cyan",
                  "text-marvel-red",
                  "text-emerald-400",
                  "text-vibranium-purple",
                  "text-cyan-300",
                  "text-amber-300",
                ];
                const colorClass = colors[aIdx % colors.length];
                const starColor = starColors[(aIdx + 1) % starColors.length];
                return (
                  <span
                    key={`t2-${a.id || aIdx}-${aIdx}`}
                    className={`flex items-center gap-2.5 ${colorClass} transition-colors hover:brightness-125`}
                  >
                    <span className={`${starColor} text-xs drop-shadow-[0_0_8px_currentColor]`}>★</span>
                    <span className="tracking-[0.2em] font-black">{a.title}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </Link>

      {/* ─── Scroll Indicator (hidden on small mobile screens to prevent overlap) ─── */}
      <motion.button
        onClick={scrollToNext}
        className="scroll-indicator hidden lg:flex absolute bottom-20 left-1/2 -translate-x-1/2 z-20"
        aria-label="Scroll to next section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-arc-cyan/60 font-space">SCROLL</span>
        <div className="scroll-indicator-line" />
        <RiArrowDownLine className="text-arc-cyan/60 text-lg animate-bounce" />
      </motion.button>
    </section>
  );
}
