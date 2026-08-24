import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { formatAnnouncementDate } from "../../utils/announcementUtils";

export default function AnnouncementCard({ item, compact = false, showLink = false }) {
  const urgent =
    item?.priority === "urgent" ||
    item?.is_urgent === true ||
    /urgent|emergency|critical|breaking/i.test(String(item?.title || ""));

  return (
    <motion.article
      className={`announcement-card comic-panel${compact ? " compact" : ""}${urgent ? " is-urgent" : ""}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
    >
      <div className="announcement-card-head">
        <span className={`announcement-badge${urgent ? " urgent" : item.is_active !== false ? " active" : " inactive"}`}>
          {urgent ? "Mission Alert" : item.is_active !== false ? "Update" : "Inactive"}
        </span>
        {item.created_at && (
          <time dateTime={item.created_at}>{formatAnnouncementDate(item.created_at)}</time>
        )}
      </div>
      <h3>{item.title}</h3>
      <p>{item.message}</p>
      {!compact && showLink && (
        <Link to="/announcements" className="announcement-card-link">
          Read all updates →
        </Link>
      )}
    </motion.article>
  );
}
