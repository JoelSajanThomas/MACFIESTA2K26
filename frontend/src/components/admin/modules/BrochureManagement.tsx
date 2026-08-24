"use client";

import { useState } from "react";
import {
  RiFileTextLine,
  RiUploadCloudLine,
  RiDownloadCloud2Line,
  RiEyeLine,
  RiShareLine,
  RiCheckLine,
} from "react-icons/ri";

interface BrochureItem {
  id: string;
  title: string;
  version: string;
  fileSize: string;
  uploadedDate: string;
  downloadsCount: number;
  publicUrl: string;
  isCurrent: boolean;
}

export function BrochureManagement() {
  const [brochures, setBrochures] = useState<BrochureItem[]>([
    {
      id: "br-1",
      title: "MacFiesta 2K26 Official Event Rulebook & Schedule Brochure",
      version: "v2.1 (Final Release)",
      fileSize: "8.4 MB",
      uploadedDate: "Sep 20, 2026",
      downloadsCount: 1420,
      publicUrl: "https://macfiesta.macfast.org/downloads/macfiesta_2k26_brochure_v2.pdf",
      isCurrent: true,
    },
    {
      id: "br-2",
      title: "MacFiesta 2K26 Preliminary Teaser Schedule",
      version: "v1.0 (Draft)",
      fileSize: "4.2 MB",
      uploadedDate: "Aug 15, 2026",
      downloadsCount: 680,
      publicUrl: "https://macfiesta.macfast.org/downloads/macfiesta_2k26_brochure_v1.pdf",
      isCurrent: false,
    },
  ]);

  const copyShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Brochure public link copied to clipboard!");
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <RiFileTextLine className="text-festival-gold text-lg" />
            <span>Brochure Management, Versioning & PDF Hub</span>
          </h2>
          <p className="text-xs text-white/40">Upload official festival rulebook brochures, track public downloads, and manage version history</p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="p-6 rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-center space-y-2 cursor-pointer">
        <RiUploadCloudLine size={32} className="text-festival-gold mx-auto" />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Upload New Version of Official Festival Brochure (PDF)
        </h3>
        <p className="text-[10px] text-white/40">Max file size 25MB • Automatically generates public download link</p>
      </div>

      {/* Brochure Roster */}
      <div className="glass p-6 rounded-2xl border border-white/10 space-y-4 text-xs">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
          Brochure Versions & Download Analytics
        </h3>

        <div className="space-y-3">
          {brochures.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-white text-sm">{b.title}</h4>
                  {b.isCurrent && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active Live
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/50">
                  Version: {b.version} • Size: {b.fileSize} • Uploaded: {b.uploadedDate}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-festival-gold flex items-center gap-1">
                  <RiDownloadCloud2Line size={14} /> {b.downloadsCount} Downloads
                </span>
                <button
                  onClick={() => copyShareLink(b.publicUrl)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold cursor-pointer flex items-center gap-1"
                >
                  <RiShareLine size={14} /> Share Link
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
