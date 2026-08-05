import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import EventCard from "../components/EventCard";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import ScrollReveal from "../components/ScrollReveal";
import { getEvents } from "../services/api";
import { PAGE_IMAGES } from "../utils/assets";
import { EVENT_GUIDELINES, PRIZE_POOL_SAMPLE } from "../utils/pageContent";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getEvents()
      .then((res) => setEvents(res.data))
      .catch(() => setError("Could not load events."))
      .finally(() => setLoading(false));
  }, []);

  function retry() {
    setLoading(true);
    setError("");
    getEvents()
      .then((res) => setEvents(res.data))
      .catch(() => setError("Could not load events."))
      .finally(() => setLoading(false));
  }

  const generalEvents = useMemo(
    () => events.filter((e) => e.category === "general" || !e.department),
    [events]
  );

  const departmentEvents = useMemo(
    () => events.filter((e) => e.department),
    [events]
  );

  const departments = useMemo(() => {
    const map = {};
    departmentEvents.forEach((e) => {
      const key = e.department || "Other";
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [departmentEvents]);

  return (
    <>
      <PageHeader
        eyebrow="Competitions"
        title="Events"
        subtitle="Ready to compete? Browse guidelines, prize pools, and every MacFiesta competition."
        image={PAGE_IMAGES.events}
      />
      <section className="section page-content events-page">
        <div className="container">
          <ScrollReveal className="events-intro detail-panel">
            <h2>Ready to Compete?</h2>
            <p>
              Macfiesta brings together solo artists, duos, squads, and full crews from colleges
              across India. Pick your arena, read the guidelines, and register before slots fill.
            </p>
            <Link to="/login" className="btn btn-gold">Register Now</Link>
          </ScrollReveal>

          <ScrollReveal className="events-guidelines detail-panel">
            <h2>General Guidelines</h2>
            <ul className="events-guidelines-list">
              {EVENT_GUIDELINES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal className="events-prize-pool">
            <h2 className="home-section-title">Prize Pool</h2>
            <p className="sample-data-note">Indicative pools — confirm amounts on each event page.</p>
            <div className="prize-pool-grid">
              {PRIZE_POOL_SAMPLE.map((p) => (
                <div key={p.tier} className="prize-pool-card detail-panel">
                  <strong>{p.tier}</strong>
                  <span className="prize-pool-amount">{p.amount}</span>
                  <p>{p.note}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {loading && <LoadingState message="Loading events…" />}
          {error && <ErrorState message={error} onRetry={retry} />}

          {!loading && !error && (
            <>
              <ScrollReveal>
                <h2 className="home-section-title">General Events</h2>
              </ScrollReveal>
              <div className="events-grid-premium">
                {generalEvents.length > 0 ? (
                  generalEvents.map((ev, i) => (
                    <ScrollReveal key={ev.id} delay={i % 8}>
                      <EventCard event={ev} />
                    </ScrollReveal>
                  ))
                ) : (
                  <EmptyState
                    icon="📅"
                    title="General events"
                    message="General competitions appear here when published."
                  />
                )}
              </div>

              {departments.length > 0 && (
                <>
                  <ScrollReveal>
                    <h2 className="home-section-title">Department-wise Events</h2>
                  </ScrollReveal>
                  {departments.map(([dept, deptEvents]) => (
                    <div key={dept} className="events-dept-block">
                      <h3 className="events-dept-title">{dept}</h3>
                      <div className="events-grid-premium">
                        {deptEvents.map((ev, i) => (
                          <ScrollReveal key={ev.id} delay={i % 8}>
                            <EventCard event={ev} />
                          </ScrollReveal>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {events.length === 0 && (
                <EmptyState
                  icon="📅"
                  title="No events yet"
                  message="Events will appear here once coordinators publish them."
                />
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
