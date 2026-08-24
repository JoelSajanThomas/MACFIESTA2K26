"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MODULES, NavModule } from "./NavigationRail";
import {
  RiCloseLine,
  RiSearchLine,
  RiArrowRightLine,
  RiShieldFlashLine,
  RiSparklingLine,
  RiFlashlightLine,
} from "react-icons/ri";

interface AdminMenuMatrixProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  onSelectPage: (pageId: string) => void;
}

export function AdminMenuMatrix({
  isOpen,
  onClose,
  activePage,
  onSelectPage,
}: AdminMenuMatrixProps) {
  const [search, setSearch] = useState("");

  const filteredModules = MODULES.filter((module) => {
    const matchLabel = module.label.toLowerCase().includes(search.toLowerCase());
    const matchDesc = module.desc.toLowerCase().includes(search.toLowerCase());
    const matchPage = module.pages.some((p) =>
      p.label.toLowerCase().includes(search.toLowerCase())
    );
    return matchLabel || matchDesc || matchPage;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] bg-[#05050A]/95 backdrop-blur-2xl text-white flex flex-col p-4 sm:p-8 font-mono select-none overflow-y-auto select-scrollbar"
        >
          {/* Background Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[350px] rounded-full bg-marvel-red/10 blur-[150px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[350px] rounded-full bg-arc-cyan/10 blur-[150px] pointer-events-none" />

          {/* Header */}
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between border-b border-arc-cyan/30 pb-6 mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-marvel-red text-white flex items-center justify-center text-xl font-black shadow-[0_0_25px_#ED1D24] border-2 border-white/20">
                MF
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-marvel-red text-white">
                    S.H.I.E.L.D. COMMAND MATRIX
                  </span>
                  <span className="text-xs text-arc-cyan font-bold flex items-center gap-1">
                    <RiSparklingLine className="animate-spin-slow" /> 10 WORKSPACES ACTIVE
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  TACTICAL <span className="marvel-bang-comic-gradient font-black">ADMIN MENU</span>
                </h2>
              </div>
            </div>

            <button
              type="button"
              suppressHydrationWarning={true}
              onClick={onClose}
              className="p-3 rounded-full bg-white/10 hover:bg-marvel-red hover:text-white text-white/80 transition-all cursor-pointer border border-white/10 shadow-lg"
              aria-label="Close Admin Menu"
            >
              <RiCloseLine size={24} />
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="max-w-7xl mx-auto w-full mb-8 relative z-10">
            <div className="relative">
              <RiSearchLine className="absolute left-5 top-1/2 -translate-y-1/2 text-arc-cyan text-xl" />
              <input
                type="text"
                suppressHydrationWarning={true}
                placeholder="Search workspaces, missions, finance, logistics, or tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-black/80 border-2 border-arc-cyan/30 rounded-2xl text-white text-sm focus:border-arc-cyan focus:outline-none transition-all placeholder:text-white/40 shadow-[0_0_20px_rgba(0,212,255,0.1)]"
              />
            </div>
          </div>

          {/* 10 Workspaces Grid Cards */}
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 pb-12">
            {filteredModules.map((hub) => {
              const Icon = hub.icon;
              const isCurrentHub =
                activePage === hub.id || hub.pages.some((p) => p.id === activePage);

              return (
                <motion.div
                  key={hub.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className={`marvel-card rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                    isCurrentHub
                      ? "border-arc-cyan bg-gradient-to-b from-arc-cyan/15 via-[#0A0D1A] to-black shadow-[0_0_30px_rgba(0,212,255,0.25)]"
                      : "border-white/10 bg-black/70 hover:border-marvel-red/50 hover:bg-black/90"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                        isCurrentHub ? "bg-arc-cyan text-black border-arc-cyan shadow-[0_0_15px_#00D4FF]" : "bg-white/5 text-arc-cyan border-white/10"
                      }`}>
                        <Icon />
                      </div>

                      <button
                        type="button"
                        suppressHydrationWarning={true}
                        onClick={() => {
                          onSelectPage(hub.pages.length > 0 ? hub.pages[0].id : hub.id);
                          onClose();
                        }}
                        className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 hover:bg-marvel-red hover:text-white text-arc-cyan border border-white/10 transition-colors flex items-center gap-1"
                      >
                        <span>Open</span>
                        <RiArrowRightLine />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white uppercase group-hover:text-metallic-gold transition-colors tracking-wide" style={{ fontFamily: "var(--font-heading)" }}>
                        {hub.label}
                      </h3>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">
                        {hub.desc}
                      </p>
                    </div>

                    {/* Subpages Links */}
                    {hub.pages.length > 0 && (
                      <div className="pt-3 border-t border-white/10 space-y-1.5">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
                          <RiFlashlightLine className="text-metallic-gold" /> Sub-Modules ({hub.pages.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {hub.pages.map((page) => {
                            const isSubActive = activePage === page.id;
                            return (
                              <button
                                key={page.id}
                                type="button"
                                suppressHydrationWarning={true}
                                onClick={() => {
                                  onSelectPage(page.id);
                                  onClose();
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                                  isSubActive
                                    ? "bg-arc-cyan text-black border-arc-cyan shadow-[0_0_10px_#00D4FF]"
                                    : "bg-white/5 text-white/70 hover:text-white hover:bg-white/15 border-white/10"
                                }`}
                              >
                                {page.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
