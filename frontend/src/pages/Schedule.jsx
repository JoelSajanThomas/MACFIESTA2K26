import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import ScheduleDayGroup from "../components/schedule/ScheduleDayGroup";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { getEvents } from "../services/api";
import { PAGE_IMAGES } from "../utils/assets";
import {
  SCHEDULE_CATEGORIES,
  filterScheduleEvents,
  groupEventsByDate,
} from "../utils/scheduleUtils";

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getEvents()
      .then((res) => setEvents(res.data))
      .catch(() => setError("Could not load schedule."))
      .finally(() => setLoading(false));
  }, []);

  function retry() {
    setLoading(true);
    setError("");
    getEvents()
      .then((res) => setEvents(res.data))
      .catch(() => setError("Could not load schedule."))
      .finally(() => setLoading(false));
  }

  const filtered = useMemo(
    () => filterScheduleEvents(events, category, search),
    [events, category, search]
  );

  const dayGroups = useMemo(() => {
    const grouped = groupEventsByDate(filtered);
    return Object.values(grouped);
  }, [filtered]);

  return (
    <>
      <PageHeader
        eyebrow="Plan your fest"
        title="Event Schedule"
        subtitle="Day-wise timetable of all MacFiesta competitions — never miss a moment."
        image={PAGE_IMAGES.schedule}
      />

      <section className="section page-content schedule-page">
        <div className="container">
          <div className="schedule-toolbar">
            <div className="schedule-search-wrap">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search by event or venue…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="schedule-search"
              />
            </div>

            <div className="schedule-filters">
              {SCHEDULE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`chip${category === cat.value ? " active" : ""}`}
                  onClick={() => setCategory(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {loading && <LoadingState message="Loading schedule…" />}
          {error && <ErrorState message={error} onRetry={retry} />}

          {!loading && !error && dayGroups.length === 0 && (
            <EmptyState
              icon="📅"
              title={events.length === 0 ? "Schedule coming soon" : "No matching events"}
              message={
                events.length === 0
                  ? "The fest timetable will be published here once events are confirmed."
                  : "Try a different category or search term."
              }
              action={
                events.length === 0 ? (
                  <Link to="/events" className="btn btn-outline">Browse Events</Link>
                ) : null
              }
            />
          )}

          {!loading && !error && (
            <div className="schedule-days">
              {dayGroups.map((day, i) => (
                <ScheduleDayGroup key={day.date} day={day} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
