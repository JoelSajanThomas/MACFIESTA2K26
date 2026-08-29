import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiTimeLine,
  RiMapPinLine,
  RiRadarLine,
} from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";
import { getEvents } from "../services/api";

const defaultTimelineEvents = {
  day1: [
    {
      time: "10:00 AM onwards",
      title: "College & School Missions Initialization",
      stage: "All Labs & Grounds",
      cat: "General",
      desc: "Simultaneous kickoff of 14 College Competitions & 9 School Showcases across Coding, Gaming, Shark Tank, and Detective Hunts."
    },
    {
      time: "04:30 PM",
      title: "Cultural Events Officially Commence",
      stage: "Main Stage Arena",
      cat: "Cultural",
      desc: "The evening festival officially begins with dignitary protocols, light ignition, and ceremonial flag-off."
    },
    {
      time: "04:45 PM - 07:00 PM",
      title: "Opening Program & Welcome Dance",
      stage: "Main Stage Arena",
      cat: "Cultural",
      desc: "Opening: Program begins with an electrifying Welcome Dance performance followed by stage competitions."
    },
    {
      time: "07:00 PM - 07:30 PM",
      title: "Food Break & Refreshment Zone",
      stage: "Food Pavilion",
      cat: "General",
      desc: "Dinner break, multi-cuisine food trucks, and networking across festival dining arenas."
    },
    {
      time: "08:00 PM - 09:30 PM",
      title: "College Band Performance",
      stage: "Main Stage Arena",
      cat: "Cultural",
      desc: "High-voltage live rock, fusion, and popular soundtracks performed live by the premier College Band."
    },
  ],
  day2: [
    {
      time: "10:00 AM - 02:30 PM",
      title: "Mission Finales & Stark Expo Showcase",
      stage: "Stark Labs & Auditorium",
      cat: "Technical",
      desc: "Championship rounds, Hackathon prototype juries, BGMI final lobby, and Stark School Expo exhibits."
    },
    {
      time: "03:30 PM - 06:00 PM",
      title: "Grand Fashion Show",
      stage: "Main Stage Arena",
      cat: "Cultural",
      desc: "Spectacular designer runway battle featuring superhero themes, haute couture, and dynamic choreography."
    },
    {
      time: "07:00 PM - 07:30 PM",
      title: "Food Break & Gala Refreshments",
      stage: "Food Pavilion",
      cat: "General",
      desc: "Evening break and festival refreshments before the headline concert."
    },
    {
      time: "07:30 PM - 10:00 PM",
      title: "Grand Band Performance & Concert",
      stage: "Athletic Grounds",
      cat: "Cultural",
      desc: "Headlining celebrity band performance and electrifying festival pro-show closing."
    },
  ]
};

export default function Schedule() {
  const [activeDay, setActiveDay] = useState("day1");
  const [stageFilter, setStageFilter] = useState("all");
  const [timeline, setTimeline] = useState(defaultTimelineEvents);

  usePageSeo({
    title: "Mission Timeline · MacFiesta 2026",
    description: "Track real-time parallel operations across Avengers Command venues.",
  });

  useEffect(() => {
    getEvents()
      .then((res) => {
        const eventsList = Array.isArray(res.data)
          ? res.data
          : res.data?.events || res.data?.results || [];

        if (Array.isArray(eventsList) && eventsList.length > 0) {
          const day1Items = [];
          const day2Items = [];

          eventsList.forEach((evt) => {
            const isDay2 = evt.event_date === "2026-09-25" || (evt.date && evt.date.includes("25"));
            const targetList = isDay2 ? day2Items : day1Items;

            targetList.push({
              time: evt.event_time ? `${evt.event_time}` : (evt.time || "10:00 AM onwards"),
              title: evt.title,
              stage: evt.venue || (evt.audience === "school" ? "School Arena" : "Main Campus Labs"),
              cat: evt.category || "Technical",
              desc: evt.description || "Official championship round and tournament showcase.",
            });
          });

          setTimeline({ day1: day1Items, day2: day2Items });
        }
      })
      .catch(() => {});
  }, []);

  const filteredTimeline = (timeline[activeDay] || []).filter((item) => {
    return stageFilter === "all" || item.stage.toLowerCase().includes(stageFilter.toLowerCase());
  });

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-excon relative overflow-hidden">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/download.jpg"
          alt="Marvel Schedule Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        {/* Subtle cinematic gradient to preserve timeline readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/25 to-[#05050A]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <RiRadarLine className="animate-spin text-sm text-metallic-gold" />
            <span>S.H.I.E.L.D. TACTICAL MISSION RADAR</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">MISSION</span>{" "}
            <span className="gradient-text-gold">TIMELINE</span>
          </h1>
          <p className="text-white/80 text-xs sm:text-sm font-excon font-normal">
            Track real-time parallel operations across Avengers Command venues.
          </p>
        </div>

        {/* Tab & Filter Panel */}
        <div className="glass-aurora p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
          
          {/* Day Selector */}
          <div className="flex bg-black/50 p-1 rounded-full border border-white/10 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveDay("day1")}
              className={`flex-1 md:flex-none px-4 sm:px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all font-excon-bold ${
                activeDay === "day1"
                  ? "bg-marvel-red text-white shadow-[0_0_15px_#ED1D24]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Phase 01 — 24 Sep
            </button>
            <button
              type="button"
              onClick={() => setActiveDay("day2")}
              className={`flex-1 md:flex-none px-4 sm:px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all font-excon-bold ${
                activeDay === "day2"
                  ? "bg-marvel-red text-white shadow-[0_0_15px_#ED1D24]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Phase 02 — 25 Sep
            </button>
          </div>

          {/* Arena/Stage Filters */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto select-scrollbar pb-1">
            {["all", "Labs", "Main Stage", "Food Pavilion", "Athletic"].map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => setStageFilter(stage)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all font-excon-bold ${
                  stageFilter === stage
                    ? "bg-metallic-gold text-black shadow-[0_0_12px_#FFD700]"
                    : "bg-white/5 text-white/70 hover:text-white border border-white/10"
                }`}
              >
                {stage === "all" ? "All Venues" : stage}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Flow */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-arc-cyan/30 space-y-6 sm:space-y-8 font-excon">
          <AnimatePresence mode="popLayout">
            {filteredTimeline.map((item, idx) => (
              <motion.div
                key={`${activeDay}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="relative"
              >
                {/* Glowing Node on Line */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full bg-arc-cyan shadow-[0_0_12px_#00D4FF] border-2 border-black" />

                {/* Event Card */}
                <div className="marvel-card p-4 sm:p-6 rounded-2xl border border-white/10 hover:border-arc-cyan/50 transition-colors shadow-lg bg-[#0A0D1A]/90">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2 text-metallic-gold text-xs font-bold tracking-wider font-excon-bold">
                      <RiTimeLine className="text-sm shrink-0" />
                      <span>{item.time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-arc-cyan font-mono">
                        {item.cat}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-white/60 font-medium">
                        <RiMapPinLine className="text-marvel-red text-sm shrink-0" />
                        <span>{item.stage}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 space-y-1.5">
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight font-excon-black">
                      {item.title}
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed font-excon font-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
