import { useMemo } from "react";
import { motion } from "framer-motion";
import { formatGalleryDate } from "../utils/galleryUtils";
import { useMotionPrefs } from "../hooks/useMotionPrefs";
import { buildFadeUp } from "../utils/animations";
import { useTilt } from "../hooks/useTilt";

export default function GalleryGrid({
  items = [],
  preview = false,
  limit,
  onItemClick,
  showPlaceholderNote = false,
  hideCaption = false,
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
          <GalleryTile
            key={item.id}
            item={item}
            index={i}
            fadeUp={fadeUp}
            onItemClick={onItemClick}
            hideCaption={hideCaption}
          />
        ))}
      </div>
    </>
  );
}

function GalleryTile({ item, index, fadeUp, onItemClick, hideCaption = false }) {
  const tiltRef = useTilt(true, 4.25);
  const title = item.title?.trim() || "MacFiesta Highlight";
  const alt = item.alt?.trim() || title;

  return (
    <motion.figure
      ref={tiltRef}
      className={`gallery-item size-${(index % 3) + 1}${onItemClick ? " clickable" : ""}`}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      custom={index % 8}
      onClick={onItemClick ? () => onItemClick(item) : undefined}
      onKeyDown={onItemClick ? (e) => e.key === "Enter" && onItemClick(item) : undefined}
      role={onItemClick ? "button" : undefined}
      tabIndex={onItemClick ? 0 : undefined}
    >
      <div className="gallery-item-image">
        <img
          src={item.src}
          alt={alt}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="gallery-item-hover" aria-hidden="true">
          <span>View</span>
        </div>
      </div>
      {!hideCaption && (
        <figcaption>
          <strong>{title}</strong>
          {item.uploaded_at && <span>{formatGalleryDate(item.uploaded_at)}</span>}
        </figcaption>
      )}
    </motion.figure>
  );
}