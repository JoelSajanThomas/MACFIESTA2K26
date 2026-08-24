"use client";

import { useState } from "react";
import { RiArchiveLine, RiRefreshLine } from "react-icons/ri";

export function ArchiveModule() {
  const [archivedEvents] = useState([
    { id: "ae-1", title: "MacFiesta 2K25 PUBG Mobile Tournament", category: "Gaming", archivedOn: "Oct 2025" },
  ]);

  return (
    <div className="space-y-6 select-none">
      <div className="glass p-4 rounded-2xl border border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Archive & Recycle Bin Recovery
          </h2>
          <p className="text-xs text-white/40">Manage archived festival events, previous season records, and restore items from the recycle bin</p>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10 space-y-4 text-xs">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
          Archived Festival Records
        </h3>
        {archivedEvents.map((ev) => (
          <div key={ev.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between">
            <div>
              <h4 className="font-extrabold text-white">{ev.title}</h4>
              <p className="text-[10px] text-white/40">{ev.category} • Archived {ev.archivedOn}</p>
            </div>
            <button onClick={() => alert(`Restored ${ev.title}`)} className="px-3 py-1 rounded bg-festival-gold/20 text-festival-gold font-bold text-xs cursor-pointer flex items-center gap-1">
              <RiRefreshLine size={14} /> Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
