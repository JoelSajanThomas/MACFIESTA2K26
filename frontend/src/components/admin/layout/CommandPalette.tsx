"use client";

import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  RiSearchLine,
  RiCloseLine,
  RiArrowRightLine,
  RiAddLine,
  RiCalendarEventLine,
  RiUserAddLine,
  RiUserHeartLine,
  RiTrophyLine,
  RiMegaphoneLine,
  RiAwardLine,
  RiRefund2Line,
  RiFileDownloadLine,
  RiTimeLine,
} from "react-icons/ri";
import { MODULES } from "./NavigationRail";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onQuickAction?: (action: string) => void;
}

interface CommandItem {
  id: string;
  category: string;
  title: string;
  icon: any;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  onQuickAction,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) { setQuery(""); setSelectedIndex(0); }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [];

    // Quick actions
    const actions = [
      { id: "qa-event", title: "Create Event", icon: RiCalendarEventLine, key: "create-event" },
      { id: "qa-participant", title: "Register Participant", icon: RiUserAddLine, key: "register-participant" },
      { id: "qa-volunteer", title: "Add Volunteer", icon: RiUserHeartLine, key: "add-volunteer" },
      { id: "qa-result", title: "Publish Result", icon: RiTrophyLine, key: "publish-result" },
      { id: "qa-announcement", title: "Send Announcement", icon: RiMegaphoneLine, key: "send-announcement" },
      { id: "qa-certificate", title: "Generate Certificate", icon: RiAwardLine, key: "generate-certificate" },
      { id: "qa-refund", title: "Issue Refund", icon: RiRefund2Line, key: "issue-refund" },
      { id: "qa-report", title: "Download Report", icon: RiFileDownloadLine, key: "download-report" },
      { id: "qa-schedule", title: "Create Schedule", icon: RiTimeLine, key: "create-schedule" },
    ];

    actions.forEach((a) => {
      list.push({
        id: a.id,
        category: "Quick Action",
        title: a.title,
        icon: a.icon,
        action: () => { onQuickAction?.(a.key); onClose(); },
      });
    });

    // Navigation items from MODULES
    MODULES.forEach((mod) => {
      const Icon = mod.icon;
      if (mod.pages.length === 0) {
        list.push({
          id: mod.id,
          category: "Navigate",
          title: mod.label,
          icon: Icon,
          action: () => { onSelectTab(mod.id); onClose(); },
        });
      }
      mod.pages.forEach((page) => {
        list.push({
          id: page.id,
          category: mod.label,
          title: page.label,
          icon: Icon,
          action: () => { onSelectTab(page.id); onClose(); },
        });
      });
    });

    return list;
  }, [onClose, onQuickAction, onSelectTab]);

  const results = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        results[selectedIndex]?.action();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, results, selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-lg bg-[#111113] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
          >
            {/* Input */}
            <div className="p-3 border-b border-white/[0.06] flex items-center gap-2.5">
              <RiSearchLine size={15} className="text-zinc-500 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                placeholder="Type a command or search..."
                className="w-full bg-transparent text-[13px] text-white placeholder:text-zinc-600 focus:outline-none"
              />
              <button onClick={onClose} className="p-1 text-zinc-600 hover:text-zinc-400 cursor-pointer">
                <RiCloseLine size={16} />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-px">
              {results.length === 0 ? (
                <div className="py-8 text-center text-zinc-600 text-[12px]">
                  No results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                results.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  const selected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        selected
                          ? "bg-white/[0.06] text-white"
                          : "text-zinc-400 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={14} className={selected ? "text-amber-400" : "text-zinc-600"} />
                        <div className="flex items-center gap-2">
                          <span className="text-[12.5px] font-medium">{cmd.title}</span>
                          <span className="text-[10px] text-zinc-600">{cmd.category}</span>
                        </div>
                      </div>
                      {selected && <RiArrowRightLine size={12} className="text-zinc-600" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 bg-[#0c0c0e] border-t border-white/[0.05] flex items-center justify-between text-[10px] text-zinc-600 font-mono">
              <div className="flex gap-3">
                <span><kbd className="bg-white/[0.06] px-1 py-0.5 rounded text-zinc-500">↑↓</kbd> Navigate</span>
                <span><kbd className="bg-white/[0.06] px-1 py-0.5 rounded text-zinc-500">↵</kbd> Select</span>
              </div>
              <span><kbd className="bg-white/[0.06] px-1 py-0.5 rounded text-zinc-500">Esc</kbd> Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
