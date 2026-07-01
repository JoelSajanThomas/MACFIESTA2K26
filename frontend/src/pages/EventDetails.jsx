import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import RegistrationForm from "../components/RegistrationForm";
import EventWinnersSection from "../components/results/EventWinnersSection";
import ScheduleInfoCard from "../components/schedule/ScheduleInfoCard";
import { getEvent, getEvents, getResults, mediaUrl } from "../services/api";
import { CATEGORY_IMAGES } from "../utils/constants";

function formatDate(d) {
  if (!d) return "TBA";
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatTime(t) {
  if (!t) return "TBA";
  const [h, m] = t.split(":");
  const dt = new Date();
  dt.setHours(+h, +m);
  return dt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export default function EventDetails() {
  const { idOrSlug } = useParams();
  const [event, setEvent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvent = useCallback(() => {
    const isNum = /^\d+$/.test(idOrSlug);
    const load = isNum
      ? getEvent(idOrSlug)
      : getEvents().then((res) => {
          const m = res.data.find((e) => e.slug === idOrSlug);
          if (!m) throw new Error();
          return getEvent(m.id);
        });

    return load.then((res) => setEvent(res.data));
  }, [idOrSlug]);

  useEffect(() => {
    Promise.all([loadEvent(), getResults().catch(() => ({ data: [] }))])
      .then(([, resultsRes]) => setResults(resultsRes.data))
      .catch(() => setError("Event not found."))
      .finally(() => setLoading(false));
  }, [loadEvent]);

  const refreshEvent = useCallback(() => {
    loadEvent().catch(() => {});
  }, [loadEvent]);

  if (loading) return <div className="page-content container"><p className="state-msg">Loading…</p></div>;
  if (error || !event) return (
    <div className="page-content container">
      <p className="state-msg error">{error}</p>
      <Link to="/events" className="btn btn-gold">Back to Events</Link>
    </div>
  );

  const img = mediaUrl(event.image) || CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.default;
  const spots = event.max_participants - (event.participant_count || 0);

  return (
    <>
      <PageHeader eyebrow={event.category} title={event.title} image={img} />
      <section className="section page-content">
        <div className="container">
          <Link to="/events" className="back-link">← All events</Link>

          <motion.div
            className="event-detail-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="detail-main">
              <p className="detail-desc">{event.description}</p>
              {event.rules && (
                <div className="detail-panel">
                  <h3>Rules & Guidelines</h3>
                  <p className="rules-text">{event.rules}</p>
                </div>
              )}

              <EventWinnersSection event={event} results={results} />
            </div>

            <aside className="detail-sidebar">
              <div className="detail-panel">
                <span className={`event-badge ${event.is_registration_open ? "open" : "closed"}`}>
                  {event.is_registration_open ? "Registration Open" : "Closed"}
                </span>
                <dl className="detail-facts">
                  <div><dt>Venue</dt><dd>{event.venue}</dd></div>
                  <div><dt>Date</dt><dd>{formatDate(event.event_date)}</dd></div>
                  <div><dt>Time</dt><dd>{formatTime(event.event_time)}</dd></div>
                  <div><dt>Fee</dt><dd>₹{event.registration_fee}</dd></div>
                  <div><dt>Registered</dt><dd className="gold-text">{event.participant_count} participants</dd></div>
                  <div><dt>Capacity</dt><dd>{event.max_participants} max · {spots > 0 ? `${spots} left` : "Full"}</dd></div>
                </dl>
                {event.is_result_published && (
                  <Link to="/results" className="btn btn-outline btn-full">View Results</Link>
                )}
              </div>

              <RegistrationForm event={event} onSuccess={refreshEvent} />

              <ScheduleInfoCard event={event} />
            </aside>
          </motion.div>
        </div>
      </section>
    </>
  );
}
