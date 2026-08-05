import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Countdown from "./Countdown";
import { BRAND, FEST_DATE } from "../utils/brand";
import { heroImage, heroVideo, heroVideoMobile } from "../utils/assets";
import { useMotionPrefs } from "../hooks/useMotionPrefs";
import { buildHeroSequence } from "../utils/animations";

export default function Hero({ settings }) {
  const prefs = useMotionPrefs();
  const heroMotion = useMemo(() => buildHeroSequence(prefs), [prefs]);

  const heroBg = settings?.hero_image_url || heroImage;
  const heroVid = settings?.hero_video_url || heroVideo;
  const heroVidMobile = settings?.hero_video_mobile_url || heroVideoMobile;
  const year = settings?.fest_year || BRAND.festYear;
  const title = settings?.hero_title || settings?.fest_name?.toUpperCase() || "MACFIESTA";
  const tagline = settings?.tagline || BRAND.tagline;
  const subtitle = settings?.hero_subtitle || BRAND.subtitle;
  const festDate = settings?.fest_date || FEST_DATE.toISOString().slice(0, 10);
  const countdownRaw = settings?.countdown_datetime
    ? new Date(settings.countdown_datetime)
    : new Date(`${festDate}T09:00:00`);
  const countdownTargetMs = Number.isFinite(countdownRaw.getTime())
    ? countdownRaw.getTime()
    : FEST_DATE.getTime();

  const social = [
    { label: "Instagram", href: settings?.instagram_url },
    { label: "YouTube", href: settings?.youtube_url },
    { label: "Facebook", href: settings?.facebook_url },
  ].filter((s) => s.href);

  return (
    <section className="hero-classic">
      <div className="hero-classic-bg">
        {heroVid ? (
          <video
            className="hero-classic-bg-img"
            autoPlay
            muted
            loop
            playsInline
            poster={heroBg}
            aria-hidden="true"
          >
            <source src={heroVidMobile} type="video/mp4" media="(max-width: 767px)" />
            <source src={heroVid} type="video/mp4" />
          </video>
        ) : (
          heroBg && (
            <img
              src={heroBg}
              alt=""
              className="hero-classic-bg-img"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          )
        )}
        <div className="hero-classic-overlay" />
      </div>

      <motion.div
        className="hero-classic-content"
        variants={heroMotion.container}
        initial="hidden"
        animate="visible"
      >
        <motion.p className="hero-classic-year" variants={heroMotion.item}>{year}</motion.p>
        <motion.h1 className="hero-classic-title" variants={heroMotion.item}>{title}</motion.h1>
        <motion.p className="hero-classic-tagline" variants={heroMotion.item}>{tagline}</motion.p>
        <motion.p className="hero-classic-sub" variants={heroMotion.item}>{subtitle}</motion.p>

        <motion.div className="hero-classic-countdown" variants={heroMotion.item}>
          <Countdown targetDate={countdownTargetMs} variant="hero" embedded />
        </motion.div>

        <motion.div className="hero-classic-actions" variants={heroMotion.item}>
          <Link to="/events" className="btn btn-gold btn-hero">Register Now</Link>
          <Link to="/events" className="btn btn-outline btn-hero">View Events</Link>
        </motion.div>

        {social.length > 0 && (
          <motion.div className="hero-classic-social" variants={heroMotion.item}>
            <span className="hero-classic-social-label">Follow Us</span>
            <div className="hero-classic-social-links">
              {social.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
