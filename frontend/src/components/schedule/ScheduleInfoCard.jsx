import { Link } from "react-router-dom";
import {
  formatDayDate,
  formatScheduleTime,
  getEventStatus,
  STATUS_LABELS,
} from "../../utils/scheduleUtils";

export default function ScheduleInfoCard({ event }) {
  const status = getEventStatus(event);
  const timeLabel = event.event_time
    ? `${formatScheduleTime(event.event_time)}${
        event.event_end_time ? ` – ${formatScheduleTime(event.event_end_time)}` : ""
      }`
    : "TBD";

  return (
    <div className="detail-panel schedule-info-card">
      <h3>Schedule Info</h3>
      <dl className="schedule-info-list">
        <div>
          <dt>Date</dt>
          <dd>{formatDayDate(event.event_date)}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{timeLabel}</dd>
        </div>
        <div>
          <dt>Venue</dt>
          <dd>{event.venue || "TBD"}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <span className={`schedule-status-label ${status}`}>
              {STATUS_LABELS[status]}
            </span>
          </dd>
        </div>
      </dl>
      <Link to="/schedule" className="schedule-info-link">
        View full schedule →
      </Link>
    </div>
  );
}
