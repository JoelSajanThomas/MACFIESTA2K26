import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  RiAwardLine,
  RiSearchLine,
  RiShieldFlashLine,
  RiTrophyFill,
  RiBuildingLine,
  RiCheckDoubleLine,
  RiMapPinLine,
  RiCalendarEventLine,
  RiSparklingFill,
  RiCompass3Line,
  RiSwordLine,
  RiMedalFill,
} from "react-icons/ri";
import { getResults } from "../services/api";
import { usePageSeo } from "../hooks/usePageSeo";

const POSITION_ORDER = { first: 1, second: 2, third: 3, special: 4 };

const POSITION_THEMES = {
  first: {
    label: "1st Place",
    subtitle: "GRAND CHAMPION",
    emoji: "🥇",
    badge: "bg-gradient-to-r from-[#FFD700] via-[#FFC000] to-[#B8860B] text-[#0A0800] font-black",
    border: "border-[#FFD700]/80",
    glow: "shadow-[0_0_30px_rgba(255,215,0,0.3),0_0_60px_rgba(255,215,0,0.1)]",
    ring: "ring-1 ring-[#FFD700]/60",
    cardBg: "bg-[#FFD700]/[0.07] backdrop-blur-xl",
    nameColor: "text-[#FFF194]",
    topBar: "from-[#FFF275] via-[#FFD700] to-[#B8860B]",
    iconColor: "#FFD700",
    stampBg: "bg-[#FFD700]/15 text-[#FFE57F] border-[#FFD700]/30",
  },
  second: {
    label: "2nd Place",
    subtitle: "RUNNER-UP",
    emoji: "🥈",
    badge: "bg-gradient-to-r from-[#FFFFFF] via-[#D0D5DD] to-[#98A2B3] text-[#07080A] font-black",
    border: "border-[#D0D5DD]/70",
    glow: "shadow-[0_0_25px_rgba(208,213,221,0.2),0_0_50px_rgba(208,213,221,0.08)]",
    ring: "ring-1 ring-[#D0D5DD]/40",
    cardBg: "bg-white/[0.06] backdrop-blur-xl",
    nameColor: "text-[#F0F2F5]",
    topBar: "from-[#FFFFFF] via-[#D0D5DD] to-[#717680]",
    iconColor: "#D0D5DD",
    stampBg: "bg-white/10 text-white/90 border-white/20",
  },
  third: {
    label: "3rd Place",
    subtitle: "2ND RUNNER-UP",
    emoji: "🥉",
    badge: "bg-gradient-to-r from-[#FFA066] via-[#CD7F32] to-[#7A3A0B] text-white font-black",
    border: "border-[#CD7F32]/70",
    glow: "shadow-[0_0_25px_rgba(205,127,50,0.2),0_0_50px_rgba(205,127,50,0.08)]",
    ring: "ring-1 ring-[#CD7F32]/40",
    cardBg: "bg-[#CD7F32]/[0.07] backdrop-blur-xl",
    nameColor: "text-[#FFCCA8]",
    topBar: "from-[#FFA066] via-[#CD7F32] to-[#7A3A0B]",
    iconColor: "#CD7F32",
    stampBg: "bg-[#CD7F32]/15 text-[#FFA066] border-[#CD7F32]/30",
  },
  special: {
    label: "Special Mention",
    subtitle: "JURY COMMENDATION",
    emoji: "⭐",
    badge: "bg-gradient-to-r from-[#B8AEFF] via-[#7B68EE] to-[#483D8B] text-white font-black",
    border: "border-[#7B68EE]/70",
    glow: "shadow-[0_0_25px_rgba(123,104,238,0.2),0_0_50px_rgba(123,104,238,0.08)]",
    ring: "ring-1 ring-[#7B68EE]/40",
    cardBg: "bg-[#7B68EE]/[0.07] backdrop-blur-xl",
    nameColor: "text-[#DCD6FF]",
    topBar: "from-[#B8AEFF] via-[#7B68EE] to-[#483D8B]",
    iconColor: "#7B68EE",
    stampBg: "bg-[#7B68EE]/15 text-[#DCD6FF] border-[#7B68EE]/30",
  },
};

