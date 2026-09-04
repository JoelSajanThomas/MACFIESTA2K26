import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  RiBaseStationLine,
  RiTrophyFill,
  RiBuildingLine,
  RiSearchLine,
  RiFireLine,
  RiSparklingFill,
  RiRefreshLine,
  RiShieldFlashLine,
  RiCompass3Line,
} from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";
import { getResults } from "../services/api";

const POSITION_POINTS = { first: 10, second: 7, third: 5, special: 2 };

const PODIUM_CONFIG = [
  // 1st Place - Champion
  {
    rank: 1,
    label: "GRAND CHAMPION",
    tagline: "HIGHEST CUMULATIVE POWER LEVEL",
    emoji: "👑",
    crownIcon: "🏆",
    bgGradient: "bg-[#FFD700]/[0.07] backdrop-blur-xl",
    border: "border-[#FFD700]/80",
    glow: "shadow-[0_0_35px_rgba(255,215,0,0.3)]",
    ring: "ring-1 ring-[#FFD700]/60",
    topBar: "from-[#FFF275] via-[#FFD700] to-[#B8860B]",
    badge: "bg-gradient-to-r from-[#FFD700] via-[#FFC000] to-[#B8860B] text-[#0A0800] font-black",
    nameColor: "text-[#FFF194]",
    ptsColor: "text-[#FFD700]",
    medalGlow: "bg-[#FFD700]/20 border border-[#FFD700]/50 text-white shadow-[0_0_15px_rgba(255,215,0,0.5)]",
    orbGlow: "rgba(255,215,0,0.12)",
  },
  // 2nd Place - 1st Runner Up
  {
    rank: 2,
    label: "1ST RUNNER-UP",
    tagline: "ELITE CONTENDER DIVISION",
    emoji: "🥈",
    crownIcon: "🎖️",
    bgGradient: "bg-white/[0.06] backdrop-blur-xl",
    border: "border-[#D0D5DD]/70",
    glow: "shadow-[0_0_30px_rgba(192,192,192,0.2)]",
    ring: "ring-1 ring-[#D0D5DD]/40",
    topBar: "from-[#FFFFFF] via-[#D0D5DD] to-[#717680]",
    badge: "bg-gradient-to-r from-[#FFFFFF] via-[#D0D5DD] to-[#98A2B3] text-[#07080A] font-black",
    nameColor: "text-[#F0F2F5]",
    ptsColor: "text-[#E4E7EC]",
    medalGlow: "bg-white/15 border border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.4)]",
    orbGlow: "rgba(208,213,221,0.08)",
  },
  // 3rd Place - 2nd Runner Up
  {
    rank: 3,
    label: "2ND RUNNER-UP",
    tagline: "VANGUARD PODIUM CONTENDER",
    emoji: "🥉",
    crownIcon: "🏅",
    bgGradient: "bg-[#CD7F32]/[0.07] backdrop-blur-xl",
    border: "border-[#CD7F32]/70",
    glow: "shadow-[0_0_30px_rgba(205,127,50,0.2)]",
    ring: "ring-1 ring-[#CD7F32]/40",
    topBar: "from-[#FFA066] via-[#CD7F32] to-[#7A3A0B]",
    badge: "bg-gradient-to-r from-[#FFA066] via-[#CD7F32] to-[#7A3A0B] text-white font-black",
    nameColor: "text-[#FFCCA8]",
    ptsColor: "text-[#CD7F32]",
    medalGlow: "bg-[#CD7F32]/20 border border-[#CD7F32]/50 text-white shadow-[0_0_15px_rgba(205,127,50,0.4)]",
    orbGlow: "rgba(205,127,50,0.1)",
  },
];

