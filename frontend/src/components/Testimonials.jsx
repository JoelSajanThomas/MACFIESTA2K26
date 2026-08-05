import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";

export default function Testimonials({ items = [], sectionMeta = {} }) {
  return (
    <section className="section testimonials-section">
      <div className="container">
        <SectionHeading
          eyebrow="Voices"
          title={sectionMeta.title || "What People Say"}
          subtitle={sectionMeta.subtitle || "Delegates, coordinators, and campus clubs on the MacFiesta experience."}
        />
        <div className="testimonials-grid">
          {items.map((t, i) => (
            <motion.blockquote
              key={`${t.name}-${i}`}
              className="testimonial-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <p>&ldquo;{t.quote}&rdquo;</p>
              <footer>
                <strong>{t.name}</strong>
                {t.role && <span>{t.role}</span>}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
