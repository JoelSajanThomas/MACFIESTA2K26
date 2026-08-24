"use client";

import { useState } from "react";
import {
  RiTerminalBoxLine,
  RiKey2Line,
  RiToggleLine,
  RiShieldFlashLine,
  RiSaveLine,
  RiCheckDoubleLine,
} from "react-icons/ri";

interface DevToolsModuleProps {
  maintenanceMode: boolean;
  setMaintenanceMode: (val: boolean) => void;
  enable2FA: boolean;
  setEnable2FA: (val: boolean) => void;
}

export function DevToolsModule({
  maintenanceMode,
  setMaintenanceMode,
  enable2FA,
  setEnable2FA,
}: DevToolsModuleProps) {
  const [publicRegOpen, setPublicRegOpen] = useState(true);
  const [qrScanningActive, setQrScanningActive] = useState(true);
  const [socketDebug, setSocketDebug] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <RiTerminalBoxLine className="text-festival-gold" />
            <span>Developer Tools & Feature Flags</span>
          </h3>
          <p className="text-xs text-white/40">Toggle system flags, API keys, maintenance mode, and production configurations</p>
        </div>
      </div>

      {/* Feature Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-5">
          <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/10 pb-3" style={{ fontFamily: "var(--font-heading)" }}>
            System Feature Flags
          </h4>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div>
              <p className="text-xs font-bold text-white">Maintenance Mode</p>
              <p className="text-[10px] text-white/40">Block public traffic & display maintenance banner</p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                maintenanceMode ? "bg-amber-500" : "bg-white/10"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  maintenanceMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Enforce 2FA */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div>
              <p className="text-xs font-bold text-white">Enforce 2FA Authentication</p>
              <p className="text-[10px] text-white/40">Require TOTP authentication for all admin roles</p>
            </div>
            <button
              onClick={() => setEnable2FA(!enable2FA)}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                enable2FA ? "bg-festival-gold" : "bg-white/10"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  enable2FA ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Public Registrations */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div>
              <p className="text-xs font-bold text-white">Public Delegate Registration</p>
              <p className="text-[10px] text-white/40">Allow new user signups on public portal</p>
            </div>
            <button
              onClick={() => setPublicRegOpen(!publicRegOpen)}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                publicRegOpen ? "bg-emerald-500" : "bg-white/10"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  publicRegOpen ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* API Credentials */}
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/10 pb-3" style={{ fontFamily: "var(--font-heading)" }}>
            API Credentials & Environment
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">Production API Key</label>
              <input
                type="password"
                readOnly
                value="macfiesta_prod_sec_key_984124981"
                className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl font-mono text-festival-gold text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">Socket Webhook secret</label>
              <input
                type="password"
                readOnly
                value="whsec_0891248102948120"
                className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl font-mono text-festival-pink text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
