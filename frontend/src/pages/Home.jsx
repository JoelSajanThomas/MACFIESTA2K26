import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Hero from "../components/Hero";
import SectionHeading from "../components/SectionHeading";
import CategoryCard from "../components/CategoryCard";
import EventCard from "../components/EventCard";
import StatsCounter from "../components/StatsCounter";
import WinnersPreview from "../components/WinnersPreview";
import AnnouncementStrip from "../components/announcements/AnnouncementStrip";
import AnnouncementsSection from "../components/announcements/AnnouncementsSection";
import SponsorSection from "../components/SponsorSection";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import ScrollReveal from "../components/ScrollReveal";
import EventFormats from "../components/EventFormats";
import GuestProfiles from "../components/GuestProfiles";
import FestRewind from "../components/FestRewind";
import GalleryGrid from "../components/GalleryGrid";
import { CATEGORIES, HERO_IMAGE, FEST_YEAR } from "../utils/constants";
import { normalizeGalleryItems } from "../utils/galleryUtils";
import { getEvents, getResults, getGallery, getDashboardStats, getAnnouncements } from "../services/api";

const HIGHLIGHTS = [
  {
    title: "National Level Fest",
    desc: "Students from across the country — diverse backgrounds, institutions, and regions.",
    icon: "🌏",
  },
  {
    title: "Electrifying Energy",
    desc: "Music performances, cultural showcases, fashion walks, and unforgettable DJ nights.",
    icon: "⚡",
  },
  {
    title: "Live on MacFiesta Pro",
    desc: "Real-time registrations, results, and fest updates — powered by your dashboard.",
    icon: "📡",
  },
];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [results, setResults] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEvents(),
      getResults(),
      getGallery(),
      getDashboardStats(),
      getAnnouncements(),
    ])
      .then(([e, r, g, s, a]) => {
        setEvents(e.data);
        setResults(r.data);
        setGallery(g.data);
        setStats(s.data);
        setAnnouncements(a.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = events.slice(0, 6);

  return (
    <div className="home-page">
      <Hero />

      <AnnouncementStrip announcements={announcements} />

      {/* About */}
      <section className="section about-section" id="about-preview">
        <div className="container about-grid">
          <ScrollReveal className="about-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80"
              alt="College campus"
              loading="lazy"
            />
            <div className="about-image-accent" />
          </ScrollReveal>
          <ScrollReveal className="about-content" delay={1}>
            <span className="section-eyebrow">Welcome to Macfiesta {FEST_YEAR}</span>
            <h2 className="section-title align-left">
              National Level Fest of MACFAST
            </h2>
            <p>
              We are expecting students from all over the country, representing a diverse
              range of backgrounds, institutions, and regions. Macfiesta is MACFAST's flagship
              celebration of skill, strategy, and camaraderie.
            </p>
            <p>
              Experience electrifying music and pure energy — from high-voltage performances
              and cultural showcases to glamorous fashion walks and DJ nights.
            </p>
            <Link to="/about" className="btn btn-gold">Learn More</Link>
          </ScrollReveal>
        </div>
      </section>

      <EventFormats />

      {/* Highlights */}
      <section className="section highlights-section">
        <div className="container">
          <SectionHeading
            eyebrow="Why MacFiesta"
            title="Festival Highlights"
            subtitle="The experiences that make every edition unforgettable."
          />
          <div className="highlights-grid">
            {HIGHLIGHTS.map((h, i) => (
              <motion.div
                key={h.title}
                className="highlight-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -8 }}
              >
                <span className="highlight-icon">{h.icon}</span>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="container">
          <SectionHeading
            eyebrow="Compete"
            title="Event Categories"
            subtitle="Find your arena — from code to choreography."
          />
          <div className="categories-grid">
            {CATEGORIES.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      <GuestProfiles />
      <FestRewind />

      {/* Featured Events */}
      <section className="section featured-section">
        <div className="container">
          <SectionHeading
            eyebrow="Don't miss out"
            title="Featured Events"
            subtitle="Top competitions with live registration status."
          />
          {loading ? (
            <p className="state-msg">Loading events…</p>
          ) : (
            <div className="events-grid-premium">
              {featured.length > 0 ? (
                featured.map((ev, i) => (
                  <EventCard key={ev.id} event={ev} featured index={i} />
                ))
              ) : (
                <p className="state-msg">Events coming soon.</p>
              )}
            </div>
          )}
          <div className="section-cta">
            <Link to="/events" className="btn btn-outline">View All Events</Link>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="section stats-live-section">
        <div className="container">
          <SectionHeading
            eyebrow="Live data"
            title="Festival Statistics"
            subtitle="Real-time numbers from the MacFiesta dashboard."
          />
          <StatsCounter stats={stats} />
        </div>
      </section>

      {/* Winners Preview */}
      <section className="section winners-section">
        <div className="container">
          <SectionHeading
            eyebrow="Champions"
            title="Winners Preview"
            subtitle="Celebrating excellence across competitions."
          />
          <WinnersPreview results={results} />
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="section gallery-preview-section">
        <div className="container">
          <SectionHeading
            eyebrow="Memories"
            title="Gallery Preview"
            subtitle="Glimpses from past editions and this year's fest."
          />
          <GalleryGrid
            items={normalizeGalleryItems(gallery, gallery.length === 0)}
            preview
            limit={6}
            showPlaceholderNote={gallery.length === 0}
          />
        </div>
      </section>

      <AnnouncementsSection announcements={announcements} />

      <SponsorSection />
      <Testimonials />
      <FAQ />

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-banner-bg" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="cta-banner-overlay" />
        <ScrollReveal className="container cta-banner-content">
          <h2>Ready to be part of Macfiesta {FEST_YEAR}?</h2>
          <p>Register for your favourite events before slots run out.</p>
          <Link to="/events" className="btn btn-gold btn-lg">Register Now</Link>
        </ScrollReveal>
      </section>
    </div>
  );
}
