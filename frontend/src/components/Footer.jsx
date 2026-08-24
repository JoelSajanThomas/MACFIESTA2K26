import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiInstagramFill,
  RiYoutubeFill,
  RiLinkedinBoxFill,
  RiTwitterXFill,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiArrowUpLine,
  RiShieldFlashLine,
  RiFlashlightLine,
  RiDownloadLine,
  RiSwordLine,
  RiRadio2Line,
  RiCheckDoubleLine,
  RiLockLine,
} from "react-icons/ri";
import { useFestivalControl } from "../lib/festivalStore";
import { getCurrentUser, isLoggedIn } from "../services/api";
import { AUTH_CHANGE_EVENT } from "../utils/auth";

const LIVE_FEEDS = [
  "PORTAL CO-ORDINATES: 9.3835° N, 76.5741° E (MACFAST CAMPUS)",
  "STATUS: 23 ARENA MISSIONS INITIALIZED & READY",
  "PRIZE BOUNTY: ₹1,50,000+ ACROSS COLLEGE & SCHOOL MISSIONS",
  "S.H.I.E.L.D. PROTOCOL: LEVEL 10 SECURITY ACTIVE",
  "REGISTRATION DESK: SATELLITE ENCRYPTION LIVE",
];

const SOCIAL_LINKS = [
  { platform: "instagram", label: "Instagram", url: "https://instagram.com/macfiesta2k26", icon: RiInstagramFill },
  { platform: "youtube", label: "YouTube", url: "https://youtube.com/@macfiesta", icon: RiYoutubeFill },
  { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/school/macfast", icon: RiLinkedinBoxFill },
  { platform: "twitter", label: "Twitter", url: "https://twitter.com/macfiesta", icon: RiTwitterXFill },
];

/**
 * Web Audio FX Synthesizer for Marvel & DC click effects
 */
function playSfx(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "marvel") {
      // Repulsor blast chord
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      // High-tech DC bat-signal chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Audio context may be blocked by browser autoplay policy until interaction
  }
}

