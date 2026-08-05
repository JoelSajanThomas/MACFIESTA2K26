import { Link } from "react-router-dom";
import ScrollReveal from "../ScrollReveal";

export default function HomeSponsors({ sponsors = [] }) {
  return (
    <section className="home-sponsors section" id="sponsors">
      <div className="container">
        <ScrollReveal>
          <h2 className="home-section-title">Sponsors</h2>
        </ScrollReveal>
        <div className="home-sponsors-row">
          {sponsors.map((sponsor, i) => (
            <ScrollReveal key={sponsor.id || sponsor.name} delay={i} className="home-sponsor-item">
              <div className="home-sponsor-logo">
                {sponsor.logo ? (
                  <img src={sponsor.logo} alt={sponsor.alt || sponsor.name} loading="lazy" decoding="async" />
                ) : (
                  <span>{sponsor.name}</span>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
        <div className="home-section-link-wrap">
          <Link to="/sponsors" className="home-text-link">View all sponsors →</Link>
        </div>
      </div>
    </section>
  );
}
