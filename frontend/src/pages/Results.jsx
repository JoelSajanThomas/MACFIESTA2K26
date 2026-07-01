import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import EventResultsGroup from "../components/results/EventResultsGroup";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { getResults } from "../services/api";
import {
  FILTER_OPTIONS,
  filterResults,
  groupResultsByEvent,
} from "../utils/resultsUtils";

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getResults()
      .then((res) => setResults(res.data))
      .catch(() => setError("Could not load results."))
      .finally(() => setLoading(false));
  }, []);

  function retry() {
    setLoading(true);
    setError("");
    getResults()
      .then((res) => setResults(res.data))
      .catch(() => setError("Could not load results."))
      .finally(() => setLoading(false));
  }

  const filtered = useMemo(
    () => filterResults(results, positionFilter, search),
    [results, positionFilter, search]
  );

  const groups = useMemo(() => groupResultsByEvent(filtered), [filtered]);

  return (
    <>
      <PageHeader
        eyebrow="Champions"
        title="Results"
        subtitle="Official podium placements across MacFiesta competitions."
        image="https://images.unsplash.com/photo-1523580495183-5f5a5c1c4c0e?w=1920&q=80"
      />

      <section className="section page-content results-page">
        <div className="container">
          <div className="results-toolbar">
            <div className="results-search-wrap">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search by event or participant…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="results-search"
              />
            </div>

            <div className="results-filters">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`chip${positionFilter === opt.value ? " active" : ""}`}
                  onClick={() => setPositionFilter(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {loading && <LoadingState message="Loading results…" />}
          {error && <ErrorState message={error} onRetry={retry} />}

          {!loading && !error && groups.length === 0 && (
            <EmptyState
              icon="🏆"
              title={results.length === 0 ? "No results published yet" : "No matching results"}
              message={
                results.length === 0
                  ? "Winners will appear here once coordinators publish official results."
                  : "Try a different search term or filter."
              }
              action={
                results.length === 0 ? (
                  <Link to="/events" className="btn btn-outline">Browse Events</Link>
                ) : null
              }
            />
          )}

          {!loading && !error && (
            <div className="results-groups">
              {groups.map((group, i) => (
                <EventResultsGroup key={group.id} group={group} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
