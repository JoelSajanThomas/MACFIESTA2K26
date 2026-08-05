import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { deleteEvent, getEvents } from "../../services/api";
import { EVENT_CATEGORY_OPTIONS } from "../../utils/adminUtils";

export default function AdminEventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    setError("");
    getEvents()
      .then((res) => setEvents(res.data))
      .catch(() => setError("Could not load events."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (!q) return true;
      return [e.title, e.category, e.venue].some((v) => String(v).toLowerCase().includes(q));
    });
  }, [events, search, category]);

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
    <div className="admin-list-page">
      <div className="admin-list-head">
        <h2>Manage Events</h2>
        <Link to="/admin/events/new" className="btn btn-gold btn-sm">Add Event</Link>
      </div>

      <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search title, category, venue…">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-select">
          <option value="all">All categories</option>
          {EVENT_CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </AdminTableToolbar>

      {loading && <LoadingState message="Loading events…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="admin-table-wrap">
          <table className="dash-table admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Venue</th>
                <th>Registered</th>
                <th>Registration</th>
                <th>Results</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td data-label="Title">{e.title}</td>
                  <td data-label="Category">{e.category}</td>
                  <td data-label="Venue">{e.venue}</td>
                  <td data-label="Registered">{e.participant_count ?? 0}</td>
                  <td data-label="Registration">
                    <span className={`dash-badge ${e.is_registration_open ? "open" : "closed"}`}>
                      {e.is_registration_open ? "Open" : "Closed"}
                    </span>
                  </td>
                  <td data-label="Results">
                    <span className={`dash-badge ${e.is_result_published ? "published" : "pending"}`}>
                      {e.is_result_published ? "Published" : "Pending"}
                    </span>
                  </td>
                  <td data-label="Actions" className="admin-actions-cell">
                    <Link to={`/admin/events/${e.id}/edit`} className="btn btn-card btn-sm">Edit</Link>
                    <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setDeleteId(e.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="admin-empty">No events match your filters.</p>}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete event?"
        message="This will permanently remove the event and related data."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
