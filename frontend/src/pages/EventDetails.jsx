import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import RegistrationForm from "../components/RegistrationForm";
import EventWinnersSection from "../components/results/EventWinnersSection";
import ScheduleInfoCard from "../components/schedule/ScheduleInfoCard";
import LoadingState from "../components/ui/LoadingState";
import { getEvent, getEvents, getResults, mediaUrl } from "../services/api";
import { getEventFallbackImage } from "../utils/assets";
import { getSeatsRemaining, getSeatsFillPercent, formatCategoryLabel } from "../utils/eventUtils";

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

  if (loading) {
    return (
      <div className="page-content container">
        <LoadingState message="Loading event…" />
      </div>
    );
  }
  if (error || !event) return (
    <div className="page-content container">
      <p className="state-msg error">{error}</p>
      <Link to="/events" className="btn btn-gold">Back to Events</Link>
    </div>
  );

  const img = mediaUrl(event.image) || getEventFallbackImage(event.category);
  const seatsLeft = getSeatsRemaining(event);
  const fillPercent = getSeatsFillPercent(event);

  return (
    <>
      <PageHeader
        eyebrow={event.category}
        title={event.title}
        subtitle={`${formatDate(event.event_date)} · ${event.venue}`}
        image={img}
      />
      <section className="section page-content event-details-page">
        <div className="container">
          <Link to="/events" className="back-link">← All events</Link>

          <div className="event-detail-top-cards">
            <div className="detail-info-chip">
              <span>Date</span>
              <strong>{formatDate(event.event_date)}</strong>
            </div>
            <div className="detail-info-chip">
              <span>Time</span>
              <strong>{formatTime(event.event_time)}</strong>
            </div>
            <div className="detail-info-chip">
              <span>Venue</span>
              <strong>{event.venue}</strong>
            </div>
            <div className="detail-info-chip">
              <span>Fee</span>
              <strong>₹{event.registration_fee}</strong>
            </div>
          </div>

          <motion.div
            className="event-detail-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="detail-main">
              <div className="detail-panel detail-about-panel">
                <h3>About this event</h3>
                <p className="detail-desc">{event.description}</p>
              </div>

              {event.rules && (
                <div className="detail-panel">
                  <h3>Rules &amp; Guidelines</h3>
                  <p className="rules-text">{event.rules}</p>
                </div>
              )}

              {(event.coordinator_name || event.coordinator_phone || event.coordinator_email) && (
                <div className="detail-panel">
                  <h3>Event Coordinator</h3>
                  <dl className="detail-facts">
                    {event.coordinator_name && <div><dt>Name</dt><dd>{event.coordinator_name}</dd></div>}
                    {event.coordinator_phone && <div><dt>Phone</dt><dd><a href={`tel:${event.coordinator_phone}`}>{event.coordinator_phone}</a></dd></div>}
                    {event.coordinator_email && <div><dt>Email</dt><dd><a href={`mailto:${event.coordinator_email}`}>{event.coordinator_email}</a></dd></div>}
                  </dl>
                </div>
              )}

              <EventWinnersSection event={event} results={results} />

              <div className="detail-cta-panel">
                <h3>Planning your fest day?</h3>
                <p>Check the full timetable or browse other competitions at the same venue.</p>
                <div className="detail-cta-actions">
                  <Link to="/schedule" className="btn btn-outline">View Schedule</Link>
                  <Link to="/events" className="btn btn-gold">More Events</Link>
                </div>
              </div>
            </div>

            <aside className="detail-sidebar">
              <div className="detail-panel detail-status-panel">
                <div className="detail-status-badges">
                  <span className={`event-badge ${event.is_registration_open ? "open" : "closed"}`}>
                    {event.is_registration_open ? "Registration Open" : "Closed"}
                  </span>
                  {event.is_result_published && (
                    <span className="event-badge results-published">Results Published</span>
                  )}
                </div>
                <dl className="detail-facts">
                  <div><dt>Registered</dt><dd className="gold-text">{event.participant_count} teams</dd></div>
                  <div><dt>Capacity</dt><dd>{event.max_participants} max · {seatsLeft > 0 ? `${seatsLeft} left` : "Full"}</dd></div>
                  <div><dt>Category</dt><dd className="capitalize">{formatCategoryLabel(event.category)}</dd></div>
                  {event.department && <div><dt>Department</dt><dd>{event.department}</dd></div>}
                  {(event.min_team_size || event.max_team_size) && (
                    <div><dt>Team size</dt><dd>{event.min_team_size || 1}–{event.max_team_size || "∞"}</dd></div>
                  )}
                </dl>
                {event.is_registration_open && (
                  <div className="event-seats-bar detail-seats-bar" aria-label={`${seatsLeft} seats remaining of ${event.max_participants}`}>
                    <div className="event-seats-track">
                      <div className="event-seats-fill" style={{ width: `${fillPercent}%` }} />
                    </div>
                    <span className="event-seats-label">
                      {seatsLeft > 0
                        ? `${seatsLeft} of ${event.max_participants} seats available`
                        : event.waiting_list_enabled
                          ? "Full — waiting list open"
                          : "Registration full"}
                    </span>
                  </div>
                )}
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
