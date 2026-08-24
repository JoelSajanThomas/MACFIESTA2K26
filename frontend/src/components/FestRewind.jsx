import ScrollReveal from "./ScrollReveal";
import SectionBadge from "./theme/SectionBadge";
import { REWIND_HIGHLIGHTS } from "../utils/constants";
import { BRAND } from "../utils/brand";
import { useTilt } from "../hooks/useTilt";

/**
 * Fest rewind — MacFiesta 2025 lookback tiles.
 */
export default function FestRewind({ items = [] }) {
  const tiles = items.length ? items : REWIND_HIGHLIGHTS;
  const lookbackYear = BRAND.festYear - 1;

  return (
    <section className="home-rewind section" aria-labelledby="rewind-title">
      <div className="container">
        <ScrollReveal>
          <SectionBadge tone="blue">Rewind</SectionBadge>
          <h2 id="rewind-title" className="home-section-title">
            MacFiesta {lookbackYear} Rewind
          </h2>
          <p className="home-section-sub">Relive highlights from last year’s festival.</p>
        </ScrollReveal>
        <div className="home-rewind-grid">
          {tiles.map((item, i) => (
            <RewindTile key={item.title} item={item} delay={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RewindTile({ item, delay }) {
  const tiltRef = useTilt(true, 4.5);

  return (
    <ScrollReveal ref={tiltRef} delay={delay} className="home-rewind-tile">
      {item.image && (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      )}
      <div className="home-rewind-tile-overlay" aria-hidden="true" />
      <h3>{item.title}</h3>
    </ScrollReveal>
  );
}
