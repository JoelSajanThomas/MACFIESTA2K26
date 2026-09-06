import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RiCompass3Line, RiHomeLine, RiCalendarLine, RiRadarLine } from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";

export default function NotFound() {
  usePageSeo({
    title: "404 - Coordinates Lost | MacFiesta 2026",
    description: "The requested mission coordinates could not be found in the multiverse.",
  });

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center px-4 py-16 relative overflow-hidden font-space select-none">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/download (6).jpg"
          alt="Marvel Comic Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/30 to-[#05050A]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>
      {/* Dynamic Multiverse Ambient Glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-marvel-red/20 blur-[130px] pointer-events-none z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-arc-cyan/20 blur-[130px] pointer-events-none z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 max-w-lg w-full rounded-2xl border border-white/20 bg-[#0A0D18]/90 backdrop-blur-xl p-8 sm:p-10 text-center shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(0,212,255,0.15)] space-y-6"
      >
        {/* Holographic 404 Display */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-arc-cyan/40 bg-arc-cyan/10 text-arc-cyan text-xs font-bold tracking-[0.2em] uppercase">
            <RiRadarLine className="animate-spin text-sm" />
            <span>QUANTUM RADAR: NO TARGET</span>
          </div>

          <h1 className="text-7xl sm:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 font-orbitron drop-shadow-[0_0_20px_rgba(0,212,255,0.3)]">
            404
          </h1>
        </div>

        {/* Subtitle & Explanatory Text */}
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-[#ED1D24] font-orbitron">
            COORDINATES LOST IN MULTIVERSE
          </h2>
          <p className="text-xs sm:text-sm text-white/70 max-w-sm mx-auto leading-relaxed">
            The mission page or resource you requested has shifted into another timeline or does not exist.
          </p>
        </div>

        {/* Tactical Navigation Links */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-arc-cyan hover:bg-[#33ddff] text-black font-black uppercase text-xs tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,212,255,0.4)] no-underline"
          >
            <RiHomeLine className="text-base" />
            <span>Headquarters</span>
          </Link>
          <Link
            to="/events"
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[#FFD700] hover:text-[#FFE55C] font-bold uppercase text-xs tracking-wider transition-all duration-200 flex items-center justify-center gap-2 no-underline"
          >
            <RiCompass3Line className="text-base" />
            <span>All Missions</span>
          </Link>
          <Link
            to="/schedule"
            className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white font-bold uppercase text-xs tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 no-underline"
          >
            <RiCalendarLine className="text-sm" />
            <span>Timeline</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
