"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiCalendarEventLine,
  RiTrophyLine,
  RiMegaphoneLine,
  RiQrCodeLine,
  RiFileDownloadLine,
  RiAlertLine,
  RiCloseLine,
  RiFlashlightLine,
} from "react-icons/ri";

interface QuickActionDockProps {
  onQuickAction?: (action: string) => void;
}

export function QuickActionDock({ onQuickAction }: QuickActionDockProps) {
  const [expanded, setExpanded] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const actions = [
    { key: "create-event", label: "Add Event", icon: RiCalendarEventLine, color: "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30" },
    { key: "publish-result", label: "Publish Result", icon: RiTrophyLine, color: "text-[#F5B301] bg-[#F5B301]/10 hover:bg-[#F5B301]/20 border-[#F5B301]/30" },
    { key: "send-announcement", label: "New Announcement", icon: RiMegaphoneLine, color: "text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30" },
    { key: "generate-qr", label: "Generate QR", icon: RiQrCodeLine, color: "text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30" },
    { key: "download-report", label: "Export Report", icon: RiFileDownloadLine, color: "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30" },
    { key: "emergency-notice", label: "Emergency Alert", icon: RiAlertLine, color: "text-rose-400 bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 font-bold" },
  ];

  return (
    <div ref={dockRef} className="fixed bottom-6 right-6 z-40 select-none">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mb-3 p-2 bg-[#111114]/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl space-y-1 w-56 overflow-hidden"
          >
            <div className="px-3 py-1.5 border-b border-zinc-800/60 flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <RiFlashlightLine className="text-[#F5B301]" /> Quick Dock
              </span>
              <button
                onClick={() => setExpanded(false)}
                className="text-zinc-500 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <RiCloseLine size={14} />
              </button>
            </div>

            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.key}
                  onClick={() => {
                    setExpanded(false);
                    onQuickAction?.(act.key);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all cursor-pointer ${act.color}`}
                >
                  <Icon size={16} />
                  <span className="truncate">{act.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-13 h-13 rounded-full bg-[#F5B301] hover:bg-amber-300 text-zinc-950 shadow-2xl shadow-amber-500/30 flex items-center justify-center font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer border-2 border-amber-400/40"
        title="Expand Quick Action Dock"
      >
        <RiAddLine size={24} className={`transition-transform duration-200 ${expanded ? "rotate-45" : ""}`} />
      </button>
    </div>
  );
}
