import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { GUEST_PROFILES, FEST_THEME, FEST_THEME_DESC } from "../utils/constants";

export default function GuestProfiles() {
  return (
    <>
      <section className="section theme-section">
        <div className="container theme-banner">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="theme-inner"
          >
            <span className="section-eyebrow">This year's theme</span>
            <h2 className="theme-title">{FEST_THEME}</h2>
            <p>{FEST_THEME_DESC}</p>
          </motion.div>
        </div>
      </section>

      <section className="section guests-section">
        <div className="container">
          <SectionHeading
            eyebrow="Star guests"
            title="Guest Profiles"
            subtitle="Sessions and appearances you won't want to miss."
          />
          <div className="guests-grid">
            {GUEST_PROFILES.map((guest, i) => (
              <motion.article
                key={guest.name}
                className="guest-card"
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <img src={guest.image} alt={guest.name} loading="lazy" />
                <div className="guest-info">
                  <h3>{guest.name}</h3>
                  <span className="guest-role">{guest.role}</span>
                  <p>{guest.bio}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
