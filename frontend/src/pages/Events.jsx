import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import EventCard from "../components/EventCard";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { getEvents } from "../services/api";
import { CATEGORIES } from "../utils/constants";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("category") || "all";

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

  const filtered =
    filter === "all" ? events : events.filter((e) => e.category === filter);

  const chips = [{ slug: "all", label: "All" }, ...CATEGORIES.map((c) => ({ slug: c.slug, label: c.label }))];

  return (
    <>
      <PageHeader
        eyebrow="Competitions"
        title="All Events"
        subtitle="Browse every MacFiesta competition — venue, schedule, fees, and live registration counts."
        image="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80"
      />
      <section className="section page-content">
        <div className="container">
          <div className="filter-chips">
            {chips.map((chip) => (
              <button
                key={chip.slug}
                type="button"
                className={`chip${filter === chip.slug ? " active" : ""}`}
                onClick={() => setSearchParams(chip.slug === "all" ? {} : { category: chip.slug })}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {loading && <LoadingState message="Loading events…" />}
          {error && <ErrorState message={error} onRetry={retry} />}

          {!loading && !error && (
            <div className="events-grid-premium">
              {filtered.length > 0 ? (
                filtered.map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)
              ) : (
                <EmptyState
                  icon="📅"
                  title="No events found"
                  message={filter === "all" ? "Events will appear here once published." : "No events in this category yet."}
                />
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
