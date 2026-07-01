import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import ScrollReveal from "../components/ScrollReveal";
import { FEST_YEAR, FEST_THEME, OFFICIAL_SITE } from "../utils/constants";

const VALUES = [
  { title: "National Reach", desc: "Students from institutions across India come together at MACFAST." },
  { title: "Every Format", desc: "Solo, duo, trio, squad, and group events — something for every team." },
  { title: "Legends Rise", desc: "Where champions are made and memories last beyond the fest." },
];

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow={`Macfiesta ${FEST_YEAR}`}
        title="About Macfiesta"
        subtitle="National level fest of MACFAST — where legends rise."
        image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80"
      />
      <section className="section page-content">
        <div className="container about-page-grid">
          <ScrollReveal>
            <h2>Welcome to Macfiesta {FEST_YEAR}</h2>
            <p>
              Macfiesta is the national-level fest of MACFAST. We expect students from all
              over the country, representing diverse backgrounds, institutions, and regions.
            </p>
            <p>
              This year's theme is <strong>{FEST_THEME}</strong> — a cinematic celebration
              with movie-themed events, thrilling quests, and challenges that test knowledge
              and strategic thinking.
            </p>
            <p>
              MacFiesta Pro is the digital companion platform for live registrations,
              participant counts, results, and gallery updates throughout the fest.
            </p>
            <a
              href={OFFICIAL_SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              Visit Official Site →
            </a>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <img
              src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80"
              alt="Festival crowd"
              className="about-page-img"
              loading="lazy"
            />
          </ScrollReveal>
        </div>

        <div className="container values-grid">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              className="value-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
