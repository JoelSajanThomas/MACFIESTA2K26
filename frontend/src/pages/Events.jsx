import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  RiSearchLine,
  RiTrophyLine,
  RiMapPinLine,
  RiArrowRightLine,
  RiTimeLine,
  RiShieldFlashLine,
  RiFlashlightLine,
  RiTicketLine,
  RiGraduationCapLine,
  RiBuilding4Line,
  RiUserLine,
  RiTeamLine,
  RiPhoneLine,
  RiShieldUserLine,
  RiWhatsappLine,
} from "react-icons/ri";
import { getEvents } from "../services/api";
import { ALL_EVENTS } from "../lib/eventsData";
import { usePageSeo } from "../hooks/usePageSeo";
import { getCartItems, toggleInCart, clearCart } from "../utils/eventCart";

const CATEGORY_TABS = [
  { id: "all", label: "All Sectors" },
  { id: "technical", label: "Technical & Coding" },
  { id: "gaming", label: "Esports & Gaming" },
  { id: "management", label: "Management & Pitch" },
  { id: "cultural", label: "Cultural & Dance" },
  { id: "sports", label: "Sports & Turf War" },
  { id: "general", label: "Adventure & Creative" },
];

export default function Events() {
  const [events, setEvents] = useState(ALL_EVENTS || []);
  const [search, setSearch] = useState("");
  const [selectedScope, setSelectedScope] = useState("all");
  const [selectedType, setSelectedType] = useState("all"); // 'all' | 'solo' | 'squad'
  const [selectedCat, setSelectedCat] = useState("all");
  const [cartKeys, setCartKeys] = useState(() => getCartItems());

  usePageSeo({
    title: "Event Missions · MacFiesta 2026",
    description: "Browse official Avenger missions across technical, esports, cultural, management, and sports sectors directly from the festival registry.",
  });

  useEffect(() => {
    const handleCartChange = (event) => setCartKeys(event.detail || getCartItems());
    window.addEventListener("macfiesta-cart-change", handleCartChange);
    getEvents()
      .then((res) => {
        const rawEvents = Array.isArray(res.data)
          ? res.data
          : res.data?.events || res.data?.results || [];

        if (Array.isArray(rawEvents) && rawEvents.length > 0) {
          const mapped = rawEvents.map((apiEvt) => {
            const isSchool = apiEvt.audience === "school" || (apiEvt.slug && apiEvt.slug.startsWith("school-"));
            const scope = isSchool ? "school" : "college";
            const fee = Number(apiEvt.registration_fee) || 0;
            const isExpo = apiEvt.slug === "school-stark-expo" || (apiEvt.slug && apiEvt.slug.includes("stark-expo"));
            const prize = isExpo
              ? null
              : apiEvt.prize_pool
              ? Number(apiEvt.prize_pool)
              : (isSchool ? 3000 : 10000);

            const local = ALL_EVENTS.find((e) => e.slug === apiEvt.slug || String(e._id) === String(apiEvt.id));
            
            // Determine Solo vs Squad type
            const maxTeam = apiEvt.max_team_size ?? local?.max_team_size ?? (local?.type === "squad" ? 4 : 1);
            const isSquad = maxTeam > 1 || apiEvt.type === "squad" || local?.type === "squad";
            const teamType = isSquad ? "squad" : "solo";

            return {
              _id: String(apiEvt.id),
              id: apiEvt.id,
              slug: apiEvt.slug || String(apiEvt.id),
              title: apiEvt.title,
              scope: scope,
              type: teamType,
              maxTeamSize: maxTeam,
              category: apiEvt.category || "general",
              department: apiEvt.department || "",
              description: apiEvt.description || "Official MacFiesta 2026 festival championship mission brief.",
              registrationFee: fee,
              prizePool: prize,
              venue: apiEvt.venue && apiEvt.venue !== "TBD" ? apiEvt.venue : (local?.venue || "Campus Fest Arena"),
              time: apiEvt.event_time ? `Day 1, ${apiEvt.event_time}` : (local?.time || "10:00 AM onwards"),
              coverImage: apiEvt.image || local?.coverImage || (isSchool ? "/MARVEL/download (6).jpg" : "/MARVEL/4081455907815375.png"),
              hero: local?.hero || (isSchool ? "Superhero Junior" : "Avenger Hero"),
              subtitle: apiEvt.department || local?.subtitle || (isSchool ? "School Championship" : "College Challenge"),
              level: local?.level || (isSchool ? "Level: Junior" : "Level: Alpha"),
              powerRating: local?.powerRating || "Power: 95/100",
              borderClass: isSchool ? "border-emerald-500/40 hover:border-emerald-400" : "border-arc-cyan/40 hover:border-arc-cyan",
              accentColor: isSchool ? "#10B981" : "#00D4FF",
              coordinator: local?.coordinator || (apiEvt.coordinator_name ? {
                name: apiEvt.coordinator_name.replace(/\s*\([^)]*\)\s*/g, " ").trim(),
                phone: apiEvt.coordinator_phone || "+91 85909 39674",
                department: local?.coordinator?.department || apiEvt.department || "",
                team: local?.coordinator?.team || [],
              } : {
                name: "Event In-Charge",
                phone: "+91 85909 39674",
                department: apiEvt.department || "",
                team: [],
              }),
            };
          });
          setEvents(mapped);
        }
      })
      .catch(() => {});
    return () => window.removeEventListener("macfiesta-cart-change", handleCartChange);
  }, []);

  const cartEvents = useMemo(
    () => events.filter((event) => cartKeys.includes(String(event.slug || event._id || event.id))),
    [events, cartKeys]
  );
  const cartTotal = useMemo(
    () => cartEvents.reduce((total, event) => total + Number(event.registrationFee || event.registration_fee || 0), 0),
    [cartEvents]
  );

  const collegeCount = useMemo(() => events.filter((e) => e.scope === "college").length, [events]);
  const schoolCount = useMemo(() => events.filter((e) => e.scope === "school").length, [events]);

  // Dynamically scope the format counts to the currently selected audience/division (All / College / School)
  const scopeEvents = useMemo(() => {
    if (selectedScope === "all") return events;
    return events.filter((e) => e.scope === selectedScope);
  }, [events, selectedScope]);

  const soloCount = useMemo(
    () => scopeEvents.filter((e) => e.type === "solo" || (e.maxTeamSize || 1) <= 1).length,
    [scopeEvents]
  );
  const squadCount = useMemo(
    () => scopeEvents.filter((e) => e.type === "squad" || (e.maxTeamSize && e.maxTeamSize > 1)).length,
    [scopeEvents]
  );

  const scopeTabs = useMemo(() => [
    { id: "all", label: `All (${events.length})`, icon: RiShieldFlashLine },
    { id: "college", label: `College (${collegeCount})`, icon: RiGraduationCapLine },
    { id: "school", label: `School (${schoolCount})`, icon: RiBuilding4Line },
  ], [events.length, collegeCount, schoolCount]);

  const typeTabs = useMemo(() => [
    { id: "all", label: "All Formats" },
    { id: "solo", label: `Solo (${soloCount})`, icon: RiUserLine },
    { id: "squad", label: `Squad (${squadCount})`, icon: RiTeamLine },
  ], [soloCount, squadCount]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        (e.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.subtitle || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.venue || "").toLowerCase().includes(search.toLowerCase());

      const matchScope = selectedScope === "all" || e.scope === selectedScope;

      const isSquad = e.type === "squad" || (e.maxTeamSize && e.maxTeamSize > 1);
      const matchType =
        selectedType === "all" ||
        (selectedType === "solo" && !isSquad) ||
        (selectedType === "squad" && isSquad);

      let matchCat = selectedCat === "all";
      if (!matchCat) {
        const c = (e.category || "").toLowerCase();
        if (selectedCat === "technical") matchCat = c === "tech" || c === "technical";
        else if (selectedCat === "cultural") matchCat = c === "arts" || c === "cultural";
        else if (selectedCat === "sports") matchCat = c === "sports";
        else if (selectedCat === "gaming") matchCat = c === "gaming" || e.title.toLowerCase().includes("bgmi") || e.title.toLowerCase().includes("efootball");
        else if (selectedCat === "management") matchCat = c === "management" || c === "business";
        else if (selectedCat === "general") matchCat = c === "general";
        else matchCat = c.includes(selectedCat.toLowerCase());
      }

      return matchSearch && matchScope && matchType && matchCat;
    });
  }, [events, search, selectedScope, selectedType, selectedCat]);

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-excon relative overflow-hidden">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={encodeURI("/MARVEL/Whatever happens, stay who you are….jpg")}
          onError={(e) => {
            e.currentTarget.src = "/MARVEL/Whatever happens, stay who you are.jpg";
          }}
          alt="Marvel Universe Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        {/* Subtle cinematic gradient to preserve text readability without muddying the picture */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/25 to-[#05050A]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 relative z-10">
        
        {/* Header Briefing Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. EVENT DIRECTORY</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">SELECT YOUR</span>{" "}
            <span className="gradient-text-gold">MISSION</span>
          </h1>

          <p className="text-white/80 text-xs sm:text-sm font-excon font-normal">
            Choose your battle arena. Compete across {events.length || 23} official competitions across College &amp; School divisions.
          </p>
        </div>

        {/* Filter Controls Panel */}
        <div className="glass-aurora p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 space-y-4 shadow-2xl">
          
          {/* Scope Filters, Solo/Squad Selector & Search Bar */}
          <div className="flex flex-col lg:flex-row gap-3 justify-between items-center">
            
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Scope Tabs (All, College, School) */}
              <div className="flex bg-black/50 p-1 rounded-full border border-white/10 overflow-x-auto select-scrollbar">
                {scopeTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = selectedScope === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedScope(tab.id)}
                      className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap font-excon-bold cursor-pointer ${
                        active
                          ? "bg-marvel-red text-white shadow-[0_0_15px_#ED1D24]"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      <Icon className="text-sm" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Format Filter (Solo vs Squad) */}
              <div className="flex bg-black/50 p-1 rounded-full border border-metallic-gold/30 overflow-x-auto select-scrollbar">
                {typeTabs.map((tab) => {
                  const active = selectedType === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedType(tab.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap font-excon-bold cursor-pointer ${
                        active
                          ? "bg-metallic-gold text-black shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {Icon && <Icon className="text-xs" />}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-base" />
              <input
                type="text"
                placeholder="Search missions, heroes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder-white/40 focus:outline-none focus:border-arc-cyan transition-colors font-excon"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 border-t border-white/10 pt-3 select-scrollbar">
            {CATEGORY_TABS.map((cat) => {
              const active = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all font-excon-bold cursor-pointer ${
                    active
                      ? "bg-metallic-gold text-black shadow-[0_0_15px_#FFD700]"
                      : "bg-white/5 text-white/70 hover:text-white border border-white/10 hover:border-white/20"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info Counter */}
        <div className="flex items-center justify-between text-xs text-white/60 font-bold uppercase tracking-wider font-excon-bold px-1">
          <div className="flex items-center gap-2">
            <RiFlashlightLine className="text-arc-cyan animate-pulse" />
            <span>Showing {filteredEvents.length} Active Missions</span>
          </div>
          <span className="text-metallic-gold hidden sm:inline-block">
            {selectedScope === "school" ? "School Pass: Free Entry (₹0)" : "College Total Bounty: ₹1,11,000"}
          </span>
        </div>

        {/* Featured School Event Highlight: STARK EXPO */}
        {(selectedScope === "school" || selectedScope === "all") && (
          <div className="relative overflow-hidden rounded-3xl border-2 border-arc-cyan/50 bg-gradient-to-br from-arc-cyan/20 via-[#0A0D1A]/95 to-purple-900/20 p-6 sm:p-8 shadow-[0_0_40px_rgba(0,212,255,0.2)]">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arc-cyan/20 text-arc-cyan text-xs font-black uppercase tracking-widest border border-arc-cyan/40 font-mono">
                  <span>⭐ School Event Most Attractive Event</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-excon-black tracking-tight flex items-center gap-3">
                  <span>STARK EXPO</span>
                  <span className="text-xs px-2.5 py-1 rounded bg-metallic-gold/20 text-metallic-gold border border-metallic-gold/40 font-mono font-bold tracking-normal">
                    Free Walk-in
                  </span>
                </h2>
                <p className="text-sm font-bold text-metallic-gold font-mono">
                  Tag line : One Expo. Infinite Worlds of Discovery.
                </p>
                <div className="p-3.5 rounded-2xl bg-black/60 border border-arc-cyan/30 text-xs text-white/90 leading-relaxed space-y-1.5">
                  <p className="text-arc-cyan font-black text-[11px] uppercase tracking-wider font-mono">
                    ✦ Highlighting in the school event section:
                  </p>
                  <p className="text-white/85 text-xs sm:text-sm">
                    <strong>STAR EXPO – PRIZE POOL IS NOT THERE.</strong> This is <span className="underline decoration-arc-cyan underline-offset-2">not a competition</span>, just a free expo / exhibition for students to gain hands-on experience on different domains!
                  </p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider font-mono block">The Expo Includes:</span>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs text-white font-medium flex items-center gap-1.5">
                      <span>🤖</span> Artificial Intelligence (AI)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs text-white font-medium flex items-center gap-1.5">
                      <span>🌐</span> Internet of Things (IoT)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs text-white font-medium flex items-center gap-1.5">
                      <span>🔬</span> Science &amp; Experiments
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs text-white font-medium flex items-center gap-1.5">
                      <span>🧬</span> Biology &amp; Life Sciences
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs text-white font-medium flex items-center gap-1.5">
                      <span>🧠</span> Psychology &amp; Human Behaviour
                    </span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex flex-col gap-2.5 w-full lg:w-auto">
                <Link
                  to="/events/school-stark-expo"
                  className="px-6 py-3 rounded-full bg-arc-cyan hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,212,255,0.5)] font-excon-black text-center"
                >
                  Explore STARK EXPO Pavilion →
                </Link>
                <span className="text-[11px] text-center text-white/60 font-mono">
                  Day 1 (24 Sept) · Open to All School Students
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mission Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredEvents.map((item, idx) => {
            const isSchool = item.scope === "school";
            const feeDisplay = item.registrationFee === 0 ? "FREE PASS" : `₹${item.registrationFee}`;

            return (
              <motion.div
                key={item.slug || item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                className={`marvel-card group overflow-hidden rounded-2xl flex flex-col justify-between min-h-[550px] relative border ${item.borderClass || "border-arc-cyan/20 hover:border-arc-cyan"} shadow-xl bg-[#0A0D1A]/90`}
              >
                {/* Event Cover Image & MCU Badge */}
                <div className="relative h-48 w-full overflow-hidden bg-black/60 shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D1A] via-black/40 to-transparent z-10" />
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                    loading="lazy"
                  />

                  {/* Badges Top Left */}
                  <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                    <span className="px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase rounded bg-marvel-red text-white shadow-[0_0_10px_#ED1D24] font-excon-black">
                      ⚡ {item.hero}
                    </span>
                    <span className="px-2 py-0.5 text-[8px] font-bold text-arc-cyan bg-black/80 rounded border border-arc-cyan/30 uppercase tracking-wider font-mono">
                      {item.subtitle}
                    </span>
                  </div>

                  {/* Scope & Format Tag Top Right */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full font-excon-bold border ${
                        item.type === "squad"
                          ? "bg-arc-cyan/20 text-arc-cyan border-arc-cyan/40"
                          : "bg-white/10 text-white/80 border-white/20"
                      }`}
                    >
                      {item.type === "squad" ? (item.maxTeamSize || item.max_team_size ? `👥 Squad (${item.maxTeamSize || item.max_team_size}P)` : "👥 Squad") : "👤 Solo"}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full font-excon-black border ${
                        isSchool
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : "bg-metallic-gold/20 text-metallic-gold border-metallic-gold/40"
                      }`}
                    >
                      {isSchool ? "🎒 School" : "🎓 College"}
                    </span>
                  </div>
                </div>

                {/* Mission Details */}
                <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between bg-[#0A0D1A] relative z-20 font-excon">
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-white/60">
                      <span className="text-metallic-gold uppercase font-bold font-excon-bold tracking-wider">{item.category}</span>
                      <span className="text-arc-cyan font-bold font-excon-bold tracking-wider">{item.level}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-metallic-gold transition-colors duration-300 line-clamp-1 tracking-tight uppercase font-excon-black">
                      {item.title}
                    </h3>

                    <p className="text-xs text-white/70 line-clamp-2 leading-relaxed font-excon">
                      {item.description}
                    </p>

                    {/* Stats & Key Details */}
                    <div className="space-y-1.5 text-xs text-white/70 font-excon pt-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <RiTrophyLine className="text-metallic-gold text-base shrink-0" />
                          <span>
                            Prize Pool:{" "}
                            <strong className="text-white font-black font-excon-black">
                              {item.slug === "school-stark-expo" || item.prizePool === null
                                ? "No Prize Pool (Free Expo)"
                                : typeof item.prizePool === "number"
                                ? `₹${item.prizePool.toLocaleString("en-IN")}`
                                : item.prizePool}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-arc-cyan">
                          <RiTicketLine className="shrink-0" />
                          <span className="font-mono">{feeDisplay}</span>
                        </div>
                      </div>

                      {item.slug === "school-stark-expo" && (
                        <div className="p-2.5 rounded-xl bg-arc-cyan/10 border border-arc-cyan/30 text-[11px] text-arc-cyan leading-snug space-y-1">
                          <p className="font-bold text-white">
                            ✨ Free Experiential Exhibition (Not a Competition)
                          </p>
                          <p className="text-[10px] text-white/75 font-mono">
                            Domains: AI • IoT • Science • Biology • Psychology
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <RiMapPinLine className="text-arc-cyan text-base shrink-0" />
                        <span className="truncate font-medium">{item.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RiTimeLine className="text-marvel-red text-base shrink-0" />
                        <span className="font-medium">{item.time}</span>
                      </div>
                    </div>

                    {/* Event In-Charge & Committee Contact Panel */}
                    <div className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-arc-cyan/40 rounded-2xl p-3 my-2 space-y-2 transition-all shadow-inner">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <RiShieldUserLine className="text-arc-cyan text-xs shrink-0" />
                        <span className="text-[10px] uppercase font-bold text-arc-cyan tracking-wider font-space truncate">
                          In-Charge &amp; Committee
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate font-excon-bold">
                            {item.coordinator?.name || "Event In-Charge"}
                          </p>
                          {item.coordinator?.phone && (
                            <p className="text-[11px] font-mono text-white/70 tracking-wide mt-0.5">
                              {item.coordinator.phone}
                            </p>
                          )}
                        </div>

                        {item.coordinator?.phone && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={`tel:${item.coordinator.phone.replace(/[^0-9+]/g, "")}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg bg-arc-cyan/15 hover:bg-arc-cyan text-arc-cyan hover:text-black transition-all border border-arc-cyan/30"
                              title={`Call ${item.coordinator.name}`}
                              aria-label={`Call ${item.coordinator.name}`}
                            >
                              <RiPhoneLine size={13} />
                            </a>
                            <a
                              href={`https://wa.me/${item.coordinator.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black transition-all border border-emerald-500/30"
                              title={`WhatsApp ${item.coordinator.name}`}
                              aria-label={`WhatsApp ${item.coordinator.name}`}
                            >
                              <RiWhatsappLine size={13} />
                            </a>
                          </div>
                        )}
                      </div>

                      {item.coordinator?.team && item.coordinator.team.length > 0 && (
                        <div className="text-[9px] text-white/50 border-t border-white/5 pt-1.5 flex items-center justify-between font-space">
                          <span>Committee Team: {item.coordinator.team.length} Active Leads</span>
                          <span className="text-arc-cyan font-bold">Coordination Desk</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3.5 border-t border-white/10 flex items-center justify-between gap-2 mt-3">
                    <Link
                      to={`/events/${item.slug || item._id}`}
                      className="text-[11px] sm:text-xs font-bold text-arc-cyan hover:text-white transition-colors tracking-wider uppercase flex items-center gap-1 font-excon-bold min-w-0"
                    >
                      <span className="truncate">Rules &amp; Briefing</span>
                      <RiArrowRightLine className="shrink-0" />
                    </Link>
                    {item.externalRegistrationUrl || item.slug === "vibe-coding-hackathon" ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleInCart(item.slug || item._id || item.id)}
                          className={`text-[10px] font-black px-3 py-1.5 rounded-full transition-all uppercase tracking-wider font-excon-black whitespace-nowrap ${cartKeys.includes(String(item.slug || item._id || item.id)) ? "bg-emerald-400 text-black" : "bg-metallic-gold text-black hover:bg-white"}`}
                        >
                          {cartKeys.includes(String(item.slug || item._id || item.id)) ? "✓ In Checkout" : "+ Add to Checkout"}
                        </button>
                        <a
                          href={item.externalRegistrationUrl || "https://hackathon.macfast.org/"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] sm:text-[11px] font-black text-black bg-arc-cyan px-4 py-1.5 rounded-full hover:bg-white transition-all uppercase tracking-wider shadow-[0_0_12px_#00D4FF] font-excon-black text-center whitespace-nowrap inline-flex items-center gap-1"
                        >
                          <span>Register ↗</span>
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleInCart(item.slug || item._id || item.id)}
                          className={`text-[10px] sm:text-[11px] font-black px-3 py-1.5 rounded-full transition-all uppercase tracking-wider font-excon-black whitespace-nowrap ${cartKeys.includes(String(item.slug || item._id || item.id)) ? "bg-emerald-400 text-black" : "bg-metallic-gold text-black hover:bg-white"}`}
                        >
                          {cartKeys.includes(String(item.slug || item._id || item.id)) ? "✓ In Checkout" : "+ Add to Checkout"}
                        </button>
                        <Link
                          to={`/events/${item.slug || item._id}`}
                          className="text-[10px] sm:text-[11px] font-black text-black bg-arc-cyan px-4 py-1.5 rounded-full hover:bg-white transition-all uppercase tracking-wider shadow-[0_0_12px_#00D4FF] font-excon-black text-center whitespace-nowrap"
                        >
                          Join Mission
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
      {cartEvents.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-5xl mx-auto p-3 sm:p-4 rounded-2xl bg-[#0A0D1A]/95 border border-metallic-gold/50 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs sm:text-sm text-metallic-gold font-black font-mono text-center">⚡ {cartEvents.length} Missions in Checkout · Total: ₹{cartTotal.toLocaleString("en-IN")}</span>
          <div className="flex items-center gap-2">
            <Link to="/checkout" className="px-4 py-2 rounded-xl bg-metallic-gold text-black text-[10px] font-black uppercase font-mono">Proceed to Checkout →</Link>
            <button type="button" onClick={clearCart} className="px-3 py-2 rounded-xl bg-white/10 text-white/70 text-[10px] font-black uppercase font-mono">Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}
