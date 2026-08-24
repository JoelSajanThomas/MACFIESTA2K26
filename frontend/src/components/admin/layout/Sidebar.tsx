"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MODULES, NavModule } from "./NavigationRail";
import {
  RiArrowRightSLine,
  RiArrowLeftSLine,
  RiCompass3Line,
} from "react-icons/ri";

interface SidebarProps {
  activePage: string;
  onSelectPage: (pageId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  activePage,
  onSelectPage,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [activeHubId, setActiveHubId] = useState<string | null>(null);
  const [hoveredHubId, setHoveredHubId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActiveHubId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayHub = MODULES.find((m) => m.id === (hoveredHubId || activeHubId));

  return (
    <aside
      className={`
        relative hidden lg:flex flex-col h-full min-h-0 max-h-full bg-[#0c0c0f] border-r border-zinc-800/80
        transition-[width] duration-300 ease-in-out shrink-0 select-none items-center py-3 z-40
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Top Header Logo */}
      <div
        className={`w-full flex items-center gap-3 px-3 h-10 border-b border-zinc-800/60 shrink-0 mb-3 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F5B301] to-amber-600 flex items-center justify-center text-zinc-950 font-black text-xs shrink-0 shadow-lg shadow-amber-500/20 cursor-pointer hover:scale-105 transition-transform">
          MF
        </div>
        {!collapsed && (
          <div className="min-w-0 overflow-hidden">
            <p className="text-[13px] font-black text-white tracking-tight leading-none truncate">
              MacFiesta Pro
            </p>
            <p className="text-[10px] text-zinc-500 font-medium mt-0.5 truncate">
              Super Admin OS
            </p>
          </div>
        )}
      </div>

      {/* Nav Category Cards */}
      <nav className="flex-1 flex flex-col items-center gap-2 overflow-y-auto min-h-0 w-full px-2 scrollbar-thin">
        {MODULES.map((hub) => {
          const Icon = hub.icon;
          const isSelected =
            activePage === hub.id ||
            hub.pages.some((p) => p.id === activePage);

          return (
            <div
              key={hub.id}
              className="relative group w-full flex justify-center"
              onMouseEnter={() => collapsed && setHoveredHubId(hub.id)}
              onMouseLeave={() => collapsed && setHoveredHubId(null)}
            >
              <button
                onClick={() => {
                  if (hub.pages.length === 0) {
                    onSelectPage(hub.id);
                    setActiveHubId(null);
                  } else {
                    onSelectPage(hub.pages[0].id);
                  }
                }}
                className={`
                  relative w-full rounded-2xl flex items-center transition-all duration-150 cursor-pointer text-left
                  ${collapsed ? "w-11 h-11 justify-center" : "p-2.5 gap-3"}
                  ${
                    isSelected
                      ? "bg-[#F5B301]/10 text-[#F5B301] border border-[#F5B301]/30 shadow-md font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent"
                  }
                `}
              >
                <Icon size={19} className="shrink-0" />
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-extrabold text-white truncate leading-snug">
                      {hub.label}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate group-hover:text-zinc-400">
                      {hub.desc}
                    </p>
                  </div>
                )}
                {isSelected && (
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-[#F5B301] rounded-r-full shadow-[0_0_10px_#F5B301]" />
                )}
              </button>
            </div>
          );
        })}


      </nav>

      {/* Floating Popover in Collapsed Mode */}
      {collapsed && (
        <AnimatePresence>
          {displayHub && displayHub.pages.length > 0 && (
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, x: -10, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.96 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              onMouseEnter={() => setHoveredHubId(displayHub.id)}
              onMouseLeave={() => setHoveredHubId(null)}
              className="absolute left-16 top-4 z-50 w-72 bg-[#111114]/95 backdrop-blur-2xl border border-zinc-800 rounded-2xl shadow-2xl p-3 space-y-1 text-xs"
            >
              <div className="px-3 py-2 border-b border-zinc-800/80 mb-1 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <RiCompass3Line className="text-[#F5B301]" />
                    <span>{displayHub.label}</span>
                  </p>
                  <p className="text-[10px] text-zinc-500">{displayHub.desc}</p>
                </div>
              </div>

              <div className="space-y-0.5">
                {displayHub.pages.map((page) => {
                  const isActive = activePage === page.id;
                  return (
                    <button
                      key={page.id}
                      onClick={() => {
                        onSelectPage(page.id);
                        setActiveHubId(null);
                        setHoveredHubId(null);
                      }}
                      className={`
                        w-full text-left p-2.5 rounded-xl transition-all duration-120 cursor-pointer flex items-center justify-between gap-2 group
                        ${
                          isActive
                            ? "bg-[#F5B301]/10 text-[#F5B301] border border-[#F5B301]/25 font-bold"
                            : "text-zinc-300 hover:text-white hover:bg-zinc-800/50"
                        }
                      `}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[12px] truncate">{page.label}</span>
                          {page.badge && (
                            <span className="text-[9px] font-extrabold px-1.5 py-px rounded-full uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
                              {page.badge}
                            </span>
                          )}
                        </div>
                        {page.desc && (
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5 group-hover:text-zinc-400">
                            {page.desc}
                          </p>
                        )}
                      </div>
                      <RiArrowRightSLine
                        size={14}
                        className="text-zinc-600 group-hover:text-[#F5B301] group-hover:translate-x-0.5 transition-transform shrink-0"
                      />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Collapse Toggle Footer */}
      <div className="w-full border-t border-zinc-800/60 p-1.5 shrink-0 mt-auto">
        <button
          onClick={onToggleCollapse}
          className={`
            w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px]
            text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all cursor-pointer
            ${collapsed ? "justify-center" : ""}
          `}
          title={collapsed ? "Expand Category Panel" : "Collapse to Rail"}
        >
          {collapsed ? (
            <RiArrowRightSLine size={16} />
          ) : (
            <>
              <RiArrowLeftSLine size={16} />
              <span className="font-semibold text-xs">Collapse Panel</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

// ── Mobile Sidebar Overlay ───────────────────────────────────────────
interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  onSelectPage: (pageId: string) => void;
}

export function MobileSidebar({
  isOpen,
  onClose,
  activePage,
  onSelectPage,
}: MobileSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="relative z-10 w-72 bg-[#0c0c0f] border-r border-zinc-800 flex flex-col h-full shadow-2xl p-4 space-y-4"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F5B301] to-amber-600 flex items-center justify-center text-zinc-950 font-black text-xs shrink-0">
                MF
              </div>
              <div>
                <p className="text-[13px] font-black text-white">MacFiesta</p>
                <p className="text-[10px] text-zinc-500">2K26 Control Center</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin">
              {MODULES.map((hub) => (
                <div key={hub.id} className="space-y-1">
                  <p className="text-[10px] font-extrabold uppercase text-[#F5B301] tracking-wider px-2">
                    {hub.label}
                  </p>
                  {hub.pages.length === 0 ? (
                    <button
                      onClick={() => {
                        onSelectPage(hub.id);
                        onClose();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800"
                    >
                      {hub.label}
                    </button>
                  ) : (
                    hub.pages.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectPage(p.id);
                          onClose();
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                          activePage === p.id
                            ? "bg-[#F5B301]/10 text-[#F5B301] font-bold"
                            : "text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        <span>{p.label}</span>
                        {p.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                            {p.badge}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
