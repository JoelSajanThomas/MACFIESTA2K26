import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  RiFlashlightLine,
  RiTrophyLine,
  RiMapPinLine,
  RiTimeLine,
  RiArrowRightLine,
} from "react-icons/ri";

const FEATURED_MISSIONS = [
  {
    title: "24H Hackathon — Code Warfare",
    slug: "avengers-code-assemble",
    hero: "Technical",
    powerRating: "Prize: ₹35,000",
    level: "Flagship Event",
    category: "Technical",
    reward: "₹35,000",
    venue: "Main Hall / CS Block",
    time: "Day 1, 10:00 AM",
    image: "/MARVEL/4081455907815375.png",
    characterImg: "/MARVEL/4081455907815375.png",
    accentColor: "#ED1D24",
    borderClass: "border-marvel-red/40 hover:border-marvel-red hover:shadow-[0_0_40px_rgba(237,29,36,0.45)]",
  },
  {
    title: "Esports Gaming Arena (BGMI & Valorant)",
    slug: "battle-of-wakanda",
    hero: "Gaming",
    powerRating: "Prize: ₹40,000",
    level: "Grand Finale",
    category: "Gaming",
    reward: "₹40,000",
    venue: "Esports Hall",
    time: "Day 1, 11:30 AM",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    characterImg: "/MARVEL/3025924746959430.jpg",
    accentColor: "#00D4FF",
    borderClass: "border-arc-cyan/40 hover:border-arc-cyan hover:shadow-[0_0_40px_rgba(0,212,255,0.45)]",
  },
  {
    title: "Cultural Night — Pro-Show & Stage Events",
    slug: "choreo-verse-the-dance-battle",
    hero: "Cultural",
    powerRating: "Live Pro-Show",
    level: "Main Stage",
    category: "Cultural",
    reward: "Trophy & Pro-Show",
    venue: "Main Stage Arena",
    time: "Day 2, 6:00 PM",
    image: "/MARVEL/Doctor Strange.png",
    characterImg: "/MARVEL/Doctor Strange.png",
    accentColor: "#FFD700",
    borderClass: "border-metallic-gold/40 hover:border-metallic-gold hover:shadow-[0_0_40px_rgba(255,215,0,0.45)]",
  },
  {
    title: "Quantum Coding Combat — Speed Programming",
    slug: "the-flash-code-rush",
    hero: "Technical",
    powerRating: "Prize: ₹25,000",
    level: "Open Category",
    category: "General",
    reward: "₹25,000",
    venue: "Main Lab / CS Dept",
    time: "Day 1, 02:00 PM",
    image: "/MARVEL/Spider-man.png",
    characterImg: "/MARVEL/Spider-man.png",
    accentColor: "#ED1D24",
    borderClass: "border-marvel-red/40 hover:border-marvel-red hover:shadow-[0_0_40px_rgba(237,29,36,0.45)]",
  },
];

export default function HomeFeaturedMissions() {
  return (
    <section
      id="events"
      style={{
        position: "relative",
        padding: "80px 24px",
        borderTop: "1px solid rgba(0, 212, 255, 0.15)",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px", gap: "20px" }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 16px",
                borderRadius: "50px",
                border: "1px solid rgba(0, 212, 255, 0.3)",
                background: "rgba(0, 212, 255, 0.1)",
                color: "#00D4FF",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: "12px",
                boxShadow: "0 0 15px rgba(0, 212, 255, 0.2)",
              }}
            >
              <RiFlashlightLine />
              <span>MACFIESTA FEATURED EVENTS</span>
            </div>

            <h2
              style={{
                fontSize: "clamp(2rem, 5vw, 3.2rem)",
                fontWeight: "900",
                textTransform: "uppercase",
                margin: "0 0 8px",
                color: "#FFFFFF",
                fontFamily: "var(--font-excon-black)",
                letterSpacing: "0.02em",
              }}
            >
              Featured <span style={{ color: "#00D4FF" }}>Events</span>
            </h2>

            <div style={{ height: "2px", width: "96px", background: "linear-gradient(90deg, #ED1D24, #00D4FF)" }} />
          </div>

          <Link
            to="/events"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "50px",
              border: "1px solid rgba(0, 212, 255, 0.4)",
              background: "rgba(0, 212, 255, 0.08)",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
              boxShadow: "0 0 15px rgba(0, 212, 255, 0.2)",
              transition: "all 0.2s",
            }}
          >
            <span>View All 26 Events</span>
            <RiArrowRightLine />
          </Link>
        </div>

        {/* Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {FEATURED_MISSIONS.map((m, idx) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
              style={{
                background: "rgba(10, 13, 26, 0.92)",
                border: `1px solid ${m.accentColor}40`,
                borderRadius: "20px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              }}
            >
              {/* Top accent beam */}
              <div style={{ height: "2px", width: "100%", background: `linear-gradient(90deg, transparent, ${m.accentColor}, transparent)` }} />

              {/* Cover Image Container */}
              <div style={{ position: "relative", height: "190px", overflow: "hidden", background: "#000" }}>
                <img
                  src={m.image}
                  alt={m.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(1.1) contrast(1.2)" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(10, 13, 26, 0.95) 100%)" }} />

                {/* Hero Badge */}
                <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: m.accentColor,
                      color: m.accentColor === "#FFD700" ? "#000000" : "#FFFFFF",
                      fontSize: "10px",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      boxShadow: `0 0 12px ${m.accentColor}`,
                    }}
                  >
                    🦸 {m.hero}
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(0, 212, 255, 0.3)",
                      color: "#00D4FF",
                      fontSize: "9px",
                      fontWeight: "700",
                    }}
                  >
                    {m.powerRating}
                  </span>
                </div>

                {/* Avatar Icon */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "-20px",
                    right: "16px",
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    overflow: "hidden",
                    background: "#000",
                    boxShadow: "0 0 20px rgba(0,0,0,0.8)",
                    zIndex: 10,
                  }}
                >
                  <img src={m.characterImg} alt={m.hero} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }} />
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: "28px 20px 20px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ color: "#FFD700", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {m.category}
                    </span>
                    <span style={{ color: "#00D4FF", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", paddingRight: "54px" }}>
                      {m.level}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "900",
                      color: "#FFFFFF",
                      margin: "0 0 14px",
                      textTransform: "uppercase",
                      lineHeight: "1.3",
                      fontFamily: "var(--font-excon-black)",
                    }}
                  >
                    {m.title}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "rgba(255, 255, 255, 0.7)", marginBottom: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <RiTrophyLine style={{ color: "#FFD700" }} />
                      <span>Reward Pool: <strong style={{ color: "#FFFFFF", fontWeight: "800" }}>{m.reward}</strong></span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <RiMapPinLine style={{ color: "#00D4FF" }} />
                      <span>{m.venue}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <RiTimeLine style={{ color: "#ED1D24" }} />
                      <span>{m.time}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px" }}>
                  <Link
                    to={`/events/${m.slug}`}
                    style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "#00D4FF",
                      textDecoration: "none",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>View Details</span>
                    <RiArrowRightLine />
                  </Link>

                  <Link
                    to="/register"
                    style={{
                      padding: "6px 14px",
                      borderRadius: "50px",
                      background: "#ED1D24",
                      color: "#FFFFFF",
                      fontSize: "10px",
                      fontWeight: "900",
                      textDecoration: "none",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      boxShadow: "0 0 12px #ED1D24",
                    }}
                  >
                    Register Now
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
