import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";

export default function GuestProfiles({ theme, guests = [], sectionMeta = {} }) {
  return (
    <>
      {theme && (
        <section className="section theme-section">
          <div className="container theme-banner">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="theme-inner"
            >
              <span className="section-eyebrow">{theme.eyebrow}</span>
              <h2 className="theme-title">{theme.title}</h2>
              <p>{theme.description}</p>
            </motion.div>
          </div>
        </section>
      )}

      <section className="section guests-section">
        <div className="container">
          <SectionHeading
            eyebrow="Star guests"
            title={sectionMeta.title || "Guest Profiles"}
            subtitle={sectionMeta.subtitle || "Sessions and appearances you won't want to miss."}
          />
          <div className="guests-grid">
            {guests.map((guest, i) => (
              <motion.article
                key={guest.name}
                className="guest-card"
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {guest.image && <img src={guest.image} alt={guest.name} loading="lazy" decoding="async" />}
                <div className="guest-info">
                  <h3>{guest.name}</h3>
                  <span className="guest-role">{guest.role}</span>
                  <p>{guest.bio || guest.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
