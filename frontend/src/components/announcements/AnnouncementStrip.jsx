import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { resolveAnnouncements, isUsingPlaceholders } from "../../utils/announcementUtils";

export default function AnnouncementStrip({ announcements = [] }) {
  const items = resolveAnnouncements(announcements).slice(0, 5);
  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <section className="announcement-strip-premium">
      <div className="announcement-strip-label">
        <span className="pulse-dot" />
        Live Updates
      </div>
      <div className="announcement-strip-track-wrap">
        <motion.div
          className="announcement-strip-track"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((item, i) => (
            <span key={`${item.id}-${i}`} className="announcement-strip-item">
              <strong>{item.title}</strong>
              <span>{item.message}</span>
            </span>
          ))}
        </motion.div>
      </div>
      <Link to="/announcements" className="announcement-strip-link">
        All →
      </Link>
      {isUsingPlaceholders(announcements) && (
        <span className="announcement-strip-hint">Preview updates</span>
      )}
    </section>
  );
}