export default function Scoreboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  usePageSeo({
    title: "Live Radar Scoreboard · College Points Leaderboard · MacFiesta 2026",
    description: "Real-time college-wise leaderboard, power levels, and cumulative scores across all 23 MacFiesta 2026 arena missions.",
  });

  const fetchData = () => {
    setLoading(true);
    getResults()
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setResults(raw);
        setLastRefreshed(new Date());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Aggregate college points
  const collegeLeaderboard = useMemo(() => {
    const map = new Map();

    results.forEach((r) => {
      const college = (r.college_name || "").trim();
      if (!college) return;
      const pts = POSITION_POINTS[r.position] ?? 0;

      if (!map.has(college)) {
        map.set(college, {
          name: college,
          totalPoints: 0,
          firsts: 0,
          seconds: 0,
          thirds: 0,
          specials: 0,
          eventsWon: [],
        });
      }

      const c = map.get(college);
      c.totalPoints += pts;
      if (r.position === "first") c.firsts++;
      else if (r.position === "second") c.seconds++;
      else if (r.position === "third") c.thirds++;
      else if (r.position === "special") c.specials++;

      c.eventsWon.push({
        event: r.event_title || "Arena Mission",
        position: r.position,
        participant: r.participant_name,
        points: pts,
      });
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        b.totalPoints - a.totalPoints ||
        b.firsts - a.firsts ||
        b.seconds - a.seconds ||
        b.thirds - a.thirds ||
        a.name.localeCompare(b.name)
    );
  }, [results]);

  const maxPoints = collegeLeaderboard[0]?.totalPoints || 1;

  const filteredColleges = search
    ? collegeLeaderboard.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.eventsWon.some((e) => e.event.toLowerCase().includes(search.toLowerCase()))
      )
    : collegeLeaderboard;

  const top3 = collegeLeaderboard.slice(0, 3);

  const totalPointsAwarded = useMemo(
    () => collegeLeaderboard.reduce((acc, c) => acc + c.totalPoints, 0),
    [collegeLeaderboard]
  );

  const publishedEventCount = useMemo(() => {
    const events = new Set(results.map((r) => r.event_id ?? r.event));
    return events.size;
  }, [results]);

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-24 text-white relative overflow-hidden">
      {/* Background Marvel Artwork with Cinematic Scrims */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/batman.jpg"
          alt="Scoreboard Backdrop"
          className="w-full h-full object-cover object-center opacity-90 contrast-[1.1] saturate-[1.15] brightness-[0.95]"
        />
        {/* Transparent cinematic scrim so Batman artwork shines through */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-transparent to-[#05050A]/60 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,212,255,0.06)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.08)_0%,transparent_60%)] pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">

        {/* ── Page Header / Mission Radar HUD ── */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-metallic-gold/50 bg-metallic-gold/15 text-metallic-gold text-xs font-black tracking-[0.25em] uppercase shadow-[0_0_20px_rgba(212,175,55,0.35)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-metallic-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-metallic-gold"></span>
            </span>
            <RiBaseStationLine className="text-sm text-metallic-gold" />
            <span>S.H.I.E.L.D. SATELLITE LIVE RADAR</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">COLLEGE</span>{" "}
            <span className="gradient-text-gold">POWER POINTS</span>
          </h1>

          <p className="text-white/75 text-xs sm:text-sm font-space max-w-2xl mx-auto leading-relaxed">
            Real-time aggregate collegiate standings. Points automatically synchronize live as jury councils officially finalize and publish arena outcomes.
          </p>

          {/* Tactical Specs / Scoring Matrix Bar */}
          <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
            {[
              { icon: "🥇", pos: "1st Place", pts: "10 PTS", color: "border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFE57F]" },
              { icon: "🥈", pos: "2nd Place", pts: "7 PTS", color: "border-[#C0C0C0]/40 bg-[#C0C0C0]/10 text-[#F0F2F5]" },
              { icon: "🥉", pos: "3rd Place", pts: "5 PTS", color: "border-[#CD7F32]/40 bg-[#CD7F32]/10 text-[#FFA066]" },
              { icon: "⭐", pos: "Special", pts: "2 PTS", color: "border-[#7B68EE]/40 bg-[#7B68EE]/10 text-[#D2CBFF]" },
            ].map(({ icon, pos, pts, color }) => (
              <div
                key={pos}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl border ${color} text-xs font-mono backdrop-blur-md shadow-sm`}
              >
                <span>{icon}</span>
                <span className="opacity-80 font-bold">{pos}:</span>
                <span className="font-black tracking-wide">{pts}</span>
              </div>
            ))}

            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 px-4 py-1 rounded-xl bg-arc-cyan/15 hover:bg-arc-cyan/25 border border-arc-cyan/40 text-xs font-mono text-arc-cyan transition-all cursor-pointer shadow-[0_0_12px_rgba(0,212,255,0.25)]"
              title="Refresh radar coordinates"
            >
              <RiRefreshLine className={loading ? "animate-spin" : ""} />
              <span className="font-bold">SYNC FEED</span>
            </button>
          </div>
        </div>

        {/* ── Key Tactical Metrics Strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {[
            {
              label: "Competing Institutions",
              value: collegeLeaderboard.length,
              sub: "Ranked on Leaderboard",
              icon: RiBuildingLine,
              color: "text-arc-cyan",
              borderColor: "border-arc-cyan/40",
              glow: "shadow-[0_0_20px_rgba(0,212,255,0.15)]",
            },
            {
              label: "Championship Leader",
              value: top3[0]?.name || "Awaiting Score",
              sub: top3[0] ? `${top3[0].totalPoints} Cumulative PTS` : "Pending Results",
              isText: true,
              icon: RiTrophyFill,
              color: "text-metallic-gold",
              borderColor: "border-metallic-gold/45",
              glow: "shadow-[0_0_20px_rgba(212,175,55,0.2)]",
            },
            {
              label: "Total Power Points",
              value: totalPointsAwarded,
              sub: "Awarded Across Arenas",
              icon: RiFireLine,
              color: "text-marvel-red",
              borderColor: "border-marvel-red/40",
              glow: "shadow-[0_0_20px_rgba(237,29,36,0.2)]",
            },
            {
              label: "Concluded Arenas",
              value: publishedEventCount,
              sub: "Results Formally Archived",
              icon: RiShieldFlashLine,
              color: "text-emerald-400",
              borderColor: "border-emerald-500/40",
              glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
            },
          ].map(({ label, value, sub, icon: Icon, color, isText, borderColor, glow }) => (
            <div
              key={label}
              className={`rounded-2xl p-4 sm:p-5 border ${borderColor} ${glow} bg-black/25 backdrop-blur-md flex flex-col justify-between space-y-2 relative overflow-hidden`}
            >
              <div className="flex items-center justify-between text-white/40">
                <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-white/60">
                  {label}
                </span>
                <Icon className={`text-lg ${color}`} />
              </div>

              <div>
                <div
                  className={`font-black font-excon-black ${color} ${
                    isText ? "text-sm sm:text-base leading-snug break-words" : "text-3xl sm:text-4xl"
                  }`}
                >
                  {value}
                </div>
                <div className="text-[10px] text-white/45 font-mono pt-0.5">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {loading && collegeLeaderboard.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <RiBaseStationLine className="text-4xl text-arc-cyan animate-pulse mx-auto" />
            <div className="text-arc-cyan uppercase font-bold text-xs tracking-[0.25em] font-mono">
              Interfacing with S.H.I.E.L.D. Satellite Network…
            </div>
          </div>
        ) : collegeLeaderboard.length === 0 ? (
          <div className="marvel-card p-16 rounded-3xl border border-white/10 text-center space-y-3 bg-black/25 backdrop-blur-xl">
            <RiTrophyFill className="text-5xl text-metallic-gold/30 mx-auto" />
            <p className="text-white/60 text-sm font-space font-bold">No college points recorded yet.</p>
            <p className="text-white/35 text-xs font-mono">
              Points will automatically populate here as mission jury scores are confirmed and published.
            </p>
          </div>
        ) : (
          <>
            {/* ── Top 3 Holographic Champion Showcase ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <RiSparklingFill className="text-sm text-metallic-gold" />
                  <span className="text-xs uppercase font-black tracking-[0.25em] text-metallic-gold font-mono">
                    PODIUM OF VICTORS
                  </span>
                </div>
                <span className="text-[10.5px] text-white/40 font-mono">
                  Radar Timestamp: {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>

              {/* 3-Column Visual Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                {top3.map((college, i) => {
                  const cfg = PODIUM_CONFIG[i];
                  return (
                    <motion.div
                      key={college.name}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.12 }}
                      whileHover={{ y: -4 }}
                      className={`relative overflow-hidden rounded-3xl border ${cfg.border} ${cfg.glow} ${cfg.bgGradient} ${cfg.ring} flex flex-col justify-between transition-all group`}
                    >
                      {/* Top Glowing Laser Bar */}
                      <div className={`h-2 w-full bg-gradient-to-r ${cfg.topBar}`} />

                      {/* Subtle Ambient Radial Orb */}
                      <div
                        className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-40"
                        style={{ backgroundColor: cfg.orbGlow }}
                      />

                      <div className="p-6 sm:p-7 space-y-5 relative z-10">
                        {/* Card Header: Rank Tag + Medal */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] uppercase tracking-widest ${cfg.badge} shadow-md`}
                            >
                              <span>{cfg.crownIcon}</span>
                              <span>#{cfg.rank} {cfg.label}</span>
                            </span>
                            <div className="text-[9.5px] uppercase tracking-wider text-white/40 font-mono">
                              {cfg.tagline}
                            </div>
                          </div>

                          <div
                            className={`w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${cfg.medalGlow}`}
                          >
                            {cfg.emoji}
                          </div>
                        </div>

                        {/* Full Institution Name — styled like a monument, zero truncation */}
                        <div className="space-y-2">
                          <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                            <RiBuildingLine className="text-xs" />
                            <span>ACCREDITED INSTITUTION</span>
                          </div>

                          <h3
                            className={`text-xl sm:text-2xl font-black uppercase ${cfg.nameColor} font-excon-black leading-snug break-words tracking-tight drop-shadow-sm`}
                          >
                            {college.name}
                          </h3>

                          {/* Medals Breakdown Pills */}
                          <div className="flex items-center gap-2 flex-wrap pt-2">
                            {college.firsts > 0 && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFD700]/15 border border-[#FFD700]/40 text-[#FFE57F] text-xs font-mono font-bold shadow-sm">
                                🥇 {college.firsts} Gold
                              </span>
                            )}
                            {college.seconds > 0 && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#C0C0C0]/15 border border-[#C0C0C0]/40 text-[#F0F2F5] text-xs font-mono font-bold shadow-sm">
                                🥈 {college.seconds} Silver
                              </span>
                            )}
                            {college.thirds > 0 && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#CD7F32]/15 border border-[#CD7F32]/40 text-[#FFA066] text-xs font-mono font-bold shadow-sm">
                                🥉 {college.thirds} Bronze
                              </span>
                            )}
                            {college.specials > 0 && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#7B68EE]/15 border border-[#7B68EE]/40 text-[#D2CBFF] text-xs font-mono font-bold shadow-sm">
                                ⭐ {college.specials} Special
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Recent Victories Badges */}
                        {college.eventsWon.length > 0 && (
                          <div className="space-y-1.5 pt-3 border-t border-white/10">
                            <div className="text-[10px] uppercase font-bold tracking-widest text-white/40 font-mono">
                              Arenas Conquered:
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                              {college.eventsWon.map((e, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80 font-mono truncate max-w-full"
                                  title={`${e.event} (${e.position})`}
                                >
                                  {e.event} · <b className="text-metallic-gold">+{e.points}</b>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Bottom: Points Pillar */}
                      <div className="px-6 py-4 bg-black/20 border-t border-white/10 flex items-center justify-between relative z-10 backdrop-blur-sm">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 font-mono">
                          Total Power Points
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl sm:text-4xl font-black font-excon-black ${cfg.ptsColor}`}>
                            {college.totalPoints}
                          </span>
                          <span className="text-xs font-mono font-bold text-white/40">PTS</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── Search & Filter HUD ── */}
            <div className="glass p-3 sm:p-4 rounded-2xl border border-arc-cyan/30 relative shadow-[0_0_20px_rgba(0,212,255,0.1)] bg-black/20">
              <RiSearchLine className="absolute left-6 top-1/2 -translate-y-1/2 text-arc-cyan text-lg" />
              <input
                type="text"
                placeholder="Search college by full institutional name or mission arena won…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-xs placeholder:text-white/35 transition-all font-space"
              />
            </div>

            {/* ── Complete Standings Board ── */}
            <div className="marvel-card rounded-3xl border border-white/15 overflow-hidden bg-black/20 backdrop-blur-md shadow-2xl">
              <div className="px-6 py-4.5 bg-white/[0.04] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <RiCompass3Line className="text-metallic-gold text-lg animate-spin" style={{ animationDuration: "12s" }} />
                  <span className="text-xs uppercase font-black tracking-[0.2em] text-white font-mono">
                    RADAR STANDINGS ARCHIVE
                  </span>
                </div>
                <span className="text-[11px] font-mono text-white/50">
                  Showing {filteredColleges.length} of {collegeLeaderboard.length} Participating College{collegeLeaderboard.length === 1 ? "" : "s"}
                </span>
              </div>

              {filteredColleges.length === 0 ? (
                <div className="text-center py-16 text-white/40 text-xs font-mono">
                  No institution found matching &quot;{search}&quot;.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredColleges.map((college) => {
                    const rank = collegeLeaderboard.findIndex((c) => c.name === college.name) + 1;
                    const pct = Math.min(100, Math.round((college.totalPoints / maxPoints) * 100));

                    return (
                      <motion.div
                        key={college.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="p-5 sm:p-6 hover:bg-white/[0.04] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        {/* Rank + Full College Name */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 font-mono shadow-md ${
                              rank === 1
                                ? "bg-metallic-gold text-black shadow-[0_0_15px_#FFD700]"
                                : rank === 2
                                ? "bg-[#D0D5DD] text-black shadow-[0_0_12px_rgba(208,213,221,0.5)]"
                                : rank === 3
                                ? "bg-[#CD7F32] text-white shadow-[0_0_12px_rgba(205,127,50,0.5)]"
                                : "bg-white/5 border border-white/10 text-white/70"
                            }`}
                          >
                            #{rank}
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            {/* Full College Name: wraps cleanly, bold, crisp */}
                            <h4 className="text-base sm:text-lg font-black uppercase text-white group-hover:text-metallic-gold transition-colors font-excon-black leading-snug break-words">
                              {college.name}
                            </h4>

                            {/* Medals & Arenas count */}
                            <div className="flex items-center gap-3 flex-wrap text-xs font-mono text-white/55">
                              <span className="inline-flex items-center gap-1">
                                🥇 <b className="text-white/80">{college.firsts}</b>
                              </span>
                              <span className="inline-flex items-center gap-1">
                                🥈 <b className="text-white/80">{college.seconds}</b>
                              </span>
                              <span className="inline-flex items-center gap-1">
                                🥉 <b className="text-white/80">{college.thirds}</b>
                              </span>
                              {college.specials > 0 && (
                                <span className="inline-flex items-center gap-1">
                                  ⭐ <b className="text-white/80">{college.specials}</b>
                                </span>
                              )}
                              <span className="text-white/25">•</span>
                              <span className="text-white/50">
                                {college.eventsWon.length} arena placement{college.eventsWon.length === 1 ? "" : "s"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Power Progress Track & Points */}
                        <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 sm:w-72 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                          <div className="flex-1 hidden sm:block">
                            <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden border border-white/10 p-0.5">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  rank === 1
                                    ? "bg-gradient-to-r from-metallic-gold via-[#FFE57F] to-metallic-gold shadow-[0_0_10px_#FFD700]"
                                    : rank === 2
                                    ? "bg-gradient-to-r from-[#D0D5DD] to-[#FFFFFF]"
                                    : rank === 3
                                    ? "bg-gradient-to-r from-[#CD7F32] to-[#FFA066]"
                                    : "bg-gradient-to-r from-arc-cyan/60 to-arc-cyan"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="text-[10px] font-mono text-white/40 text-right mt-1">
                              {pct}% of max points
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-2xl sm:text-3xl font-black font-excon-black ${
                                rank === 1
                                  ? "text-metallic-gold"
                                  : rank === 2
                                  ? "text-[#D0D5DD]"
                                  : rank === 3
                                  ? "text-[#CD7F32]"
                                  : "text-white"
                              }`}
                            >
                              {college.totalPoints}
                            </span>
                            <span className="text-xs uppercase font-bold text-white/45 font-mono ml-1.5">
                              PTS
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