export default function Results() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  usePageSeo({
    title: "Official Event-Wise Results · Hall of Heroes · MacFiesta 2026",
    description: "Official verified event-wise winners and champions for MacFiesta 2026 arena missions.",
  });

  useEffect(() => {
    getResults()
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setResults(raw);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group published results by event
  const eventGroups = useMemo(() => {
    const map = new Map();
    results.forEach((r) => {
      const eid = r.event_id ?? r.event;
      if (!map.has(eid)) {
        map.set(eid, {
          eventId: eid,
          title: r.event_title || "Championship Mission",
          category: r.event_category || "",
          venue: r.event_venue || "",
          date: r.event_date || "",
          results: [],
        });
      }
      map.get(eid).results.push(r);
    });

    // Sort each event's winners by rank
    for (const g of map.values()) {
      g.results.sort(
        (a, b) => (POSITION_ORDER[a.position] ?? 9) - (POSITION_ORDER[b.position] ?? 9)
      );
    }

    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [results]);

  const categories = useMemo(() => {
    const cats = new Set(eventGroups.map((g) => g.category).filter(Boolean));
    return ["all", ...Array.from(cats).sort()];
  }, [eventGroups]);

  const visibleGroups =
    activeCategory === "all"
      ? eventGroups
      : eventGroups.filter((g) => g.category === activeCategory);

  const searchedGroups = search
    ? visibleGroups.filter(
        (g) =>
          g.title.toLowerCase().includes(search.toLowerCase()) ||
          g.category.toLowerCase().includes(search.toLowerCase()) ||
          g.results.some(
            (r) =>
              r.participant_name?.toLowerCase().includes(search.toLowerCase()) ||
              r.college_name?.toLowerCase().includes(search.toLowerCase())
          )
      )
    : visibleGroups;

  const totalVictors = useMemo(() => {
    return eventGroups.reduce((acc, g) => acc + g.results.length, 0);
  }, [eventGroups]);

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-24 text-white relative overflow-hidden">
      {/* Background Marvel Artwork with Atmospheric Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/1078401073291511012.jpg"
          alt="Results Hall of Heroes Backdrop"
          className="w-full h-full object-cover object-center opacity-90 contrast-[1.1] saturate-[1.15] brightness-[0.95]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-transparent to-[#05050A]/60 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.06)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,212,255,0.06)_0%,transparent_60%)] pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">

        {/* ── Page Header / Victory Dossier HUD ── */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-metallic-gold/50 bg-metallic-gold/15 text-metallic-gold text-xs font-black tracking-[0.25em] uppercase shadow-[0_0_20px_rgba(212,175,55,0.35)]"
          >
            <RiShieldFlashLine className="animate-pulse text-metallic-gold text-sm" />
            <span>S.H.I.E.L.D. VERIFIED VICTORY ARCHIVE</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">EVENT-WISE</span>{" "}
            <span className="gradient-text-gold">RESULTS</span>
          </h1>

          <p className="text-white/75 text-xs sm:text-sm font-space max-w-2xl mx-auto leading-relaxed">
            Official mission outcomes recorded arena by arena. Review verified victors, runner-up agents, and representing institutions for each concluded challenge.
          </p>
        </div>

        {/* ── KPI Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="rounded-2xl p-4 sm:p-5 border border-metallic-gold/35 bg-black/25 backdrop-blur-md text-center space-y-1.5 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <RiAwardLine className="text-2xl text-metallic-gold mx-auto" />
            <div className="text-3xl sm:text-4xl font-black text-white font-excon-black">
              {eventGroups.length}
            </div>
            <div className="text-[10.5px] uppercase tracking-widest text-white/50 font-mono font-bold">
              Published Arenas
            </div>
          </div>

          <div className="rounded-2xl p-4 sm:p-5 border border-[#FFD700]/35 bg-black/25 backdrop-blur-md text-center space-y-1.5 shadow-[0_0_20px_rgba(255,215,0,0.15)]">
            <RiTrophyFill className="text-2xl text-[#FFD700] mx-auto" />
            <div className="text-3xl sm:text-4xl font-black text-white font-excon-black">
              {totalVictors}
            </div>
            <div className="text-[10.5px] uppercase tracking-widest text-white/50 font-mono font-bold">
              Decorated Champions
            </div>
          </div>

          <div className="rounded-2xl p-4 sm:p-5 border border-arc-cyan/35 bg-black/25 backdrop-blur-md text-center space-y-1.5 shadow-[0_0_20px_rgba(0,212,255,0.15)] col-span-2 md:col-span-1">
            <RiSparklingFill className="text-2xl text-arc-cyan mx-auto" />
            <div className="text-3xl sm:text-4xl font-black text-white font-excon-black">
              {categories.length > 1 ? categories.length - 1 : 1}
            </div>
            <div className="text-[10.5px] uppercase tracking-widest text-white/50 font-mono font-bold">
              Arena Categories
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 space-y-3">
            <RiCompass3Line className="text-4xl text-arc-cyan animate-spin mx-auto" />
            <div className="text-arc-cyan uppercase font-bold text-xs tracking-[0.25em] font-mono">
              Retrieving Official S.H.I.E.L.D. Victory Records…
            </div>
          </div>
        ) : eventGroups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="marvel-card p-16 rounded-3xl border border-white/10 text-center space-y-3 bg-[#0A0D18]/85 backdrop-blur-xl"
          >
            <RiTrophyFill className="text-5xl text-metallic-gold/30 mx-auto" />
            <p className="text-white/60 text-sm font-space font-bold">No event results have been published yet.</p>
            <p className="text-white/35 text-xs font-mono">
              Results will appear here automatically as each arena mission is judged and signed off by the jury.
            </p>
          </motion.div>
        ) : (
          <>
            {/* ── Category Filters & Search Bar ── */}
            <div className="space-y-3">
              {categories.length > 2 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest transition-all cursor-pointer font-mono ${
                        activeCategory === cat
                          ? "bg-metallic-gold text-black border-metallic-gold shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                          : "bg-white/5 text-white/60 border-white/10 hover:text-white hover:border-white/30"
                      }`}
                    >
                      {cat === "all" ? "All Divisions" : cat}
                    </button>
                  ))}
                </div>
              )}

              <div className="glass p-3 sm:p-4 rounded-2xl border border-arc-cyan/30 relative shadow-[0_0_20px_rgba(0,212,255,0.1)]">
                <RiSearchLine className="absolute left-6 top-1/2 -translate-y-1/2 text-arc-cyan text-lg" />
                <input
                  type="text"
                  placeholder="Search by arena mission name, participant agent, or college…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-xs placeholder:text-white/35 transition-all font-space"
                />
              </div>
            </div>

            {/* ── Event Sections (One per published arena) ── */}
            <div className="space-y-14">
              {searchedGroups.length === 0 ? (
                <div className="text-center text-white/40 text-xs font-mono py-16">
                  No mission results found matching &quot;{search}&quot;.
                </div>
              ) : (
                searchedGroups.map((group, gIdx) => (
                  <motion.section
                    key={group.eventId}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: gIdx * 0.05 }}
                    className="space-y-6"
                  >
                    {/* Mission Header Dossier Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-4 border-b-2 border-metallic-gold/30">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10.5px] font-black uppercase tracking-[0.25em] font-mono text-metallic-gold flex items-center gap-1.5">
                            <RiSwordLine className="text-xs" />
                            ARENA MISSION
                          </span>
                          {group.category && (
                            <span className="text-[9.5px] px-3 py-0.5 rounded-full bg-metallic-gold/15 text-metallic-gold border border-metallic-gold/35 font-mono font-bold uppercase tracking-widest">
                              {group.category}
                            </span>
                          )}
                        </div>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white font-excon-black tracking-tight drop-shadow-sm">
                          {group.title}
                        </h2>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-white/55 font-mono pt-0.5">
                          {group.venue && (
                            <span className="flex items-center gap-1.5">
                              <RiMapPinLine className="text-metallic-gold" />
                              <span>{group.venue}</span>
                            </span>
                          )}
                          {group.date && (
                            <span className="flex items-center gap-1.5">
                              <RiCalendarEventLine className="text-metallic-gold" />
                              <span>{group.date}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Verified Badge */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[10.5px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                          <RiCheckDoubleLine className="text-sm" />
                          VERIFIED OUTCOME
                        </span>
                      </div>
                    </div>

                    {/* Winner Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {group.results.map((result, rIdx) => {
                        const theme = POSITION_THEMES[result.position] || POSITION_THEMES.special;

                        return (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.35, delay: gIdx * 0.05 + rIdx * 0.06 }}
                            whileHover={{ y: -4 }}
                            className={`relative rounded-3xl border ${theme.border} ${theme.cardBg} ${theme.glow} ${theme.ring} backdrop-blur-xl overflow-hidden flex flex-col justify-between transition-all group`}
                          >
                            {/* Accent Glow Top Bar */}
                            <div className={`h-1.5 w-full bg-gradient-to-r ${theme.topBar}`} />

                            <div className="p-6 space-y-5">
                              {/* Position Badge & Winner Avatar */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest ${theme.badge} shadow-md`}
                                  >
                                    <span>{theme.emoji}</span>
                                    <span>{theme.label}</span>
                                  </span>
                                  <div className="text-[9.5px] uppercase font-mono tracking-wider text-white/40">
                                    {theme.subtitle}
                                  </div>
                                </div>

                                {result.winner_photo ? (
                                  <img
                                    src={result.winner_photo}
                                    alt={result.participant_name}
                                    className="w-13 h-13 rounded-2xl object-cover border-2 shadow-lg shrink-0"
                                    style={{ borderColor: theme.iconColor }}
                                  />
                                ) : (
                                  <div
                                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border"
                                    style={{ borderColor: theme.iconColor, backgroundColor: "rgba(255,255,255,0.03)" }}
                                  >
                                    {theme.emoji}
                                  </div>
                                )}
                              </div>

                              {/* Victor Name */}
                              <div className="space-y-2">
                                <h3
                                  className={`text-xl sm:text-2xl font-black uppercase ${theme.nameColor} font-excon-black leading-snug break-words tracking-tight`}
                                >
                                  {result.participant_name}
                                </h3>

                                {/* College Name: Full Name, wrap comfortably, clean badge icon */}
                                <div className="flex items-start gap-2 pt-1 border-t border-white/10">
                                  <RiBuildingLine className="text-sm text-metallic-gold shrink-0 mt-0.5" />
                                  <span className="text-xs sm:text-sm font-bold text-white/85 font-space leading-snug break-words">
                                    {result.college_name}
                                  </span>
                                </div>
                              </div>

                              {/* Jury Remarks / Commendations */}
                              {result.remarks && (
                                <div className="text-xs text-white/50 font-mono italic border-t border-white/10 pt-3">
                                  &ldquo;{result.remarks}&rdquo;
                                </div>
                              )}
                            </div>

                            {/* Card Footer Stamp */}
                            <div className="px-6 py-3.5 bg-black/20 backdrop-blur-sm border-t border-white/10 flex items-center justify-between text-[10.5px] font-mono">
                              <span className="text-white/40 uppercase font-bold tracking-wider">
                                ARENA MERIT
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${theme.stampBg}`}>
                                {theme.subtitle}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.section>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
