import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import AnnouncementCard from "../components/announcements/AnnouncementCard";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { getAnnouncements } from "../services/api";
import { isUsingPlaceholders, resolveAnnouncements, getLastUpdated, formatAnnouncementDate } from "../utils/announcementUtils";
import { BRAND } from "../utils/brand";
import { categoryImages } from "../utils/assets";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    getAnnouncements()
      .then((res) => setAnnouncements(res.data))
      .catch(() => setError("Could not load announcements."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const items = resolveAnnouncements(announcements);
  const usingPlaceholders = isUsingPlaceholders(announcements);
  const lastUpdated = getLastUpdated(items);

  return (
    <>
      <PageHeader
        eyebrow="Fest updates"
        title="Announcements"
        subtitle={`Official ${BRAND.festName} alerts, schedule updates, and coordinator notices.`}
        image={categoryImages.stage}
      />

      <section className="section page-content announcements-page">
        <div className="container narrow-wide">
          {lastUpdated && !loading && (
            <p className="announcements-last-updated">
              Last updated: <time dateTime={lastUpdated.toISOString()}>{formatAnnouncementDate(lastUpdated.toISOString())}</time>
            </p>
          )}
          {loading && <LoadingState message="Loading announcements…" />}
          {error && <ErrorState message={error} onRetry={load} />}

          {usingPlaceholders && !loading && !error && (
            <motion.p
              className="announcements-placeholder-note"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Showing preview updates until live announcements are published by coordinators.
            </motion.p>
          )}

          {!loading && !error && items.length === 0 && (
            <EmptyState
              icon="📢"
              title="No announcements yet"
              message="Check back soon for fest updates and registration alerts."
              action={<Link to="/" className="btn btn-outline">Back to Home</Link>}
            />
          )}

          {!loading && !error && items.length > 0 && (
            <div className="announcements-page-grid">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <AnnouncementCard item={item} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
