import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { RiMapPinLine, RiTimeLine, RiArrowRightLine, RiFlashlightLine } from "react-icons/ri";

const typeColors = {
  General:    { bg: "rgba(0,212,255,0.15)",   text: "#00D4FF",  border: "rgba(0,212,255,0.3)"   },
  Gaming:     { bg: "rgba(123,47,190,0.15)",  text: "#B55FE6",  border: "rgba(123,47,190,0.3)"  },
  Technical:  { bg: "rgba(255,215,0,0.15)",   text: "#FFD700",  border: "rgba(255,215,0,0.3)"   },
  Management: { bg: "rgba(237,29,36,0.15)",   text: "#ED1D24",  border: "rgba(237,29,36,0.3)"   },
  Cultural:   { bg: "rgba(123,47,190,0.15)",  text: "#B55FE6",  border: "rgba(123,47,190,0.3)"  },
};

const SCHEDULE_DATA = {
  day1: [
    { time: "10:00 AM", title: "College & School Missions Kickoff", venue: "All Labs & Arenas", type: "Technical" },
    { time: "04:30 PM", title: "Cultural Events Official Opening", venue: "Main Stage Arena", type: "Cultural" },
    { time: "04:45 PM", title: "Grand Welcome Dance & Cultural Contests", venue: "Main Stage Arena", type: "Cultural" },
    { time: "07:00 PM", title: "Food Break & Refreshment Zone", venue: "Food Pavilion", type: "General" },
    { time: "08:00 PM", title: "College Band Live Performance", venue: "Main Stage Arena", type: "Cultural" },
  ],
  day2: [
    { time: "10:00 AM", title: "Semi-Finals & Stark Expo Showcase", venue: "Stark Labs & Grounds", type: "Technical" },
    { time: "03:30 PM", title: "Grand Superhero Fashion Show", venue: "Main Stage Arena", type: "Cultural" },
    { time: "07:00 PM", title: "Food Break & Gala Refreshments", venue: "Food Pavilion", type: "General" },
    { time: "07:30 PM", title: "Grand Band Performance & Concert", venue: "Athletic Grounds", type: "Cultural" },
  ],
};

export default function HomeSchedulePreview() {
  const [activeDay, setActiveDay] = useState("day1");

  return (
    <section
      id="schedule"
      style={{
        position: "relative",
        padding: "80px 24px",
        borderTop: "1px solid rgba(255, 215, 0, 0.2)",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 18px",
              borderRadius: "50px",
              border: "1px solid rgba(255, 215, 0, 0.3)",
              background: "rgba(255, 215, 0, 0.1)",
              color: "#FFD700",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "16px",
              boxShadow: "0 0 15px rgba(255,215,0,0.2)",
            }}
          >
            <RiFlashlightLine />
            <span>EVENT SCHEDULE</span>
          </div>

          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3.4rem)",
              fontWeight: "900",
              textTransform: "uppercase",
              color: "#FFFFFF",
              margin: "0 0 12px",
              fontFamily: "var(--font-excon-black)",
              letterSpacing: "0.02em",
            }}
          >
            Festival <span style={{ color: "#00D4FF" }}>Schedule</span>
          </h2>

          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.75)", lineHeight: "1.6" }}>
            2 Days of parallel tactical operations across Stark Labs, Main Arena, and Esports pavilions.
          </p>

          {/* Day Tabs */}
          <div style={{ display: "inline-flex", gap: "10px", marginTop: "20px", background: "rgba(0,0,0,0.6)", padding: "6px", borderRadius: "50px", border: "1px solid rgba(255,255,255,0.15)" }}>
            <button
              type="button"
              onClick={() => setActiveDay("day1")}
              style={{
                padding: "8px 22px",
                borderRadius: "50px",
                fontSize: "12px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                border: "none",
                cursor: "pointer",
                background: activeDay === "day1" ? "#ED1D24" : "transparent",
                color: activeDay === "day1" ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                boxShadow: activeDay === "day1" ? "0 0 15px rgba(237,29,36,0.6)" : "none",
                transition: "all 0.2s",
              }}
            >
              Day 01 — 24 Sep
            </button>

            <button
              type="button"
              onClick={() => setActiveDay("day2")}
              style={{
                padding: "8px 22px",
                borderRadius: "50px",
                fontSize: "12px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                border: "none",
                cursor: "pointer",
                background: activeDay === "day2" ? "#ED1D24" : "transparent",
                color: activeDay === "day2" ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                boxShadow: activeDay === "day2" ? "0 0 15px rgba(237,29,36,0.6)" : "none",
                transition: "all 0.2s",
              }}
            >
              Day 02 — 25 Sep
            </button>
          </div>
        </div>

        {/* Schedule List */}
        <div style={{ borderLeft: "2px solid rgba(0, 212, 255, 0.3)", marginLeft: "16px", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {SCHEDULE_DATA[activeDay].map((slot, idx) => {
                const tc = typeColors[slot.type] || typeColors.General;
                return (
                  <motion.div
                    key={slot.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    style={{ position: "relative" }}
                  >
                    {/* Node Dot */}
                    <div
                      style={{
                        position: "absolute",
                        left: "-33px",
                        top: "16px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        border: `2px solid ${tc.text}`,
                        background: "#05050A",
                        boxShadow: `0 0 10px ${tc.text}`,
                      }}
                    />

                    <div
                      style={{
                        background: "rgba(10, 14, 26, 0.9)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "16px",
                        padding: "16px 20px",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <RiTimeLine style={{ color: "#00D4FF", fontSize: "14px" }} />
                          <span style={{ color: "#FFD700", fontSize: "12px", fontWeight: "700" }}>{slot.time}</span>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: tc.bg,
                              color: tc.text,
                              border: `1px solid ${tc.border}`,
                              fontSize: "9px",
                              fontWeight: "800",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                            }}
                          >
                            {slot.type}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "900",
                            color: "#FFFFFF",
                            margin: 0,
                            fontFamily: "var(--font-excon-black)",
                            textTransform: "uppercase",
                          }}
                        >
                          {slot.title}
                        </h3>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
                        <RiMapPinLine style={{ color: "#00D4FF" }} />
                        <span style={{ fontWeight: "700" }}>{slot.venue}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* View Full Timeline Link */}
        <div style={{ textAlign: "center", marginTop: "36px" }}>
          <Link
            to="/schedule"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#00D4FF",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            <span>Open Full Interactive Timeline</span>
            <RiArrowRightLine />
          </Link>
        </div>

      </div>
    </section>
  );
}