export default function Footer() {
  const { settings } = useFestivalControl();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [currentUser, setCurrentUser] = useState(null);

  // Marvel vs DC Clean Single-Vote State Starting from 0
  const [marvelVotes, setMarvelVotes] = useState(() => {
    const saved = localStorage.getItem("mf_poll_marvel_v5");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [dcVotes, setDcVotes] = useState(() => {
    const saved = localStorage.getItem("mf_poll_dc_v5");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [userVoted, setUserVoted] = useState(() => {
    return localStorage.getItem("mf_poll_voted_v5") || null;
  });
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Rotating Live Telemetry Feed
  const [feedIndex, setFeedIndex] = useState(0);

  useEffect(() => {
    function checkUser() {
      if (!isLoggedIn()) {
        setCurrentUser(null);
        return;
      }
      getCurrentUser()
        .then((res) => {
          setCurrentUser(res.data);
          const userKey = res.data?.email || res.data?.id;
          if (userKey) {
            const savedUserVote = localStorage.getItem(`mf_user_vote_v5_${userKey}`);
            if (savedUserVote) {
              setUserVoted(savedUserVote);
            }
          }
        })
        .catch(() => setCurrentUser(null));
    }
    checkUser();
    window.addEventListener(AUTH_CHANGE_EVENT, checkUser);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, checkUser);
  }, []);

  useEffect(() => {
    // Thoroughly purge all past legacy vote data from localStorage
    try {
      ["mf_marvel_votes", "mf_dc_votes", "mf_user_allegiance", "mf_poll_marvel_v3", "mf_poll_dc_v3", "mf_poll_voted_v3", "mf_poll_marvel_v4", "mf_poll_dc_v4", "mf_poll_voted_v4"].forEach((k) => {
        localStorage.removeItem(k);
      });
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("mf_user_vote_") && !k.startsWith("mf_user_vote_v5_")) {
          localStorage.removeItem(k);
        }
      });
    } catch {
      // Ignore localStorage errors
    }

    const interval = setInterval(() => {
      setFeedIndex((prev) => (prev + 1) % LIVE_FEEDS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/volunteer") ||
    pathname?.startsWith("/volunteers") ||
    pathname?.startsWith("/judge") ||
    pathname?.startsWith("/judges")
  ) {
    return null;
  }

  const handleVote = (side) => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      setFeedbackToast("🔒 AUTHENTICATION REQUIRED • REDIRECTING TO LOGIN...");
      setTimeout(() => {
        navigate("/login");
      }, 1400);
      return;
    }

    const userKey = currentUser?.email || currentUser?.id || "authenticated_agent";
    const userVoteRecord = localStorage.getItem(`mf_user_vote_v5_${userKey}`) || userVoted;

    // Strictly only 1 vote allowed per user account
    if (userVoteRecord) {
      setFeedbackToast("⚠️ VOTE LOCKED: ALLEGIANCE ALREADY RECORDED!");
      setTimeout(() => setFeedbackToast(null), 2500);
      return;
    }

    playSfx(side);

    if (side === "marvel") {
      const nextMarvel = marvelVotes + 1;
      setMarvelVotes(nextMarvel);
      localStorage.setItem("mf_poll_marvel_v5", nextMarvel.toString());
      localStorage.setItem(`mf_user_vote_v5_${userKey}`, "marvel");
      localStorage.setItem("mf_poll_voted_v5", "marvel");
      setUserVoted("marvel");
      setFeedbackToast("⚡ MARVELVERSE ALLEGIANCE RECORDED! (+1)");
    } else {
      const nextDc = dcVotes + 1;
      setDcVotes(nextDc);
      localStorage.setItem("mf_poll_dc_v5", nextDc.toString());
      localStorage.setItem(`mf_user_vote_v5_${userKey}`, "dc");
      localStorage.setItem("mf_poll_voted_v5", "dc");
      setUserVoted("dc");
      setFeedbackToast("🦇 JUSTICE LEAGUE ALLEGIANCE RECORDED! (+1)");
    }

    setTimeout(() => {
      setFeedbackToast(null);
    }, 3200);
  };

  const handleNextFeed = () => {
    setFeedIndex((prev) => (prev + 1) % LIVE_FEEDS.length);
  };

  const totalVotes = marvelVotes + dcVotes;
  const marvelPct = totalVotes === 0 ? 50 : Math.round((marvelVotes / totalVotes) * 100);
  const dcPct = totalVotes === 0 ? 50 : 100 - marvelPct;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className="relative bg-gradient-to-b from-[#05050A] via-[#080B16] to-[#020205] border-t border-arc-cyan/20 overflow-hidden z-10 text-white font-space"
      role="contentinfo"
      aria-label="Main Footer"
    >
      {/* Background Energy Glows */}
      <div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-marvel-red/10 blur-[110px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-10 w-[300px] h-[300px] rounded-full bg-arc-cyan/10 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Animated Laser Beam */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-marvel-red via-arc-cyan to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* ─── LIVE WORKING SECTION: MARVEL VS DC MULTIVERSE HYPE TERMINAL ─── */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/15 backdrop-blur-xl relative overflow-hidden shadow-[0_0_35px_rgba(0,0,0,0.8)]">
          
          {/* Cyber Grid Accent */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 relative z-10">
            
            {/* Left: Terminal Telemetry Stream (Clickable to Cycle & Shows Vote) */}
            <div
              onClick={handleNextFeed}
              className="flex items-center gap-3 w-full lg:w-auto cursor-pointer group flex-1 min-w-0"
              title="Click to cycle next telemetry alert"
            >
              <div className={`p-2.5 rounded-xl border shrink-0 transition-all ${
                userVoted === "marvel"
                  ? "bg-marvel-red/20 border-marvel-red text-marvel-red shadow-[0_0_15px_rgba(237,29,36,0.4)]"
                  : userVoted === "dc"
                  ? "bg-arc-cyan/20 border-arc-cyan text-arc-cyan shadow-[0_0_15px_rgba(0,212,255,0.4)]"
                  : "bg-arc-cyan/10 border-arc-cyan/40 text-arc-cyan shadow-[0_0_12px_rgba(0,212,255,0.25)]"
              }`}>
                <RiRadio2Line size={20} className="animate-pulse" />
              </div>
              <div className="text-left overflow-hidden w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`w-2 h-2 rounded-full animate-ping ${userVoted === "marvel" ? "bg-marvel-red" : "bg-arc-cyan"}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] font-orbitron text-arc-cyan">
                    QUANTUM TELEMETRY FEED
                  </span>
                  {userVoted && (
                    <span className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      userVoted === "marvel"
                        ? "bg-marvel-red/30 text-marvel-red border border-marvel-red/60"
                        : "bg-arc-cyan/30 text-arc-cyan border border-arc-cyan/60"
                    }`}>
                      YOUR VOTE: {userVoted.toUpperCase()} RECORDED
                    </span>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={userVoted ? `${userVoted}-${feedIndex}` : feedIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs sm:text-sm font-bold text-white tracking-wide truncate mt-0.5"
                    style={{ textShadow: "0 0 12px rgba(255,255,255,0.4)" }}
                  >
                    {feedIndex === 0 && userVoted
                      ? userVoted === "marvel"
                        ? "⚡ VOTE CONFIRMED: YOU ASSEMBLED WITH MARVELVERSE!"
                        : "🦇 VOTE CONFIRMED: YOU UNITED WITH JUSTICE LEAGUE!"
                      : LIVE_FEEDS[feedIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Live Interactive Marvel vs DC Hype Battle Bar */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-4 min-w-[320px] sm:min-w-[460px]">
              <div className="w-full space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold tracking-wider uppercase font-anton">
                  <span className={`flex items-center gap-1 ${userVoted === "marvel" ? "text-[#ff2b32] font-black scale-105" : "text-marvel-red"}`}>
                    <RiSwordLine className="text-xs" /> MARVEL ({marvelPct}%)
                    {userVoted === "marvel" && <span className="text-[10px] text-metallic-gold ml-1 font-space font-bold">• YOUR VOTE ✓</span>}
                  </span>
                  <span className={`flex items-center gap-1 ${userVoted === "dc" ? "text-[#1ae0ff] font-black scale-105" : "text-arc-cyan"}`}>
                    {userVoted === "dc" && <span className="text-[10px] text-metallic-gold mr-1 font-space font-bold">YOUR VOTE ✓ •</span>}
                    DC ({dcPct}%) <RiSwordLine className="text-xs" />
                  </span>
                </div>

                {/* Dual Split Animated Battle Power Bar */}
                <div className="w-full h-3 rounded-full bg-black/60 overflow-hidden flex p-0.5 border border-white/20 shadow-inner">
                  <motion.div
                    className="h-full rounded-l-full bg-gradient-to-r from-[#FF0022] to-[#ED1D24] shadow-[0_0_14px_#ED1D24]"
                    initial={false}
                    animate={{ width: `${marvelPct}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  />
                  <motion.div
                    className="h-full rounded-r-full bg-gradient-to-r from-[#00D4FF] to-[#0088FF] shadow-[0_0_14px_#00D4FF]"
                    initial={false}
                    animate={{ width: `${dcPct}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  />
                </div>
              </div>

              {/* Single-Vote Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <motion.button
                  whileHover={!userVoted ? { scale: 1.06 } : {}}
                  whileTap={!userVoted ? { scale: 0.94 } : {}}
                  type="button"
                  onClick={() => handleVote("marvel")}
                  disabled={!!userVoted}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    userVoted === "marvel"
                      ? "bg-marvel-red text-white shadow-[0_0_20px_#ED1D24] border border-white/40 ring-2 ring-marvel-red/80 cursor-default"
                      : userVoted === "dc"
                      ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed opacity-50"
                      : !isLoggedIn()
                      ? "bg-marvel-red/15 text-marvel-red hover:bg-marvel-red hover:text-white border border-marvel-red/40 hover:shadow-[0_0_14px_#ED1D24] cursor-pointer"
                      : "bg-marvel-red/20 text-marvel-red hover:bg-marvel-red hover:text-white border border-marvel-red/50 hover:shadow-[0_0_14px_#ED1D24] cursor-pointer"
                  }`}
                  title={userVoted ? "Your vote is recorded" : !isLoggedIn() ? "Login required to cast your vote for Marvel" : "Vote for Marvelverse (1 Vote Limit)"}
                >
                  {userVoted === "marvel" ? (
                    <RiCheckDoubleLine className="text-xs" />
                  ) : !isLoggedIn() ? (
                    <RiLockLine className="text-[10px] opacity-70" />
                  ) : null}
                  <span>{userVoted === "marvel" ? "ASSEMBLED ✓" : "Assemble"}</span>
                </motion.button>

                <motion.button
                  whileHover={!userVoted ? { scale: 1.06 } : {}}
                  whileTap={!userVoted ? { scale: 0.94 } : {}}
                  type="button"
                  onClick={() => handleVote("dc")}
                  disabled={!!userVoted}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    userVoted === "dc"
                      ? "bg-arc-cyan text-black shadow-[0_0_20px_#00D4FF] border border-white/40 ring-2 ring-arc-cyan/80 cursor-default"
                      : userVoted === "marvel"
                      ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed opacity-50"
                      : !isLoggedIn()
                      ? "bg-arc-cyan/15 text-arc-cyan hover:bg-arc-cyan hover:text-black border border-arc-cyan/40 hover:shadow-[0_0_14px_#00D4FF] cursor-pointer"
                      : "bg-arc-cyan/20 text-arc-cyan hover:bg-arc-cyan hover:text-black border border-arc-cyan/50 hover:shadow-[0_0_14px_#00D4FF] cursor-pointer"
                  }`}
                  title={userVoted ? "Your vote is recorded" : !isLoggedIn() ? "Login required to cast your vote for DC" : "Vote for DC Universe (1 Vote Limit)"}
                >
                  {userVoted === "dc" ? (
                    <RiCheckDoubleLine className="text-xs text-black" />
                  ) : !isLoggedIn() ? (
                    <RiLockLine className="text-[10px] opacity-70" />
                  ) : null}
                  <span>{userVoted === "dc" ? "UNITED ✓" : "Unite"}</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Real-time Feedback Toast Popup */}
          <AnimatePresence>
            {feedbackToast && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 py-1 px-3 rounded-lg bg-white/10 border border-arc-cyan/40 text-center text-xs font-bold text-arc-cyan tracking-wider font-orbitron"
              >
                {feedbackToast}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── SECTION 2: BRAND IDENTITY & TACTICAL CARDS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-white/10 items-start">
          
          {/* Brand & Mission Briefing (md:col-span-5) */}
          <div className="md:col-span-5 space-y-3.5 text-left flex flex-col items-start">
            <Link
              to="/"
              className="flex items-center gap-2.5 group focus:outline-none"
              aria-label="MACFIESTA Home Link"
            >
              <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                <img
                  src={settings?.logoUrl || "/logo.png"}
                  alt="MACFIESTA Logo"
                  className="w-9 h-9 object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-left">
                <h3 className="text-lg md:text-xl tracking-wider uppercase flex items-center gap-1 font-anton leading-none">
                  <span className="shimmer-text">{(settings?.name || "MACFIESTA").toUpperCase()}</span>
                </h3>
                <p className="text-[8px] text-arc-cyan tracking-[0.25em] uppercase font-bold font-space mt-0.5">
                  {settings?.edition || "2K26"} • MARVEL VS DC
                </p>
              </div>
            </Link>

            <p className="text-xs text-white/60 leading-relaxed max-w-sm font-space">
              Earth&apos;s premier national collegiate festival at MACFAST. 23 Arena Missions across School & College divisions.
            </p>

            {/* Social Alliances Connect */}
            <div className="flex gap-2 pt-0.5">
              {SOCIAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <motion.a
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.95 }}
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-arc-cyan hover:border-arc-cyan/40 hover:bg-arc-cyan/10 transition-all shadow-sm"
                    aria-label={`Follow on ${link.label}`}
                  >
                    <Icon size={15} />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Tactical Action Card 1: Direct Mission Clearance (md:col-span-3) */}
          <div className="md:col-span-3 space-y-2 text-left">
            <h4 className="text-[11px] font-bold text-arc-cyan uppercase tracking-[0.2em] flex items-center gap-1.5">
              <RiShieldFlashLine className="text-xs" /> Tactical Actions
            </h4>
            <div className="space-y-2">
              <Link
                to="/register"
                className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-marvel-red/50 transition-all text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-marvel-red shadow-[0_0_6px_#ED1D24]" />
                  <span className="font-bold text-white group-hover:text-marvel-red transition-colors">Claim Pass</span>
                </div>
                <span className="text-[10px] text-white/40 group-hover:translate-x-0.5 transition-transform">REGISTER →</span>
              </Link>

              <Link
                to="/brochure"
                className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-metallic-gold/50 transition-all text-xs"
              >
                <div className="flex items-center gap-2">
                  <RiDownloadLine className="text-metallic-gold text-xs" />
                  <span className="font-bold text-white group-hover:text-metallic-gold transition-colors">Brochure Dossier</span>
                </div>
                <span className="text-[10px] text-white/40 group-hover:translate-x-0.5 transition-transform">PDF →</span>
              </Link>
            </div>
          </div>

          {/* Tactical Action Card 2: Stark Communications & Venue (md:col-span-4) */}
          <div className="md:col-span-4 space-y-2 text-left">
            <h4 className="text-[11px] font-bold text-marvel-red uppercase tracking-[0.2em] flex items-center gap-1.5">
              <RiFlashlightLine className="text-xs" /> Stark Communications
            </h4>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 text-xs text-white/75">
              <div className="flex gap-2 items-center">
                <RiMapPinLine className="text-arc-cyan text-sm shrink-0" />
                <span className="truncate">{settings?.venueAddress || "MACFAST Campus, Tiruvalla, Kerala"}</span>
              </div>
              <div className="flex gap-2 items-center">
                <RiPhoneLine className="text-marvel-red text-sm shrink-0" />
                <a href={`tel:${settings?.contactPhone || "+919447000000"}`} className="hover:text-white font-mono transition-colors truncate">
                  {settings?.contactPhone || "+91 94470 00000"}
                </a>
              </div>
              <div className="flex gap-2 items-center">
                <RiMailLine className="text-metallic-gold text-sm shrink-0" />
                <a href={`mailto:${settings?.contactEmail || "macfiesta@macfast.org"}`} className="hover:text-white font-mono transition-colors truncate">
                  {settings?.contactEmail || "macfiesta@macfast.org"}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SECTION 3: BOTTOM SIGNATURE & PROTOCOL BAR ─── */}
        <div className="pt-4 pb-12 xl:pb-0 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/45 font-mono text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} {(settings?.name || "MACFIESTA").toUpperCase()} • MARVEL VS DC. All rights reserved.
          </div>

          <div className="flex gap-4">
            <Link to="/events" className="hover:text-arc-cyan transition-colors">Missions</Link>
            <Link to="/schedule" className="hover:text-arc-cyan transition-colors">Timeline</Link>
            <Link to="/scoreboard" className="hover:text-arc-cyan transition-colors">Scoreboard</Link>
            <Link to="/rules" className="hover:text-arc-cyan transition-colors">Rules</Link>
            <Link to="/faq" className="hover:text-arc-cyan transition-colors">FAQ</Link>
            <Link to="/privacy" className="hover:text-arc-cyan transition-colors">Privacy</Link>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Engineered by <span className="text-metallic-gold font-bold uppercase">Joel Sajan Thomas & Joel Zacharia</span>
            </span>
            <button
              onClick={scrollToTop}
              type="button"
              className="p-1.5 bg-arc-cyan/10 border border-arc-cyan/40 rounded-full text-arc-cyan hover:bg-arc-cyan hover:text-black transition-all shadow-[0_0_10px_rgba(0,212,255,0.3)] cursor-pointer shrink-0"
              aria-label="Scroll back to top"
            >
              <RiArrowUpLine size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
