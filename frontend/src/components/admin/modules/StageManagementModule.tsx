"use client";

import { useState } from "react";
import { RiMicLine, RiUserVoiceLine } from "react-icons/ri";

export function StageManagementModule() {
  const [stages] = useState([
    { id: "stg-1", name: "Main Auditorium (Stage A)", activeEvent: "Battle of Bands 2K26", anchor: "RJ Arun", soundCheck: "PASSED" },
    { id: "stg-2", name: "Open Air Amphitheatre (Stage B)", activeEvent: "Group Dance Competition", anchor: "Kevin Peter", soundCheck: "PASSED" },
  ]);

  return (
    <div className="space-y-6 select-none">
      <div className="glass p-4 rounded-2xl border border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Live Stage & Sound Check Management Console
          </h2>
          <p className="text-xs text-white/40">Real-time stage timeline, audio/visual soundchecks, anchors, and cue management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {stages.map((stg) => (
          <div key={stg.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="font-extrabold text-white text-sm">{stg.name}</h4>
            <p className="text-festival-gold font-bold">Active: {stg.activeEvent}</p>
            <p className="text-white/60">Anchor: {stg.anchor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
