import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useFestivalControl } from "../../lib/festivalStore";
import { RiShieldFlashLine, RiPulseLine, RiFlashlightLine } from "react-icons/ri";

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { settings } = useFestivalControl();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = location.pathname;
  const isAdminPage = pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/desk") || pathname.startsWith("/volunteer");

  if (mounted && settings.maintenanceMode && !isAdminPage) {
    // Synchronized timing for smooth, realistic pendulum web-swinging physics
    const animationDuration = 10;
    const animationTimes = [0, 0.25, 0.5, 0.75, 1];

    return (
      <div className="fixed inset-0 z-[9999] bg-[#05050A] text-white flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden font-mono">
        {/* Background Marvel Video Layer */}
        <div className="absolute inset-0 z-0 opacity-95 pointer-events-none overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            className="w-full h-full object-cover object-center"
            style={{ transform: "translate3d(0,0,0)", willChange: "transform" }}
          >
            <source src={encodeURI("/MARVEL/Video Project 4.mp4")} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/40 to-[#05050A]/60 z-[1]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(5,5,10,0.85)_90%)] z-[1]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] rounded-full bg-marvel-red/20 blur-[160px] z-[1]" />
        </div>

        {/* Main Maintenance Card Container */}
        <div className="relative z-10 max-w-xl w-full">

          {/* REALISTIC SVG WEB LINES LAYER - Synchronized with Spider-Man's wrist */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-visible">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="-350 -350 700 700"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
              <defs>
                {/* Neon Web Glow Filter */}
                <filter id="web-glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="web-glow-red" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Radial Gradient for Web Impact Nodes */}
                <radialGradient id="web-node-glow">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity="1" />
                  <stop offset="60%" stopColor="#ED1D24" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* 1. PRIMARY SWINGING WEB ROPE (High Anchor Point to Spider-Man) */}
              {/* Outer Glow Rope */}
              <motion.path
                animate={{
                  d: [
                    "M -150 -600 Q -230 -380 -270 -160",
                    "M 0 -600 Q 0 -360 0 -110",
                    "M 150 -600 Q 230 -380 270 -160",
                    "M 0 -600 Q 0 -410 0 -210",
                    "M -150 -600 Q -230 -380 -270 -160",
                  ],
                }}
                transition={{
                  duration: animationDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: animationTimes,
                }}
                stroke="#FFFFFF"
                strokeWidth="2.5"
                fill="none"
                filter="url(#web-glow-cyan)"
                strokeDasharray="8 2"
                className="opacity-90"
              />

              {/* Inner Core Tension Web */}
              <motion.path
                animate={{
                  d: [
                    "M -150 -600 Q -230 -380 -270 -160",
                    "M 0 -600 Q 0 -360 0 -110",
                    "M 150 -600 Q 230 -380 270 -160",
                    "M 0 -600 Q 0 -410 0 -210",
                    "M -150 -600 Q -230 -380 -270 -160",
                  ],
                }}
                transition={{
                  duration: animationDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: animationTimes,
                }}
                stroke="#00D4FF"
                strokeWidth="1.4"
                fill="none"
                filter="url(#web-glow-cyan)"
              />

              {/* 2. DYNAMIC WEB SHOOTER STRAND (Shoots out to Card Corner Anchor Points) */}
              <motion.path
                animate={{
                  d: [
                    "M -270 -160 Q -255 -185 -240 -210", // Latched to Top-Left corner
                    "M 0 -110 Q 0 -145 0 -180",         // Latched to Badge center
                    "M 270 -160 Q 255 -185 240 -210",   // Latched to Top-Right corner
                    "M 0 -210 Q -120 -210 -240 -210",   // Cross web shot to Left
                    "M -270 -160 Q -255 -185 -240 -210",
                  ],
                  opacity: [1, 0.6, 1, 0.8, 1],
                }}
                transition={{
                  duration: animationDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: animationTimes,
                }}
                stroke="#00D4FF"
                strokeWidth="2"
                fill="none"
                filter="url(#web-glow-cyan)"
              />

              {/* 3. SECONDARY CROSS TENSILE WEB (Red Accent Web Line) */}
              <motion.path
                animate={{
                  d: [
                    "M -270 -160 Q -150 -130 0 -180",
                    "M 0 -110 Q 120 -150 240 -210",
                    "M 270 -160 Q 150 -130 0 -180",
                    "M 0 -210 Q 120 -210 240 -210",
                    "M -270 -160 Q -150 -130 0 -180",
                  ],
                  opacity: [0.8, 0.9, 0.8, 0.95, 0.8],
                }}
                transition={{
                  duration: animationDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: animationTimes,
                }}
                stroke="#ED1D24"
                strokeWidth="1.6"
                fill="none"
                filter="url(#web-glow-red)"
                strokeDasharray="4 2"
              />

              {/* DYNAMIC WEB IMPACT GLOW NODES */}
              {/* Top-Left Corner Anchor Node */}
              <motion.circle
                cx="-240"
                cy="-210"
                r="7"
                fill="url(#web-node-glow)"
                animate={{
                  scale: [1.8, 0.8, 0.8, 1.6, 1.8],
                  opacity: [1, 0.3, 0.3, 0.9, 1],
                }}
                transition={{
                  duration: animationDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: animationTimes,
                }}
              />
              {/* Top-Right Corner Anchor Node */}
              <motion.circle
                cx="240"
                cy="-210"
                r="7"
                fill="url(#web-node-glow)"
                animate={{
                  scale: [0.8, 0.8, 1.8, 1.2, 0.8],
                  opacity: [0.3, 0.3, 1, 0.8, 0.3],
                }}
                transition={{
                  duration: animationDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: animationTimes,
                }}
              />
            </svg>
          </div>

          {/* SPIDER-MAN CHARACTER WITH REALISTIC PENDULUM SWING & NATURAL PHYSICS */}
          <motion.div
            animate={{
              x: [-270, 0, 270, 0, -270],
              y: [-160, -110, -160, -210, -160],
              rotate: [-22, 0, 22, -5, -22],
              scale: [1.05, 1.2, 1.05, 1.15, 1.05],
            }}
            transition={{
              duration: animationDuration,
              repeat: Infinity,
              ease: "easeInOut",
              times: animationTimes,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-56 md:h-56 z-30 pointer-events-none drop-shadow-[0_0_40px_#ED1D24]"
          >
            {/* Spider-Man Character Image with Realistic Glow */}
            <div className="relative w-full h-full">
              <img
                src="/MARVEL/Spider-man.png"
                alt="Spider-Man Web Swing Animation"
                className="w-full h-full object-contain filter brightness-125 contrast-125 drop-shadow-[0_0_30px_rgba(255,0,51,0.95)]"
              />

              {/* Wrist Web Shooter Light Pulse */}
              <motion.div
                animate={{
                  opacity: [0.9, 0.4, 0.9, 0.5, 0.9],
                  scale: [1.3, 0.9, 1.3, 1.0, 1.3],
                }}
                transition={{
                  duration: animationDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: animationTimes,
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-arc-cyan/60 blur-md pointer-events-none"
              />
            </div>
          </motion.div>

          {/* Maintenance Card Content */}
          <div className="relative z-10 space-y-6 flex flex-col items-center bg-black/85 backdrop-blur-xl border border-marvel-red/40 p-8 sm:p-10 rounded-3xl shadow-[0_0_70px_rgba(237,29,36,0.35)] overflow-hidden">

            {/* DECORATIVE CORNER SPIDER WEBS ON CARD */}
            <svg className="absolute -top-2 -left-2 w-28 h-28 pointer-events-none opacity-35 text-marvel-red" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M 0 0 L 100 0 M 0 0 L 0 100 M 0 0 L 80 80" />
              <path d="M 20 0 Q 20 20 0 20" />
              <path d="M 40 0 Q 40 40 0 40" />
              <path d="M 60 0 Q 60 60 0 60" />
              <path d="M 80 0 Q 80 80 0 80" />
            </svg>
            <svg className="absolute -top-2 -right-2 w-28 h-28 pointer-events-none opacity-35 text-arc-cyan" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M 100 0 L 0 0 M 100 0 L 100 100 M 100 0 L 20 80" />
              <path d="M 80 0 Q 80 20 100 20" />
              <path d="M 60 0 Q 60 40 100 40" />
              <path d="M 40 0 Q 40 60 100 60" />
              <path d="M 20 0 Q 20 80 100 80" />
            </svg>
            <svg className="absolute -bottom-2 -left-2 w-28 h-28 pointer-events-none opacity-35 text-arc-cyan" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M 0 100 L 100 100 M 0 100 L 0 0 M 0 100 L 80 20" />
              <path d="M 20 100 Q 20 80 0 80" />
              <path d="M 40 100 Q 40 60 0 60" />
              <path d="M 60 100 Q 60 40 0 40" />
              <path d="M 80 100 Q 80 20 0 20" />
            </svg>
            <svg className="absolute -bottom-2 -right-2 w-28 h-28 pointer-events-none opacity-35 text-marvel-red" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M 100 100 L 0 100 M 100 100 L 100 0 M 100 100 L 20 20" />
              <path d="M 80 100 Q 80 80 100 80" />
              <path d="M 60 100 Q 60 60 100 60" />
              <path d="M 40 100 Q 40 40 100 40" />
              <path d="M 20 100 Q 20 20 100 20" />
            </svg>

            {/* S.H.I.E.L.D. Spider-Tech Badge */}
            <div className="relative mt-4">
              <div className="w-20 h-20 rounded-full bg-marvel-red/15 border-2 border-marvel-red flex items-center justify-center text-marvel-red shadow-[0_0_30px_#ED1D24] animate-pulse">
                <RiShieldFlashLine size={40} className="animate-spin-slow text-arc-cyan drop-shadow-[0_0_15px_#00D4FF]" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-arc-cyan opacity-75" />
                <span className="relative inline-flex rounded-full h-5 w-5 bg-arc-cyan shadow-[0_0_10px_#00D4FF]" />
              </span>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-arc-cyan/40 bg-arc-cyan/15 text-arc-cyan text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                <RiPulseLine className="animate-pulse" />
                <span>SPIDER-SENSE PROTOCOL • MAINTENANCE MODE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                <span className="marvel-bang-comic-gradient glitch-text block">
                  {settings.name.toUpperCase()} {settings.edition.toUpperCase()}
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-white/90 font-mono font-medium leading-relaxed max-w-md mx-auto drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                Spider-Man and the S.H.I.E.L.D. web-tech team are performing quantum updates on the festival grid. Mission Control will be restored online shortly.
              </p>
            </div>

            {/* Live Progress Bar & Status Monitor */}
            <div className="p-5 rounded-2xl bg-black/70 border border-white/15 text-left w-full space-y-3 text-xs backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              <div className="flex justify-between items-center text-white/80 font-bold tracking-wider uppercase">
                <span className="flex items-center gap-1.5 text-arc-cyan">
                  <RiFlashlightLine className="animate-pulse" /> WEB-NET SYNCHRONIZING
                </span>
                <span className="text-marvel-red font-black tracking-widest animate-pulse">
                  92% COMPLETE
                </span>
              </div>

              {/* Animated Loading Bar */}
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  initial={{ width: "10%" }}
                  animate={{ width: ["15%", "92%", "40%", "92%"] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-gradient-to-r from-arc-cyan via-marvel-red to-metallic-gold h-full rounded-full shadow-[0_0_12px_#ED1D24]"
                />
              </div>

              <div className="flex justify-between items-center text-white/70 font-medium text-[11px]">
                <span>LOCATION HEADQUARTERS</span>
                <span className="text-white font-bold">MACFAST CAMPUS, TIRUVALLA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

