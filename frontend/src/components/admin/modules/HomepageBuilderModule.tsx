"use client";

import { useState } from "react";
import {
  RiLayoutGridLine,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiDeviceLine,
  RiSmartphoneLine,
  RiTabletLine,
  RiMacbookLine,
  RiCheckDoubleLine,
  RiSaveLine,
  RiMagicLine,
  RiEditLine,
  RiCloseLine,
} from "react-icons/ri";
import { useFestivalControl, HomepageSection } from "@/lib/festivalStore";

export function HomepageBuilderModule() {
  const { sections, updateSections } = useFestivalControl();
  const [selectedSectionId, setSelectedSectionId] = useState<string>("hero");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [flashMsg, setFlashMsg] = useState("");

  const triggerFlash = (msg: string) => {
    setFlashMsg(msg);
    setTimeout(() => setFlashMsg(""), 3000);
  };

  const handleToggleVisibility = (id: string) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, visible: !sec.visible } : sec
    );
    updateSections(updated);
    triggerFlash("✓ Section visibility updated live");
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    updated.forEach((s, idx) => (s.order = idx));
    updateSections(updated);
    triggerFlash("✓ Section layout reordered");
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    updated.forEach((s, idx) => (s.order = idx));
    updateSections(updated);
    triggerFlash("✓ Section layout reordered");
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#F5B301] text-zinc-950">
              Visual Page Builder
            </span>
            <span className="text-xs text-zinc-400 font-semibold">WYSIWYG Homepage Layout Editor</span>
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
            Dynamic Public Homepage Layout Builder
          </h2>
          <p className="text-xs text-zinc-400">
            Reorder, toggle, or edit sections of macfiesta.macfast.org live with multi-device previews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {flashMsg && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full flex items-center gap-1">
              <RiCheckDoubleLine size={16} /> {flashMsg}
            </span>
          )}

          <button
            onClick={() => setShowPreviewModal(true)}
            className="btn-primary text-xs flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg cursor-pointer"
          >
            <RiDeviceLine size={16} /> Live Preview
          </button>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Section Order & Toggle Matrix */}
        <div className="lg:col-span-6 glass p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-heading)" }}>
              Homepage Sections Structure & Order
            </h3>
            <span className="text-[10px] text-white/40 font-mono">
              {sections.filter((s) => s.visible).length} / {sections.length} Active
            </span>
          </div>

          <div className="space-y-2">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${selectedSectionId === sec.id
                    ? "bg-[#F5B301]/10 border-[#F5B301]/40 text-white shadow-md"
                    : sec.visible
                      ? "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                      : "bg-zinc-900/40 border-white/5 text-white/30"
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-white/40 w-5">{idx + 1}.</span>
                  <p className="text-xs font-bold truncate">{sec.title}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/70"
                    title="Move Up"
                  >
                    <RiArrowUpLine size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === sections.length - 1}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/70"
                    title="Move Down"
                  >
                    <RiArrowDownLine size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(sec.id)}
                    className={`p-1.5 rounded-lg transition-colors ${sec.visible
                        ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                        : "text-zinc-500 bg-zinc-800"
                      }`}
                    title={sec.visible ? "Hide Section" : "Show Section"}
                  >
                    {sec.visible ? <RiEyeLine size={14} /> : <RiEyeOffLine size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Selected Section Properties Inspector */}
        <div className="lg:col-span-6 glass p-6 rounded-2xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <RiEditLine className="text-[#F5B301]" />
              <span>Section Inspector: {selectedSection?.title}</span>
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <span className="text-[10px] text-[#F5B301] uppercase font-bold tracking-widest block">
                Section Metadata
              </span>
              <p className="text-white/70">
                Identifier: <span className="font-mono text-white font-bold">{selectedSection?.id}</span>
              </p>
              <p className="text-white/70">
                Status:{" "}
                <span className={selectedSection?.visible ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {selectedSection?.visible ? "Visible on Public Website" : "Hidden"}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Section Title Label</label>
              <input
                type="text"
                value={selectedSection?.title || ""}
                onChange={(e) => {
                  if (!selectedSectionId) return;
                  const updated = sections.map((s) =>
                    s.id === selectedSectionId ? { ...s, title: e.target.value } : s
                  );
                  updateSections(updated);
                }}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-[#F5B301] focus:outline-none font-bold"
              />
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => triggerFlash("✓ Published Section Changes Live to Public Website!")}
                className="btn-primary text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <RiSaveLine size={16} /> Publish Section Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Multi-Device Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#09090b] border border-white/10 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header Bar */}
            <div className="h-14 px-6 border-b border-white/10 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2">
                <RiMagicLine className="text-[#F5B301]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Public Website Live Multi-Device Preview
                </h3>
              </div>

              {/* Device Selector */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                {[
                  { id: "desktop", icon: RiMacbookLine, label: "Desktop" },
                  { id: "tablet", icon: RiTabletLine, label: "Tablet" },
                  { id: "mobile", icon: RiSmartphoneLine, label: "Mobile" },
                ].map((d) => {
                  const Icon = d.icon;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setPreviewDevice(d.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${previewDevice === d.id ? "bg-[#F5B301] text-zinc-950" : "text-white/50 hover:text-white"
                        }`}
                    >
                      <Icon size={14} />
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            {/* Device Viewport Wrapper */}
            <div className="flex-1 bg-zinc-950/80 p-6 flex items-center justify-center overflow-auto">
              <div
                className={`bg-[#09090b] border border-white/20 rounded-2xl shadow-2xl overflow-y-auto transition-all duration-300 ${previewDevice === "desktop"
                    ? "w-full h-full"
                    : previewDevice === "tablet"
                      ? "w-[768px] h-[90%]"
                      : "w-[375px] h-[90%]"
                  }`}
              >
                <div className="p-6 space-y-6 text-center">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F5B301] text-xs font-bold">
                    ★ Simulated Preview of macfiesta.macfast.org ({previewDevice.toUpperCase()})
                  </div>

                  {sections
                    .filter((s) => s.visible)
                    .map((sec) => (
                      <div key={sec.id} className="p-8 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">{sec.title}</h4>
                        <p className="text-xs text-white/40 font-mono">[{sec.id} component active]</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
