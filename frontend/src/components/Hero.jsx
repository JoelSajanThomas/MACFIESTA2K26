import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Countdown from "./Countdown";
import { HERO_IMAGE, FEST_YEAR, FEST_TAGLINE, FEST_SUBTITLE } from "../utils/constants";

const FLOATERS = [
  { size: 120, top: "15%", left: "8%", delay: 0 },
  { size: 80, top: "60%", left: "85%", delay: 0.5 },
  { size: 60, top: "75%", left: "12%", delay: 1 },
  { size: 100, top: "25%", left: "78%", delay: 0.3 },
];

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section className="hero-cinematic" ref={ref}>
      <motion.div className="hero-bg" style={{ y: bgY }}>
        <img src={HERO_IMAGE} alt="" className="hero-bg-img" loading="eager" />
        <div className="hero-overlay" />
      </motion.div>

      {FLOATERS.map((f, i) => (
        <motion.span
          key={i}
          className="hero-floater"
          style={{ width: f.size, height: f.size, top: f.top, left: f.left }}
          animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: f.delay, ease: "easeInOut" }}
          aria-hidden="true"
        />
      ))}

      <motion.div className="hero-content-wrap" style={{ opacity }}>
        <motion.p
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          National Level Fest of MACFAST
        </motion.p>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          MACFIESTA
          <span className="hero-year">{FEST_YEAR}</span>
        </motion.h1>

        <motion.p
          className="hero-tagline"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
        >
          {FEST_TAGLINE} — {FEST_SUBTITLE}
          <br />
          Experience electrifying music, pure energy, and competitions from across the nation.
        </motion.p>

        <motion.div
          className="hero-countdown-wrap"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <p className="hero-countdown-label">Fest begins in</p>
          <Countdown />
        </motion.div>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
        >
          <Link to="/events" className="btn btn-gold">
            Register Now
          </Link>
          <Link to="/events" className="btn btn-outline">
            Explore Events
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-scroll-hint"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span>Scroll</span>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </section>
  );
}
