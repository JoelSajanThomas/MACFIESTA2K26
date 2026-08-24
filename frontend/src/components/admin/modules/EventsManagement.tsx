"use client";

import { useState } from "react";
import { DataTable, Column } from "../shared/DataTable";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCalendarLine,
  RiMapPinLine,
  RiTrophyLine,
  RiGroupLine,
  RiImageLine,
  RiVideoLine,
  RiImageEditLine,
  RiFilmLine,
} from "react-icons/ri";

export interface EventRecord {
  _id: string;
  title: string;
  slug: string;
  category: string;
  venue: string;
  description?: string;
  coverImage?: string;
  videoUrl?: string;
  photos?: string[];
  timeSlot?: string;
  prizePool?: number;
  seatsAvailable?: number;
  status?: string;
  rules?: string;
}

interface EventsManagementProps {
  events: EventRecord[];
  onOpenCreateModal: () => void;
  onEditEvent: (event: EventRecord) => void;
  onDeleteEvent: (id: string) => void;
  onEditMedia?: (event: EventRecord) => void;
  onRefresh?: () => void;
}

export function EventsManagement({
  events,
  onOpenCreateModal,
  onEditEvent,
  onDeleteEvent,
  onEditMedia,
  onRefresh,
}: EventsManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory === "all") return true;
    return ev.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const columns: Column<EventRecord>[] = [
    {
      key: "title",
      header: "Event & Cover Photo",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0">
            {row.coverImage ? (
              <img src={row.coverImage} alt={row.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <RiImageLine size={18} />
              </div>
            )}
          </div>
          <div>
            <p className="font-extrabold text-white text-xs tracking-wide">{row.title}</p>
            <span className="text-[9px] font-bold uppercase tracking-wider text-festival-gold">
              {row.category || "General"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "venue",
      header: "Venue & Timing",
      render: (row) => (
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-white/80 flex items-center gap-1">
            <RiMapPinLine size={12} className="text-festival-gold" />
            <span>{row.venue || "Main Auditorium"}</span>
          </p>
          <p className="text-[10px] text-white/40 flex items-center gap-1">
            <RiCalendarLine size={12} />
            <span>{row.timeSlot || "Day 1, 10:00 AM"}</span>
          </p>
        </div>
      ),
    },
    {
      key: "prizePool",
      header: "Prize Pool",
      render: (row) => (
        <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
          <RiTrophyLine size={13} /> ₹{(row.prizePool || 10000).toLocaleString()}
        </span>
      ),
    },
    {
      key: "media",
      header: "Photo & Video Status",
      render: (row) => (
        <div className="flex items-center gap-2 text-[10px]">
          <span
            className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 ${
              row.coverImage ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-500"
            }`}
          >
            <RiImageLine size={11} /> {row.coverImage ? "Photo Set" : "No Photo"}
          </span>
          <span
            className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 ${
              row.videoUrl ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-zinc-800 text-zinc-500"
            }`}
          >
            <RiVideoLine size={11} /> {row.videoUrl ? "Video Set" : "No Video"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar: Create Event & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass p-4 rounded-2xl border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          {["all", "gaming", "cultural", "technical", "sports", "general"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-festival-gold text-festival-dark shadow-[0_0_15px_rgba(234,179,8,0.25)]"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenCreateModal}
          className="btn-primary text-xs flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-lg shrink-0 cursor-pointer"
        >
          <RiAddLine size={16} />
          <span>Add New Festival Event</span>
        </button>
      </div>

      {/* Events Data Table */}
      <DataTable
        title="MacFiesta 2K26 Event Roster"
        columns={columns}
        data={filteredEvents}
        searchKey="title"
        searchPlaceholder="Search event title, venue, category..."
        onRefresh={onRefresh}
        exportFileName="macfiesta_events_roster"
        actions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => (onEditMedia ? onEditMedia(row) : onEditEvent(row))}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              title="Change event photos or video"
            >
              <RiFilmLine size={14} />
              <span className="hidden md:inline">Photos/Video</span>
            </button>
            <button
              onClick={() => onEditEvent(row)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs cursor-pointer"
              title="Edit event details"
            >
              <RiEditLine size={14} />
            </button>
            <button
              onClick={() => onDeleteEvent(row._id)}
              className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs cursor-pointer"
              title="Delete event"
            >
              <RiDeleteBinLine size={14} />
            </button>
          </div>
        )}
      />
    </div>
  );
}
