import { motion } from "framer-motion";
import { formatDayDate, formatDayLabel } from "../../utils/scheduleUtils";
import ScheduleEventCard from "./ScheduleEventCard";

export default function ScheduleDayGroup({ day, index = 0 }) {
  return (
    <motion.section
      className="schedule-day-group"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <header className="schedule-day-header">
        <div>
          <span className="schedule-day-label">{formatDayLabel(day.date)}</span>
          <h2 className="schedule-day-date">{formatDayDate(day.date)}</h2>
        </div>
        <span className="schedule-day-count">
          {day.events.length} event{day.events.length !== 1 ? "s" : ""}
        </span>
      </header>

      <div className="schedule-timeline">
        {day.events.map((event, i) => (
          <ScheduleEventCard key={event.id} event={event} index={i} />
        ))}
      </div>
    </motion.section>
  );
}
