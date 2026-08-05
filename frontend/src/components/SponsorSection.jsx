import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";

export default function SponsorSection({ sponsors = [], sectionMeta = {} }) {
  return (
    <section className="section sponsors-section" id="sponsors">
      <div className="container">
        <SectionHeading
          eyebrow="Partners"
          title={sectionMeta.title || "Our Sponsors"}
          subtitle={sectionMeta.subtitle || "Campus partners and sponsors who keep the fest running across venues."}
        />
        <div className="sponsors-grid">
          {sponsors.map((sponsor, i) => (
            <motion.div
              key={sponsor.id || sponsor.name}
              className="sponsor-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5 }}
            >
              <div className="sponsor-logo-placeholder">
                {sponsor.logo ? (
                  <img src={sponsor.logo} alt={sponsor.name} loading="lazy" decoding="async" />
                ) : (
                  sponsor.name.charAt(0)
                )}
              </div>
              <strong>{sponsor.name}</strong>
              <span>{sponsor.tier || sponsor.sponsor_type}</span>
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
