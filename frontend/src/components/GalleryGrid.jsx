import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { formatGalleryDate } from "../utils/galleryUtils";
import { useMotionPrefs } from "../hooks/useMotionPrefs";
import { buildFadeUp } from "../utils/animations";

export default function GalleryGrid({
  items = [],
  preview = false,
  limit,
  onItemClick,
  showPlaceholderNote = false,
}) {
  const prefs = useMotionPrefs();
  const fadeUp = useMemo(() => buildFadeUp(prefs), [prefs]);
  const sliced = limit ? items.slice(0, limit) : items;

  if (sliced.length === 0) {
    return (
      <div className="gallery-empty-state">
        <span className="gallery-empty-icon">📷</span>
        <h3>No photos in this category</h3>
        <p>Try another filter or check back after the fest.</p>
      </div>
    );
  }

  return (
    <>
      {showPlaceholderNote && (
        <p className="gallery-placeholder-note">
          Showing fest highlight previews — official photos will appear here as they are uploaded.
        </p>
      )}

      <div className={`gallery-masonry${preview ? " preview" : ""}`}>
        {sliced.map((item, i) => (
          <motion.figure
            key={item.id}
            className={`gallery-item size-${(i % 3) + 1}${onItemClick ? " clickable" : ""}`}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
            custom={i % 8}
            onClick={onItemClick ? () => onItemClick(item) : undefined}
            onKeyDown={onItemClick ? (e) => e.key === "Enter" && onItemClick(item) : undefined}
            role={onItemClick ? "button" : undefined}
            tabIndex={onItemClick ? 0 : undefined}
          >
            <div className="gallery-item-image">
              <img
                src={item.src}
                alt={item.alt || item.title}
                loading="lazy"
                decoding="async"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="gallery-item-hover">
                <span>View</span>
              </div>
              <span className="gallery-item-category">{item.category}</span>
            </div>
            <figcaption>
              <strong>{item.title}</strong>
              {item.uploaded_at && (
                <span>{formatGalleryDate(item.uploaded_at)}</span>
              )}
            </figcaption>
          </motion.figure>
        ))}

        {preview && (
          <Link to="/gallery" className="gallery-view-all">
            View Full Gallery →
          </Link>
        )}
      </div>
    </>
  );
}
