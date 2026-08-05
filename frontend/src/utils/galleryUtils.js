import { mediaUrl } from "../services/api";
import { galleryPlaceholders } from "./assets";

export const GALLERY_FILTERS = [
  { value: "all", label: "All" },
  { value: "stage", label: "Stage" },
  { value: "tech", label: "Tech" },
  { value: "cultural", label: "Cultural" },
  { value: "crowd", label: "Crowd" },
  { value: "winners", label: "Winners" },
];

export function inferGalleryCategory(title = "") {
  const t = title.toLowerCase();
  if (t.includes("tech") || t.includes("hack") || t.includes("code")) return "tech";
  if (t.includes("cultural") || t.includes("music") || t.includes("dance") || t.includes("fashion")) return "cultural";
  if (t.includes("crowd") || t.includes("audience") || t.includes("dj")) return "crowd";
  if (t.includes("winner") || t.includes("victory") || t.includes("podium")) return "winners";
  if (t.includes("stage") || t.includes("main")) return "stage";
  return "stage";
}

export function normalizeGalleryItems(items = [], usePlaceholders = false) {
  if (items.length === 0 && usePlaceholders) {
    return galleryPlaceholders.map((p) => ({
      id: p.id,
      title: p.title,
      src: p.src,
      alt: p.alt || p.title,
      category: p.category,
      uploaded_at: p.uploaded_at,
      isPlaceholder: true,
      raw: p,
    }));
  }

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    src: mediaUrl(item.image),
    alt: item.title,
    category: inferGalleryCategory(item.title),
    uploaded_at: item.uploaded_at,
    isPlaceholder: false,
    raw: item,
  }));
}

export function filterGalleryItems(items, category) {
  if (category === "all") return items;
  return items.filter((item) => item.category === category);
}

export function formatGalleryDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getGalleryImageSrc(item) {
  if (!item) return "";
  if (item.src) return item.src;
  if (item.image) return mediaUrl(item.image);
  return item.raw?.src || "";
}
