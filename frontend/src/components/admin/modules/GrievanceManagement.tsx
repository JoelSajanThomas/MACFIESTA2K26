"use client";

import { useState } from "react";
import {
  RiCustomerService2Line,
  RiQuestionAnswerLine,
  RiShieldCheckLine,
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
} from "react-icons/ri";

interface ObjectionRecord {
  id: string;
  type: "objection" | "general";
  submittedBy: string;
  college: string;
  eventTitle?: string;
  subject: string;
  details: string;
  status: "OPEN" | "PENDING_REVIEW" | "RESOLVED" | "REJECTED";
  priority: "HIGH" | "MEDIUM" | "LOW";
  date: string;
}

export function GrievanceManagement() {
  const [activeType, setActiveType] = useState<"all" | "objection" | "general">("all");

  const [grievances, setGrievances] = useState<ObjectionRecord[]>([
    {
      id: "gr-101",
      type: "objection",
      submittedBy: "Team Phoenix Captain (MACFAST)",
      college: "MACFAST Tiruvalla",
      eventTitle: "Battle of Bands 2K26",
      subject: "Scorecard Objection — Audio Distortion During Performance",
      details: "Stage audio monitor failed for 45 seconds during song #2. Requesting score review by Chief Jury.",
      status: "PENDING_REVIEW",
      priority: "HIGH",
      date: "30 mins ago",
    },
    {
      id: "gr-102",
      type: "general",
      submittedBy: "Ananya Sharma",
      college: "TKM College Kollam",
      subject: "Food Counter Coupon Verification Delay",
      details: "Long queue at Veg Counter 2 during 01:00 PM lunch slot.",
      status: "RESOLVED",
      priority: "MEDIUM",
      date: "2 hours ago",
    },
    {
      id: "gr-103",
      type: "objection",
      submittedBy: "DevBytes Team Lead",
      college: "NIT Tiruchirappalli",
      eventTitle: "CodeStorm 2.0 Hackathon",
      subject: "API Rate Limit Objection",
      details: "External API gateway timeout caused 10-minute submission delay.",
      status: "OPEN",
      priority: "HIGH",
      date: "1 hour ago",
    },
  ]);

  const updateStatus = (id: string, nextStatus: ObjectionRecord["status"]) => {
    setGrievances((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: nextStatus } : g))
    );
  };

  const filtered = grievances.filter((g) => {
    if (activeType === "all") return true;
    return g.type === activeType;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <RiCustomerService2Line className="text-festival-gold text-lg" />
            <span>Grievance, Technical Support & Program Objection Portal</span>
          </h2>
          <p className="text-xs text-white/40">Review participant event disputes, jury score objections, and general technical complaints</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
          {[
            { id: "all", label: "All Items" },
            { id: "objection", label: "Program Objections" },
            { id: "general", label: "General Complaints" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                activeType === t.id ? "bg-festival-gold text-festival-dark" : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stream List */}
      <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Active Grievance Stream ({filtered.length} Items)
          </h3>
        </div>

        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:bg-white/[0.07] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      item.type === "objection" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                    }`}>
                      {item.type === "objection" ? "Jury Objection" : "Helpdesk Item"}
                    </span>
                    <h4 className="font-extrabold text-white text-xs">{item.subject}</h4>
                  </div>
                  <p className="text-[10px] text-white/50">
                    Submitted by {item.submittedBy} ({item.college}) • {item.date}
                  </p>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  item.status === "RESOLVED"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : item.status === "PENDING_REVIEW"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : item.status === "REJECTED"
                    ? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                    : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                }`}>
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-white/80 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                {item.details}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5 text-xs">
                {item.status !== "RESOLVED" && (
                  <button
                    onClick={() => updateStatus(item.id, "RESOLVED")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold hover:bg-emerald-500/30 cursor-pointer flex items-center gap-1"
                  >
                    <RiCheckLine size={14} /> Resolve Grievance
                  </button>
                )}
                {item.status !== "REJECTED" && (
                  <button
                    onClick={() => updateStatus(item.id, "REJECTED")}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold hover:bg-rose-500/20 cursor-pointer flex items-center gap-1"
                  >
                    <RiCloseLine size={14} /> Dismiss / Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
