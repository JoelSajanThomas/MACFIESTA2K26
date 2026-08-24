import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiMegaphoneLine,
  RiShieldFlashLine,
  RiTimeLine,
  RiAlertLine,
  RiSearchLine,
  RiCalendarEventLine,
  RiUserStarLine,
  RiCompass3Line,
  RiArrowRightLine,
  RiBroadcastLine,
} from "react-icons/ri";
import { BackgroundVideo } from "../components/ui/BackgroundVideo";
import { getAnnouncements } from "../services/api";
import {
  isUsingPlaceholders,
  resolveAnnouncements,
  getLastUpdated,
  formatAnnouncementDate,
} from "../utils/announcementUtils";
import { usePageSeo } from "../hooks/usePageSeo";

const FILTER_TABS = [
  { id: "all", label: "All Transmissions", icon: RiBroadcastLine },
  { id: "urgent", label: "Urgent Alerts", icon: RiAlertLine },
  { id: "schedule", label: "Schedule & Venues", icon: RiCalendarEventLine },
  { id: "guests", label: "VIP & Guests", icon: RiUserStarLine },
  { id: "registration", label: "Registrations", icon: RiCompass3Line },
];

export default function Announcements() {
  usePageSeo({
    title: "Official Announcements · MacFiesta 2026",
    description: "Real-time tactical mission updates, venue schedules, guest sessions, and registration alerts for MacFiesta 2026.",
  });

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  function load() {
    setLoading(true);
    setError("");
    getAnnouncements()
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setAnnouncements(raw);
      })
      .catch(() => setError("Could not load transmissions from S.H.I.E.L.D. HQ."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const rawItems = useMemo(() => resolveAnnouncements(announcements), [announcements]);
  const usingPlaceholders = isUsingPlaceholders(announcements);
  const lastUpdated = getLastUpdated(rawItems);

  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const message = (item.message || "").toLowerCase();
      const q = search.toLowerCase();

      const matchesSearch = title.includes(q) || message.includes(q);

      let matchesCategory = true;
      const isUrgent =
        item.priority === "urgent" ||
        item.is_urgent === true ||
        /urgent|emergency|critical|breaking|alert/i.test(title);

      if (selectedFilter === "urgent") {
        matchesCategory = isUrgent;
      } else if (selectedFilter === "schedule") {
        matchesCategory = /schedule|venue|stage|timing|slot|map/i.test(title + " " + message);
      } else if (selectedFilter === "guests") {
        matchesCategory = /guest|vip|celebrity|sayip|artist|speaker|pro-show/i.test(title + " " + message);
      } else if (selectedFilter === "registration") {
        matchesCategory = /registration|register|entry|pass|ticket|fee|desk/i.test(title + " " + message);
      }

      return matchesSearch && matchesCategory;
    });
  }, [rawItems, search, selectedFilter]);

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-20 text-white font-excon relative overflow-hidden">
      {/* Background Marvel Video Loop */}
      <BackgroundVideo
        src="/MARVEL/Video Project 4.mp4"
        fallbackSrc="/MARVEL/Video Project 6.mp4"
        opacity="opacity-75"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 relative z-10">
        
        {/* Header Briefing Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. TACTICAL TRANSMISSIONS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">OFFICIAL</span>{" "}
            <span className="gradient-text-gold">ANNOUNCEMENTS</span>
          </h1>

          <p className="text-sm sm:text-base text-white/70 leading-relaxed font-mono">
            Direct mission briefings, venue adjustments, celebrity arrivals, and festival alerts transmitted in real-time from the MacFiesta Command Center.
          </p>

          {lastUpdated && !loading && (
            <div className="inline-flex items-center gap-2 text-xs font-mono text-arc-cyan/80 bg-arc-cyan/10 px-3.5 py-1 rounded-full border border-arc-cyan/30 shadow-[0_0_10px_rgba(0,212,255,0.2)]">
              <RiTimeLine />
              <span>
                LAST TELEMETRY UPDATE:{" "}
                <strong className="text-white">
                  {formatAnnouncementDate(lastUpdated.toISOString())}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Search & Category Filter Controls */}
        <div className="glass-aurora p-4 sm:p-6 rounded-3xl border border-white/10 space-y-4 max-w-4xl mx-auto shadow-2xl">
          {/* Search Box */}
          <div className="relative">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
            <input
              type="text"
              placeholder="Search announcements, schedule changes, guest sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-black/60 border border-white/15 rounded-2xl text-white text-xs sm:text-sm placeholder:text-white/40 focus:border-arc-cyan focus:outline-none focus:ring-1 focus:ring-arc-cyan transition-all font-mono"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-metallic-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.35)]"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  <Icon className="text-sm" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Placeholder Note Banner */}
        {usingPlaceholders && !loading && !error && (
          <div className="max-w-4xl mx-auto px-4 py-3 bg-arc-cyan/10 border border-arc-cyan/30 rounded-2xl text-arc-cyan text-xs font-mono text-center shadow-[0_0_15px_rgba(0,212,255,0.15)] flex items-center justify-center gap-2">
            <RiBroadcastLine className="animate-pulse" />
            <span>Standby Broadcast: Showing verified preview alerts until live coordinator announcements stream.</span>
          </div>
        )}

        {/* Loading / Error States */}
        {loading && (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-arc-cyan border-t-transparent animate-spin shadow-[0_0_20px_#00D4FF]" />
            <p className="text-xs font-mono uppercase tracking-widest text-arc-cyan animate-pulse">
              Decryping S.H.I.E.L.D. Quantum Transmission...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="max-w-md mx-auto p-6 rounded-3xl bg-rose-950/40 border border-rose-500/40 text-center space-y-4 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
            <RiAlertLine className="text-4xl text-rose-400 mx-auto" />
            <p className="text-sm font-bold text-rose-300">{error}</p>
            <button
              onClick={load}
              className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Announcements List Grid */}
        {!loading && !error && (
          <div className="max-w-4xl mx-auto space-y-5">
            {filteredItems.length === 0 ? (
              <div className="glass-aurora p-12 rounded-3xl border border-white/10 text-center space-y-4">
                <RiMegaphoneLine className="text-5xl text-white/30 mx-auto" />
                <h3 className="text-lg font-bold text-white font-excon-black uppercase">No Announcements Found</h3>
                <p className="text-xs text-white/60 font-mono max-w-sm mx-auto">
                  No transmissions match your active filters or search terms.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedFilter("all");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-metallic-gold text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const urgent =
                  item.priority === "urgent" ||
                  item.is_urgent === true ||
                  /urgent|emergency|critical|breaking|alert/i.test(String(item.title || ""));

                return (
                  <motion.article
                    key={item.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 space-y-4 backdrop-blur-xl transition-all duration-300 group hover:-translate-y-1 ${
                      urgent
                        ? "bg-rose-950/30 border-rose-500/40 shadow-[0_0_35px_rgba(244,63,94,0.15)] hover:border-rose-400"
                        : "bg-black/70 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-arc-cyan/40 hover:shadow-[0_0_35px_rgba(0,212,255,0.15)]"
                    }`}
                  >
                    {/* Top Status Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 font-mono ${
                            urgent
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                              : "bg-arc-cyan/15 text-arc-cyan border border-arc-cyan/30"
                          }`}
                        >
                          {urgent ? (
                            <>
                              <RiAlertLine className="animate-pulse text-xs" />
                              <span>CRITICAL ALERT</span>
                            </>
                          ) : (
                            <>
                              <RiBroadcastLine className="text-xs" />
                              <span>MISSION UPDATE</span>
                            </>
                          )}
                        </span>

                        <span className="text-[11px] font-mono text-white/50">
                          TRANSMISSION #{String(idx + 1).padStart(3, "0")}
                        </span>
                      </div>

                      {item.created_at && (
                        <span className="text-xs font-mono text-white/60 flex items-center gap-1.5">
                          <RiTimeLine className="text-metallic-gold" />
                          <span>{formatAnnouncementDate(item.created_at)}</span>
                        </span>
                      )}
                    </div>

                    {/* Announcement Content */}
                    <div className="space-y-2">
                      <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-excon-black tracking-tight group-hover:text-metallic-gold transition-colors">
                        {item.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-mono">
                        {item.message}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <span className="text-white/40 font-mono text-[11px]">
                        AUTHORIZED BY S.H.I.E.L.D. MISSION CONTROL
                      </span>

                      <Link
                        to="/events"
                        className="inline-flex items-center gap-1.5 text-metallic-gold hover:text-white font-bold tracking-wider uppercase transition-colors"
                      >
                        <span>Explore Fest Events</span>
                        <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.article>
                );
              })
            )}
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className="max-w-4xl mx-auto glass-aurora p-8 rounded-3xl border border-metallic-gold/30 text-center space-y-4 shadow-[0_0_40px_rgba(212,175,55,0.15)]">
          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-excon-black">
            STAY TUNED FOR THE <span className="gradient-text-gold">GRAND FINALE</span>
          </h3>
          <p className="text-xs sm:text-sm text-white/70 font-mono max-w-xl mx-auto">
            Real-time stage calls, round announcements, and leaderboard postings will update live during MacFiesta on 24–25 September 2026.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              to="/schedule"
              className="px-6 py-3 rounded-xl bg-metallic-gold hover:bg-white text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all flex items-center gap-2"
            >
              <RiCalendarEventLine className="text-base" /> Full Fest Schedule
            </Link>
            <Link
              to="/events"
              className="px-6 py-3 rounded-xl bg-black/60 hover:bg-white/10 text-white border border-white/20 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <RiCompass3Line className="text-base" /> Browse 23 Missions
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
