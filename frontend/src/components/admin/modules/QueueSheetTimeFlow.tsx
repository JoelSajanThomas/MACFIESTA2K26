"use client";

import { useState } from "react";
import {
  RiCalendarLine,
  RiMicLine,
  RiDownloadCloud2Line,
  RiFileTextLine,
  RiPrinterLine,
  RiTimeLine,
} from "react-icons/ri";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/exportUtils";

interface QueueItem {
  seqNo: number;
  timeSlot: string;
  eventName: string;
  stageName: string;
  reportingTime: string;
  coordinator: string;
  judgeName: string;
  status: "SCHEDULED" | "LIVE" | "COMPLETED";
}

export function QueueSheetTimeFlow() {
  const [activeDay, setActiveDay] = useState<"Day 1" | "Day 2">("Day 1");

  const [queueData, setQueueData] = useState<QueueItem[]>([
    { seqNo: 1, timeSlot: "09:30 AM - 10:30 AM", eventName: "Inauguration & Lighting Ceremony", stageName: "Main Auditorium (Stage A)", reportingTime: "09:00 AM", coordinator: "Dr. Thomas Varghese", judgeName: "N/A (Opening)", status: "COMPLETED" },
    { seqNo: 2, timeSlot: "11:00 AM - 01:00 PM", eventName: "ValoFiesta Valorant Tournament", stageName: "Seminar Hall A (Esports)", reportingTime: "10:30 AM", coordinator: "Mathew Joseph", judgeName: "Internal Jury", status: "LIVE" },
    { seqNo: 3, timeSlot: "01:30 PM - 03:00 PM", eventName: "CodeStorm 2.0 Hackathon", stageName: "Computer Lab 1", reportingTime: "01:00 PM", coordinator: "Rahul Varma", judgeName: "Prof. Sarah Paul", status: "SCHEDULED" },
    { seqNo: 4, timeSlot: "03:30 PM - 06:00 PM", eventName: "Battle of Bands 2K26", stageName: "Open Air Amphitheatre", reportingTime: "03:00 PM", coordinator: "Ananya Sharma", judgeName: "SoundWave Jury", status: "SCHEDULED" },
  ]);

  const exportQueueSheet = (format: "csv" | "excel" | "pdf") => {
    const exportRows = queueData.map((q) => ({
      "Seq #": q.seqNo,
      "Time Slot": q.timeSlot,
      "Reporting Time": q.reportingTime,
      "Event Name": q.eventName,
      "Stage / Venue": q.stageName,
      Coordinator: q.coordinator,
      "Judge / Jury": q.judgeName,
      Status: q.status,
    }));

    if (format === "csv") exportToCSV(`MacFiesta_Queue_Sheet_${activeDay}`, exportRows);
    else if (format === "excel") exportToExcel(`MacFiesta_Queue_Sheet_${activeDay}`, exportRows);
    else if (format === "pdf") exportToPDF(`OFFICIAL EVENT QUEUE SHEET (${activeDay.toUpperCase()})`, `MacFiesta_Queue_Sheet_${activeDay}`, exportRows);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <RiTimeLine className="text-festival-gold text-lg" />
            <span>Automated Queue Sheet & Program Time Flow Generator</span>
          </h2>
          <p className="text-xs text-white/40">Auto-generate sequence flow for stage managers, coordinators, judges, and volunteer crews</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => exportQueueSheet("excel")}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold cursor-pointer flex items-center gap-1"
          >
            <RiFileTextLine size={14} /> Queue Sheet (.xls)
          </button>
          <button
            onClick={() => exportQueueSheet("pdf")}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 font-bold cursor-pointer flex items-center gap-1"
          >
            <RiPrinterLine size={14} /> Print-Ready PDF
          </button>
        </div>
      </div>

      {/* Queue Sheet Table View */}
      <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Festival Stage & Program Flow Schedule
          </h3>
          <span className="text-[10px] font-mono text-festival-gold uppercase bg-festival-gold/10 px-2.5 py-0.5 rounded border border-festival-gold/30 font-bold">
            Live Sequential Roster
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest font-black text-[10px]">
                <th className="py-3 px-3 text-center">Seq #</th>
                <th className="py-3 px-3">Reporting & Performance Time</th>
                <th className="py-3 px-3">Event Competition</th>
                <th className="py-3 px-3">Stage & Venue</th>
                <th className="py-3 px-3">Assigned Coordinator</th>
                <th className="py-3 px-3">Assigned Jury</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {queueData.map((row) => (
                <tr key={row.seqNo} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 text-center font-mono font-bold text-festival-gold">#{row.seqNo}</td>
                  <td className="py-3 px-3">
                    <p className="font-mono font-bold text-white">{row.timeSlot}</p>
                    <span className="text-[10px] text-emerald-400 font-mono">Report: {row.reportingTime}</span>
                  </td>
                  <td className="py-3 px-3 font-extrabold">{row.eventName}</td>
                  <td className="py-3 px-3 text-cyan-400 font-semibold">{row.stageName}</td>
                  <td className="py-3 px-3 text-white/80">{row.coordinator}</td>
                  <td className="py-3 px-3 text-white/60">{row.judgeName}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        row.status === "LIVE"
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse"
                          : row.status === "COMPLETED"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {row.status}
                    </span>
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
