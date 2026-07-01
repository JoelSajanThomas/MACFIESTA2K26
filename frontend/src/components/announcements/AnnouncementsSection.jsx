import { Link } from "react-router-dom";
import SectionHeading from "../SectionHeading";
import AnnouncementCard from "./AnnouncementCard";
import { resolveAnnouncements, isUsingPlaceholders } from "../../utils/announcementUtils";

export default function AnnouncementsSection({ announcements = [] }) {
  const items = resolveAnnouncements(announcements).slice(0, 3);
  const usingPlaceholders = isUsingPlaceholders(announcements);

  return (
    <section className="section announcements-home-section" id="announcements">
      <div className="container">
        <SectionHeading
          eyebrow="Stay informed"
          title="Latest Announcements"
          subtitle="Registration alerts, schedule changes, and fest highlights — updated live."
        />

        {usingPlaceholders && (
          <p className="announcements-placeholder-note">
            Preview updates shown until coordinators publish live announcements.
          </p>
        )}

        <div className="announcements-home-grid">
          {items.map((item) => (
            <AnnouncementCard key={item.id} item={item} compact />
          ))}
        </div>

        <div className="section-cta">
          <Link to="/announcements" className="btn btn-outline">
            View All Announcements
          </Link>
        </div>
      </div>
    </section>
  );
}
