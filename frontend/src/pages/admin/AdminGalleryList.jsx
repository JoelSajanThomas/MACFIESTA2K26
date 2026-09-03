import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { deleteGalleryImage, getGallery, mediaUrl } from "../../services/api";
import { getGalleryItems, deleteGalleryItem as deleteStoreGalleryItem } from "../../lib/galleryStore";

export default function AdminGalleryList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  function load() {
    setLoading(true);
    setError("");

    getGallery()
      .then((res) => {
        const backendItems = (res.data || []).map((b) => ({
          id: b.id,
          title: b.title,
          // Use thumbnail for videos, otherwise the image URL
          image: b.type === "video"
            ? (mediaUrl(b.thumbnail) || "/logo.png")
            : (b.url || mediaUrl(b.image) || "/logo.png"),
          type: b.type || "image",
          category: b.category || "general",
          isBackend: true,
        }));

        const storeItems = getGalleryItems()
          .filter((s) => !backendItems.some((b) => String(b.id) === String(s.id)))
          .map((s) => ({
            id: s.id,
            title: s.title,
            image: s.thumbnailUrl || s.url,
            type: s.type || "image",
            category: s.category || "general",
            isBackend: false,
          }));

        setItems([...backendItems, ...storeItems]);
      })
      .catch(() => {
        // Fallback to local gallery store items
        const storeItems = getGalleryItems().map((s) => ({
          id: s.id,
          title: s.title,
          image: s.thumbnailUrl || s.url,
          type: s.type || "image",
          category: s.category || "general",
          isBackend: false,
        }));
        setItems(storeItems);
      })
      .finally(() => setLoading(false));
  }


  useEffect(() => {
    load();
  }, []);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      if (!isNaN(Number(deleteId))) {
        try {
          await deleteGalleryImage(deleteId);
        } catch {
          // Backend record may already be removed or mock item
        }
      }
      deleteStoreGalleryItem(String(deleteId));
      setItems((prev) => prev.filter((i) => String(i.id) !== String(deleteId)));
      setDeleteId(null);
    } catch {
      setError("Could not delete image.");
    }
  }

  return (
    <div className="admin-list-page">
      <div className="admin-list-head">
        <div>
          <h2>Manage Visual Archives &amp; Gallery</h2>
          <p className="text-xs text-white/50">Upload images, highlights, and reels for the public gallery.</p>
        </div>
        <Link to="/admin/gallery/new" className="btn btn-gold btn-sm">+ Add Image / Video</Link>
      </div>

      {loading && <LoadingState message="Loading gallery…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="admin-gallery-grid">
          {items.map((item) => (
            <article key={item.id} className="admin-gallery-card detail-panel">
              <div className="relative w-full h-40 bg-black/40 overflow-hidden flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/logo.png";
                  }}
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-black/70 border border-white/20 text-arc-cyan">
                  {item.type}
                </span>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-black/70 text-white/80">
                  {item.category}
                </span>
              </div>
              <div className="admin-gallery-card-body p-3">
                <strong className="text-sm truncate block">{item.title}</strong>
                <div className="admin-actions-cell mt-2 flex gap-2">
                  <Link to={`/admin/gallery/${item.id}/edit`} className="btn btn-card btn-sm flex-1 text-center">Edit</Link>
                  <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setDeleteId(item.id)}>Delete</button>
                </div>
              </div>
            </article>
          ))}
          {items.length === 0 && <p className="admin-empty">No gallery images or videos yet.</p>}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete gallery media?"
        message="This will remove the media item from the public archives."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
