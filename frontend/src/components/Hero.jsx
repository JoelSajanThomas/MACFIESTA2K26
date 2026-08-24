import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiShieldFlashLine,
  RiFlashlightLine,
  RiCompass3Line,
  RiVolumeUpLine,
  RiVolumeMuteLine,
  RiArrowRightLine,
} from "react-icons/ri";
import Countdown from "./Countdown";
import { BRAND, FEST_DATE, formatFestDateRange } from "../utils/brand";
import "../styles/ref-ui-hero.css";

export default function Hero({ settings }) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  const year = settings?.fest_year || BRAND.festYear;
  const dateLabel = settings?.fest_date_display || formatFestDateRange();
  const festName = (settings?.fest_name || BRAND.festName || "MACFIESTA").toUpperCase();
  const festDate = settings?.fest_date || FEST_DATE.toISOString().slice(0, 10);
  const countdownRaw = settings?.countdown_datetime
    ? new Date(settings.countdown_datetime)
    : new Date(`${festDate}T09:00:00`);
  const countdownTargetMs = Number.isFinite(countdownRaw.getTime())
    ? countdownRaw.getTime()
    : FEST_DATE.getTime();

  const edition = String(year).replace(/^20/, "2K") || "2K26";
  const registrationOpen = settings?.registration_open !== false;

  const tickerItems = [
    "★ 26 EXCITING EVENTS",
    "★ PRIZE POOL WORTH 20 LAKHS",
    "★ HACKATHON & CODING COMBAT",
    "★ ESPORTS GAMING ARENA",
    "★ CULTURAL PRO-SHOW & STAGE EVENTS",
    "★ MANAGEMENT & ARTS COMPETITIONS",
  ];

  const toggleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3");
      audioRef.current.loop = true;
    }
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play().catch(() => { });
      setAudioPlaying(true);
    }
  };

  return (
    <section
      className="ref-hero mf-hero-cinematic mf1-hero mf1-hero--craft mf1-hero--frame-bg"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        paddingTop: "120px",
        paddingBottom: "0",
        background: "transparent",
        overflow: "hidden",
      }}
      aria-label="MacFiesta 2026 hero"
    >
      {/* Marvel Atmosphere Glows */}
      <div style={{ position: "absolute", top: "25%", left: "5%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(237, 29, 36, 0.15)", filter: "blur(140px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "30%", right: "5%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(0, 212, 255, 0.15)", filter: "blur(140px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", width: "100%", position: "relative", zIndex: 10, flexGrow: 1, display: "flex", alignItems: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "48px", alignItems: "center", width: "100%" }}>

          {/* Left Hero Briefing */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* S.H.I.E.L.D. Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 16px",
                borderRadius: "50px",
                border: "1px solid rgba(237, 29, 36, 0.4)",
                background: "rgba(237, 29, 36, 0.1)",
                color: "#ED1D24",
                fontSize: "11px",
                fontWeight: "800",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                width: "fit-content",
                boxShadow: "0 0 18px rgba(237, 29, 36, 0.35)",
              }}
            >
              <RiShieldFlashLine style={{ animation: "pulse 2s infinite" }} />
              <span>MacFiesta · MACFAST • {edition}</span>
            </motion.div>

            {/* Main Title Stack */}
            <div>
              <span
                style={{
                  display: "block",
                  color: "#00D4FF",
                  fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.25em",
                  marginBottom: "4px",
                }}
              >
                WELCOME TO
              </span>

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "12px", margin: "0" }}>
                <h1
                  style={{
                    fontSize: "clamp(3.2rem, 9vw, 6.8rem)",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    margin: 0,
                    lineHeight: 0.9,
                    color: "#FFFFFF",
                    fontFamily: "var(--font-excon-black)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {festName}
                </h1>
                <span
                  style={{
                    fontSize: "clamp(2.4rem, 6vw, 4.8rem)",
                    fontWeight: "900",
                    background: "linear-gradient(135deg, #00D4FF 0%, #ED1D24 50%, #FFD700 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 0.9,
                    fontFamily: "var(--font-excon-black)",
                  }}
                >
                  {edition}
                </span>
              </div>

              <span
                style={{
                  display: "block",
                  color: "#ED1D24",
                  fontSize: "clamp(1.4rem, 3.5vw, 2.4rem)",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  marginTop: "8px",
                  fontFamily: "var(--font-excon-black)",
                }}
              >
                National College Festival
              </span>
            </div>

            {/* Tagline */}
            <p
              style={{
                fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)",
                color: "rgba(255, 255, 255, 0.85)",
                lineHeight: "1.65",
                maxWidth: "560px",
                margin: "0",
              }}
            >
              MACFAST&apos;s premier national-level collegiate fest — where creativity meets competition. Compete across{" "}
              <strong style={{ color: "#00D4FF" }}>26 thrilling events</strong>.
            </p>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", paddingTop: "8px" }}>
              <Link
                to="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "14px 32px",
                  borderRadius: "50px",
                  background: "#ED1D24",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  textDecoration: "none",
                  boxShadow: "0 0 25px rgba(237, 29, 36, 0.6)",
                  transition: "all 0.2s",
                }}
              >
                <span>{registrationOpen ? "Register Now" : "Registration Closed"}</span>
                <RiArrowRightLine />
              </Link>

              <Link
                to="/events"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "14px 28px",
                  borderRadius: "50px",
                  border: "1px solid #00D4FF",
                  background: "rgba(0, 212, 255, 0.1)",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  textDecoration: "none",
                  boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)",
                  transition: "all 0.2s",
                }}
              >
                <RiCompass3Line style={{ color: "#00D4FF", fontSize: "16px" }} />
                <span>View Events</span>
              </Link>
            </div>
          </div>

          {/* Right S.H.I.E.L.D. Stark HUD */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                background: "rgba(10, 14, 26, 0.92)",
                border: "1px solid rgba(0, 212, 255, 0.3)",
                borderRadius: "20px",
                padding: "24px 28px",
                width: "100%",
                maxWidth: "380px",
                boxShadow: "0 0 40px rgba(0,0,0,0.8), 0 0 20px rgba(0,212,255,0.15)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              {/* Corner Tech Brackets */}
              <div style={{ position: "absolute", top: "-2px", left: "-2px", width: "16px", height: "16px", borderTop: "2px solid #00D4FF", borderLeft: "2px solid #00D4FF", borderTopLeftRadius: "6px" }} />
              <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "16px", height: "16px", borderTop: "2px solid #00D4FF", borderRight: "2px solid #00D4FF", borderTopRightRadius: "6px" }} />
              <div style={{ position: "absolute", bottom: "-2px", left: "-2px", width: "16px", height: "16px", borderBottom: "2px solid #ED1D24", borderLeft: "2px solid #ED1D24", borderBottomLeftRadius: "6px" }} />
              <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "16px", height: "16px", borderBottom: "2px solid #ED1D24", borderRight: "2px solid #ED1D24", borderBottomRightRadius: "6px" }} />

              {/* HUD Header */}
              <div style={{ textAlign: "center" }}>
                <h3
                  style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "#00D4FF",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    margin: "0 0 4px",
                  }}
                >
                  <RiFlashlightLine />
                  <span>FEST COUNTDOWN</span>
                </h3>
                <p style={{ fontSize: "12px", color: "#FFD700", fontWeight: "700", margin: 0 }}>
                  United to Excel · {dateLabel}
                </p>
              </div>

              {/* Countdown Numbers */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Countdown targetDate={countdownTargetMs} variant="hero" embedded />
              </div>

              {/* Audio HUD Equalizer Bar */}
              <button
                type="button"
                onClick={toggleAudio}
                style={{
                  paddingTop: "14px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "transparent",
                  borderLeft: "none",
                  borderRight: "none",
                  borderBottom: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(0, 212, 255, 0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#00D4FF",
                    }}
                  >
                    {audioPlaying ? <RiVolumeUpLine /> : <RiVolumeMuteLine />}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: "9px", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>
                      FEST ANTHEM
                    </p>
                    <p style={{ fontSize: "11px", fontWeight: "800", color: audioPlaying ? "#00D4FF" : "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                      {audioPlaying ? "AUDIO PLAYING • TAP TO MUTE" : "AUDIO MUTED • TAP TO PLAY"}
                    </p>
                  </div>
                </div>

                {/* Animated Equalizer Columns */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "24px" }}>
                  {[12, 22, 16, 24, 18, 10, 20, 14, 24, 18].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: "3px",
                        height: audioPlaying ? `${h}px` : "6px",
                        borderRadius: "2px",
                        background: i % 2 === 0 ? "#00D4FF" : "#ED1D24",
                        transition: "height 0.3s ease",
                        animation: audioPlaying ? `pulse ${0.4 + (i % 3) * 0.2}s infinite alternate` : "none",
                      }}
                    />
                  ))}
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* S.H.I.E.L.D. Ticker Marquee */}
      <div
        style={{
          width: "100%",
          padding: "10px 0",
          background: "rgba(0, 0, 0, 0.75)",
          borderTop: "1px solid rgba(0, 212, 255, 0.2)",
          borderBottom: "1px solid rgba(0, 212, 255, 0.2)",
          overflow: "hidden",
          whiteSpace: "nowrap",
          position: "relative",
          zIndex: 10,
          marginTop: "48px",
        }}
      >
        <div style={{ display: "flex", gap: "40px", animation: "ticker 20s linear infinite" }}>
          {Array(4).fill(0).map((_, groupIdx) => (
            <div key={groupIdx} style={{ display: "flex", gap: "40px", alignItems: "center" }}>
              {tickerItems.map((item, itemIdx) => (
                <span
                  key={itemIdx}
                  style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: itemIdx === 0 ? "#ED1D24" : itemIdx === 1 ? "#FFD700" : itemIdx === 2 ? "#00D4FF" : "#FFFFFF",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
