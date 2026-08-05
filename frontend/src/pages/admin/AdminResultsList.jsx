import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { deleteResult, getResults } from "../../services/api";
import { POSITION_OPTIONS } from "../../utils/adminUtils";

export default function AdminResultsList() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("all");
  const [deleteId, setDeleteId] = useState(null);

  function load() {
    setLoading(true);
    getResults()
      .then((res) => setResults(res.data))
      .catch(() => setError("Could not load results."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return results.filter((r) => {
      if (position !== "all" && r.position !== position) return false;
      if (!q) return true;
      return [r.event_title, r.participant_name, r.college_name].some((v) =>
        String(v || "").toLowerCase().includes(q)
      );
    });
  }, [results, search, position]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteResult(deleteId);
      setResults((prev) => prev.filter((r) => r.id !== deleteId));
      setDeleteId(null);
    } catch {
      setError("Could not delete result.");
    }
  }

  return (
    <div className="admin-list-page">
      <div className="admin-list-head">
        <h2>Manage Results</h2>
        <Link to="/admin/results/new" className="btn btn-gold btn-sm">Add Result</Link>
      </div>

      <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search event, participant, college…">
        <select value={position} onChange={(e) => setPosition(e.target.value)} className="admin-select">
          <option value="all">All positions</option>
          {POSITION_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </AdminTableToolbar>

      {loading && <LoadingState message="Loading results…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="admin-table-wrap">
          <table className="dash-table admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Participant</th>
                <th>College</th>
                <th>Position</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td data-label="Event">{r.event_title}</td>
                  <td data-label="Participant">{r.participant_name}</td>
                  <td data-label="College">{r.college_name}</td>
                  <td data-label="Position">{r.position}</td>
                  <td data-label="Actions" className="admin-actions-cell">
                    <Link to={`/admin/results/${r.id}/edit`} className="btn btn-card btn-sm">Edit</Link>
                    <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setDeleteId(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete result?"
        message="This will remove the result from the public Results page."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
