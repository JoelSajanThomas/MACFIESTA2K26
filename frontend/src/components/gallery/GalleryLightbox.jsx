import { AnimatePresence, motion } from "framer-motion";
import { formatGalleryDate, getGalleryImageSrc } from "../../utils/galleryUtils";

export default function GalleryLightbox({ item, onClose }) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="lightbox-premium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="lightbox-inner"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">
              ×
            </button>
            <img src={getGalleryImageSrc(item)} alt={item.title} />
            <div className="lightbox-caption">
              <strong>{item.title}</strong>
              {formatGalleryDate(item.uploaded_at) && (
                <span>{formatGalleryDate(item.uploaded_at)}</span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
