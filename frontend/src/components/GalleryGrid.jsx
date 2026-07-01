import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { formatGalleryDate } from "../utils/galleryUtils";

export default function GalleryGrid({
  items = [],
  preview = false,
  limit,
  onItemClick,
  showPlaceholderNote = false,
}) {
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
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 6) * 0.06, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            onClick={onItemClick ? () => onItemClick(item) : undefined}
            onKeyDown={onItemClick ? (e) => e.key === "Enter" && onItemClick(item) : undefined}
            role={onItemClick ? "button" : undefined}
            tabIndex={onItemClick ? 0 : undefined}
          >
            <div className="gallery-item-image">
              <img src={item.src} alt={item.title} loading="lazy" />
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
