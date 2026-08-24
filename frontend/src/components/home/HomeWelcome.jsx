import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiShieldFlashLine,
  RiTrophyLine,
  RiTeamLine,
  RiFlashlightLine,
} from "react-icons/ri";
import { BRAND, formatFestDateRange } from "../../utils/brand";
import { MF1_MARVEL } from "../../utils/assets";

const STATS = [
  { value: "26+", label: "Events", icon: <RiTrophyLine />, color: "#FFD700" },
  { value: "5000+", label: "Participants", icon: <RiTeamLine />, color: "#00D4FF" },
  { value: "20L+", label: "Prize Pool", icon: <RiFlashlightLine />, color: "#ED1D24" },
  { value: "100%", label: "Fest Experience", icon: <RiShieldFlashLine />, color: "#7B2FBE" },
];

export default function HomeWelcome({ settings }) {
  const festName = (settings?.fest_name || BRAND.festName || "MACFIESTA").toUpperCase();
  const college = settings?.college_name || BRAND.collegeName;
  const venue = settings?.venue || BRAND.venue;
  const dateLabel = settings?.fest_date_display || formatFestDateRange();

  return (
    <section
      id="about"
      style={{
        position: "relative",
        padding: "90px 24px",
        borderTop: "1px solid rgba(237, 29, 36, 0.2)",
        background: "transparent",
        overflow: "hidden",
      }}
      aria-labelledby="welcome-title"
    >
      {/* City background texture */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.15, pointerEvents: "none" }}>
        <img
          src={MF1_MARVEL.cityNeverSleeps}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(1.1) contrast(1.2)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #05050A 0%, transparent 40%, transparent 60%, #05050A 100%)" }} />
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "48px", alignItems: "center" }}>

          {/* Left Briefing */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 18px",
                borderRadius: "50px",
                border: "1px solid rgba(0, 212, 255, 0.3)",
                background: "rgba(0, 212, 255, 0.1)",
                color: "#00D4FF",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                width: "fit-content",
                boxShadow: "0 0 15px rgba(0,212,255,0.2)",
              }}
            >
              <RiShieldFlashLine style={{ animation: "pulse 2s infinite" }} />
              <span>ABOUT THE FEST</span>
            </div>

            <h2
              id="welcome-title"
              style={{
                fontSize: "clamp(2.2rem, 5.5vw, 3.8rem)",
                fontWeight: "900",
                textTransform: "uppercase",
                margin: 0,
                color: "#FFFFFF",
                fontFamily: "var(--font-excon-black)",
                lineHeight: "1.05",
                letterSpacing: "-0.01em",
              }}
            >
              Where Heroes <br />
              <span style={{ color: "#00D4FF" }}>Assemble</span> &amp;{" "}
              <span style={{ background: "linear-gradient(135deg, #FFD700, #ED1D24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Dominate
              </span>
            </h2>

            <p style={{ fontSize: "15px", color: "rgba(255, 255, 255, 0.85)", lineHeight: "1.7", margin: 0 }}>
              MacFiesta is the premier national inter-collegiate festival hosted by {college}, bringing together thousands of delegates across technology, culture, management, and sports.
            </p>

            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.75)", lineHeight: "1.7", margin: 0 }}>
              Over 2 action-packed days, delegates from across the country gather at{" "}
              <strong style={{ color: "#00D4FF" }}>{festName}</strong> to compete for glory, honor, trophies, and massive prize pools.
            </p>

            {/* Quick Meta Info */}
            <div style={{ display: "flex", gap: "24px", paddingTop: "8px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div>
                <span style={{ display: "block", fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>When</span>
                <strong style={{ fontSize: "13px", color: "#FFD700" }}>{dateLabel}</strong>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Where</span>
                <strong style={{ fontSize: "13px", color: "#00D4FF" }}>{venue}</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", paddingTop: "8px" }}>
              <Link
                to="/events"
                style={{
                  padding: "12px 24px",
                  borderRadius: "50px",
                  background: "#FFD700",
                  color: "#000000",
                  fontSize: "12px",
                  fontWeight: "900",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  boxShadow: "0 0 20px rgba(255, 215, 0, 0.4)",
                }}
              >
                Explore Events
              </Link>
              <Link
                to="/register"
                style={{
                  padding: "12px 24px",
                  borderRadius: "50px",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  background: "rgba(255, 255, 255, 0.06)",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: "800",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Register Now
              </Link>
            </div>
          </motion.div>

          {/* Right 4 Counter Grid Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            {STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, borderColor: stat.color }}
                style={{
                  background: "rgba(10, 14, 26, 0.88)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "28px 20px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                  transition: "all 0.3s",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    color: stat.color,
                    boxShadow: `0 0 20px ${stat.color}30`,
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                      fontWeight: "900",
                      color: "#FFFFFF",
                      fontFamily: "var(--font-excon-black)",
                      lineHeight: "1",
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "#00D4FF",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      marginTop: "6px",
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
