"use client";

import { useState } from "react";
import {
  RiCalendarLine,
  RiMicLine,
  RiMapPinRangeLine,
  RiUserHeartLine,
  RiAddLine,
  RiDeleteBinLine,
} from "react-icons/ri";

interface ScheduleManagementProps {
  events: any[];
}

export function ScheduleManagement({ events }: ScheduleManagementProps) {
  const [scheduleItems, setScheduleItems] = useState([
    { id: "sch-1", day: "Day 1", time: "09:30 AM - 10:30 AM", event: "Inauguration Ceremony", venue: "Main Auditorium", stage: "Stage A", coordinator: "Dr. Thomas V." },
    { id: "sch-2", day: "Day 1", time: "11:00 AM - 01:00 PM", event: "ValoFiesta Gaming", venue: "Computer Lab 1", stage: "Esports Arena", coordinator: "Mathew Joseph" },
    { id: "sch-3", day: "Day 1", time: "02:00 PM - 04:30 PM", event: "Battle of Bands", venue: "Open Air Amphitheatre", stage: "Main Stage", coordinator: "Ananya Sharma" },
  ]);

  return (
    <div className="space-y-6 select-none">
      <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Festival Master Schedule & Stage Allocation
          </h2>
          <p className="text-xs text-white/40">Manage Day 1 & Day 2 timetables, stage assignments, and volunteer shifts</p>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Master Timetable</h3>
          <button
            onClick={() => {
              const event = prompt("Event Title:");
              if (event) {
                setScheduleItems([
                  ...scheduleItems,
                  { id: `sch-${Date.now()}`, day: "Day 1", time: "12:00 PM", event, venue: "Hall A", stage: "Stage B", coordinator: "Admin" },
                ]);
              }
            }}
            className="btn-primary text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer"
          >
            <RiAddLine size={16} /> Add Slot
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest font-black text-[10px]">
                <th className="py-3 px-3">Day</th>
                <th className="py-3 px-3">Time Slot</th>
                <th className="py-3 px-3">Event Title</th>
                <th className="py-3 px-3">Venue</th>
                <th className="py-3 px-3">Stage</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {scheduleItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-bold text-festival-gold">{item.day}</td>
                  <td className="py-3 px-3 font-mono">{item.time}</td>
                  <td className="py-3 px-3 font-extrabold">{item.event}</td>
                  <td className="py-3 px-3 text-white/70">{item.venue}</td>
                  <td className="py-3 px-3 text-cyan-400 font-bold">{item.stage}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setScheduleItems(scheduleItems.filter((s) => s.id !== item.id))}
                      className="text-rose-400 cursor-pointer"
                    >
                      <RiDeleteBinLine size={14} />
                    </button>
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
