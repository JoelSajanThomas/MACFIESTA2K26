"use client";

import { useState } from "react";
import {
  RiBarChartGroupedLine,
  RiMoneyDollarCircleLine,
  RiFileList3Line,
  RiFileTextLine,
  RiFileExcelLine,
  RiFilePdfLine,
  RiDownloadLine,
  RiPieChartLine,
  RiShieldCheckLine,
  RiUserHeartLine,
  RiScales3Line,
  RiBuilding2Line,
  RiCheckDoubleLine,
  RiSearchLine,
  RiFilterLine,
} from "react-icons/ri";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/exportUtils";
import { getVolunteersList, getAttendanceLogs } from "@/lib/volunteerStore";
import { getJudgesList, getJudgeScores } from "@/lib/judgeStore";
import { useAuditLogs } from "@/lib/auditLogStore";

interface ReportsModuleProps {
  registrations?: any[];
  payments?: any[];
  events?: any[];
}

export function ReportsModule({ registrations = [], payments = [], events = [] }: ReportsModuleProps) {
  const [selectedReportType, setSelectedReportType] = useState<"registrations" | "revenue" | "volunteers" | "judges" | "audit">("registrations");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const { logs: auditLogs } = useAuditLogs();
  const volunteers = getVolunteersList();
  const attendanceLogs = getAttendanceLogs();
  const judges = getJudgesList();
  const judgeScores = getJudgeScores();

  const triggerToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3500);
  };

  // Sample data datasets for export
  const masterRegistrationData = registrations.length > 0 ? registrations : [
    { regId: "REG-901", name: "Rahul K.", email: "rahul@cet.ac.in", college: "CET Trivandrum", event: "Byte & Code Hackathon", fee: "₹300", status: "VERIFIED", date: "2026-08-07" },
    { regId: "REG-902", name: "Ananya Nair", email: "ananya@stjoseph.ac.in", college: "St. Joseph's Pala", event: "Byte & Code Hackathon", fee: "₹300", status: "VERIFIED", date: "2026-08-07" },
    { regId: "REG-903", name: "Siddharth Menon", email: "sid@gecbh.ac.in", college: "GEC Barton Hill", event: "Thor Gaming Arena (Valorant)", fee: "₹500", status: "VERIFIED", date: "2026-08-07" },
    { regId: "REG-904", name: "Devika S.", email: "devika@macfast.org", college: "MACFAST Tiruvalla", event: "Choreo Dance & Pro Show", fee: "₹400", status: "VERIFIED", date: "2026-08-07" },
  ];

  const financialRevenueData = [
    { category: "Byte & Code Hackathon Passes", registrations: 180, price: "₹300", gross: "₹54,000", status: "CLEARED" },
    { category: "Thor Gaming Arena Passes", registrations: 120, price: "₹500", gross: "₹60,000", status: "CLEARED" },
    { category: "Choreo Dance & Cultural Passes", registrations: 220, price: "₹400", gross: "₹88,000", status: "CLEARED" },
    { category: "General Fest All-Access Passes", registrations: 630, price: "₹150", gross: "₹94,500", status: "CLEARED" },
  ];

  const volunteerReportData = volunteers.map((v) => ({
    code: v.volunteerCode,
    name: v.name,
    email: v.email,
    phone: v.phone,
    department: v.department,
    venue: v.assignedVenue,
    shiftHours: v.shiftHours,
    dutyStatus: v.status,
  }));

  const juryReportData = judges.map((j) => ({
    code: j.judgeCode,
    name: j.name,
    email: j.email,
    organization: j.organization,
    assignedEvent: j.assignedEventName,
    category: j.category,
  }));

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    let dataToExport: any[] = masterRegistrationData;
    let fileName = "MacFiesta_Pro_Report";

    if (selectedReportType === "registrations") {
      dataToExport = masterRegistrationData;
      fileName = "MacFiesta_Master_Registrations";
    } else if (selectedReportType === "revenue") {
      dataToExport = financialRevenueData;
      fileName = "MacFiesta_Financial_Revenue_Summary";
    } else if (selectedReportType === "volunteers") {
      dataToExport = volunteerReportData;
      fileName = "MacFiesta_Volunteer_Roster_Audit";
    } else if (selectedReportType === "judges") {
      dataToExport = juryReportData;
      fileName = "MacFiesta_Jury_Directory_Audit";
    } else if (selectedReportType === "audit") {
      dataToExport = auditLogs;
      fileName = "MacFiesta_System_Audit_Logs";
    }

    if (format === "csv") exportToCSV(fileName, dataToExport);
    else if (format === "excel") exportToExcel(fileName, dataToExport);
    else if (format === "pdf") exportToPDF("MACFIESTA EXECUTIVE REPORT", fileName, dataToExport);

    triggerToast(`✓ Exported ${fileName} as ${format.toUpperCase()}!`);
  };

  return (
    <div className="space-y-6 select-none font-mono">
      {/* Header Toast */}
      {statusMsg && (
        <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold rounded-xl animate-pulse flex items-center gap-2">
          <RiCheckDoubleLine className="text-base" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A0D1A]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-marvel-red/10 border border-marvel-red/30 text-marvel-red text-[10px] font-bold uppercase tracking-widest mb-1">
            <RiBarChartGroupedLine className="animate-pulse" />
            <span>ENTERPRISE REPORTING & ANALYTICS CENTER</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Executive Reports <span className="marvel-bang-comic-gradient font-black">& Data Exporter Studio</span>
          </h2>
          <p className="text-xs text-white/50">
            Generate and download high-precision reports for Registrations, Financial Revenue, Volunteers, Jury Scorecards & Audit Logs.
          </p>
        </div>

        {/* Global Export Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport("excel")}
            className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs hover:bg-emerald-500 hover:text-black transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RiFileExcelLine className="text-base" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => handleExport("pdf")}
            className="px-4 py-2.5 rounded-xl bg-marvel-red/20 border border-marvel-red/40 text-marvel-red font-bold text-xs hover:bg-marvel-red hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RiFilePdfLine className="text-base" />
            <span>Export PDF Document</span>
          </button>

          <button
            onClick={() => handleExport("csv")}
            className="px-4 py-2.5 rounded-xl bg-arc-cyan/20 border border-arc-cyan/40 text-arc-cyan font-bold text-xs hover:bg-arc-cyan hover:text-black transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RiDownloadLine className="text-base" />
            <span>CSV Raw Data</span>
          </button>
        </div>
      </div>

      {/* Analytics Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-black/40 border border-arc-cyan/30 space-y-1">
          <span className="text-white/50 text-[10px] uppercase font-bold">Total Gross Revenue</span>
          <div className="text-3xl font-black text-arc-cyan">₹2,96,500</div>
          <span className="text-emerald-400 text-[10px]">100% Cleared Transactions</span>
        </div>

        <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1">
          <span className="text-white/50 text-[10px] uppercase font-bold">Verified Registrations</span>
          <div className="text-3xl font-black text-emerald-400">1,150</div>
          <span className="text-emerald-400 text-[10px]">Active Delegates</span>
        </div>

        <div className="p-5 rounded-2xl bg-black/40 border border-metallic-gold/30 space-y-1">
          <span className="text-white/50 text-[10px] uppercase font-bold">Volunteers Enrolled</span>
          <div className="text-3xl font-black text-metallic-gold">{volunteers.length}</div>
          <span className="text-metallic-gold text-[10px]">Duty Shift Staff</span>
        </div>

        <div className="p-5 rounded-2xl bg-black/40 border border-marvel-red/30 space-y-1">
          <span className="text-white/50 text-[10px] uppercase font-bold">Jury Members & Scorecards</span>
          <div className="text-3xl font-black text-marvel-red">{judges.length} / {judgeScores.length}</div>
          <span className="text-marvel-red text-[10px]">Scorecards Verified</span>
        </div>
      </div>

      {/* REPORT TYPE SELECTOR RAIL */}
      <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10 overflow-x-auto scrollbar-none gap-1">
        {[
          { id: "registrations" as const, label: `Master Registrations (${masterRegistrationData.length})`, icon: RiFileList3Line },
          { id: "revenue" as const, label: "Financial Revenue Breakdown", icon: RiMoneyDollarCircleLine },
          { id: "volunteers" as const, label: `Volunteer Roster Logs (${volunteers.length})`, icon: RiUserHeartLine },
          { id: "judges" as const, label: `Jury Directory & Scorecards (${judges.length})`, icon: RiScales3Line },
          { id: "audit" as const, label: `Security & Auth Audit Logs (${auditLogs.length})`, icon: RiShieldCheckLine },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedReportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedReportType(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-marvel-red text-white shadow-[0_0_15px_#ED1D24]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* LIVE REPORT PREVIEW TABLE */}
      <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <RiFileTextLine className="text-arc-cyan" />
              <span>Live Report Data Preview & Filter</span>
            </h3>
            <p className="text-xs text-white/50">Preview exact dataset rows before triggering document export.</p>
          </div>

          <div className="relative w-full sm:w-64 text-xs">
            <input
              type="text"
              placeholder="Filter preview data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
            />
            <RiSearchLine className="absolute right-3 top-2.5 text-white/40" />
          </div>
        </div>

        {/* 1. Master Registrations Report */}
        {selectedReportType === "registrations" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest font-black text-[10px]">
                  <th className="py-3 px-3">Reg ID</th>
                  <th className="py-3 px-3">Participant Name</th>
                  <th className="py-3 px-3">Registered Email</th>
                  <th className="py-3 px-3">College / Institution</th>
                  <th className="py-3 px-3">Event Registered</th>
                  <th className="py-3 px-3">Fee Paid</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {masterRegistrationData.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-arc-cyan font-mono">{row.regId}</td>
                    <td className="py-3 px-3 font-bold text-white">{row.name}</td>
                    <td className="py-3 px-3 text-white/70 font-mono text-[11px]">✉️ {row.email}</td>
                    <td className="py-3 px-3 text-white/60">{row.college}</td>
                    <td className="py-3 px-3 text-metallic-gold font-bold">{row.event}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold font-mono">{row.fee}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/40">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Financial Revenue Breakdown Report */}
        {selectedReportType === "revenue" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest font-black text-[10px]">
                  <th className="py-3 px-3">Pass Category</th>
                  <th className="py-3 px-3">Total Sold</th>
                  <th className="py-3 px-3">Unit Ticket Price</th>
                  <th className="py-3 px-3">Gross Collections</th>
                  <th className="py-3 px-3 text-right">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {financialRevenueData.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{row.category}</td>
                    <td className="py-3 px-3 font-bold text-arc-cyan font-mono">{row.registrations} passes</td>
                    <td className="py-3 px-3 text-white/60 font-mono">{row.price}</td>
                    <td className="py-3 px-3 text-emerald-400 font-mono font-bold text-sm">{row.gross}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/40">
                        ● {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Volunteer Roster Report */}
        {selectedReportType === "volunteers" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest font-black text-[10px]">
                  <th className="py-3 px-3">Code & Name</th>
                  <th className="py-3 px-3">Registered Email</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Assigned Venue</th>
                  <th className="py-3 px-3">Shift Hours</th>
                  <th className="py-3 px-3 text-right">Live Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {volunteerReportData.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-arc-cyan/20 text-arc-cyan font-bold text-[9px]">{row.code}</span>
                        <span>{row.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-arc-cyan font-mono text-[11px]">✉️ {row.email}</td>
                    <td className="py-3 px-3 text-white/70">{row.department}</td>
                    <td className="py-3 px-3 text-metallic-gold font-bold">{row.venue}</td>
                    <td className="py-3 px-3 text-white/50 font-mono">{row.shiftHours}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/40">
                        ● {row.dutyStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Jury Directory & Scorecards Report */}
        {selectedReportType === "judges" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest font-black text-[10px]">
                  <th className="py-3 px-3">Judge Code & Name</th>
                  <th className="py-3 px-3">Registered Email</th>
                  <th className="py-3 px-3">Organization</th>
                  <th className="py-3 px-3">Assigned Event</th>
                  <th className="py-3 px-3 text-right">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {juryReportData.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-metallic-gold/20 text-metallic-gold font-bold text-[9px]">{row.code}</span>
                        <span>{row.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-metallic-gold font-mono text-[11px]">✉️ {row.email}</td>
                    <td className="py-3 px-3 text-white/70">{row.organization}</td>
                    <td className="py-3 px-3 text-arc-cyan font-bold">{row.assignedEvent}</td>
                    <td className="py-3 px-3 text-right text-white/50">{row.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Security & Auth Audit Logs */}
        {selectedReportType === "audit" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest font-black text-[10px]">
                  <th className="py-3 px-3">Date & Exact Time</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">User Identity</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {auditLogs.map((log: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 text-metallic-gold font-mono font-bold whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-3 font-bold text-arc-cyan">{log.role}</td>
                    <td className="py-3 px-3 font-bold text-white">{log.userName} ({log.userCode})</td>
                    <td className="py-3 px-3 text-white/60 font-mono text-[11px]">✉️ {log.email}</td>
                    <td className="py-3 px-3 text-white/80">{log.action}</td>
                    <td className="py-3 px-3 text-right font-mono text-white/40">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
