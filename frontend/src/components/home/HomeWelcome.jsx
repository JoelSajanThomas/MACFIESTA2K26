import { Link } from "react-router-dom";
import ScrollReveal from "../ScrollReveal";
import { aboutImage } from "../../utils/assets";

export default function HomeWelcome({ settings }) {
  const aboutSrc = settings?.about_image_url || aboutImage;
  return (
    <section className="home-welcome section">
      <div className="container">
        <h2 className="home-section-title">Welcome to Macfiesta</h2>
      </div>
      <div className="container home-welcome-grid">
        <ScrollReveal className="home-welcome-stack" aria-label="National Level Fest of MACFAST">
          <span>National</span>
          <span>Level</span>
          <span>Fest</span>
          <span>of</span>
          <span>{settings?.college_name || "MACFAST"}</span>
        </ScrollReveal>

        <ScrollReveal className="home-welcome-side" delay={1}>
          <p className="home-welcome-text">
            {settings?.about_body ||
              "Macfiesta is the national-level inter-college fest of MACFAST — three days of competitions, culture, and campus energy at Thiruvalla."}
          </p>
          <div className="home-welcome-image">
            <img
              src={aboutSrc}
              alt="MACFAST campus during Macfiesta"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <Link to="/about" className="home-text-link">Learn more about Macfiesta →</Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
