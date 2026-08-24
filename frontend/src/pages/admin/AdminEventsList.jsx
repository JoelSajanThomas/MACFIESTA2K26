import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import { deleteEvent, getEvents, getAdminRegistrations, getResults } from "../../services/api";
import { EVENT_CATEGORY_OPTIONS, EVENT_AUDIENCE_OPTIONS } from "../../utils/adminUtils";

const VALID_CATEGORIES = new Set(EVENT_CATEGORY_OPTIONS.map((o) => o.value));

export default function AdminEventsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [regCounts, setRegCounts] = useState({});
  const [resultMap, setResultMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const categoryParam = searchParams.get("category");
  const category = VALID_CATEGORIES.has(categoryParam) ? categoryParam : "all";
  const [audience, setAudience] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function setCategory(next) {
    const nextParams = new URLSearchParams(searchParams);
    if (!next || next === "all") nextParams.delete("category");
    else nextParams.set("category", next);
    setSearchParams(nextParams, { replace: true });
  }

  function load() {
    setLoading(true);
    setError("");
    Promise.all([
      getEvents(),
      getAdminRegistrations().catch(() => ({ data: [] })),
      getResults().catch(() => ({ data: [] })),
    ])
      .then(([eventsRes, regsRes, resultsRes]) => {
        setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
        const regs = Array.isArray(regsRes.data) ? regsRes.data : regsRes.data?.results || [];
        const counts = {};
        const participants = {};
        regs.forEach((r) => {
          if (r.approval_status === "cancelled") return;
          const key = r.event;
          counts[key] = (counts[key] || 0) + 1;
          const teamExtra = r.registration_type === "team" ? (r.team_members?.length || 0) : 0;
          participants[key] = (participants[key] || 0) + 1 + teamExtra;
        });
        setRegCounts({ counts, participants });
        const results = Array.isArray(resultsRes.data) ? resultsRes.data : resultsRes.data?.results || [];
        const byEvent = {};
        results.forEach((r) => {
          byEvent[r.event] = (byEvent[r.event] || 0) + 1;
        });
        setResultMap(byEvent);
      })
      .catch(() => setError("Could not load events."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (audience !== "all" && e.audience !== audience) return false;
      if (!q) return true;
      return [e.title, e.category, e.venue, e.audience, e.department, e.slug].some((v) =>
        String(v || "").toLowerCase().includes(q)
      );
    });
  }, [events, search, category, audience]);

  const summary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const active = events.filter((e) => e.status !== "cancelled");
    return {
      total: active.length,
      registrations: Object.values(regCounts.counts || {}).reduce((a, b) => a + b, 0),
      participants: Object.values(regCounts.participants || {}).reduce((a, b) => a + b, 0),
      today: active.filter((e) => e.event_date === today).length,
      pendingResults: active.filter((e) => !e.is_result_published).length,
    };
  }, [events, regCounts]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEvent(deleteId);
      setEvents((prev) => prev.filter((e) => e.id !== deleteId));
      setDeleteId(null);
    } catch {
      setError("Could not delete event.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-ops-page admin-list-page">
      <header className="admin-ops-header">
        <p className="section-eyebrow">Event Operations</p>
        <div className="admin-list-head">
          <h1>Missions</h1>
          <Link to="/admin/events/new" className="btn btn-gold btn-sm">Add Mission</Link>
        </div>
        <p>Open a mission to view participants, set winners, or edit details.</p>
      </header>

      <div className="admin-kpi-grid admin-kpi-grid--compact">
        <article className="admin-kpi-card"><strong>{summary.total}</strong><span>Total events</span></article>
        <article className="admin-kpi-card"><strong>{summary.registrations}</strong><span>Total registrations</span></article>
        <article className="admin-kpi-card"><strong>{summary.participants}</strong><span>Total participants</span></article>
        <article className="admin-kpi-card"><strong>{summary.today}</strong><span>Events today</span></article>
        <article className="admin-kpi-card"><strong>{summary.pendingResults}</strong><span>Results pending</span></article>
      </div>

      <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search title, category, venue…">
        <select value={audience} onChange={(e) => setAudience(e.target.value)} className="admin-select">
          <option value="all">All days (School / College)</option>
          {EVENT_AUDIENCE_OPTIONS.filter((o) => o.value).map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-select">
          <option value="all">All categories</option>
          {EVENT_CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </AdminTableToolbar>

      {loading && <LoadingState message="Loading events…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No events found" message="No events match your filters." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="admin-table-wrap">
          <table className="dash-table admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Day</th>
                <th>Time</th>
                <th>Venue</th>
                <th>Regs</th>
                <th>Participants</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const regs = regCounts.counts?.[e.id] ?? e.participant_count ?? 0;
                const parts = regCounts.participants?.[e.id] ?? regs;
                const hasResults = (resultMap[e.id] || 0) > 0;
                return (
                  <tr key={e.id}>
                    <td data-label="Event"><strong>{e.title}</strong></td>
                    <td data-label="Category">{e.category || "—"}</td>
                    <td data-label="Day">{e.audience || "—"}</td>
                    <td data-label="Time">
                      {[e.event_date, e.event_time].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td data-label="Venue">{e.venue || "—"}</td>
                    <td data-label="Regs">{regs}</td>
                    <td data-label="Participants">{parts}</td>
                    <td data-label="Status">
                      {e.status}
                      {e.is_result_published
                        ? " · Published"
                        : hasResults
                          ? " · Draft results"
                          : " · No results"}
                    </td>
                    <td data-label="Actions" className="admin-actions-cell">
                      <Link to={`/admin/events/${e.id}/participants`} className="btn btn-card btn-sm">
                        View participants
                      </Link>
                      <Link to={`/admin/events/${e.id}/winners`} className="btn btn-card btn-sm">
                        Set winners
                      </Link>
                      <Link to="/admin/schedule" className="btn btn-outline btn-sm">
                        Schedule
                      </Link>
                      <Link to={`/admin/events/${e.id}/edit`} className="btn btn-outline btn-sm">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger-outline btn-sm"
                        onClick={() => setDeleteId(e.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete event?"
        message="This will permanently remove the event and related data."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
