import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { mediaUrl } from "../services/api";
import { CATEGORY_IMAGES } from "../utils/constants";

function formatDate(dateStr) {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getEventImage(event) {
  const api = mediaUrl(event.image);
  if (api) return api;
  return CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.default;
}

export default function EventCard({ event, featured = false, index = 0 }) {
  const image = getEventImage(event);
  const detailPath = `/events/${event.slug || event.id}`;

  return (
    <motion.article
      className={`event-card-premium${featured ? " featured" : ""}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.55 }}
      whileHover={{ y: -10 }}
    >
      <div className="event-card-image">
        <img src={image} alt={event.title} loading="lazy" />
        <div className="event-card-image-overlay" />
        <span className={`event-badge ${event.is_registration_open ? "open" : "closed"}`}>
          {event.is_registration_open ? "Registration Open" : "Closed"}
        </span>
        {event.is_result_published && (
          <span className="event-badge results-published">Results Published</span>
        )}
        <span className="event-fee">₹{event.registration_fee}</span>
      </div>

      <div className="event-card-content">
        <span className="event-cat-tag">{event.category}</span>
        <h3>{event.title}</h3>

        <div className="event-card-meta">
          <span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {event.venue}
          </span>
          <span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {formatDate(event.event_date)}
          </span>
        </div>

        <div className="event-card-footer">
          <div className="event-participants">
            <strong>{event.participant_count ?? 0}</strong>
            <span>participants</span>
          </div>
          <Link to={detailPath} className="btn btn-card">
            View Details
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
