import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiPlayLine,
  RiZoomInLine,
  RiGalleryLine,
  RiImageAddLine,
  RiVideoLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFullscreenLine,
  RiFullscreenExitLine,
  RiShieldFlashLine,
} from "react-icons/ri";
import { DEFAULT_GALLERY, normalizeMediaPath } from "../lib/galleryStore";
import { getGallery, mediaUrl } from "../services/api";
import { usePageSeo } from "../hooks/usePageSeo";

export default function Gallery() {
  const [items, setItems] = useState(DEFAULT_GALLERY);
  const [loadingItems, setLoadingItems] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  usePageSeo({
    title: "Marvel Archives & Gallery · MacFiesta 2026",
    description: "Browse high-resolution photographs, pro-show reels, and highlight memories from previous MacFiesta editions.",
  });

  // Fetch gallery items from backend; fall back to defaults on error
  useEffect(() => {
    setLoadingItems(true);
    getGallery()
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.results || [];
        if (raw.length === 0) {
          setItems(DEFAULT_GALLERY);
          return;
        }
        const mapped = raw.map((b) => ({
          id: String(b.id),
          type: b.type || "image",
          category: b.category || "general",
          title: b.title || "",
          // b.url is the serializer's computed field (absolute image URL or video_url)
          url: b.type === "video"
            ? normalizeMediaPath(b.url || b.video_url || "")
            : (b.url ? b.url : mediaUrl(b.image) || ""),
          thumbnailUrl: b.thumbnail ? mediaUrl(b.thumbnail) : undefined,
          date: b.uploaded_at ? b.uploaded_at.split("T")[0] : "",
          featured: Boolean(b.featured),
        }));
        setItems(mapped);
      })
      .catch(() => {
        // Backend unreachable — use hardcoded defaults
        setItems(DEFAULT_GALLERY);
      })
      .finally(() => setLoadingItems(false));
  }, []);

  const imagesCount = items.filter((i) => i.type === "image").length;
  const videosCount = items.filter((i) => i.type === "video").length;

  const filteredMedia = items.filter((item) => {
    const matchType = filterType === "all" || item.type === filterType;
    const matchCat = filterCategory === "all" || item.category === filterCategory;
    return matchType && matchCat;
  });

  const totalFiltered = filteredMedia.length;
  const activeItem = selectedIndex !== null ? filteredMedia[selectedIndex] : null;

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || totalFiltered === 0) return null;
      return prev < totalFiltered - 1 ? prev + 1 : 0;
    });
  }, [totalFiltered]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || totalFiltered === 0) return null;
      return prev > 0 ? prev - 1 : totalFiltered - 1;
    });
  }, [totalFiltered]);

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsNativeFullscreen(false);
      }
    }
  };

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-excon relative overflow-hidden">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/MCU Multiverse Saga.jpg"
          alt="Visual Archives Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        {/* Subtle cinematic gradient to preserve gallery cards and photo clarity */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/25 to-[#05050A]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. MULTIVERSE ARCHIVES</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">VISUAL</span>{" "}
            <span className="gradient-text-gold">ARCHIVES</span>
          </h1>

          <p className="text-white/80 text-xs sm:text-sm font-excon font-normal">
            Relive previous festival moments, pro-show concerts, and championship competitions across the Marvel Cinematic Universe.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="glass-aurora p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          {/* Type Filter Buttons */}
          <div className="flex bg-black/50 p-1 rounded-full border border-white/10 w-full md:w-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all font-excon-bold ${
                filterType === "all"
                  ? "bg-marvel-red text-white shadow-[0_0_15px_#ED1D24]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <RiGalleryLine />
              <span>All ({items.length})</span>
            </button>

            <button
              onClick={() => setFilterType("image")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all font-excon-bold ${
                filterType === "image"
                  ? "bg-arc-cyan text-black shadow-[0_0_15px_#00D4FF]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <RiImageAddLine />
              <span>Photos ({imagesCount})</span>
            </button>

            <button
              onClick={() => setFilterType("video")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all font-excon-bold ${
                filterType === "video"
                  ? "bg-metallic-gold text-black shadow-[0_0_15px_#FFD700]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <RiVideoLine />
              <span>Reels ({videosCount})</span>
            </button>
          </div>

          {/* Category Selector Chips */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto select-scrollbar pb-1">
            {["all", "gaming", "cultural", "technical", "general", "pro-show"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all font-excon-bold ${
                  filterCategory === cat
                    ? "bg-white/20 text-white border border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    : "bg-white/5 text-white/50 hover:text-white border border-white/10"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid Cards */}
        {loadingItems ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 sm:h-80 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 font-excon">
            <AnimatePresence mode="popLayout">
              {filteredMedia.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35, delay: idx * 0.03 }}
                  onClick={() => setSelectedIndex(idx)}
                  className="marvel-card group relative h-72 sm:h-80 rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-arc-cyan/60 transition-all duration-500 shadow-2xl bg-[#0A0D1A]"
                >
                  <img
                    src={encodeURI(item.thumbnailUrl || item.url)}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Media Badges */}
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border font-excon-bold ${
                        item.type === "image"
                          ? "bg-arc-cyan/20 border-arc-cyan/40 text-arc-cyan"
                          : "bg-marvel-red/20 border-marvel-red/40 text-marvel-red"
                      }`}
                    >
                      {item.type === "image" ? "📷 PHOTO" : "🎬 VIDEO"}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D1A] via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <div className="space-y-1 transform group-hover:-translate-y-1 transition-transform">
                      <span className="text-[10px] text-metallic-gold font-bold uppercase tracking-wider font-excon-bold block">
                        {item.category}
                      </span>
                      <h3 className="text-white text-base font-black uppercase tracking-tight font-excon-black block group-hover:text-metallic-gold transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Hover Play / Zoom Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="p-4 bg-arc-cyan text-black rounded-full text-xl shadow-[0_0_20px_#00D4FF] transform scale-75 group-hover:scale-100 transition-transform">
                      {item.type === "video" ? <RiPlayLine /> : <RiZoomInLine />}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loadingItems && filteredMedia.length === 0 && (
          <div className="text-center py-12 text-white/50 font-excon text-xs uppercase tracking-wider">
            No media assets found in this category.
          </div>
        )}

      </div>

      {/* 100% IMMERSIVE FULL-SCREEN MEDIA THEATER */}
      <AnimatePresence>
        {activeItem && selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl w-screen h-screen flex items-center justify-center overflow-hidden font-excon"
          >
            {/* FLOATING CLOSE BUTTON */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="fixed top-6 right-6 z-[10000] px-4 py-2.5 rounded-xl bg-black/80 border border-white/20 text-white hover:bg-marvel-red hover:border-marvel-red transition-all cursor-pointer font-black text-xs uppercase backdrop-blur-md shadow-[0_0_20px_rgba(237,29,36,0.6)] flex items-center gap-2 font-excon-black"
              title="Close Full Screen (Esc)"
            >
              <RiCloseLine size={20} />
              <span className="hidden sm:inline">Close</span>
            </button>

            {/* FLOATING PREVIOUS BUTTON */}
            <button
              onClick={handlePrev}
              className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-[10000] p-4 rounded-full bg-black/80 border border-white/20 text-white hover:bg-arc-cyan hover:text-black transition-all cursor-pointer shadow-[0_0_25px_#00D4FF] hover:scale-110"
              title="Previous"
            >
              <RiArrowLeftSLine size={32} />
            </button>

            {/* FLOATING NEXT BUTTON */}
            <button
              onClick={handleNext}
              className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[10000] p-4 rounded-full bg-black/80 border border-white/20 text-white hover:bg-arc-cyan hover:text-black transition-all cursor-pointer shadow-[0_0_25px_#00D4FF] hover:scale-110"
              title="Next"
            >
              <RiArrowRightSLine size={32} />
            </button>

            {/* FULL SCREEN MEDIA VIEWPORT CONTAINER */}
            <div className="w-full h-full p-4 md:p-12 flex items-center justify-center relative">
              {activeItem.type === "image" ? (
                <motion.img
                  key={activeItem.url}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={encodeURI(activeItem.url)}
                  alt={activeItem.title}
                  className="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)]"
                />
              ) : activeItem.url.includes("youtube.com/embed/") ? (
                <iframe
                  key={activeItem.url}
                  src={`${activeItem.url}?autoplay=1`}
                  className="w-full h-full max-w-6xl max-h-[85vh] rounded-2xl border-0 shadow-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={activeItem.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full max-w-6xl max-h-[85vh] object-contain rounded-2xl bg-black shadow-[0_0_60px_rgba(0,0,0,0.9)]"
                >
                  <source src={encodeURI(activeItem.url)} />
                  <source src={activeItem.url} />
                  Your browser does not support playing this video format directly.
                </video>
              )}
            </div>

            {/* FLOATING MARVEL HUD BOTTOM CONTROL BAR */}
            <div className="gallery-viewer-controls fixed left-1/2 -translate-x-1/2 z-[10000] max-w-3xl w-[92vw] px-4 sm:px-6 py-3 rounded-2xl bg-black/80 border border-arc-cyan/30 backdrop-blur-xl flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.8)] font-excon text-xs">
              <div className="flex items-center gap-3 truncate pr-4">
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 font-excon-bold ${
                    activeItem.type === "image"
                      ? "bg-arc-cyan/20 border border-arc-cyan/40 text-arc-cyan"
                      : "bg-marvel-red/20 border border-marvel-red/40 text-marvel-red"
                  }`}
                >
                  {activeItem.type.toUpperCase()} • {activeItem.category}
                </span>
                <h3 className="text-white font-black uppercase truncate text-sm font-excon-black">
                  {activeItem.title}
                </h3>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-metallic-gold font-bold font-excon-bold">
                  {selectedIndex + 1} / {filteredMedia.length}
                </span>

                <button
                  onClick={toggleNativeFullscreen}
                  className="min-w-11 min-h-11 p-2 rounded-xl bg-white/10 hover:bg-arc-cyan hover:text-black text-white transition-colors cursor-pointer border border-white/10"
                  title="Toggle Display Fullscreen Mode"
                >
                  {isNativeFullscreen ? <RiFullscreenExitLine size={18} /> : <RiFullscreenLine size={18} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
