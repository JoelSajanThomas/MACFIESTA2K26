import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";

export default function EventFormats({ formats = [], sectionMeta = {} }) {
  return (
    <section className="section formats-section">
      <div className="container">
        <SectionHeading
          eyebrow="Choose your adventure"
          title={sectionMeta.title || "Event Formats"}
          subtitle={sectionMeta.subtitle || "Solo, duo, trio, squad, or group — more than a competition, it's a celebration of skill and camaraderie."}
        />
        <div className="formats-grid">
          {formats.map((fmt, i) => (
            <motion.div
              key={fmt.id || fmt.title}
              className="format-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -8 }}
            >
              <span className="format-icon">{fmt.label}</span>
              <h3>{fmt.title}</h3>
              <p>{fmt.description || fmt.desc}</p>
              <Link to={fmt.link || "/events"} className="format-link">Go to events →</Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
