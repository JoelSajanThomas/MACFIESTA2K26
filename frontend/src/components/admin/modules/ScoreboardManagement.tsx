"use client";

import { useState } from "react";
import {
  RiTrophyLine,
  RiAddLine,
  RiSaveLine,
  RiPulseLine,
  RiCheckDoubleLine,
  RiBuilding2Line,
} from "react-icons/ri";

interface ScoreboardManagementProps {
  events: any[];
  scoreboards: any[];
  onUpdateScoreboard?: (eventId: string, teams: any[]) => void;
  onPublishLive?: () => void;
}

export function ScoreboardManagement({
  events,
  scoreboards,
  onUpdateScoreboard,
  onPublishLive,
}: ScoreboardManagementProps) {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?._id || "");
  const [teams, setTeams] = useState<Array<{ rank: number; name: string; college: string; score: number }>>([
    { rank: 1, name: "Team CyberKnights", college: "CET Trivandrum", score: 95 },
    { rank: 2, name: "Team Byte Busters", college: "MACFAST Tiruvalla", score: 88 },
    { rank: 3, name: "Team CodeX", college: "TKM College Kollam", score: 82 },
    { rank: 4, name: "Team DevSquad", college: "Rajagiri Kalamassery", score: 74 },
  ]);

  const handleScoreChange = (index: number, newScore: number) => {
    const updated = [...teams];
    updated[index].score = newScore;
    // Auto sort by score descending
    updated.sort((a, b) => b.score - a.score);
    updated.forEach((t, i) => (t.rank = i + 1));
    setTeams(updated);
  };

  const handleSave = () => {
    if (onUpdateScoreboard) {
      onUpdateScoreboard(selectedEventId, teams);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass p-6 rounded-2xl border border-white/10">
        <div>
          <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <RiTrophyLine className="text-festival-gold" />
            <span>Live Scoreboard & Leaderboard Manager</span>
          </h3>
          <p className="text-xs text-white/40">Update team scores and publish real-time results to festival portals</p>
        </div>

        <div className="flex items-center gap-2">
          {onPublishLive && (
            <button
              onClick={onPublishLive}
              className="btn-primary text-xs flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg cursor-pointer"
            >
              <RiPulseLine className="animate-pulse" />
              <span>Broadcast Live to Scoreboard</span>
            </button>
          )}
        </div>
      </div>

      {/* Select Event & Team Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Event Picker */}
        <div className="lg:col-span-4 glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest" style={{ fontFamily: "var(--font-heading)" }}>
            Select Tournament Event
          </h4>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-white text-xs font-semibold focus:border-festival-gold focus:outline-none"
          >
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title} ({ev.category || "General"})
              </option>
            ))}
          </select>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
            <span className="text-[10px] text-festival-gold uppercase font-bold tracking-widest block">
              Event Leaderboard Rules
            </span>
            <p className="text-white/70 text-[11px] leading-relaxed">
              Updating team scores will dynamically calculate ranks, award trophy points to parent colleges, and update live WebSocket subscribers instantly.
            </p>
          </div>
        </div>

        {/* Live Score Input Roster */}
        <div className="lg:col-span-8 glass p-6 rounded-2xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
              Team Points & Ranks Matrix
            </h4>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-festival-gold text-festival-dark text-xs font-bold shadow-md hover:bg-white transition-colors cursor-pointer"
            >
              <RiSaveLine size={14} />
              <span>Save Rankings</span>
            </button>
          </div>

          <div className="space-y-3">
            {teams.map((team, idx) => (
              <div
                key={team.name}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-colors gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-base font-black ${idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-white/40"}`}>
                    #{team.rank}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">{team.name}</p>
                    <p className="text-[10px] text-white/40">{team.college}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-white/40 font-bold uppercase">Points:</span>
                    <input
                      type="number"
                      value={team.score}
                      onChange={(e) => handleScoreChange(idx, Number(e.target.value))}
                      className="w-20 px-3 py-1 bg-zinc-950 border border-white/10 rounded-lg text-white font-extrabold text-xs text-center focus:border-festival-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
