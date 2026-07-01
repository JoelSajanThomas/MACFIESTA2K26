import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import GalleryGrid from "../components/GalleryGrid";
import GalleryLightbox from "../components/gallery/GalleryLightbox";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { getGallery } from "../services/api";
import {
  GALLERY_FILTERS,
  filterGalleryItems,
  normalizeGalleryItems,
} from "../utils/galleryUtils";

export default function Gallery() {
  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    getGallery()
      .then((res) => setRawItems(res.data))
      .catch(() => setError("Could not load gallery."))
      .finally(() => setLoading(false));
  }, []);

  function retry() {
    setLoading(true);
    setError("");
    getGallery()
      .then((res) => setRawItems(res.data))
      .catch(() => setError("Could not load gallery."))
      .finally(() => setLoading(false));
  }

  const usePlaceholders = rawItems.length === 0;
  const normalized = useMemo(
    () => normalizeGalleryItems(rawItems, usePlaceholders),
    [rawItems, usePlaceholders]
  );

  const filtered = useMemo(
    () => filterGalleryItems(normalized, filter),
    [normalized, filter]
  );

  return (
    <>
      <PageHeader
        eyebrow="Memories"
        title="Gallery"
        subtitle="A premium media wall of MacFiesta stages, crowds, tech battles, and victory moments."
        image="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80"
      />

      <section className="section page-content gallery-page">
        <div className="container">
          <div className="gallery-toolbar">
            <div className="gallery-filters">
              {GALLERY_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={`chip${filter === f.value ? " active" : ""}`}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading && <LoadingState message="Loading gallery…" />}
          {error && <ErrorState message={error} onRetry={retry} />}

          {!loading && !error && normalized.length === 0 && (
            <EmptyState
              icon="📷"
              title="Gallery coming soon"
              message="Official fest photos will appear here as coordinators upload highlights."
              action={<Link to="/events" className="btn btn-outline">Explore Events</Link>}
            />
          )}

          {!loading && !error && normalized.length > 0 && (
            <GalleryGrid
              items={filtered}
              onItemClick={setActive}
              showPlaceholderNote={usePlaceholders}
            />
          )}
        </div>
      </section>

      <GalleryLightbox item={active} onClose={() => setActive(null)} />
    </>
  );
}
