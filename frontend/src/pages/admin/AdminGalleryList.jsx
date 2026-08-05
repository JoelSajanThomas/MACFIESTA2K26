import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { deleteGalleryImage, getGallery, mediaUrl } from "../../services/api";

export default function AdminGalleryList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  function load() {
    setLoading(true);
    getGallery()
      .then((res) => setItems(res.data))
      .catch(() => setError("Could not load gallery."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteGalleryImage(deleteId);
      setItems((prev) => prev.filter((i) => i.id !== deleteId));
      setDeleteId(null);
    } catch {
      setError("Could not delete image.");
    }
  }

  return (
    <div className="admin-list-page">
      <div className="admin-list-head">
        <h2>Manage Gallery</h2>
        <Link to="/admin/gallery/new" className="btn btn-gold btn-sm">Add Image</Link>
      </div>

      {loading && <LoadingState message="Loading gallery…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="admin-gallery-grid">
          {items.map((item) => (
            <article key={item.id} className="admin-gallery-card detail-panel">
              <img src={mediaUrl(item.image)} alt={item.title} loading="lazy" />
              <div className="admin-gallery-card-body">
                <strong>{item.title}</strong>
                <div className="admin-actions-cell">
                  <Link to={`/admin/gallery/${item.id}/edit`} className="btn btn-card btn-sm">Edit</Link>
                  <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setDeleteId(item.id)}>Delete</button>
                </div>
              </div>
            </article>
          ))}
          {items.length === 0 && <p className="admin-empty">No gallery images yet.</p>}
        </div>
      )}

      <ConfirmDialog open={Boolean(deleteId)} title="Delete image?" message="This will remove the image from the public gallery." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
