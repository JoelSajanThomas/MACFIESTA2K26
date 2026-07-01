import { motion } from "framer-motion";
import { TESTIMONIALS } from "../utils/constants";
import SectionHeading from "./SectionHeading";

export default function Testimonials() {
  return (
    <section className="section testimonials-section">
      <div className="container">
        <SectionHeading
          eyebrow="Voices"
          title="What Students Say"
          subtitle="Memories from past editions of MacFiesta."
        />
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={t.name}
              className="testimonial-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -6 }}
            >
              <p className="testimonial-quote">"{t.quote}"</p>
              <footer>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
