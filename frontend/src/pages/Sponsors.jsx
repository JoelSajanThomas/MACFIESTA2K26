import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import { SPONSOR_TIERS } from "../utils/constants";

export default function Sponsors() {
  return (
    <>
      <PageHeader
        eyebrow="Partners"
        title="Sponsors"
        subtitle="MacFiesta is made possible by organizations that invest in student talent."
        image="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&q=80"
      />
      <section className="section page-content sponsors-page">
        <div className="container">
          {SPONSOR_TIERS.map((tier) => (
            <div key={tier.title} className="sponsor-tier-block">
              <h2 className="sponsor-tier-title">{tier.title}</h2>
              <div className={`sponsors-grid tier-${tier.size || "default"}`}>
                {tier.sponsors.map((sponsor, i) => (
                  <motion.div
                    key={`${tier.title}-${sponsor.name}`}
                    className="sponsor-card"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="sponsor-logo-placeholder">{sponsor.name.charAt(0)}</div>
                    <strong>{sponsor.name}</strong>
                    {sponsor.tag && <span>{sponsor.tag}</span>}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          <div className="sponsor-cta detail-panel">
            <h3>Become a Sponsor</h3>
            <p>
              Partner with MACFAST MacFiesta and connect with thousands of students,
              faculty, and visitors across our national-level fest.
            </p>
            <Link to="/contact" className="btn btn-gold">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
