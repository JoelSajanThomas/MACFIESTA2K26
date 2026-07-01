import { motion } from "framer-motion";

export default function PageHeader({ eyebrow, title, subtitle, image }) {
  return (
    <section
      className="page-header"
      style={image ? { "--page-header-bg": `url(${image})` } : undefined}
    >
      <div className="page-header-overlay" />
      <motion.div
        className="container page-header-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </motion.div>
    </section>
  );
}
