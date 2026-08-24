"use client";

import { useState } from "react";
import {
  RiImageLine,
  RiVideoLine,
  RiLiveLine,
  RiUploadLine,
  RiDownloadLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiGridLine,
  RiListCheck2,
  RiCheckLine,
} from "react-icons/ri";

const MOCK_PHOTOS = [
  { id: "1", name: "Inauguration Ceremony", tag: "Event", size: "2.4 MB", uploaded: "Today 9:45 AM" },
  { id: "2", name: "Battle of Bands Rehearsal", tag: "Event", size: "3.1 MB", uploaded: "Today 10:12 AM" },
  { id: "3", name: "Robo Wars Setup", tag: "Behind Scenes", size: "1.8 MB", uploaded: "Today 9:30 AM" },
  { id: "4", name: "Registration Desk", tag: "Campus", size: "2.0 MB", uploaded: "Today 9:00 AM" },
  { id: "5", name: "Volunteer Briefing", tag: "Team", size: "1.5 MB", uploaded: "Yesterday" },
  { id: "6", name: "Stage Setup – OAT", tag: "Venue", size: "4.2 MB", uploaded: "Yesterday" },
];

const TABS = ["Photos", "Videos", "Live Stream"];
const TAB_ICONS = [RiImageLine, RiVideoLine, RiLiveLine];

export function MediaModule() {
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = MOCK_PHOTOS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-white tracking-tight">Media Library</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage photos, videos, and live stream settings for MacFiesta 2K26</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5B301] hover:bg-amber-300 text-zinc-950 font-bold text-[12px] transition-all cursor-pointer shadow-lg shadow-amber-500/20">
          <RiUploadLine size={15} /> Upload Media
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-zinc-900/60 border border-zinc-800 rounded-xl p-1 w-fit">
        {TABS.map((tab, i) => {
          const Icon = TAB_ICONS[i];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                activeTab === i
                  ? "bg-[#F5B301] text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon size={14} /> {tab}
            </button>
          );
        })}
      </div>

      {activeTab === 0 && (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search photos..."
                className="w-full pl-8 pr-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-[12px] text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-[#F5B301]/50"
              />
            </div>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-[12px] font-semibold cursor-pointer">
                  <RiDeleteBinLine size={13} /> Delete ({selected.size})
                </button>
              )}
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-[12px] font-semibold cursor-pointer hover:bg-zinc-700">
                <RiDownloadLine size={13} /> Export
              </button>
              <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
                {([["grid", RiGridLine], ["list", RiListCheck2]] as const).map(([mode, Icon]) => (
                  <button key={mode} onClick={() => setViewMode(mode as "grid" | "list")}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === mode ? "bg-zinc-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid / List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {filtered.map((photo) => {
                const isSelected = selected.has(photo.id);
                return (
                  <div key={photo.id} onClick={() => toggleSelect(photo.id)}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group ${
                      isSelected ? "border-[#F5B301] shadow-lg shadow-amber-500/20" : "border-zinc-800 hover:border-zinc-600"
                    }`}>
                    <div className="aspect-square bg-zinc-800/80 flex items-center justify-center">
                      <RiImageLine size={32} className="text-zinc-600" />
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#F5B301] flex items-center justify-center">
                        <RiCheckLine size={11} className="text-zinc-950" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-[11px] font-semibold text-white truncate">{photo.name}</p>
                      <p className="text-[9px] text-zinc-500">{photo.size} · {photo.tag}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 overflow-hidden">
              {filtered.map((photo, i) => (
                <div key={photo.id}
                  className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-zinc-800/40 transition-colors ${i > 0 ? "border-t border-zinc-800/60" : ""}`}
                  onClick={() => toggleSelect(photo.id)}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${selected.has(photo.id) ? "bg-[#F5B301] border-[#F5B301]" : "border-zinc-600"}`}>
                    {selected.has(photo.id) && <RiCheckLine size={11} className="text-zinc-950" />}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                    <RiImageLine size={18} className="text-zinc-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{photo.name}</p>
                    <p className="text-[11px] text-zinc-500">{photo.uploaded}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400">{photo.tag}</span>
                  <span className="text-[11px] text-zinc-500 font-mono">{photo.size}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 1 && (
        <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-zinc-800 border-dashed">
          <RiVideoLine size={32} className="text-zinc-600 mb-3" />
          <p className="text-sm font-semibold text-zinc-400">No videos uploaded yet</p>
          <p className="text-xs text-zinc-600 mt-1">Upload event recordings, highlights, and promos</p>
          <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5B301] hover:bg-amber-300 text-zinc-950 font-bold text-[12px] cursor-pointer">
            <RiUploadLine size={14} /> Upload Video
          </button>
        </div>
      )}

      {activeTab === 2 && (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse shrink-0" />
            <div>
              <p className="text-[13px] font-bold text-white">Live Stream</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Configure your live stream settings and embed code for the festival</p>
            </div>
            <span className="ml-auto px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold">Offline</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["Stream Key", "RTMP URL", "Backup Stream", "Embed Code"].map((field) => (
              <div key={field}>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">{field}</label>
                <input type="text" placeholder={`Enter ${field.toLowerCase()}...`}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-[12px] text-zinc-300 focus:outline-none focus:border-[#F5B301]/50" />
              </div>
            ))}
          </div>
          <button className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-[12px] cursor-pointer transition-colors">
            Go Live
          </button>
        </div>
      )}
    </div>
  );
}
