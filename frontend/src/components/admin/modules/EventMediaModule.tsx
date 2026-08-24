"use client";

import { useState } from "react";
import {
  RiImageLine,
  RiVideoLine,
  RiSaveLine,
  RiSearchLine,
  RiFilmLine,
  RiCheckLine,
  RiRefreshLine,
} from "react-icons/ri";

export interface EventItem {
  _id: string;
  title: string;
  slug: string;
  category: string;
  coverImage?: string;
  videoUrl?: string;
  photos?: string[];
  venue?: string;
}

interface EventMediaModuleProps {
  events: EventItem[];
  onUpdateMedia: (event: EventItem) => Promise<void> | void;
}

const PHOTO_PRESETS = [
  { label: "Marvel Headquarters Banner", url: "/MARVEL/3025924746959430.jpg" },
  { label: "Doctor Strange", url: "/MARVEL/Doctor Strange.png" },
  { label: "Spider-Man", url: "/MARVEL/Spider-man.png" },
  { label: "Iron Man Armor", url: "/MARVEL/4081455907815375.png" },
  { label: "Black Widow", url: "/MARVEL/61080138757668761.png" },
];

const VIDEO_PRESETS = [
  { label: "Marvel Video Loop 4 (Promotional)", url: "/MARVEL/Video Project 4.mp4" },
  { label: "Marvel Video Loop 5 (Action Showcase)", url: "/MARVEL/Video Project 5.mp4" },
];

export function EventMediaModule({ events, onUpdateMedia }: EventMediaModuleProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form states for the currently edited event
  const [coverImage, setCoverImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [photosText, setPhotosText] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredEvents = events.filter((ev) => {
    const matchCat = selectedCategory === "all" || ev.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch = ev.title.toLowerCase().includes(search.toLowerCase()) || ev.slug.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const startEditing = (ev: EventItem) => {
    setEditingEventId(ev._id);
    setCoverImage(ev.coverImage || "/MARVEL/3025924746959430.jpg");
    setVideoUrl(ev.videoUrl || "/MARVEL/Video Project 4.mp4");
    setPhotosText(Array.isArray(ev.photos) ? ev.photos.join("\n") : (ev.coverImage ? ev.coverImage : ""));
  };

  const handleSave = async (ev: EventItem) => {
    setSaving(true);
    const updated: EventItem = {
      ...ev,
      coverImage: coverImage.trim() || "/MARVEL/3025924746959430.jpg",
      videoUrl: videoUrl.trim() || "/MARVEL/Video Project 4.mp4",
      photos: photosText.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    await onUpdateMedia(updated);
    setSaving(false);
    setEditingEventId(null);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass p-6 rounded-2xl border border-amber-500/20 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            <RiFilmLine /> EVENT MEDIA MANAGEMENT
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Event Photos & Video Manager
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure cover photo banners, promo teaser videos, and photo gallery grids for all 23 festival events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono hidden sm:block">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Total Active Events</p>
            <p className="text-sm font-black text-amber-400">{events.length} Events Listed</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass p-4 rounded-2xl border border-white/10">
        <div className="relative w-full md:max-w-md">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search event title to edit photos/video..."
            className="w-full pl-10 pr-4 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {["all", "gaming", "cultural", "technical", "sports", "general"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#F5B301] text-zinc-950 shadow-md"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((ev) => {
          const isEditing = editingEventId === ev._id;
          const currentPhoto = isEditing ? coverImage : (ev.coverImage || "/MARVEL/3025924746959430.jpg");
          const currentVideo = isEditing ? videoUrl : (ev.videoUrl || "/MARVEL/Video Project 4.mp4");

          return (
            <div
              key={ev._id}
              className={`marvel-card rounded-2xl overflow-hidden border transition-all ${
                isEditing ? "border-amber-400 shadow-[0_0_30px_rgba(245,179,1,0.15)] bg-[#121218]" : "border-white/10 bg-[#0d0d12]"
              }`}
            >
              {/* Media Preview Header */}
              <div className="relative h-44 w-full bg-black overflow-hidden border-b border-white/10">
                {currentVideo && currentVideo.endsWith(".mp4") ? (
                  <video src={currentVideo} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-75" />
                ) : currentPhoto ? (
                  <img src={currentPhoto} alt={ev.title} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <RiImageLine size={36} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-transparent to-black/60" />

                <div className="absolute top-3 left-3 z-10 flex gap-2">
                  <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-500 text-zinc-950">
                    {ev.category}
                  </span>
                  {currentVideo && (
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-black/80 text-amber-400 border border-amber-400/30 flex items-center gap-1">
                      <RiVideoLine size={10} /> Video Active
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-4 right-4 z-10">
                  <h3 className="text-base font-black text-white uppercase truncate" style={{ fontFamily: "var(--font-heading)" }}>
                    {ev.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">{ev.venue || "MACFAST Campus"}</p>
                </div>
              </div>

              {/* Editing Controls or Information */}
              <div className="p-5 space-y-4">
                {isEditing ? (
                  <div className="space-y-4 text-xs font-mono">
                    {/* Change Photo Field */}
                    <div className="space-y-2">
                      <label className="block text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1">
                        <RiImageLine size={14} /> Change Cover Photo URL
                      </label>
                      <input
                        type="text"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="Enter image URL..."
                        className="w-full px-3 py-2 bg-black border border-white/15 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] text-zinc-500 self-center mr-1">Presets:</span>
                        {PHOTO_PRESETS.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setCoverImage(p.url)}
                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 text-zinc-300 text-[10px] border border-white/10 cursor-pointer"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Change Video Field */}
                    <div className="space-y-2">
                      <label className="block text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1">
                        <RiVideoLine size={14} /> Change Promo Video URL
                      </label>
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Enter MP4 video URL..."
                        className="w-full px-3 py-2 bg-black border border-white/15 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] text-zinc-500 self-center mr-1">Presets:</span>
                        {VIDEO_PRESETS.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setVideoUrl(p.url)}
                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 text-zinc-300 text-[10px] border border-white/10 cursor-pointer"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Additional Photo Gallery */}
                    <div className="space-y-1">
                      <label className="block text-zinc-400 font-bold uppercase text-[10px]">
                        Gallery Photo Links (1 per line)
                      </label>
                      <textarea
                        rows={2}
                        value={photosText}
                        onChange={(e) => setPhotosText(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 bg-black border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setEditingEventId(null)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(ev)}
                        disabled={saving}
                        className="px-5 py-2 rounded-xl bg-[#F5B301] hover:bg-amber-300 text-zinc-950 font-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
                      >
                        <RiSaveLine size={15} /> {saving ? "Saving..." : "Save Media"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between font-mono text-xs">
                    <div className="space-y-1">
                      <p className="text-zinc-400 text-[11px] truncate max-w-[240px]">
                        <strong>Photo:</strong> {ev.coverImage ? ev.coverImage.split("/").pop() : "Default"}
                      </p>
                      <p className="text-zinc-400 text-[11px] truncate max-w-[240px]">
                        <strong>Video:</strong> {ev.videoUrl ? ev.videoUrl.split("/").pop() : "None"}
                      </p>
                    </div>

                    <button
                      onClick={() => startEditing(ev)}
                      className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                    >
                      <RiFilmLine size={14} /> Change Photo / Video
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
