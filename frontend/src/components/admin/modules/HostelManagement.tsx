"use client";

import { useState } from "react";
import {
  RiHome8Line,
  RiUserLine,
  RiCheckDoubleLine,
  RiPhoneLine,
  RiQrCodeLine,
  RiDownloadCloud2Line,
  RiAddLine,
  RiBuilding2Line,
} from "react-icons/ri";

interface HostelAllocation {
  id: string;
  gender: "male" | "female";
  delegateName: string;
  college: string;
  phone: string;
  hostelBlock: string;
  roomNo: string;
  bedNo: string;
  duration: string;
  status: "CHECKED_IN" | "CONFIRMED" | "CHECKED_OUT";
  emergencyContact: string;
}

export function HostelManagement() {
  const [activeGender, setActiveGender] = useState<"male" | "female">("male");
  const [subTab, setSubTab] = useState<"allocation" | "occupancy" | "passes" | "contacts">("allocation");

  const [allocations, setAllocations] = useState<HostelAllocation[]>([
    {
      id: "h1",
      gender: "male",
      delegateName: "Rahul Varma",
      college: "CET Trivandrum",
      phone: "+91 98470 11223",
      hostelBlock: "Boys Hostel (Block B)",
      roomNo: "B-204",
      bedNo: "Bed 2",
      duration: "2 Days (Sep 24-25)",
      status: "CHECKED_IN",
      emergencyContact: "Father: Ramesh Varma (+91 98470 99887)",
    },
    {
      id: "h2",
      gender: "female",
      delegateName: "Ananya Sharma",
      college: "TKM College Kollam",
      phone: "+91 98470 33445",
      hostelBlock: "Girls Hostel (Block A)",
      roomNo: "A-108",
      bedNo: "Bed 1",
      duration: "2 Days (Sep 24-25)",
      status: "CONFIRMED",
      emergencyContact: "Mother: Sunitha Sharma (+91 98470 77665)",
    },
    {
      id: "h3",
      gender: "male",
      delegateName: "Mathew K. Joseph",
      college: "SJCET Pala",
      phone: "+91 98470 55667",
      hostelBlock: "Boys Hostel (Block C)",
      roomNo: "C-112",
      bedNo: "Bed 3",
      duration: "Day 1 Only (Sep 24)",
      status: "CHECKED_IN",
      emergencyContact: "Guardian: Joseph Mathew (+91 98470 55443)",
    },
    {
      id: "h4",
      gender: "female",
      delegateName: "Sneha Roy",
      college: "Mar Ivanios College",
      phone: "+91 98470 99000",
      hostelBlock: "Girls Hostel (Block B)",
      roomNo: "B-302",
      bedNo: "Bed 2",
      duration: "2 Days (Sep 24-25)",
      status: "CHECKED_IN",
      emergencyContact: "Father: Dr. Roy P. (+91 98470 11000)",
    },
  ]);

  const filteredAllocations = allocations.filter((a) => a.gender === activeGender);

  const toggleCheckIn = (id: string) => {
    setAllocations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus =
            item.status === "CONFIRMED"
              ? "CHECKED_IN"
              : item.status === "CHECKED_IN"
              ? "CHECKED_OUT"
              : "CONFIRMED";
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner & Dual Gender Selector */}
      <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <RiHome8Line className="text-festival-gold text-lg" />
            <span>Hostel Accommodation Management & Room Allocations</span>
          </h2>
          <p className="text-xs text-white/40">Separate management portals for Male & Female delegate hostels, bed tracking, and pass generation</p>
        </div>

        {/* Gender View Switcher */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveGender("male")}
            className={`px-4 py-2 rounded-lg font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeGender === "male"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            👦 Male Hostel (Blocks B & C)
          </button>
          <button
            onClick={() => setActiveGender("female")}
            className={`px-4 py-2 rounded-lg font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeGender === "female"
                ? "bg-pink-500 text-slate-950 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            👧 Female Hostel (Blocks A & B)
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass p-3 rounded-2xl border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          {[
            { id: "allocation", label: "Room & Bed Allocation" },
            { id: "occupancy", label: "Occupancy Gauges" },
            { id: "passes", label: "Hostel Entry Passes" },
            { id: "contacts", label: "Emergency Contacts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                subTab === tab.id
                  ? "bg-festival-gold text-festival-dark shadow-[0_0_15px_rgba(234,179,8,0.25)]"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            const name = prompt("Delegate Name:");
            const room = prompt("Room Number (e.g. B-204):");
            if (name && room) {
              setAllocations([
                ...allocations,
                {
                  id: `h-${Date.now()}`,
                  gender: activeGender,
                  delegateName: name,
                  college: "External University",
                  phone: "+91 98000 00000",
                  hostelBlock: activeGender === "male" ? "Boys Hostel Block B" : "Girls Hostel Block A",
                  roomNo: room,
                  bedNo: "Bed 1",
                  duration: "2 Days (Sep 24-25)",
                  status: "CONFIRMED",
                  emergencyContact: "Parent Contact",
                },
              ]);
            }
          }}
          className="btn-primary text-xs flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl cursor-pointer ml-auto"
        >
          <RiAddLine size={16} /> Allocate Room Bed
        </button>
      </div>

      {/* Allocations View */}
      {subTab === "allocation" && (
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>{activeGender === "male" ? "Boys Hostel Roster" : "Girls Hostel Roster"}</span>
              <span className="text-[10px] font-mono text-festival-gold px-2 py-0.5 rounded bg-festival-gold/10">
                {filteredAllocations.length} Active Delegates Assigned
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest font-black text-[10px]">
                  <th className="py-3 px-3">Delegate Name</th>
                  <th className="py-3 px-3">Institution / College</th>
                  <th className="py-3 px-3">Hostel Block</th>
                  <th className="py-3 px-3">Room & Bed</th>
                  <th className="py-3 px-3">Stay Duration</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {filteredAllocations.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-extrabold text-white">{row.delegateName}</p>
                      <span className="text-[10px] text-white/40">{row.phone}</span>
                    </td>
                    <td className="py-3 px-3 text-white/80">{row.college}</td>
                    <td className="py-3 px-3 text-cyan-400 font-bold">{row.hostelBlock}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-festival-gold">{row.roomNo}</span> ({row.bedNo})
                    </td>
                    <td className="py-3 px-3 text-white/60">{row.duration}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          row.status === "CHECKED_IN"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : row.status === "CONFIRMED"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => toggleCheckIn(row.id)}
                        className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold cursor-pointer"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Occupancy View */}
      {subTab === "occupancy" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h4 className="font-extrabold text-white text-sm">Block A Occupancy</h4>
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: "85%" }} />
            </div>
            <p className="text-xs text-white/60">34 / 40 Beds Allocated (85% Capacity)</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h4 className="font-extrabold text-white text-sm">Block B Occupancy</h4>
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: "60%" }} />
            </div>
            <p className="text-xs text-white/60">24 / 40 Beds Allocated (60% Capacity)</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h4 className="font-extrabold text-white text-sm">Waiting List Queue</h4>
            <span className="text-2xl font-black text-amber-400">6 Delegates</span>
            <p className="text-xs text-white/60">Pending Room Assignment</p>
          </div>
        </div>
      )}

      {/* Emergency Contacts View */}
      {subTab === "contacts" && (
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-3 text-xs">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
            Hostel Guardian & Emergency Phone Directory
          </h3>
          {filteredAllocations.map((a) => (
            <div key={a.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between">
              <div>
                <h4 className="font-extrabold text-white">{a.delegateName} ({a.roomNo})</h4>
                <p className="text-white/60">{a.emergencyContact}</p>
              </div>
              <RiPhoneLine className="text-emerald-400 text-lg" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
