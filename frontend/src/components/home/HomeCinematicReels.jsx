import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SectionBadge from "../theme/SectionBadge";
import { REF_UI } from "../../utils/assets";
import { usePointerParallax } from "../../hooks/usePointerParallax";
import { useTilt } from "../../hooks/useTilt";
import { useMotionPrefs } from "../../hooks/useMotionPrefs";

/**
 * Mid-home cinematic video stage:
 * - landscape: fiesta promo
 * - portrait: official Instagram reel
 */
export default function HomeCinematicReels() {
  const prefs = useMotionPrefs();
  const sectionRef = useRef(null);
  const parallaxRef = usePointerParallax(!prefs.reduced, 14);
  const portraitTilt = useTilt(!prefs.reduced, 6.5);
  const landscapeRef = useRef(null);
  const portraitRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const landscapeY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const portraitRotate = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, -5]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [28, -28]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0.15, 0.5, 0.4, 0.18]);

  useEffect(() => {
    const nodes = [landscapeRef.current, portraitRef.current].filter(Boolean);
    if (!nodes.length) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      nodes.forEach((v) => {
        v.pause();
        v.removeAttribute("autoplay");
      });
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (!(video instanceof HTMLVideoElement)) return;
          if (entry.isIntersecting) {
            video.play().catch(() => { });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.28 }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="home-cinematic-reels section home-cinematic-reels--pro"
      aria-labelledby="cinematic-reels-title"
    >
      <div ref={parallaxRef} className="home-cinematic-reels__stage" style={{ "--px": "0px", "--py": "0px" }}>
        <motion.div className="home-cinematic-reels__landscape" style={{ y: landscapeY }} aria-hidden="true">
          <video
            ref={landscapeRef}
            className="home-cinematic-reels__landscape-video"
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src={REF_UI.promoVideoMp4} type="video/mp4" />
            <source src={REF_UI.promoVideo} type="video/webm" />
          </video>
          <div className="home-cinematic-reels__landscape-veil" />
        </motion.div>

        <motion.div
          className="home-cinematic-reels__orb home-cinematic-reels__orb--red"
          style={{ opacity: glowOpacity }}
          aria-hidden="true"
        />
        <motion.div
          className="home-cinematic-reels__orb home-cinematic-reels__orb--cyan"
          style={{ opacity: glowOpacity }}
          aria-hidden="true"
        />

        <div className="container home-cinematic-reels__content">
          <motion.div
            className="home-cinematic-reels__copy"
            initial={prefs.reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <SectionBadge tone="gold">Cinematic Arena</SectionBadge>
            <h2 id="cinematic-reels-title" className="home-section-title">
              Multiverse in Motion
            </h2>
            <p className="home-section-sub">
              Fest energy on screen — promo spectacle and the official MacFiesta reel.
            </p>
          </motion.div>

          <motion.div
            className="home-cinematic-reels__portrait-shell"
            style={{
              y: prefs.reduced ? 0 : portraitY,
              rotateY: prefs.reduced ? 0 : portraitRotate,
            }}
            whileHover={prefs.reduced ? undefined : { scale: 1.03 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            <div ref={portraitTilt} className="home-cinematic-reels__portrait-frame">
              <div className="home-cinematic-reels__portrait-glow" aria-hidden="true" />
              <video
                ref={portraitRef}
                className="home-cinematic-reels__portrait-video"
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="MacFiesta official reel"
              >
                <source src={REF_UI.heroBgReelMp4} type="video/mp4" />
                <source src={REF_UI.heroBgReel} type="video/webm" />
              </video>
              <div className="home-cinematic-reels__portrait-edge" aria-hidden="true" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
