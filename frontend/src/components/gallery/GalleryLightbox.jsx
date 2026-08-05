import { AnimatePresence, motion } from "framer-motion";
import { formatGalleryDate, getGalleryImageSrc } from "../../utils/galleryUtils";
import { EASE_PREMIUM, MOTION } from "../../utils/animations";

const EASE_OUT = [0, 0, 0.2, 1];

export default function GalleryLightbox({ item, onClose }) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="lightbox-premium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: MOTION.modal, ease: EASE_OUT }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="lightbox-inner"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: EASE_PREMIUM }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">
              ×
            </button>
            <img src={getGalleryImageSrc(item)} alt={item.title} loading="lazy" decoding="async" />
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
