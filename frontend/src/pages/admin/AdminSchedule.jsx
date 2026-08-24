import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ScheduleDayGroup from "../../components/schedule/ScheduleDayGroup";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import { getEvents } from "../../services/api";
import { groupEventsByDate } from "../../utils/scheduleUtils";

export default function AdminSchedule() {
  const [searchParams] = useSearchParams();
  const printMode = searchParams.get("print") === "1";
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [day, setDay] = useState("all");

  useEffect(() => {
    getEvents()
      .then((res) => setEvents(res.data))
      .catch(() => setError("Could not load schedule."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!printMode || loading || error) return;
    const t = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(t);
  }, [printMode, loading, error, events]);

  const groups = useMemo(() => Object.values(groupEventsByDate(events)), [events]);
  const days = useMemo(() => groups.map((g) => g.date), [groups]);
  const visible = day === "all" ? groups : groups.filter((g) => g.date === day);

  return (
    <div className={`admin-page${printMode ? " admin-schedule-print" : ""}`}>
      <header className="admin-page-head">
        <h1>{printMode ? "Queue Sheet / Schedule" : "Event Schedule"}</h1>
        <p>
          {printMode
            ? "Printable day-wise queue from published events."
            : "Day-wise timetable from published events. Edit times in Events."}
        </p>
        {printMode && (
          <button type="button" className="btn btn-outline btn-sm no-print" onClick={() => window.print()}>
            Print queue sheet
          </button>
        )}
      </header>

      {days.length > 0 && (
        <div className="filter-chips admin-schedule-tabs">
          <button type="button" className={`chip${day === "all" ? " active" : ""}`} onClick={() => setDay("all")}>
            All days
          </button>
          {days.map((d) => (
            <button
              key={d}
              type="button"
              className={`chip${day === d ? " active" : ""}`}
              onClick={() => setDay(d)}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {loading && <LoadingState message="Loading schedule…" />}
      {error && <ErrorState message={error} />}

      {!loading && !error && visible.length === 0 && (
        <EmptyState icon="📅" title="No scheduled events" message="Add event dates in Manage Events." />
      )}

      {!loading && !error && visible.map((group, i) => (
        <ScheduleDayGroup key={group.date} day={group} index={i} />
      ))}
    </div>
  );
}
