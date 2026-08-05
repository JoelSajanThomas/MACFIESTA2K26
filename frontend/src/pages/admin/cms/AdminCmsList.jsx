import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminTableToolbar from "../../../components/admin/AdminTableToolbar";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import LoadingState from "../../../components/ui/LoadingState";
import ErrorState from "../../../components/ui/ErrorState";
import { CMS_RESOURCES } from "./cmsAdminConfig";

export default function AdminCmsList() {
  const { resource } = useParams();
  const config = CMS_RESOURCES[resource];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  function load() {
    if (!config) return;
    setLoading(true);
    setError("");
    config.api.list()
      .then((res) => setItems(res.data))
      .catch(() => setError(`Could not load ${config.title.toLowerCase()}.`))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [resource]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      config.searchFields.some((f) => String(item[f] || "").toLowerCase().includes(q))
    );
  }, [items, search, config]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await config.api.delete(deleteId);
      setItems((prev) => prev.filter((i) => i.id !== deleteId));
      setDeleteId(null);
    } catch {
      setError("Could not delete item.");
    }
  }

  if (!config) {
    return <p className="state-msg error">Unknown content type.</p>;
  }

  return (
    <div className="admin-list-page">
      <div className="admin-list-head">
        <h2>{config.title}</h2>
        <Link to={`${config.basePath}/new`} className="btn btn-gold btn-sm">Add {config.singular}</Link>
      </div>
      <Link to="/admin/content" className="back-link">← Website content</Link>

      <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search…" />

      {loading && <LoadingState message="Loading…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="admin-table-wrap">
          <table className="dash-table admin-table">
            <thead>
              <tr>
                {config.listColumns.map((col) => <th key={col.key}>{col.label}</th>)}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  {config.listColumns.map((col) => (
                    <td key={col.key} data-label={col.label}>{item[col.key]}</td>
                  ))}
                  <td data-label="Status">
                    <span className={`dash-badge ${item.is_active !== false ? "open" : "closed"}`}>
                      {item.is_active !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td data-label="Actions" className="admin-actions-cell">
                    <Link to={`${config.basePath}/${item.id}/edit`} className="btn btn-card btn-sm">Edit</Link>
                    <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setDeleteId(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog open={Boolean(deleteId)} title={`Delete ${config.singular.toLowerCase()}?`} message="This cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
