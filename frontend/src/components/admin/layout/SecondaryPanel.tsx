"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MODULES } from "./NavigationRail";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSearchLine,
  RiStarLine,
  RiStarFill,
  RiHistoryLine,
  RiFileCopyLine,
  RiExternalLinkLine,
  RiArrowDownSLine,
} from "react-icons/ri";

interface SecondaryPanelProps {
  activeModule: string;
  activePage: string;
  onSelectPage: (pageId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pinnedPages: string[];
  onTogglePin: (pageId: string) => void;
  recentPages: string[];
}

interface ContextMenuState {
  x: number;
  y: number;
  pageId: string;
  pageLabel: string;
}

export function SecondaryPanel({
  activeModule,
  activePage,
  onSelectPage,
  collapsed,
  onToggleCollapse,
  pinnedPages,
  onTogglePin,
  recentPages,
}: SecondaryPanelProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  const mod = MODULES.find((m) => m.id === activeModule);

  // Auto-scroll active item into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activePage]);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => setContextMenu(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  if (!mod || mod.pages.length === 0) {
    return null;
  }

  const Icon = mod.icon;

  // Filter pages by search query
  const filteredPages = mod.pages.filter((p) =>
    p.label.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Auto-group if > 8 items
  const primaryPages = filteredPages.length > 8 && !showMore ? filteredPages.slice(0, 7) : filteredPages;
  const overflowPages = filteredPages.length > 8 && !showMore ? filteredPages.slice(7) : [];

  const handleContextMenu = (e: React.MouseEvent, pageId: string, pageLabel: string) => {
    e.preventDefault();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 180),
      y: Math.min(e.clientY, window.innerHeight - 160),
      pageId,
      pageLabel,
    });
  };

  const copyLink = (pageId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/admin/console?page=${pageId}`);
    setContextMenu(null);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.aside
        key={collapsed ? "collapsed" : "expanded"}
        initial={{ width: collapsed ? 0 : 240, opacity: collapsed ? 0 : 1 }}
        animate={{ width: collapsed ? 0 : 240, opacity: collapsed ? 0 : 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:flex flex-col h-full bg-[#0d0d10] border-r border-zinc-800/80 overflow-hidden shrink-0 select-none relative shadow-xl"
      >
        {!collapsed && (
          <div className="flex flex-col h-full w-[240px]">
            {/* Module Header */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-zinc-800/80 shrink-0 bg-zinc-900/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#F5B301]/15 border border-[#F5B301]/30 flex items-center justify-center text-[#F5B301] shrink-0">
                  <Icon size={15} />
                </div>
                <span className="text-[13px] font-extrabold text-white tracking-wide truncate">
                  {mod.label}
                </span>
              </div>
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all cursor-pointer"
                title="Collapse Panel"
              >
                <RiArrowLeftSLine size={16} />
              </button>
            </div>

            {/* Quick Search inside Secondary Panel */}
            <div className="px-3.5 py-2.5 border-b border-zinc-800/60 shrink-0 bg-zinc-900/20">
              <div className="relative">
                <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" size={13} />
                <input
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={`Search ${mod.label}...`}
                  className="w-full pl-7 pr-2.5 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-[11px] text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-[#F5B301]/50 focus:ring-1 focus:ring-[#F5B301]/30 transition-all"
                />
              </div>
            </div>

            {/* Scrollable Nav Content Area */}
            <nav className="flex-1 overflow-y-auto min-h-0 px-3 py-2.5 space-y-3.5 scrollbar-none">
              {/* Pinned & Favorites section */}
              {pinnedPages.length > 0 && !filterQuery && (
                <div className="space-y-1">
                  <div className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F5B301] flex items-center gap-1.5">
                    <RiStarFill size={10} className="text-[#F5B301]" />
                    <span>Pinned Favorites</span>
                  </div>
                  <div className="space-y-0.5">
                    {pinnedPages.map((pinId) => {
                      let pinLabel = pinId;
                      MODULES.forEach((m) => {
                        const p = m.pages.find((pg) => pg.id === pinId);
                        if (p) pinLabel = p.label;
                      });
                      const isPinActive = activePage === pinId;

                      return (
                        <button
                          key={pinId}
                          onClick={() => onSelectPage(pinId)}
                          onContextMenu={(e) => handleContextMenu(e, pinId, pinLabel)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11.5px] transition-all cursor-pointer ${
                            isPinActive
                              ? "bg-[#F5B301]/15 text-[#F5B301] font-bold border border-[#F5B301]/30 shadow-sm"
                              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                          }`}
                        >
                          <span className="truncate">{pinLabel}</span>
                          <RiStarFill
                            size={11}
                            className="text-[#F5B301] shrink-0 cursor-pointer hover:scale-110 transition-transform"
                            onClick={(e) => { e.stopPropagation(); onTogglePin(pinId); }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Pages section */}
              {recentPages.length > 0 && !filterQuery && pinnedPages.length === 0 && (
                <div className="space-y-1">
                  <div className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <RiHistoryLine size={10} />
                    <span>Recently Visited</span>
                  </div>
                  <div className="space-y-0.5">
                    {recentPages.slice(0, 3).map((recId) => {
                      let recLabel = recId;
                      MODULES.forEach((m) => {
                        const p = m.pages.find((pg) => pg.id === recId);
                        if (p) recLabel = p.label;
                      });
                      const isRecActive = activePage === recId;

                      return (
                        <button
                          key={recId}
                          onClick={() => onSelectPage(recId)}
                          onContextMenu={(e) => handleContextMenu(e, recId, recLabel)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer ${
                            isRecActive ? "text-[#F5B301] font-bold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                          }`}
                        >
                          <span className="truncate">{recLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Module Pages List */}
              <div className="space-y-1">
                <div className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {mod.label} Navigation
                </div>
                <div className="space-y-0.5">
                  {primaryPages.map((page) => {
                    const isActive = activePage === page.id;
                    const isPinned = pinnedPages.includes(page.id);

                    return (
                      <button
                        key={page.id}
                        ref={isActive ? activeItemRef : null}
                        onClick={() => onSelectPage(page.id)}
                        onContextMenu={(e) => handleContextMenu(e, page.id, page.label)}
                        className={`
                          group/item w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px]
                          transition-all duration-150 cursor-pointer
                          ${
                            isActive
                              ? "bg-[#F5B301] text-zinc-950 font-extrabold shadow-md shadow-[#F5B301]/20"
                              : "text-zinc-400 hover:text-white hover:bg-zinc-800/60 font-medium"
                          }
                        `}
                      >
                        <span className="truncate">{page.label}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {page.badge && (
                            <span className={`text-[9px] font-extrabold px-1.5 py-px rounded uppercase ${
                              isActive ? "bg-zinc-950 text-[#F5B301]" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              {page.badge}
                            </span>
                          )}
                          <span
                            onClick={(e) => { e.stopPropagation(); onTogglePin(page.id); }}
                            className="opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer p-0.5"
                            title={isPinned ? "Unpin page" : "Pin page"}
                          >
                            {isPinned ? (
                              <RiStarFill size={11} className={isActive ? "text-zinc-950" : "text-[#F5B301]"} />
                            ) : (
                              <RiStarLine size={11} className={isActive ? "text-zinc-950/70 hover:text-zinc-950" : "text-zinc-500 hover:text-zinc-300"} />
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Smart Overflow Group (> 8 items) */}
                  {overflowPages.length > 0 && (
                    <div className="pt-1">
                      <button
                        onClick={() => setShowMore(!showMore)}
                        className="w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-[11px] text-[#F5B301] hover:bg-zinc-800/40 transition-colors cursor-pointer font-bold"
                      >
                        <span>More ({overflowPages.length})</span>
                        <RiArrowDownSLine size={13} className={showMore ? "rotate-180 transition-transform" : "transition-transform"} />
                      </button>
                      {showMore && (
                        <div className="ml-2 pl-2 border-l border-zinc-800/80 mt-1 space-y-0.5">
                          {overflowPages.map((op) => {
                            const isOpActive = activePage === op.id;
                            return (
                              <button
                                key={op.id}
                                onClick={() => onSelectPage(op.id)}
                                onContextMenu={(e) => handleContextMenu(e, op.id, op.label)}
                                className={`w-full text-left px-2 py-1 rounded-lg text-[11.5px] transition-colors cursor-pointer ${
                                  isOpActive ? "bg-[#F5B301]/15 text-[#F5B301] font-bold" : "text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                {op.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </nav>

            {/* Footer Module Badge */}
            <div className="px-4 py-2.5 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-mono flex items-center justify-between shrink-0 bg-zinc-900/40">
              <span>{mod.pages.length} Pages</span>
              <span className="text-[#F5B301] font-sans font-bold uppercase tracking-wider">MacFiesta Pro</span>
            </div>
          </div>
        )}

        {/* Context Menu Overlay */}
        {contextMenu && (
          <div
            style={{ left: contextMenu.x, top: contextMenu.y }}
            className="fixed z-50 w-48 bg-[#111114] border border-zinc-800 rounded-xl shadow-2xl p-1.5 text-[11.5px] text-zinc-200 select-none space-y-0.5 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-500 truncate border-b border-zinc-800 mb-1">
              {contextMenu.pageLabel}
            </div>
            <button
              onClick={() => { onTogglePin(contextMenu.pageId); setContextMenu(null); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/80 hover:text-white transition-colors text-left"
            >
              <RiStarLine size={13} className="text-[#F5B301]" />
              <span>{pinnedPages.includes(contextMenu.pageId) ? "Unpin Page" : "Pin to Favorites"}</span>
            </button>
            <button
              onClick={() => copyLink(contextMenu.pageId)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/80 hover:text-white transition-colors text-left"
            >
              <RiFileCopyLine size={13} className="text-zinc-400" />
              <span>Copy Direct Link</span>
            </button>
            <button
              onClick={() => {
                window.open(`/admin/console?page=${contextMenu.pageId}`, "_blank");
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/80 hover:text-white transition-colors text-left"
            >
              <RiExternalLinkLine size={13} className="text-zinc-400" />
              <span>Open in New Tab</span>
            </button>
          </div>
        )}
      </motion.aside>

      {/* Collapsed expand button */}
      {collapsed && mod.pages.length > 0 && (
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute left-[64px] top-1/2 -translate-y-1/2 z-20 w-5 h-10 items-center justify-center bg-[#0d0d10] border border-zinc-800 rounded-r-lg text-zinc-500 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer shadow-xl"
          title="Expand Panel"
        >
          <RiArrowRightSLine size={14} />
        </button>
      )}
    </AnimatePresence>
  );
}
