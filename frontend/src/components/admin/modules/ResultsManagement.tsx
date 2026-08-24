"use client";

import { useState } from "react";
import {
  RiTrophyLine,
  RiShieldCheckLine,
  RiBroadcastLine,
  RiBarChartGroupedLine,
  RiAddLine,
  RiMedalLine,
} from "react-icons/ri";

interface ResultsManagementProps {
  events: any[];
}

export function ResultsManagement({ events }: ResultsManagementProps) {
  const [resultsList, setResultsList] = useState([
    { id: "res-1", event: "ValoFiesta Valorant Tournament", firstPlace: "Team CyberWarriors (CET)", secondPlace: "Team Phoenix (MACFAST)", thirdPlace: "Team Apex (TKM)", status: "PUBLISHED" },
    { id: "res-2", event: "Battle of Bands 2K26", firstPlace: "SoundWave Band (SJCET)", secondPlace: "Acoustic Trio (Mar Ivanios)", thirdPlace: "Rhythm Squad", status: "VERIFIED" },
  ]);

  return (
    <div className="space-y-6 select-none">
      <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Results Entry, Verification & Leaderboards
          </h2>
          <p className="text-xs text-white/40">Enter judge scores, verify winner lists, and publish live scoreboards</p>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Winner & Score Roster</h3>
        </div>
        <div className="space-y-3">
          {resultsList.map((res) => (
            <div key={res.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-white text-sm">{res.event}</h4>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {res.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <p className="text-emerald-400 font-bold">1st: {res.firstPlace}</p>
                <p className="text-zinc-300 font-semibold">2nd: {res.secondPlace}</p>
                <p className="text-amber-600 font-semibold">3rd: {res.thirdPlace}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
