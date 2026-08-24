"use client";

import { useAuditLogs, SystemAuditLog } from "@/lib/auditLogStore";
import {
  RiFileTextLine,
  RiShieldFlashLine,
  RiUserHeartLine,
  RiScales3Line,
  RiUserFollowLine,

  RiShieldUserLine,
  RiTimeLine,
  RiRefreshLine,
} from "react-icons/ri";

interface SystemLogsModuleProps {
  auditLogs?: any[];
  onRefresh?: () => void;
}

export function SystemLogsModule({ auditLogs: externalLogs, onRefresh }: SystemLogsModuleProps) {
  const { logs: storeLogs, refreshAll } = useAuditLogs();

  const handleRefresh = () => {
    refreshAll();
    if (onRefresh) onRefresh();
  };

  const logsToDisplay = storeLogs.length > 0 ? storeLogs : (externalLogs || []);

  return (
    <div className="space-y-6 select-none font-mono">
      {/* Top Banner */}
      <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A0D1A]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-marvel-red/10 border border-marvel-red/30 text-marvel-red text-[10px] font-bold uppercase tracking-widest mb-1">
            <RiShieldFlashLine className="animate-pulse" />
            <span>REAL-TIME AUTHENTICATION & AUDIT TELEMETRY</span>
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            User Login & Security <span className="marvel-bang-comic-gradient font-black">Audit Trail</span>
          </h3>
          <p className="text-xs text-white/50">
            Real-time authentication activity logs for Volunteers, Judges, Participants & Admins with exact date & time.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="btn-primary py-2.5 px-5 text-xs font-bold uppercase flex items-center gap-2 cursor-pointer shadow-[0_0_15px_#ED1D24]"
        >
          <RiRefreshLine className="text-base" />
          <span>Refresh Live Logs</span>
        </button>
      </div>

      {/* Log Statistics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-black/40 border border-arc-cyan/30 space-y-1">
          <span className="text-white/50 text-[10px] uppercase font-bold flex items-center gap-1">
            <RiUserHeartLine className="text-arc-cyan" />
            <span>Volunteer Logins</span>
          </span>
          <div className="text-2xl font-black text-arc-cyan">
            {logsToDisplay.filter((l) => l.role === "VOLUNTEER").length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-metallic-gold/30 space-y-1">
          <span className="text-white/50 text-[10px] uppercase font-bold flex items-center gap-1">
            <RiScales3Line className="text-metallic-gold" />
            <span>Judge Logins</span>
          </span>
          <div className="text-2xl font-black text-metallic-gold">
            {logsToDisplay.filter((l) => l.role === "JUDGE").length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1">
          <span className="text-white/50 text-[10px] uppercase font-bold flex items-center gap-1">
            <RiUserFollowLine className="text-emerald-400" />

            <span>Participant Logins</span>
          </span>
          <div className="text-2xl font-black text-emerald-400">
            {logsToDisplay.filter((l) => l.role === "PARTICIPANT").length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-marvel-red/30 space-y-1">
          <span className="text-white/50 text-[10px] uppercase font-bold flex items-center gap-1">
            <RiShieldUserLine className="text-marvel-red" />
            <span>Admin Logins</span>
          </span>
          <div className="text-2xl font-black text-marvel-red">
            {logsToDisplay.filter((l) => l.role === "ADMIN").length}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass p-6 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <RiTimeLine className="text-arc-cyan" />
            <span>Live Login Audit Entries ({logsToDisplay.length})</span>
          </h4>
          <span className="text-[10px] text-arc-cyan font-bold">Real-Time Sync Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest font-black text-[10px]">
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">User Role</th>
                <th className="py-3 px-3">User Identity & Code</th>
                <th className="py-3 px-3">Registered Email</th>
                <th className="py-3 px-3">Executed Action</th>
                <th className="py-3 px-3 text-right">IP Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {logsToDisplay.map((log: SystemAuditLog, idx: number) => {
                const roleColors: Record<string, string> = {
                  VOLUNTEER: "bg-arc-cyan/20 text-arc-cyan border-arc-cyan/40",
                  JUDGE: "bg-metallic-gold/20 text-metallic-gold border-metallic-gold/40",
                  PARTICIPANT: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
                  ADMIN: "bg-marvel-red/20 text-marvel-red border-marvel-red/40",
                };

                return (
                  <tr key={log.id || idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 text-metallic-gold font-mono font-bold whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border ${roleColors[log.role] || "bg-white/10 text-white"}`}>
                        {log.role}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{log.userName}</span>
                        <span className="text-[10px] text-white/40 font-mono">({log.userCode})</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-arc-cyan font-mono text-[11px]">
                      ✉️ {log.email}
                    </td>

                    <td className="py-3 px-3 text-white/80 font-semibold">
                      {log.action}
                    </td>

                    <td className="py-3 px-3 text-right text-white/40 font-mono text-[11px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
