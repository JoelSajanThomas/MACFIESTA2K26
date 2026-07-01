import { useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";

const CONTACT_CARDS = [
  {
    title: "Fest Coordinator",
    name: "MacFiesta Team",
    email: "fest@macfast.ac.in",
    phone: "+91 98765 43210",
    hours: "Mon–Sat, 9 AM – 6 PM",
  },
  {
    title: "Registration Desk",
    name: "Student Affairs",
    email: "registrations@macfast.ac.in",
    phone: "+91 98765 43211",
    hours: "During fest days",
  },
  {
    title: "Sponsorship",
    name: "Partnerships Cell",
    email: "sponsors@macfast.ac.in",
    phone: "+91 98765 43212",
    hours: "Mon–Fri, 10 AM – 4 PM",
  },
];

const SOCIAL = [
  { label: "Instagram", handle: "@macfiesta" },
  { label: "YouTube", handle: "MacFiesta Official" },
  { label: "X / Twitter", handle: "@macfiesta" },
];

export default function Contact() {
  const [sent, setSent] = useState(false);

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
        image="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80"
      />
      <section className="section page-content contact-page">
        <div className="container">
          <div className="contact-cards-grid">
            {CONTACT_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                className="contact-card detail-panel"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <span className="contact-card-label">{card.title}</span>
                <h3>{card.name}</h3>
                <ul>
                  <li><strong>Email</strong><a href={`mailto:${card.email}`}>{card.email}</a></li>
                  <li><strong>Phone</strong><span>{card.phone}</span></li>
                  <li><strong>Hours</strong><span>{card.hours}</span></li>
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="contact-main-grid">
            <motion.form
              className="contact-form detail-panel"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3>Send a Message</h3>
              <label>
                Name
                <input type="text" name="name" required placeholder="Your name" />
              </label>
              <label>
                Email
                <input type="email" name="email" required placeholder="you@college.edu" />
              </label>
              <label>
                Subject
                <input type="text" name="subject" placeholder="Registration, sponsorship, etc." />
              </label>
              <label>
                Message
                <textarea name="message" rows={5} required placeholder="How can we help?" />
              </label>
              {sent && <p className="form-success">Message received. We'll get back to you soon.</p>}
              <button type="submit" className="btn btn-gold btn-full">Send Message</button>
            </motion.form>

            <motion.div
              className="contact-side"
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="contact-location detail-panel">
                <h3>Location</h3>
                <p>MACFAST, Thiruvalla<br />Pathanamthitta, Kerala — 689101</p>
              </div>

              <div className="contact-map-placeholder detail-panel">
                <span>📍</span>
                <p>Campus map placeholder</p>
                <small>Interactive map can be embedded here in production.</small>
              </div>

              <div className="contact-social detail-panel">
                <h3>Follow MacFiesta</h3>
                <ul>
                  {SOCIAL.map((s) => (
                    <li key={s.label}>
                      <strong>{s.label}</strong>
                      <span>{s.handle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
