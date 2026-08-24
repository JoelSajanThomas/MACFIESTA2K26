"use client";

import { useState } from "react";
import { DataTable, Column } from "../shared/DataTable";
import {
  RiHome8Line,
  RiAddLine,
  RiCheckDoubleLine,
  RiBuildingLine,
} from "react-icons/ri";

interface AccommodationRecord {
  _id: string;
  delegateName: string;
  email: string;
  college: string;
  hostelType: string;
  roomNo: string;
  duration: string;
  status: string;
  feePaid: number;
}

interface AccommodationManagementProps {
  accommodations: AccommodationRecord[];
  onAddAccommodation?: (data: any) => void;
  onRefresh?: () => void;
}

export function AccommodationManagement({
  accommodations,
  onAddAccommodation,
  onRefresh,
}: AccommodationManagementProps) {
  const [hostelFilter, setHostelFilter] = useState<string>("all");

  const filtered = accommodations.filter((acc) => {
    if (hostelFilter === "all") return true;
    return acc.hostelType.toLowerCase().includes(hostelFilter.toLowerCase());
  });

  const columns: Column<AccommodationRecord>[] = [
    {
      key: "delegateName",
      header: "Delegate & Institution",
      render: (row) => (
        <div>
          <p className="font-bold text-white text-xs">{row.delegateName}</p>
          <p className="text-[10px] text-white/40">{row.college}</p>
        </div>
      ),
    },
    {
      key: "hostelType",
      header: "Hostel & Room",
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-white/90">{row.hostelType}</p>
          <span className="text-[10px] font-mono font-bold text-festival-gold uppercase bg-festival-gold/10 px-2 py-0.5 rounded border border-festival-gold/20">
            Room: {row.roomNo}
          </span>
        </div>
      ),
    },
    {
      key: "duration",
      header: "Stay Duration",
      render: (row) => <span className="text-xs text-white/70">{row.duration}</span>,
    },
    {
      key: "feePaid",
      header: "Hostel Fee",
      render: (row) => (
        <span className="text-xs font-black text-emerald-400">₹{row.feePaid}</span>
      ),
    },
    {
      key: "status",
      header: "Occupancy Status",
      render: (row) => {
        const isCheckedIn = row.status === "CHECKED_IN";
        return (
          <span
            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
              isCheckedIn
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-amber-500/20 text-amber-300 border-amber-500/30"
            }`}
          >
            {isCheckedIn ? "Checked In" : "Confirmed"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hostel Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass p-4 rounded-2xl border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Hostels" },
            { id: "boys", label: "Boys Hostels (Block B/C)" },
            { id: "girls", label: "Girls Hostels (Block A)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setHostelFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                hostelFilter === tab.id
                  ? "bg-festival-gold text-festival-dark shadow-[0_0_15px_rgba(234,179,8,0.25)]"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        title="Campus Accommodation Roster"
        columns={columns}
        data={filtered}
        searchKey="delegateName"
        searchPlaceholder="Search delegate, college, or room number..."
        onRefresh={onRefresh}
        exportFileName="macfiesta_accommodation"
      />
    </div>
  );
}
