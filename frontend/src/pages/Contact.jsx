import { useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import FAQ from "../components/FAQ";
import { FAQ_ITEMS } from "../utils/constants";
import { BRAND } from "../utils/brand";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { categoryImages } from "../utils/assets";

export default function Contact() {
  const settings = useSiteSettings();
  const [sent, setSent] = useState(false);

  const contactEmail = settings?.contact_email || BRAND.contactEmail;
  const contactPhone = settings?.contact_phone || BRAND.contactPhone;
  const venue = settings?.venue || BRAND.venue;
  const location = settings?.location || BRAND.location;
  const college = settings?.college_name || BRAND.collegeFullName;
  const festName = settings?.fest_name || BRAND.festName;

  const social = [
    { label: "Instagram", href: settings?.instagram_url || BRAND.socialLinks.instagram },
    { label: "YouTube", href: settings?.youtube_url || BRAND.socialLinks.youtube },
    { label: "Facebook", href: settings?.facebook_url || BRAND.socialLinks.facebook },
  ].filter((s) => s.href);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <>
      <PageHeader
        eyebrow="Reach us"
        title="Contact"
        subtitle="Questions about registration, sponsorship, or volunteering? We're here to help."
        image={categoryImages.cultural}
      />
      <section className="section page-content contact-page">
        <div className="container">
          <div className="contact-cards-grid">
            <motion.div
              className="contact-card detail-panel"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="contact-card-label">Fest Office</span>
              <h3>{festName} Team</h3>
              <ul>
                <li><strong>Email</strong><a href={`mailto:${contactEmail}`}>{contactEmail}</a></li>
                <li><strong>Phone</strong><a href={`tel:${contactPhone.replace(/\s/g, "")}`}>{contactPhone}</a></li>
              </ul>
            </motion.div>

            <motion.div
              className="contact-card detail-panel"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
            >
              <span className="contact-card-label">Venue</span>
              <h3>{college}</h3>
              <ul>
                <li><strong>Campus</strong><span>{venue}</span></li>
                <li><strong>Location</strong><span>{location}</span></li>
              </ul>
            </motion.div>
          </div>

          <div className="contact-main-grid">
            <motion.form
              className="contact-form detail-panel"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              aria-label="Contact form"
            >
              <h3>Send a Message</h3>
              <label>
                Name
                <input type="text" name="name" required placeholder="Your name" autoComplete="name" />
              </label>
              <label>
                Email
                <input type="email" name="email" required placeholder="you@college.edu" autoComplete="email" />
              </label>
              <label>
                Subject
                <input type="text" name="subject" placeholder="Registration, sponsorship, etc." />
              </label>
              <label>
                Message
                <textarea name="message" rows={5} required placeholder="How can we help?" />
              </label>
              {sent && <p className="form-success" role="status">Message received. We&apos;ll get back to you soon.</p>}
              <button type="submit" className="btn btn-gold btn-full">Send Message</button>
            </motion.form>

            <motion.div
              className="contact-side"
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {social.length > 0 && (
                <div className="contact-social detail-panel">
                  <h3>Follow {festName}</h3>
                  <ul>
                    {social.map((s) => (
                      <li key={s.label}>
                        <strong>{s.label}</strong>
                        <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <FAQ
        items={FAQ_ITEMS.map((f) => ({ q: f.q, a: f.a, question: f.q, answer: f.a }))}
        sectionMeta={{ title: "Frequently Asked Questions" }}
      />
    </>
  );
}
