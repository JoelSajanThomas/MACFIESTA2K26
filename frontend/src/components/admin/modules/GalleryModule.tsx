"use client";

import { useState, useRef } from "react";
import {
  RiGalleryLine,
  RiVideoLine,
  RiImageAddLine,
  RiMovieLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiCheckDoubleLine,
  RiCloseLine,
  RiSearchLine,
  RiPlayLine,
  RiStarLine,
  RiStarFill,
  RiUploadCloud2Line,
  RiEditLine,
  RiImageEditLine,
} from "react-icons/ri";
import { useGalleryItems, GalleryItem, normalizeMediaPath } from "@/lib/galleryStore";

export function GalleryModule() {
  const { items, addItem, updateItem, deleteItem, saveItems } = useGalleryItems();

  const [activeMediaType, setActiveMediaType] = useState<"all" | "image" | "video">("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemType, setItemType] = useState<"image" | "video">("image");
  const [itemTitle, setItemTitle] = useState("");
  const [itemCategory, setItemCategory] = useState<"gaming" | "cultural" | "technical" | "general" | "pro-show">("cultural");
  const [itemUrl, setItemUrl] = useState("");
  const [itemThumbUrl, setItemThumbUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Edit Cover Modal State
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<"gaming" | "cultural" | "technical" | "general" | "pro-show">("cultural");
  const [editUrl, setEditUrl] = useState("");
  const [editThumbUrl, setEditThumbUrl] = useState("");
  const [editFeatured, setEditFeatured] = useState(false);

  // File Upload Refs
  const addSourceFileRef = useRef<HTMLInputElement | null>(null);
  const addThumbFileRef = useRef<HTMLInputElement | null>(null);
  const editSourceFileRef = useRef<HTMLInputElement | null>(null);
  const editThumbFileRef = useRef<HTMLInputElement | null>(null);

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  const triggerToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3500);
  };

  const imagesCount = items.filter((i) => i.type === "image").length;
  const videosCount = items.filter((i) => i.type === "video").length;

  const filteredItems = items.filter((item) => {
    const matchType = activeMediaType === "all" || item.type === activeMediaType;
    const matchCat = selectedCategory === "all" || item.category === selectedCategory;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchCat && matchSearch;
  });

  // Native File Picker Handlers for Add Modal
  const handleAddSourceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith("video/");
    if (isVid) setItemType("video");
    else setItemType("image");

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setItemUrl(dataUrl);
        if (!itemTitle) {
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
          setItemTitle(nameWithoutExt);
        }
        triggerToast(`✓ Loaded media file '${file.name}' from device!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddThumbFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setItemThumbUrl(dataUrl);
        triggerToast(`✓ Loaded cover image '${file.name}'!`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Native File Picker Handlers for Edit Modal
  const handleEditSourceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setEditUrl(dataUrl);
        triggerToast(`✓ Updated media file with '${file.name}'!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditThumbFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setEditThumbUrl(dataUrl);
        triggerToast(`✓ Updated cover thumbnail with '${file.name}'!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle || !itemUrl) return;

    const normalizedUrl = normalizeMediaPath(itemUrl);

    addItem({
      type: itemType,
      title: itemTitle,
      category: itemCategory,
      url: normalizedUrl,
      thumbnailUrl: itemThumbUrl ? normalizeMediaPath(itemThumbUrl) : (itemType === "image" ? normalizedUrl : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800"),
      featured: isFeatured,
    });

    triggerToast(`✓ New ${itemType === "image" ? "Photo" : "Video"} Published & Synchronized Live!`);

    // Reset Form
    setItemTitle("");
    setItemUrl("");
    setItemThumbUrl("");
    setIsFeatured(false);
    setShowAddModal(false);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditUrl(item.url);
    setEditThumbUrl(item.thumbnailUrl || "");
    setEditFeatured(item.featured);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle || !editUrl) return;

    const normalizedUrl = normalizeMediaPath(editUrl);
    const normalizedThumb = editThumbUrl ? normalizeMediaPath(editThumbUrl) : undefined;

    updateItem({
      ...editingItem,
      title: editTitle,
      category: editCategory,
      url: normalizedUrl,
      thumbnailUrl: normalizedThumb,
      featured: editFeatured,
    });

    triggerToast("✓ Gallery Asset Cover Image & Details Updated Live!");
    setEditingItem(null);
  };

  const handleToggleFeatured = (id: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, featured: !i.featured } : i));
    saveItems(updated);
    triggerToast("✓ Featured Spotlight Status Updated!");
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove '${title}' from the gallery?`)) {
      deleteItem(id);
      triggerToast("✓ Media Item Removed from Gallery!");
    }
  };

  return (
    <div className="space-y-6 select-none font-mono">
      {/* Toast Alert */}
      {statusMsg && (
        <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold rounded-xl animate-pulse flex items-center gap-2">
          <RiCheckDoubleLine className="text-base" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A0D1A]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arc-cyan/10 border border-arc-cyan/30 text-arc-cyan text-[10px] font-bold uppercase tracking-widest mb-1">
            <RiGalleryLine className="animate-pulse" />
            <span>FESTIVAL MEDIA GALLERY STUDIO</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Media Gallery <span className="marvel-bang-comic-gradient font-black">Manager</span>
          </h2>
          <p className="text-xs text-white/50">
            Upload photos and videos, and update cover images for each photo or video asset.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setItemType("image");
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-arc-cyan text-black font-bold text-xs hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_#00D4FF]"
          >
            <RiImageAddLine className="text-base" />
            <span>+ Add Photo</span>
          </button>

          <button
            onClick={() => {
              setItemType("video");
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-marvel-red text-white font-bold text-xs hover:bg-white hover:text-black transition-colors cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_#ED1D24]"
          >
            <RiMovieLine className="text-base" />
            <span>+ Add Video</span>
          </button>
        </div>
      </div>

      {/* Telemetry Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-black/40 border border-arc-cyan/30 space-y-1">
          <span className="text-white/50 text-[10px] uppercase font-bold">Total Gallery Assets</span>
          <div className="text-2xl font-black text-white">{items.length}</div>
          <span className="text-arc-cyan text-[10px]">Published Assets</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1">
          <span className="text-white/50 text-[10px] uppercase font-bold">Photos Enrolled</span>
          <div className="text-2xl font-black text-emerald-400">{imagesCount}</div>
          <span className="text-emerald-400 text-[10px]">High-Res Imagery</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-marvel-red/30 space-y-1">
          <span className="text-white/50 text-[10px] uppercase font-bold">Videos & Highlights</span>
          <div className="text-2xl font-black text-marvel-red">{videosCount}</div>
          <span className="text-marvel-red text-[10px]">MP4 & Teasers</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-metallic-gold/30 space-y-1">
          <span className="text-white/50 text-[10px] uppercase font-bold">Featured Spotlights</span>
          <div className="text-2xl font-black text-metallic-gold">{items.filter((i) => i.featured).length}</div>
          <span className="text-metallic-gold text-[10px]">Hero Carousel Active</span>
        </div>
      </div>

      {/* MEDIA TYPE & CATEGORY FILTER RAIL */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/60 p-2 rounded-2xl border border-white/10">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 gap-1">
          {[
            { id: "all" as const, label: `All Media (${items.length})`, icon: RiGalleryLine },
            { id: "image" as const, label: `Photos (${imagesCount})`, icon: RiImageAddLine },
            { id: "video" as const, label: `Videos (${videosCount})`, icon: RiVideoLine },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMediaType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMediaType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-marvel-red text-white shadow-[0_0_15px_#ED1D24]"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-bold focus:border-arc-cyan focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="cultural">Cultural & Stage</option>
            <option value="gaming">Gaming Arena</option>
            <option value="technical">Technical Sprint</option>
            <option value="pro-show">Pro Show & Teasers</option>
            <option value="general">General Campus</option>
          </select>

          <div className="relative w-44">
            <input
              type="text"
              placeholder="Search title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pl-8 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-arc-cyan focus:outline-none"
            />
            <RiSearchLine className="absolute left-2.5 top-2.5 text-white/40" />
          </div>
        </div>
      </div>

      {/* MEDIA ASSETS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="glass rounded-2xl border border-white/10 overflow-hidden bg-[#0A0D1A] group hover:border-arc-cyan/50 transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-video bg-black overflow-hidden group">
              <img
                src={item.type === "image" ? encodeURI(item.url) : item.thumbnailUrl ? encodeURI(item.thumbnailUrl) : encodeURI(item.url)}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                    item.type === "image"
                      ? "bg-arc-cyan/20 border-arc-cyan/40 text-arc-cyan"
                      : "bg-marvel-red/20 border-marvel-red/40 text-marvel-red"
                  }`}
                >
                  {item.type === "image" ? "📷 PHOTO" : "🎥 VIDEO"}
                </span>

                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-black/60 text-white/70 border border-white/10">
                  {item.category}
                </span>
              </div>

              <div className="absolute top-2 right-2 flex items-center gap-1">
                <button
                  onClick={() => handleToggleFeatured(item.id)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    item.featured
                      ? "bg-metallic-gold text-black border-metallic-gold shadow-[0_0_10px_#FFD700]"
                      : "bg-black/60 text-white/40 border-white/10 hover:text-metallic-gold"
                  }`}
                  title={item.featured ? "Featured on homepage" : "Set as featured"}
                >
                  {item.featured ? <RiStarFill size={14} /> : <RiStarLine size={14} />}
                </button>

                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-white/80 hover:text-arc-cyan hover:border-arc-cyan transition-all cursor-pointer"
                  title="Change Cover Image & Details"
                >
                  <RiImageEditLine size={14} />
                </button>
              </div>

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setPreviewItem(item)}
                  className="p-3 rounded-full bg-arc-cyan text-black font-bold text-sm hover:scale-110 transition-transform cursor-pointer shadow-lg"
                >
                  {item.type === "video" ? <RiPlayLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
              <p className="text-[10px] text-white/40 font-mono truncate">{item.url}</p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="px-2.5 py-1.5 rounded-xl bg-metallic-gold/10 hover:bg-metallic-gold text-metallic-gold hover:text-black border border-metallic-gold/40 text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RiImageEditLine className="text-xs" />
                  <span>Change Cover</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Delete item"
                >
                  <RiDeleteBinLine size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD MEDIA MODAL WITH COVER IMAGE CUSTOMIZER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass p-6 rounded-3xl border border-arc-cyan/40 bg-[#0A0D1A] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {itemType === "image" ? <RiImageAddLine className="text-arc-cyan" /> : <RiMovieLine className="text-marvel-red" />}
                <span>{itemType === "image" ? "Add New Photo Asset" : "Add New Video Asset"}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-white/40 hover:text-white cursor-pointer">
                <RiCloseLine size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <input
                ref={addSourceFileRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleAddSourceFileUpload}
                className="hidden"
              />

              <input
                ref={addThumbFileRef}
                type="file"
                accept="image/*"
                onChange={handleAddThumbFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => addSourceFileRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-arc-cyan hover:text-black border border-dashed border-arc-cyan/50 text-arc-cyan font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-inner"
              >
                <RiUploadCloud2Line className="text-lg" />
                <span>📁 Pick Media File from Computer / Device</span>
              </button>

              <div className="text-center text-[10px] text-white/40 font-mono">OR Paste Folder System Path (e.g. C:\Users\...\video.mp4)</div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Asset Category Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setItemType("image")}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                      itemType === "image"
                        ? "bg-arc-cyan text-black border-arc-cyan shadow-[0_0_15px_#00D4FF]"
                        : "bg-black/60 text-white/60 border-white/10"
                    }`}
                  >
                    <RiImageAddLine /> Photo (Image)
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemType("video")}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                      itemType === "video"
                        ? "bg-marvel-red text-white border-marvel-red shadow-[0_0_15px_#ED1D24]"
                        : "bg-black/60 text-white/60 border-white/10"
                    }`}
                  >
                    <RiMovieLine /> Video (Highlight)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Media Title</label>
                <input
                  type="text"
                  placeholder={itemType === "image" ? "e.g. Battle of Bands Stage Night" : "e.g. Official Teaser 2026"}
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Festival Event Category</label>
                <select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                >
                  <option value="cultural">Cultural & Pro Shows</option>
                  <option value="gaming">Gaming & Esports</option>
                  <option value="technical">Technical Sprint & Hackathon</option>
                  <option value="pro-show">Pro Show Video</option>
                  <option value="general">General Campus</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">
                  {itemType === "image" ? "Photo URL / System Folder Path" : "Video URL / System Folder Path"}
                </label>
                <input
                  type="text"
                  placeholder='Paste URL or Windows Path (e.g. "C:\Users\...\video.mp4")'
                  value={itemUrl}
                  onChange={(e) => setItemUrl(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-arc-cyan focus:outline-none"
                />
              </div>

              {/* Cover Image Customizer */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-white font-bold text-xs flex items-center gap-1">
                    <RiImageEditLine className="text-metallic-gold" />
                    <span>Custom Cover Thumbnail Image</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => addThumbFileRef.current?.click()}
                    className="text-[10px] px-2 py-0.5 rounded bg-metallic-gold/20 text-metallic-gold border border-metallic-gold/40 hover:bg-metallic-gold hover:text-black font-bold transition-all"
                  >
                    📁 Upload Cover File
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Cover image URL or Windows Folder Path"
                  value={itemThumbUrl}
                  onChange={(e) => setItemThumbUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-white font-mono focus:border-metallic-gold focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-arc-cyan text-black font-bold uppercase cursor-pointer shadow-[0_0_15px_#00D4FF]"
                >
                  Publish Asset Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE COVER IMAGE & EDIT MEDIA MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass p-6 rounded-3xl border border-metallic-gold/40 bg-[#0A0D1A] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <RiImageEditLine className="text-metallic-gold" />
                <span>Change Cover Image & Asset Details</span>
              </h3>
              <button onClick={() => setEditingItem(null)} className="p-1 text-white/40 hover:text-white cursor-pointer">
                <RiCloseLine size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <input
                ref={editSourceFileRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleEditSourceFileUpload}
                className="hidden"
              />

              <input
                ref={editThumbFileRef}
                type="file"
                accept="image/*"
                onChange={handleEditThumbFileUpload}
                className="hidden"
              />

              {/* Cover Image Customizer Box */}
              <div className="p-4 rounded-2xl bg-metallic-gold/10 border border-metallic-gold/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-metallic-gold font-bold text-xs flex items-center gap-1.5">
                    <RiImageEditLine className="text-base" />
                    <span>Change Cover Thumbnail Image</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => editThumbFileRef.current?.click()}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-metallic-gold text-black font-extrabold hover:bg-white transition-all cursor-pointer shadow-md"
                  >
                    📁 Upload Cover File
                  </button>
                </div>
                <input
                  type="text"
                  placeholder='Paste Cover Image URL or Windows Path (e.g. "C:\Users\...\cover.jpg")'
                  value={editThumbUrl}
                  onChange={(e) => setEditThumbUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-white font-mono focus:border-metallic-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Asset Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-metallic-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Event Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-metallic-gold focus:outline-none"
                >
                  <option value="cultural">Cultural & Pro Shows</option>
                  <option value="gaming">Gaming & Esports</option>
                  <option value="technical">Technical Sprint & Hackathon</option>
                  <option value="pro-show">Pro Show Video</option>
                  <option value="general">General Campus</option>
                </select>
              </div>

              {/* Source Media URL / File */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-white/70 font-bold">Media Source URL / System Folder Path</label>
                  <button
                    type="button"
                    onClick={() => editSourceFileRef.current?.click()}
                    className="text-[10px] text-arc-cyan font-bold hover:underline cursor-pointer"
                  >
                    📁 Change File
                  </button>
                </div>
                <input
                  type="text"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-metallic-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editFeatCheck"
                  checked={editFeatured}
                  onChange={(e) => setEditFeatured(e.target.checked)}
                  className="w-4 h-4 accent-metallic-gold cursor-pointer"
                />
                <label htmlFor="editFeatCheck" className="text-white/80 font-bold cursor-pointer">
                  Feature this asset on Homepage Gallery Preview
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-metallic-gold text-black font-bold uppercase cursor-pointer shadow-[0_0_15px_#FFD700]"
                >
                  Save Cover & Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚡ 100% FULL-SCREEN MEDIA THEATER PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl w-screen h-screen flex items-center justify-center overflow-hidden">
          {/* FLOATING CLOSE BUTTON */}
          <button
            onClick={() => setPreviewItem(null)}
            className="fixed top-6 right-6 z-[10000] px-4 py-2.5 rounded-2xl bg-black/80 border border-white/20 text-white hover:bg-marvel-red hover:border-marvel-red transition-all cursor-pointer font-bold text-xs uppercase backdrop-blur-md shadow-[0_0_20px_rgba(237,29,36,0.6)] flex items-center gap-2"
            title="Close Full Screen (Esc)"
          >
            <RiCloseLine size={20} />
            <span>Close Full Screen</span>
          </button>

          {/* FULL SCREEN MEDIA CONTAINER */}
          <div className="w-full h-full p-4 md:p-12 flex items-center justify-center relative">
            {previewItem.type === "image" ? (
              <img
                src={encodeURI(previewItem.url)}
                alt={previewItem.title}
                className="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)]"
              />
            ) : previewItem.url.includes("youtube.com/embed/") ? (
              <iframe
                src={`${previewItem.url}?autoplay=1`}
                className="w-full h-full max-w-6xl max-h-[85vh] rounded-2xl border-0 shadow-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                key={previewItem.url}
                controls
                autoPlay
                playsInline
                className="w-full h-full max-w-6xl max-h-[85vh] object-contain rounded-2xl bg-black shadow-[0_0_60px_rgba(0,0,0,0.9)]"
              >
                <source src={encodeURI(previewItem.url)} />
                <source src={previewItem.url} />
                Your browser does not support playing this video format directly.
              </video>
            )}
          </div>

          {/* FLOATING MARVEL HUD BOTTOM BAR */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] max-w-2xl w-[92vw] px-6 py-3 rounded-2xl bg-black/80 border border-white/20 backdrop-blur-xl flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.8)] font-mono text-xs">
            <div className="flex items-center gap-3 truncate">
              <span
                className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${
                  previewItem.type === "image"
                    ? "bg-arc-cyan/20 border border-arc-cyan/40 text-arc-cyan"
                    : "bg-marvel-red/20 border border-marvel-red/40 text-marvel-red"
                }`}
              >
                {previewItem.type.toUpperCase()} · {previewItem.category}
              </span>
              <h3 className="text-white font-extrabold uppercase truncate text-sm">
                {previewItem.title}
              </h3>
            </div>

            <button
              onClick={() => setPreviewItem(null)}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] transition-colors cursor-pointer border border-white/10 shrink-0"
            >
              Exit Preview
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
