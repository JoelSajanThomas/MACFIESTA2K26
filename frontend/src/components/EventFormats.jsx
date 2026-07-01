import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { EVENT_FORMATS } from "../utils/constants";

const FORMAT_ICONS = {
  solo: "1",
  duo: "2",
  trio: "3",
  squad: "4",
  group: "∞",
};

export default function EventFormats() {
  return (
    <section className="section formats-section">
      <div className="container">
        <SectionHeading
          eyebrow="Choose your adventure"
          title="Event Formats"
          subtitle="Solo, duo, trio, squad, or group — more than a competition, it's a celebration of skill and camaraderie."
        />
        <div className="formats-grid">
          {EVENT_FORMATS.map((fmt, i) => (
            <motion.div
              key={fmt.id}
              className="format-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -8 }}
            >
              <span className="format-icon">{FORMAT_ICONS[fmt.id]}</span>
              <h3>{fmt.label}</h3>
              <p>{fmt.desc}</p>
              <Link to={fmt.link} className="format-link">Go to events →</Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
