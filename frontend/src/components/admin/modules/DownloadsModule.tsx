"use client";

import { RiDownloadCloud2Line, RiFileTextLine } from "react-icons/ri";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/exportUtils";

interface DownloadsModuleProps {
  registrations: any[];
  events: any[];
  payments: any[];
}

export function DownloadsModule({ registrations, events, payments }: DownloadsModuleProps) {
  const sampleRegistrations = registrations.length > 0 ? registrations : [
    { passCode: "MF-2K26-101", name: "Rahul Varma", email: "rahul@cet.ac.in", college: "CET Trivandrum", event: "ValoFiesta", status: "VERIFIED" },
  ];

  const exportReport = (format: "excel" | "csv" | "pdf") => {
    if (format === "excel") exportToExcel("macfiesta_registrations", sampleRegistrations);
    else if (format === "csv") exportToCSV("macfiesta_registrations", sampleRegistrations);
    else if (format === "pdf") exportToPDF("DELEGATE REGISTRATIONS ROSTER", "macfiesta_registrations", sampleRegistrations);
  };

  return (
    <div className="space-y-6 select-none">
      <div className="glass p-4 rounded-2xl border border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Downloads & Export Central Command
          </h2>
          <p className="text-xs text-white/40">One-click instant downloads in Microsoft Excel (.xls), CSV, or formatted PDF</p>
        </div>
        <RiDownloadCloud2Line size={24} className="text-festival-gold" />
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <h3 className="font-extrabold text-white text-sm">Master Registration Roster</h3>
        <p className="text-xs text-white/50">Full directory of verified pass holders with contact & college details</p>

        <div className="flex items-center gap-2 text-xs pt-2">
          <button onClick={() => exportReport("excel")} className="py-2 px-4 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold cursor-pointer">
            Excel (.xls)
          </button>
          <button onClick={() => exportReport("csv")} className="py-2 px-4 rounded-xl bg-white/5 text-white font-bold cursor-pointer">
            CSV
          </button>
          <button onClick={() => exportReport("pdf")} className="py-2 px-4 rounded-xl bg-rose-500/20 text-rose-400 font-bold cursor-pointer">
            PDF Document
          </button>
        </div>
      </div>
    </div>
  );
}
