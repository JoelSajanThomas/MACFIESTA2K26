import ScrollReveal from "./ScrollReveal";
import { REWIND_HIGHLIGHTS } from "../utils/constants";

export default function FestRewind({ items = [] }) {
  const tiles = items.length ? items : REWIND_HIGHLIGHTS;
  return (
    <section className="home-rewind section">
      <div className="container">
        <ScrollReveal>
          <h2 className="home-section-title">2024 Rewind</h2>
        </ScrollReveal>
        <div className="home-rewind-grid">
          {tiles.map((item, i) => (
            <ScrollReveal key={item.title} delay={i} className="home-rewind-tile">
              {item.image && (
                <img src={item.image} alt={item.alt || item.title} loading="lazy" decoding="async" sizes="(max-width: 640px) 50vw, 25vw" />
              )}
              <div className="home-rewind-tile-overlay" />
              <h3>{item.title}</h3>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
