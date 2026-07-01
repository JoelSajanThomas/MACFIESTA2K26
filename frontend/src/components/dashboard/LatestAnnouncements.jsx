import { formatAnnouncementDate } from "../../utils/announcementUtils";

export default function LatestAnnouncements({ announcements = [] }) {
  const active = announcements
    .filter((a) => a.is_active !== false)
    .slice(0, 5);

  if (active.length === 0) {
    return <div className="dash-empty">No active announcements.</div>;
  }

  return (
    <div className="latest-announcements-list">
      {active.map((item) => (
        <article key={item.id} className="latest-announcement-item">
          <div className="latest-announcement-head">
            <span className="announcement-badge active">Active</span>
            {item.created_at && (
              <time>{formatAnnouncementDate(item.created_at)}</time>
            )}
          </div>
          <strong>{item.title}</strong>
          <p>{item.message}</p>
        </article>
      ))}
    </div>
  );
}
