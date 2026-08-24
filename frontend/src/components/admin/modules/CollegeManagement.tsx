"use client";

import { useState } from "react";
import {
  RiBuilding2Line,
  RiTrophyLine,
  RiFileList3Line,
  RiDownloadCloud2Line,
  RiAddLine,
  RiMedalLine,
} from "react-icons/ri";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/exportUtils";

interface CollegeRecord {
  id: string;
  name: string;
  code: string;
  district: string;
  totalDelegates: number;
  eventsEntered: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  totalPoints: number;
}

export function CollegeManagement() {
  const [colleges, setColleges] = useState<CollegeRecord[]>([
    { id: "col-1", name: "MACFAST Tiruvalla", code: "MACF", district: "Pathanamthitta", totalDelegates: 145, eventsEntered: 22, goldMedals: 4, silverMedals: 2, bronzeMedals: 1, totalPoints: 240 },
    { id: "col-2", name: "College of Engineering Trivandrum", code: "CET", district: "Trivandrum", totalDelegates: 98, eventsEntered: 18, goldMedals: 3, silverMedals: 1, bronzeMedals: 2, totalPoints: 180 },
    { id: "col-3", name: "TKM College of Engineering", code: "TKM", district: "Kollam", totalDelegates: 82, eventsEntered: 15, goldMedals: 2, silverMedals: 2, bronzeMedals: 0, totalPoints: 140 },
    { id: "col-4", name: "St. Joseph's College of Engineering (SJCET)", code: "SJCET", district: "Kottayam", totalDelegates: 64, eventsEntered: 12, goldMedals: 1, silverMedals: 3, bronzeMedals: 1, totalPoints: 110 },
  ]);

  const exportCollegeReport = (format: "csv" | "excel" | "pdf") => {
    const rows = colleges.map((c) => ({
      "College Name": c.name,
      Code: c.code,
      District: c.district,
      "Total Delegates": c.totalDelegates,
      "Events Entered": c.eventsEntered,
      Golds: c.goldMedals,
      Silvers: c.silverMedals,
      Bronzes: c.bronzeMedals,
      "Total Points": c.totalPoints,
    }));

    if (format === "csv") exportToCSV("MacFiesta_College_Championship", rows);
    else if (format === "excel") exportToExcel("MacFiesta_College_Championship", rows);
    else if (format === "pdf") exportToPDF("COLLEGE CHAMPIONSHIP LEADERBOARD", "MacFiesta_College_Championship", rows);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <RiBuilding2Line className="text-festival-gold text-lg" />
            <span>Participating College Directory & Championship Points</span>
          </h2>
          <p className="text-xs text-white/40">Track college delegate representation, overall medal tally, and download college performance reports</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => exportCollegeReport("excel")}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold cursor-pointer"
          >
            Export Excel
          </button>
          <button
            onClick={() => exportCollegeReport("pdf")}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 font-bold cursor-pointer"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* College Table View */}
      <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Inter-Collegiate Standings & Medal Tally
          </h3>
          <button
            onClick={() => {
              const name = prompt("College Name:");
              const code = prompt("Short Code (e.g. CUSAT):");
              if (name && code) {
                setColleges([
                  ...colleges,
                  {
                    id: `col-${Date.now()}`,
                    name,
                    code,
                    district: "Kerala",
                    totalDelegates: 10,
                    eventsEntered: 3,
                    goldMedals: 0,
                    silverMedals: 0,
                    bronzeMedals: 0,
                    totalPoints: 0,
                  },
                ]);
              }
            }}
            className="btn-primary text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer"
          >
            <RiAddLine size={16} /> Add College
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest font-black text-[10px]">
                <th className="py-3 px-3">Institution Name</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3 text-center">Delegates</th>
                <th className="py-3 px-3 text-center">Events</th>
                <th className="py-3 px-3 text-center">Golds (🥇)</th>
                <th className="py-3 px-3 text-center">Silvers (🥈)</th>
                <th className="py-3 px-3 text-center">Bronzes (🥉)</th>
                <th className="py-3 px-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {colleges.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-extrabold text-white">{c.name}</p>
                    <span className="text-[10px] font-mono text-festival-gold">{c.code}</span>
                  </td>
                  <td className="py-3 px-3 text-white/70">{c.district}</td>
                  <td className="py-3 px-3 text-center font-bold">{c.totalDelegates}</td>
                  <td className="py-3 px-3 text-center text-cyan-400 font-bold">{c.eventsEntered}</td>
                  <td className="py-3 px-3 text-center text-amber-400 font-bold">{c.goldMedals}</td>
                  <td className="py-3 px-3 text-center text-zinc-300 font-bold">{c.silverMedals}</td>
                  <td className="py-3 px-3 text-center text-amber-600 font-bold">{c.bronzeMedals}</td>
                  <td className="py-3 px-3 text-right font-mono font-black text-festival-gold text-sm">
                    {c.totalPoints} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
