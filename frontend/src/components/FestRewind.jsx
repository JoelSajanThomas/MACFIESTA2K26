import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { REWIND_HIGHLIGHTS } from "../utils/constants";

export default function FestRewind() {
  return (
    <section className="section rewind-section">
      <div className="container">
        <SectionHeading
          eyebrow="Macfiesta rewind"
          title="Where the Magic Began"
          subtitle="Electrifying moments from last year's Macfiesta — this year we're raising the bar even higher."
        />
        <div className="rewind-grid">
          {REWIND_HIGHLIGHTS.map((item, i) => (
            <motion.div
              key={item.title}
              className="rewind-card"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <span className="rewind-icon">{item.icon}</span>
              <h3>{item.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
