import { Link } from "react-router-dom";
import { mediaUrl } from "../services/api";
import { getEventFallbackImage } from "../utils/assets";
import { formatCategoryLabel, getSeatsFillPercent } from "../utils/eventUtils";
import { formatPrizePool, formatRegistrationFee, isSchoolEvent } from "../utils/festDays";

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

/** MACFIESTA1 mission card — keeps cart/select + fee behavior. */
export default function EventCard({
  event,
  featured = false,
  selectable = false,
  selected = false,
  onToggleSelect,
}) {
  const image = getEventImage(event);
  const detailPath = `/events/${event.slug || event.id}`;
  const open = Boolean(event.is_registration_open);
  const fill = getSeatsFillPercent(event);
  const prize = formatPrizePool(event);
  const feeLabel = formatRegistrationFee(event);
  const school = isSchoolEvent(event);
  const time = event.event_time ? String(event.event_time).slice(0, 5) : null;

  return (
    <article
      className={`marvel-mission-card event-card-premium event-card-simple${featured ? " featured" : ""}${
        selected ? " is-selected" : ""
      }`}
      data-universe={event.category}
    >
      {selectable ? (
        <label className="event-card-select marvel-mission-card__select">
          <input
            type="checkbox"
            checked={selected}
            disabled={!open}
            onChange={() => onToggleSelect?.(event)}
            aria-label={`Select ${event.title}`}
          />
          <span>{selected ? "Selected" : open ? "Select" : "Closed"}</span>
        </label>
      ) : null}

      <Link to={detailPath} className="marvel-mission-card__media" aria-label={event.title}>
        <img src={image} alt="" loading="lazy" decoding="async" width="640" height="400" />
        <span className="marvel-mission-card__badge">{formatCategoryLabel(event.category)}</span>
        <span className={`marvel-mission-card__scope${school ? " is-school" : " is-college"}`}>
          {school ? "School" : "College"}
        </span>
      </Link>

      <div className="marvel-mission-card__body">
        <h3>
          <Link to={detailPath}>{event.title}</Link>
        </h3>
        {event.short_description || event.description ? (
          <p className="marvel-mission-card__desc">
            {event.short_description || String(event.description).slice(0, 110)}
          </p>
        ) : null}

        <ul className="marvel-mission-card__meta">
          <li>
            <span>When</span>
            <strong>
              {formatDate(event.event_date)}
              {time ? ` · ${time}` : ""}
            </strong>
          </li>
          <li>
            <span>Venue</span>
            <strong>{event.venue || "TBA"}</strong>
          </li>
          {prize ? (
            <li>
              <span>Prize</span>
              <strong className="is-gold">{prize}</strong>
            </li>
          ) : null}
          <li>
            <span>Fee</span>
            <strong className="price-highlight">{feeLabel}</strong>
          </li>
        </ul>

        {event.max_participants ? (
          <div className="event-capacity" aria-label={`Capacity ${fill}%`}>
            <div className="event-capacity__bar" style={{ width: `${fill}%` }} />
            <span>
              {event.participant_count ?? 0}/{event.max_participants}
            </span>
          </div>
        ) : null}

        <div className="marvel-mission-card__footer">
          <Link to={detailPath} className="marvel-mission-card__brief">
            Rules & Briefing
          </Link>
          {selectable && open ? (
            <button
              type="button"
              className="marvel-mission-card__join"
              onClick={() => onToggleSelect?.(event)}
            >
              {selected ? "Remove" : "Join Mission"}
            </button>
          ) : (
            <Link to={detailPath} className="marvel-mission-card__join">
              {open ? "Join Mission" : "View Mission"}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
