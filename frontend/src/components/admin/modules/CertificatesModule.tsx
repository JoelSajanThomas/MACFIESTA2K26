"use client";

import { useState } from "react";
import {
  RiAuctionLine,
  RiMagicLine,
  RiDownloadCloud2Line,
  RiShieldUserLine,
  RiAddLine,
  RiQrCodeLine,
} from "react-icons/ri";

export function CertificatesModule() {
  const [templates, setTemplates] = useState([
    { id: "tpl-1", title: "Official Winner Certificate (1st / 2nd / 3rd)", layout: "Landscape A4", theme: "Gold Border Glass", status: "Active" },
    { id: "tpl-2", title: "Merit & Participation Certificate", layout: "Landscape A4", theme: "Cyan Festival Slate", status: "Active" },
  ]);

  return (
    <div className="space-y-6 select-none">
      <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Certificates Management & Bulk Exporter
          </h2>
          <p className="text-xs text-white/40">Design templates, batch generate PDFs, download ZIP archives, and verify badges</p>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
          Certificate Layout Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {templates.map((tpl) => (
            <div key={tpl.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <h4 className="font-extrabold text-white">{tpl.title}</h4>
              <p className="text-[10px] text-white/40">{tpl.layout} • {tpl.theme}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
