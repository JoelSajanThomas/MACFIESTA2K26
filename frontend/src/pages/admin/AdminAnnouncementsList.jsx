import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { deleteAnnouncement, getAnnouncements } from "../../services/api";

export default function AdminAnnouncementsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);

  function load() {
    setLoading(true);
    getAnnouncements(true)
      .then((res) => setItems(res.data))
      .catch(() => setError("Could not load announcements."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((a) => {
      if (activeFilter === "active" && !a.is_active) return false;
      if (activeFilter === "inactive" && a.is_active) return false;
      if (!q) return true;
      return [a.title, a.message].some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, search, activeFilter]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteAnnouncement(deleteId);
      setItems((prev) => prev.filter((a) => a.id !== deleteId));
      setDeleteId(null);
    } catch {
      setError("Could not delete announcement.");
    }
  }

  return (
    <div className="admin-list-page">
      <div className="admin-list-head">
        <h2>Manage Announcements</h2>
        <Link to="/admin/announcements/new" className="btn btn-gold btn-sm">Add Announcement</Link>
      </div>

      <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search title or message…">
        <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="admin-select">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </AdminTableToolbar>

      {loading && <LoadingState message="Loading announcements…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="admin-table-wrap">
          <table className="dash-table admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td data-label="Title">{a.title}</td>
                  <td data-label="Status">
                    <span className={`dash-badge ${a.is_active ? "open" : "closed"}`}>
                      {a.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td data-label="Created">{new Date(a.created_at).toLocaleDateString("en-IN")}</td>
                  <td data-label="Actions" className="admin-actions-cell">
                    <Link to={`/admin/announcements/${a.id}/edit`} className="btn btn-card btn-sm">Edit</Link>
                    <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setDeleteId(a.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog open={Boolean(deleteId)} title="Delete announcement?" message="This cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
