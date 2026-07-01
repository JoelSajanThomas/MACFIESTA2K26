import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SPONSORS } from "../utils/constants";
import SectionHeading from "./SectionHeading";

export default function SponsorSection() {
  return (
    <section className="section sponsors-section" id="sponsors">
      <div className="container">
        <SectionHeading
          eyebrow="Partners"
          title="Our Sponsors"
          subtitle="Proudly supported by brands that believe in student excellence."
        />
        <div className="sponsors-grid">
          {SPONSORS.map((sponsor, i) => (
            <motion.div
              key={sponsor.name}
              className="sponsor-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5 }}
            >
              <div className="sponsor-logo-placeholder">
                {sponsor.name.charAt(0)}
              </div>
              <strong>{sponsor.name}</strong>
              <span>{sponsor.tier}</span>
            </motion.div>
          ))}
        </div>
        <div className="section-cta">
          <Link to="/sponsors" className="btn btn-outline">View All Sponsors</Link>
        </div>
      </div>
    </section>
  );
}
