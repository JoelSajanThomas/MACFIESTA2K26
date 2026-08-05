import { Link } from "react-router-dom";
import ScrollReveal from "../ScrollReveal";

export default function HomeEventTypes({ formats = [] }) {
  return (
    <section className="home-types section">
      <div className="container">
        <ScrollReveal>
          <h2 className="home-section-title">Event Types</h2>
          <p className="home-section-sub">Solo · Duo · Trio · Squad · Group</p>
        </ScrollReveal>
        <div className="home-types-grid">
          {formats.map((fmt, i) => (
            <ScrollReveal key={fmt.id || fmt.label} delay={i} className="home-type-tile">
              <Link to={fmt.link || "/events"}>{fmt.label || fmt.title}</Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
