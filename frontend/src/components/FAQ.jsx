import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "./SectionHeading";

export default function FAQ({ items = [], sectionMeta = {} }) {
  const [open, setOpen] = useState(0);

  return (
    <section className="section faq-section">
      <div className="container narrow">
        <SectionHeading
          eyebrow="Got questions?"
          title={sectionMeta.title || "Frequently Asked Questions"}
          subtitle={sectionMeta.subtitle || "Everything you need to know before the fest begins."}
        />
        <div className="faq-list">
          {items.map((item, i) => (
            <motion.div
              key={item.q || item.question}
              className={`faq-item${open === i ? " open" : ""}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <button
                type="button"
                className="faq-question"
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                {item.q || item.question}
                <span className="faq-icon">{open === i ? "−" : "+"}</span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{item.a || item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
