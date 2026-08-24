"use client";

import { useState } from "react";
import {
  RiPulseLine,
  RiFilter3Line,
  RiFlashlightLine,
  RiTimeLine,
  RiUserSharedLine,
  RiCalendarEventLine,
  RiTrophyLine,
  RiHotelBedLine,
  RiBusLine,
  RiRestaurantLine,
  RiShieldCheckLine,
  RiCloseLine,
  RiArrowRightLine,
} from "react-icons/ri";

interface ContextPanelProps {
  activePage: string;
  onQuickAction?: (action: string) => void;
  auditLogs?: any[];
}

export function ContextPanel({ activePage, onQuickAction, auditLogs = [] }: ContextPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="hidden lg:flex items-center justify-center w-8 h-full bg-[#0c0c0f] border-l border-zinc-800/80 text-zinc-500 hover:text-white transition-colors cursor-pointer shrink-0"
        title="Open Context Panel"
      >
        <RiPulseLine size={16} className="text-[#F5B301] animate-pulse" />
      </button>
    );
  }

  const renderContextContent = () => {
    switch (activePage) {
      case "events":
      case "events.list":
      case "events.live":
        return (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] text-[#F5B301] font-bold uppercase tracking-widest block">
                Event Operations Summary
              </span>
              <div className="flex justify-between text-zinc-300">
                <span>Active Competitions</span>
                <span className="font-bold text-white">26 Events</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Total Prize Pool</span>
                <span className="font-bold text-[#F5B301]">₹2,50,000</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Queue Sheets Ready</span>
                <span className="font-bold text-emerald-400">18 / 26</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                Quick Event Filters
              </span>
              {["All Categories", "Cultural", "Technical", "Sports", "Gaming", "Literary"].map((cat) => (
                <button
                  key={cat}
                  className="w-full text-left px-3 py-1.5 rounded-lg bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium transition-colors flex items-center justify-between"
                >
                  <span>{cat}</span>
                  <RiFilter3Line size={12} className="text-zinc-600" />
                </button>
              ))}
            </div>

            <button
              onClick={() => onQuickAction?.("create-event")}
              className="w-full py-2 rounded-xl bg-[#F5B301] text-zinc-950 text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-md hover:bg-amber-300 cursor-pointer"
            >
              <RiCalendarEventLine size={14} /> Add New Event
            </button>
          </div>
        );

      case "registrations":
      case "registrations.online":
      case "registrations.spot":
        return (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] text-[#F5B301] font-bold uppercase tracking-widest block">
                Live Registration Telemetry
              </span>
              <div className="flex justify-between text-zinc-300">
                <span>Pending Approvals</span>
                <span className="font-bold text-amber-400">23 Users</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Spot Check-ins Today</span>
                <span className="font-bold text-cyan-400">47 Passes</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Verified Delegates</span>
                <span className="font-bold text-emerald-400">1,150</span>
              </div>
            </div>

            <button
              onClick={() => onQuickAction?.("register-participant")}
              className="w-full py-2 rounded-xl bg-[#F5B301] text-zinc-950 text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-md hover:bg-amber-300 cursor-pointer"
            >
              <RiUserSharedLine size={14} /> Spot Register Delegate
            </button>
          </div>
        );

      case "finance":
      case "finance.overview":
      case "finance.payments":
        return (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] text-[#F5B301] font-bold uppercase tracking-widest block">
                Banking & Cash Flow Context
              </span>
              <div className="flex justify-between text-zinc-300">
                <span>Gross Income</span>
                <span className="font-bold text-emerald-400">₹1,72,500</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Pending Payment Verification</span>
                <span className="font-bold text-orange-400">14 Receipts</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Refund Requests</span>
                <span className="font-bold text-rose-400">3 Pending</span>
              </div>
            </div>
          </div>
        );

      case "results":
      case "results.publish":
        return (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] text-[#F5B301] font-bold uppercase tracking-widest block">
                Tournament Results Live Stream
              </span>
              <div className="flex justify-between text-zinc-300">
                <span>Results Published</span>
                <span className="font-bold text-emerald-400">18 Events</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Waiting Judge Scorecard</span>
                <span className="font-bold text-amber-400">8 Events</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Objections Logged</span>
                <span className="font-bold text-rose-400">3 Cases</span>
              </div>
            </div>

            <button
              onClick={() => onQuickAction?.("publish-result")}
              className="w-full py-2 rounded-xl bg-[#F5B301] text-zinc-950 text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-md hover:bg-amber-300 cursor-pointer"
            >
              <RiTrophyLine size={14} /> Publish Winner List
            </button>
          </div>
        );

      default:
        return (
          <div className="space-y-4 text-xs">
            {/* Real-time System Stream */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <RiPulseLine className="text-[#F5B301] animate-pulse" /> Live Telemetry Feed
              </span>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(auditLogs.length > 0
                  ? auditLogs.slice(0, 5)
                  : [
                      { id: "1", action: "New Registration", user: "Mar Baselios Delegate", time: "1m ago" },
                      { id: "2", action: "Payment Confirmed", user: "₹450 via Razorpay", time: "5m ago" },
                      { id: "3", action: "Volunteer Assigned", user: "Stage B Coordinator", time: "12m ago" },
                      { id: "4", action: "Result Published", user: "Gaming Valorant", time: "22m ago" },
                    ]
                ).map((log: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60 space-y-0.5">
                    <p className="text-[11px] font-bold text-white flex items-center justify-between">
                      <span>{log.action || log.details}</span>
                      <span className="text-[9px] text-zinc-500 font-mono">{log.time || "Just now"}</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate">{log.user || log.details || "System Event"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Context Shortcuts */}
            <div className="pt-2 border-t border-zinc-800 space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                Shortcuts
              </span>
              <button
                onClick={() => onQuickAction?.("create-event")}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium transition-colors flex items-center justify-between"
              >
                <span>New Event</span>
                <RiArrowRightLine size={12} className="text-zinc-600" />
              </button>
              <button
                onClick={() => onQuickAction?.("send-announcement")}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium transition-colors flex items-center justify-between"
              >
                <span>Notice Broadcast</span>
                <RiArrowRightLine size={12} className="text-zinc-600" />
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <aside className="hidden xl:flex flex-col w-72 h-full bg-[#0c0c0f] border-l border-zinc-800/80 shrink-0 select-none overflow-hidden min-h-0">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <RiFlashlightLine size={15} className="text-[#F5B301]" />
          <span className="text-[12px] font-extrabold text-white uppercase tracking-wider">
            Context Panel
          </span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-colors cursor-pointer"
          title="Minimize Context Panel"
        >
          <RiCloseLine size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-zinc-800">
        {renderContextContent()}
      </div>
    </aside>
  );
}
