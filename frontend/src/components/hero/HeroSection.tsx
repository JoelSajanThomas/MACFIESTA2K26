import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { CountdownTimer } from "./CountdownTimer";
import { MusicVisualizer } from "./MusicVisualizer";
import {
  RiPlayLine,
  RiShieldFlashLine,
  RiFlashlightLine,
  RiCompass3Line,
  RiArrowDownLine,
  RiPlayFill,
  RiPauseFill,
  RiVolumeUpFill,
  RiVolumeMuteFill,
  RiMegaphoneLine,
  RiDashboardLine,
} from "react-icons/ri";
import { useFestivalControl } from "@/lib/festivalStore";
import { getAnnouncements, isLoggedIn, getCurrentUser } from "../../services/api";
import { AUTH_CHANGE_EVENT } from "../../utils/auth";
import { ANNOUNCEMENT_PLACEHOLDERS } from "../../utils/constants";
import { isLowEndDevice } from "../../utils/deviceCapabilities";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(() => isLoggedIn());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>(ANNOUNCEMENT_PLACEHOLDERS);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const removeFallbackListenersRef = useRef<(() => void) | null>(null);

  const isPlayingRef = useRef(false);
  const userMutedRef = useRef(false);
  const maxVolume = 0.4;

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

  const setPlayState = (val: boolean) => {
    setIsPlaying(val);
    isPlayingRef.current = val;
  };

  const getOrCreateAudio = () => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio(encodeURI("/ULTRA NATÉ - Movin To The Sun.mp3"));
    audio.loop = true;
    audio.volume = maxVolume;
    audioRef.current = audio;
    return audio;
  };

  useEffect(() => {
    // Only initialize if on homepage
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      return;
    }

    // On mobile or low-end devices: skip automatic audio download entirely
    if (isLowEndDevice()) {
      return;
    }

    let fadeRaf: number;
    let isDisposed = false;

    const stopAudio = () => {
      isDisposed = true;
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.src = "";
          audioRef.current.load();
        } catch { }
        audioRef.current = null;
      }
      setPlayState(false);
    };

    const updateVolumeOnScroll = () => {
      if (!audioRef.current || userMutedRef.current || isDisposed) return;
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        stopAudio();
        return;
      }

      const fadeDistance = Math.max(320, window.innerHeight * 0.65);
      const scrollY = window.scrollY;
      const factor = Math.max(0, Math.min(1, 1 - scrollY / fadeDistance));
      const targetVol = maxVolume * factor;

      audioRef.current.volume = Math.max(0, Math.min(maxVolume, targetVol));

      if (factor <= 0.02) {
        if (!audioRef.current.paused) {
          audioRef.current.pause();
          setPlayState(false);
        }
      } else {
        if (audioRef.current.paused && !userMutedRef.current && !isDisposed) {
          audioRef.current.play().then(() => {
            if (!isDisposed && window.location.pathname === "/") {
              setPlayState(true);
            } else if (audioRef.current) {
              audioRef.current.pause();
            }
          }).catch(() => { });
        } else if (!audioRef.current.paused && !isPlayingRef.current) {
          setPlayState(true);
        }
      }
    };

    const handleScroll = () => {
      cancelAnimationFrame(fadeRaf);
      fadeRaf = requestAnimationFrame(updateVolumeOnScroll);
    };

    const removeFallbackListeners = () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      removeFallbackListenersRef.current = null;
    };

    const handleInteraction = () => {
      removeFallbackListeners();
      if (userMutedRef.current || isDisposed) return;
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        stopAudio();
        return;
      }

      const audio = getOrCreateAudio();
      audio.play().then(() => {
        if (!isDisposed && window.location.pathname === "/") {
          setPlayState(true);
          updateVolumeOnScroll();
        } else {
          audio.pause();
        }
      }).catch(() => { });
    };

    removeFallbackListenersRef.current = removeFallbackListeners;

    const startPlayback = () => {
      if (userMutedRef.current || isDisposed) return;
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        stopAudio();
        return;
      }

      const audio = getOrCreateAudio();
      audio.play().then(() => {
        if (!isDisposed && window.location.pathname === "/") {
          setPlayState(true);
          updateVolumeOnScroll();
        } else {
          audio.pause();
        }
      }).catch(() => {
        window.addEventListener("click", handleInteraction);
        window.addEventListener("keydown", handleInteraction);
        window.addEventListener("touchstart", handleInteraction);
      });
    };

    const onGlobalStop = () => {
      stopAudio();
    };
    window.addEventListener("macfiesta:stop-hero-audio", onGlobalStop);

    // Graceful delay for high-end desktop to not block initial paint
    const mountDelay = setTimeout(() => {
      if (!isDisposed && window.location.pathname === "/") {
        startPlayback();
      }
    }, 1500);

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      isDisposed = true;
      clearTimeout(mountDelay);
      cancelAnimationFrame(fadeRaf);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("macfiesta:stop-hero-audio", onGlobalStop);
      if (removeFallbackListenersRef.current) {
        removeFallbackListenersRef.current();
      }
      stopAudio();
    };
  }, []);

  const togglePlay = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation?.();
    if (removeFallbackListenersRef.current) {
      removeFallbackListenersRef.current();
    }

    const audio = getOrCreateAudio();

    if (isPlaying) {
      audio.pause();
      setPlayState(false);
      userMutedRef.current = true;
    } else {
      userMutedRef.current = false;
      const fadeDistance = Math.max(320, window.innerHeight * 0.65);
      const factor = Math.max(0, Math.min(1, 1 - window.scrollY / fadeDistance));
      audio.volume = maxVolume * Math.max(0.1, factor);
      audio.play().then(() => {
        setPlayState(true);
      }).catch(() => {
        setPlayState(false);
      });
    }
  };

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
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 rounded-full border border-marvel-red/40 bg-marvel-red/10 text-marvel-red text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-[0.2em] uppercase shadow-[0_0_18px_rgba(237,29,36,0.35)] font-space"
            >
              <RiShieldFlashLine className="animate-pulse text-xs sm:text-sm" />
              <span>AVENGERS HEADQUARTERS • {settings.edition}</span>
            </motion.div>

            {/* Main Title Block */}
            <div className="space-y-0.5 sm:space-y-1 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: customEase }}
              >
                <span
                  className="block text-arc-cyan font-bold uppercase font-space tracking-[0.22em] text-[10px] sm:text-xs md:text-sm"
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
              className="text-white/80 max-w-lg mx-auto lg:mx-0 font-space text-xs sm:text-sm md:text-base leading-relaxed font-normal pt-0.5 sm:pt-1"
            >
              &ldquo;Every Hero Has A Mission.&rdquo; — Earth&apos;s premier national collegiate festival at MACFAST. Assemble across{" "}
              <span className="text-arc-cyan font-bold">23 high-level missions</span>.
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
                  className="btn-outline border-arc-cyan text-white hover:bg-arc-cyan/20 font-space flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-2.5 sm:py-3 rounded-full shadow-[0_0_20px_rgba(0,212,255,0.25)] hover:shadow-[0_0_35px_rgba(0,212,255,0.6)] transition-all duration-300 w-full text-center cursor-pointer relative z-30 pointer-events-auto select-none hover:scale-[1.04] active:scale-[0.96]"
                >
                  <RiCompass3Line className="text-arc-cyan text-xs sm:text-base shrink-0 pointer-events-none" />
                  <span className="font-bold tracking-[0.05em] sm:tracking-[0.14em] uppercase text-[11px] sm:text-xs md:text-sm whitespace-nowrap pointer-events-none">View Events</span>
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
              className="stark-panel p-3.5 sm:p-5 rounded-2xl w-full max-w-[320px] sm:max-w-[350px] space-y-2.5 sm:space-y-3.5 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_20px_rgba(0,212,255,0.15)] relative border-glow-flow mx-auto lg:mx-0"
            >
              {/* Corner HUD Markers */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-arc-cyan/70 rounded-tl" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-arc-cyan/70 rounded-tr" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-marvel-red/70 rounded-bl" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-marvel-red/70 rounded-br" />

              <div className="w-full text-center space-y-0.5">
                <h3
                  className="text-[10px] sm:text-xs font-bold text-arc-cyan tracking-[0.2em] sm:tracking-[0.25em] uppercase flex items-center justify-center gap-1.5 font-orbitron"
                >
                  <RiFlashlightLine className="shrink-0" /> S.H.I.E.L.D. COUNTDOWN
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold text-metallic-gold font-space">
                  {settings.motto}
                </p>
              </div>

              <div className="flex justify-center w-full">
                <CountdownTimer />
              </div>

              <button
                type="button"
                onClick={togglePlay}
                className="w-full pt-2 sm:pt-3 border-t border-white/10 flex items-center justify-between gap-2 group cursor-pointer text-left focus:outline-none select-none rounded-b-xl hover:bg-white/[0.03] transition-colors -mx-1 px-1"
                aria-label={isPlaying ? "Pause theme music" : "Play theme music"}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-all duration-300 shadow-lg flex items-center justify-center shrink-0 ${isPlaying
                        ? "bg-marvel-red border-marvel-red text-white shadow-[0_0_15px_#ED1D24] group-hover:scale-110"
                        : "bg-white/10 border-white/20 text-arc-cyan hover:border-arc-cyan group-hover:scale-110"
                      }`}
                  >
                    {isPlaying ? (
                      <RiPauseFill className="text-sm sm:text-base text-white drop-shadow-[0_0_6px_#FFFFFF]" />
                    ) : (
                      <RiPlayFill className="text-sm sm:text-base text-arc-cyan ml-0.5 drop-shadow-[0_0_6px_#00D4FF]" />
                    )}
                  </div>
                  <div className="text-left font-space">
                    <p className="text-[8px] sm:text-[9px] text-white/45 tracking-widest uppercase flex items-center gap-1">
                      {isPlaying ? <RiVolumeUpFill className="text-arc-cyan text-xs shrink-0" /> : <RiVolumeMuteFill className="text-white/40 text-xs shrink-0" />}
                      <span>AVENGERS AUDIO HUD</span>
                    </p>
                    <p
                      className={`text-[10px] sm:text-xs font-bold transition-colors duration-300 font-excon-bold flex items-center gap-1.5 ${isPlaying ? "text-arc-cyan animate-pulse" : "text-white/45"
                        }`}
                    >
                      {isPlaying ? "BEATS ONLINE • TAP TO PAUSE" : "AUDIO MUTED • TAP TO PLAY"}
                    </p>
                  </div>
                </div>
                <MusicVisualizer isPlaying={isPlaying} />
              </button>
            </motion.div>
          </div>

        </div>
      </motion.div>

      {/* ─── S.H.I.E.L.D. Live Announcement Ticker ─── */}
      <Link
        to="/announcements"
        className="w-full glass py-2.5 border-y border-arc-cyan/30 overflow-hidden z-20 bg-black/80 backdrop-blur-md flex items-center relative shadow-[0_0_25px_rgba(0,212,255,0.15)] cursor-pointer select-none group block no-underline"
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
