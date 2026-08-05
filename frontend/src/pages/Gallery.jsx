import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import GalleryGrid from "../components/GalleryGrid";
import GalleryLightbox from "../components/gallery/GalleryLightbox";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { getGallery } from "../services/api";
import { PAGE_IMAGES } from "../utils/assets";
import {
  GALLERY_FILTERS,
  filterGalleryItems,
  normalizeGalleryItems,
} from "../utils/galleryUtils";
import { GALLERY_VIDEO_SAMPLES } from "../utils/pageContent";

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
        subtitle="Glimpses from MacFiesta — photos and highlight reels."
        image={PAGE_IMAGES.gallery}
      />

      <section className="section page-content gallery-page">
        <div className="container">
          {GALLERY_VIDEO_SAMPLES.length > 0 && (
            <div className="gallery-video-glimpses">
              <h2 className="home-section-title">Video Glimpses</h2>
              <div className="gallery-video-grid">
                {GALLERY_VIDEO_SAMPLES.map((vid) => (
                  <figure key={vid.id} className="gallery-video-card">
                    <video
                      src={vid.src}
                      poster={vid.poster}
                      controls
                      playsInline
                      preload="metadata"
                      aria-label={vid.title}
                    />
                    <figcaption>{vid.title}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

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
