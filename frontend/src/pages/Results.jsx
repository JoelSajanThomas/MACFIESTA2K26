import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RiAwardLine, RiSearchLine, RiDownloadLine, RiCheckDoubleLine, RiSparklingLine, RiShieldFlashLine } from "react-icons/ri";
import { getResults } from "../services/api";
import { usePageSeo } from "../hooks/usePageSeo";

const DEFAULT_RESULTS = [
  { event: "Thor Gaming Arena (Urumi BGMI & Valorant)", winner: "Apex Overlords (CET Trivandrum)", runner: "Silent Killers (MACFAST)", hero: "Thor", status: "verified" },
  { event: "Iron Man Byte & Code Hackathon", winner: "Byte Busters (MACFAST)", runner: "Syntax Sorcerers (AJCE)", hero: "Iron Man", status: "verified" },
  { event: "Sanctum Corporate Showdown", winner: "Aria George (MBA Dept)", runner: "Rohit Krishnan (SCMS)", hero: "Doctor Strange", status: "verified" }
];

export function HallOfHeroesPodium({ topTeams }) {
  const champion = topTeams?.[0]?.name || "Byte Busters";
  const runner = topTeams?.[1]?.name || "Apex Squad";
  const third = topTeams?.[2]?.name || "Syntax Team";

  return (
    <div className="marvel-card p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-metallic-gold/40 text-center space-y-4 sm:space-y-6 relative overflow-hidden bg-gradient-to-b from-[#0F0D05] to-[#05050A] font-excon">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-excon-bold font-bold tracking-[0.2em] uppercase">
        <RiSparklingLine className="animate-spin" />
        <span>AVENGERS HALL OF HEROES PODIUM</span>
      </div>

      <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight font-excon-black">
        <span className="shimmer-text">CONGRATULATIONS TO THE</span>{" "}
        <span className="gradient-text-plasma">VICTORS</span>
      </h3>

      {/* Holographic 3D Podium Display */}
      <div className="flex justify-center items-end gap-2 sm:gap-4 pt-4 sm:pt-6 pb-2">
        {/* 2nd Place */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center space-y-1.5 sm:space-y-2"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            🥈
          </div>
          <div className="w-20 sm:w-32 h-24 sm:h-28 bg-white/5 border border-white/20 rounded-t-2xl flex flex-col justify-center p-1.5 sm:p-2 text-center">
            <span className="text-[9px] sm:text-[10px] text-white/50 uppercase font-bold font-excon-bold">2ND PLACE</span>
            <span className="text-[11px] sm:text-xs font-black text-white truncate font-excon-black">{runner}</span>
          </div>
        </motion.div>

        {/* 1st Place */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: -16 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center space-y-1.5 sm:space-y-2"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-metallic-gold/20 border-2 border-metallic-gold flex items-center justify-center text-metallic-gold text-xl sm:text-2xl font-bold shadow-[0_0_25px_#FFD700]">
            👑
          </div>
          <div className="w-24 sm:w-36 h-32 sm:h-36 bg-metallic-gold/10 border-2 border-metallic-gold/50 rounded-t-2xl flex flex-col justify-center p-2 text-center shadow-[0_0_20px_rgba(255,215,0,0.2)]">
            <span className="text-[9px] sm:text-[10px] text-metallic-gold uppercase font-bold font-excon-bold">🏆 CHAMPION</span>
            <span className="text-xs sm:text-sm font-black text-white truncate font-excon-black">{champion}</span>
          </div>
        </motion.div>

        {/* 3rd Place */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center space-y-1.5 sm:space-y-2"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-marvel-red/20 border border-marvel-red/40 flex items-center justify-center text-marvel-red text-base sm:text-lg font-bold shadow-[0_0_15px_rgba(237,29,36,0.3)]">
            🥉
          </div>
          <div className="w-20 sm:w-32 h-18 sm:h-20 bg-marvel-red/5 border border-marvel-red/20 rounded-t-2xl flex flex-col justify-center p-1.5 sm:p-2 text-center">
            <span className="text-[9px] sm:text-[10px] text-marvel-red uppercase font-bold font-excon-bold">3RD PLACE</span>
            <span className="text-[11px] sm:text-xs font-black text-white truncate font-excon-black">{third}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Results() {
  const [search, setSearch] = useState("");
  const [scores, setScores] = useState([]);

  usePageSeo({
    title: "Hall of Heroes · MacFiesta 2026",
    description: "Inspect official tournament winners, hero achievements, and download verified certificates.",
  });

  useEffect(() => {
    getResults()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setScores(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const dynamicResults = scores.length > 0
    ? scores.map((s) => {
        const eventTitle = typeof s.event === "object" ? s.event?.title : s.event_title || "Championship Tournament";
        const winner = s.winner_name ? `${s.winner_name} (${s.winner_college || "Champion"})` : "TBD";
        const runner = s.runner_name ? `${s.runner_name} (${s.runner_college || "Runner-Up"})` : "TBD";
        return {
          event: eventTitle,
          winner,
          runner,
          hero: "Marvel",
          status: "verified"
        };
      })
    : DEFAULT_RESULTS;

  const filtered = dynamicResults.filter((r) => (r.event || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-excon relative overflow-hidden">
      {/* Background Marvel Neon Ambient Color Blending */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[400px] bg-arc-cyan/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[400px] bg-metallic-gold/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(5,5,10,0.85)_95%)] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. VERIFIED VICTORY RECORDS</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">HALL OF</span>{" "}
            <span className="gradient-text-gold">HEROES</span>
          </h1>

          <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-excon font-normal">
            Inspect official tournament winners, hero achievements, and download verified certificates.
          </p>
        </div>

        {/* Podium */}
        <HallOfHeroesPodium />

        {/* Search */}
        <div className="glass p-4 rounded-2xl border border-arc-cyan/20 relative">
          <RiSearchLine className="absolute left-7 top-1/2 -translate-y-1/2 text-arc-cyan text-lg" />
          <input
            type="text"
            placeholder="Search hall of heroes by mission name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-xs placeholder:text-white/30 transition-all font-excon"
          />
        </div>

        {/* Results grid */}
        <div className="space-y-4 sm:space-y-6">
          {filtered.map((row, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="marvel-card p-4 sm:p-6 rounded-2xl border border-arc-cyan/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 hover:border-arc-cyan transition-all shadow-xl"
            >
              <div className="space-y-3 sm:space-y-4 flex-grow w-full md:w-auto">
                <div className="flex items-center gap-2 text-metallic-gold text-xs font-bold uppercase tracking-wider font-excon-bold flex-wrap">
                  <RiAwardLine className="shrink-0" />
                  <span>{row.event}</span>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-arc-cyan/10 border border-arc-cyan/30 text-arc-cyan text-[9px] font-excon-bold tracking-widest ml-auto sm:ml-2">
                    <RiCheckDoubleLine />
                    VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 text-xs font-excon">
                  <div className="p-3 sm:p-3.5 bg-black/60 rounded-xl border border-arc-cyan/30">
                    <span className="block text-[10px] uppercase font-bold text-metallic-gold tracking-wider font-excon-bold">👑 GRAND CHAMPION</span>
                    <span className="block font-black text-white text-xs sm:text-sm mt-1 font-excon-black truncate">{row.winner}</span>
                  </div>
                  <div className="p-3 sm:p-3.5 bg-black/60 rounded-xl border border-white/10">
                    <span className="block text-[10px] uppercase font-bold text-white/50 tracking-wider font-excon-bold">🥈 RUNNER UP AGENT</span>
                    <span className="block font-bold text-white/80 text-xs sm:text-sm mt-1 font-excon truncate">{row.runner}</span>
                  </div>
                </div>
              </div>

              {/* Certificate Download button */}
              <button
                onClick={() => alert(`Downloading official S.H.I.E.L.D. Victory Certificate for ${row.event}...`)}
                className="text-xs font-black text-black bg-arc-cyan hover:bg-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all uppercase tracking-[0.14em] shadow-[0_0_12px_#00D4FF] font-excon-black flex items-center gap-2 justify-center shrink-0 w-full md:w-auto cursor-pointer"
              >
                <RiDownloadLine />
                <span>Certificate PDF</span>
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
