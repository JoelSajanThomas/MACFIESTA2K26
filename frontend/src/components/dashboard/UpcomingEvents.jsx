import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  formatDayDate,
  formatScheduleTime,
  getUpcomingEvents,
} from "../../utils/scheduleUtils";

export default function UpcomingEvents({ events = [] }) {
  const upcoming = getUpcomingEvents(events, 5);

  if (upcoming.length === 0) {
    return (
      <div className="dash-empty">No upcoming events scheduled.</div>
    );
  }

  return (
    <div className="upcoming-events-list">
      {upcoming.map((ev, i) => (
        <motion.div
          key={ev.id}
          className="upcoming-event-item"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <div className="upcoming-event-time">
            <strong>{formatScheduleTime(ev.event_time)}</strong>
            <span>{formatDayDate(ev.event_date)}</span>
          </div>
          <div className="upcoming-event-info">
            <strong>{ev.title}</strong>
            <span>{ev.venue}</span>
          </div>
          <Link to={`/events/${ev.slug || ev.id}`} className="upcoming-event-link">
            →
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
