import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  formatScheduleTime,
  getEventStatus,
  STATUS_LABELS,
} from "../../utils/scheduleUtils";

export default function ScheduleEventCard({ event, index = 0 }) {
  const status = getEventStatus(event);
  const detailPath = `/events/${event.slug || event.id}`;

  return (
    <motion.article
      className="schedule-timeline-card"
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
    >
      <div className="schedule-timeline-time">
        <span className="schedule-time-value">{formatScheduleTime(event.event_time)}</span>
        <span className={`schedule-status-label ${status}`}>{STATUS_LABELS[status]}</span>
      </div>

      <div className="schedule-timeline-line" aria-hidden="true">
        <span className="schedule-timeline-dot" />
      </div>

      <div className="schedule-timeline-body">
        <div className="schedule-card-top">
          <span className="event-cat-tag">{event.category}</span>
          <span className={`event-badge inline ${event.is_registration_open ? "open" : "closed"}`}>
            {event.is_registration_open ? "Open" : "Closed"}
          </span>
        </div>

        <h3>{event.title}</h3>

        <p className="schedule-venue">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {event.venue}
        </p>

        <div className="schedule-card-footer">
          <span className="schedule-participants">
            <strong>{event.participant_count ?? 0}</strong> registered
          </span>
          <Link to={detailPath} className="btn btn-card">
            View Details
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
