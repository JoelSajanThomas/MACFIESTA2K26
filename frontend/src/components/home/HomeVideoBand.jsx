import { useEffect, useRef } from "react";
import ScrollReveal from "../ScrollReveal";
import SectionBadge from "../theme/SectionBadge";
import { REF_UI } from "../../utils/assets";

/**
 * Full-bleed cinematic loop band between major home sections.
 */
export default function HomeVideoBand() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      video.pause();
      return undefined;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => { });
        else video.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <section className="home-video-band section" aria-labelledby="home-video-band-title">
      <div className="home-video-band__frame">
        <video
          ref={videoRef}
          className="home-video-band__video"
          muted
          loop
          playsInline
          preload="metadata"
          poster={REF_UI.cityNight}
        >
          <source src={REF_UI.cinematicLoopMp4} type="video/mp4" />
          <source src={REF_UI.cinematicLoop} type="video/webm" />
        </video>
        <div className="home-video-band__veil" aria-hidden="true" />
        <div className="container home-video-band__copy">
          <ScrollReveal>
            <SectionBadge tone="gold">Live Atmosphere</SectionBadge>
            <h2 id="home-video-band-title" className="home-section-title">
              Heroes Assemble
            </h2>
            <p className="home-section-sub">
              Stage lights, crowd pulse, and championship energy — MacFiesta in motion.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
