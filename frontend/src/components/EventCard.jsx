import { Link } from "react-router-dom";
import { mediaUrl } from "../services/api";
import { getEventFallbackImage } from "../utils/assets";
import { formatCategoryLabel } from "../utils/eventUtils";

function formatDate(dateStr) {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getEventImage(event) {
  return mediaUrl(event.image) || getEventFallbackImage(event.category);
}

export default function EventCard({ event, featured = false }) {
  const image = getEventImage(event);
  const detailPath = `/events/${event.slug || event.id}`;

  return (
    <article className={`event-card-premium${featured ? " featured" : ""}`}>
      <Link to={detailPath} className="event-card-image-link" aria-label={`View ${event.title}`}>
        <div className="event-card-image">
          <img
            src={image}
            alt={event.title}
            loading="lazy"
            decoding="async"
            width="640"
            height="400"
          />
        </div>
      </Link>

      <div className="event-card-content">
        <p className="event-card-category">{formatCategoryLabel(event.category)}</p>
        <h3>
          <Link to={detailPath}>{event.title}</Link>
        </h3>
        <p className="event-card-meta-line">
          {formatDate(event.event_date)} · {event.venue || "TBA"}
          {event.is_registration_open ? " · Open" : " · Closed"}
        </p>

        <div className="event-card-footer">
          <span className="event-card-fee">
            ₹{Number(event.registration_fee).toLocaleString("en-IN")}
          </span>
          <Link to={detailPath} className="event-card-link">View event →</Link>
        </div>
      </div>
    </article>
  );
}
