"use client";

import { useState, useMemo } from "react";
import { DataTable, Column } from "../shared/DataTable";
import {
  RiQrCodeLine,
  RiCheckDoubleLine,
  RiCloseCircleLine,
  RiFileList3Line,
  RiMoneyDollarCircleLine,
  RiEditLine,
  RiForbidLine,
  RiDeleteBinLine,
  RiCloseLine,
  RiSaveLine,
  RiAddLine,
  RiUserAddLine,
  RiPrinterLine,
  RiShieldCheckLine,
  RiShieldFlashLine,
  RiCompass3Line,
  RiBuilding4Line,
  RiPhoneLine,
  RiMailLine,
  RiTicketLine,
  RiSparklingLine,
  RiRefreshLine,
} from "react-icons/ri";

import { exportToCSV } from "@/lib/exportUtils";
import { api } from "@/lib/api";

export interface RegistrationRecord {
  _id: string;
  passCode?: string;
  entryPass?: string;
  userId?: any;
  eventId?: any;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  college?: string;
  department?: string;
  year?: string;
  eventTitle?: string;
  eventCategory?: string;
  eventVenue?: string;
  eventDate?: string;
  status: "ACTIVE" | "CANCELLED" | "CHECKED_IN" | "BANNED" | string;
  paymentStatus?: string;
  paymentId?: string;
  amountPaid?: number;
  qrCheckedIn?: boolean;
  qrCode?: string;
  createdAt?: string;
}

interface RegistrationsManagementProps {
  registrations: RegistrationRecord[];
  onRefresh?: () => void;
  onCheckIn?: (passCode: string) => void;
  onCancelReg?: (id: string) => void;
}

export function RegistrationsManagement({
  registrations = [],
  onRefresh,
  onCheckIn,
  onCancelReg,
}: RegistrationsManagementProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [selectedPass, setSelectedPass] = useState<RegistrationRecord | null>(null);
  const [editingReg, setEditingReg] = useState<RegistrationRecord | null>(null);
  const [showSpotModal, setShowSpotModal] = useState(false);
  const [spotSubmitting, setSpotSubmitting] = useState(false);
  const [spotMsg, setSpotMsg] = useState("");

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editEvent, setEditEvent] = useState("");
  const [editAmount, setEditAmount] = useState(150);
  const [editStatus, setEditStatus] = useState("ACTIVE");

  // Spot registration fields
  const [spotName, setSpotName] = useState("");
  const [spotEmail, setSpotEmail] = useState("");
  const [spotPhone, setSpotPhone] = useState("");
  const [spotCollege, setSpotCollege] = useState("");
  const [spotDept, setSpotDept] = useState("");
  const [spotYear, setSpotYear] = useState("1");
  const [spotEvent, setSpotEvent] = useState("General Festival Pass");
  const [spotAmount, setSpotAmount] = useState(150);

  // Normalize registrations data
  const normalizedData: RegistrationRecord[] = useMemo(() => {
    return (registrations || []).map((r: any) => {
      const user = typeof r.userId === "object" ? r.userId : {};
      const event = typeof r.eventId === "object" ? r.eventId : {};
      const pass = r.entryPass || r.passCode || (r._id ? `MF-${String(r._id).slice(-6).toUpperCase()}` : "MF-2K26-PASS");

      return {
        _id: String(r._id || Math.random()),
        passCode: pass,
        entryPass: pass,
        userId: r.userId,
        eventId: r.eventId,
        userName: r.userName || user?.name || "Delegate User",
        userEmail: r.userEmail || user?.email || "N/A",
        userPhone: r.userPhone || user?.phone || "N/A",
        college: r.college || user?.college || "MACFAST Tiruvalla",
        department: r.department || user?.department || "General",
        year: r.year || user?.year || "1st Year",
        eventTitle: r.eventTitle || event?.title || "General Festival Pass",
        eventCategory: (r.eventCategory || event?.category || "general").toUpperCase(),
        eventVenue: r.eventVenue || event?.venue || "Main Campus Arena",
        eventDate: r.eventDate || event?.date || "24-25 Sep 2026",
        status: (r.status ? String(r.status).toUpperCase() : "ACTIVE"),
        paymentStatus: r.paymentStatus || "completed",
        paymentId: r.paymentId || (r._id ? `TXN_${String(r._id).slice(-8)}` : "TXN_PAID"),
        amountPaid: Number(r.amountPaid ?? 150),
        qrCheckedIn: r.status === "CHECKED_IN" || !!r.qrCheckedIn,
        qrCode: r.qrCode || "",
        createdAt: r.createdAt || new Date().toISOString(),
      };
    });
  }, [registrations]);

  // Telemetry KPIs
  const stats = useMemo(() => {
    const total = normalizedData.length;
    const checkedIn = normalizedData.filter((r) => r.status === "CHECKED_IN" || r.qrCheckedIn).length;
    const active = normalizedData.filter((r) => r.status === "ACTIVE").length;
    const revoked = normalizedData.filter((r) => r.status === "BANNED" || r.status === "CANCELLED").length;
    const revenue = normalizedData.reduce((acc, r) => acc + (r.amountPaid || 150), 0);

    return { total, checkedIn, active, revoked, revenue };
  }, [normalizedData]);

  // Filtering
  const filtered = useMemo(() => {
    return normalizedData.filter((reg) => {
      // Status filter
      if (statusFilter === "active" && reg.status !== "ACTIVE") return false;
      if (statusFilter === "checked_in" && reg.status !== "CHECKED_IN" && !reg.qrCheckedIn) return false;
      if (statusFilter === "banned" && reg.status !== "BANNED") return false;
      if (statusFilter === "cancelled" && reg.status !== "CANCELLED") return false;

      // Category filter
      if (categoryFilter !== "all" && reg.eventCategory?.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesPass = reg.passCode?.toLowerCase().includes(term);
        const matchesName = reg.userName?.toLowerCase().includes(term);
        const matchesEmail = reg.userEmail?.toLowerCase().includes(term);
        const matchesPhone = reg.userPhone?.toLowerCase().includes(term);
        const matchesCollege = reg.college?.toLowerCase().includes(term);
        const matchesEvent = reg.eventTitle?.toLowerCase().includes(term);
        const matchesTx = reg.paymentId?.toLowerCase().includes(term);
        if (!matchesPass && !matchesName && !matchesEmail && !matchesPhone && !matchesCollege && !matchesEvent && !matchesTx) {
          return false;
        }
      }

      return true;
    });
  }, [normalizedData, statusFilter, categoryFilter, searchTerm]);

  // Export CSV
  const handleExportCSV = () => {
    const dataToExport = filtered.map((r) => ({
      "Registration ID": r._id,
      "Pass Code": r.passCode,
      "Delegate Name": r.userName,
      "Email Address": r.userEmail,
      "Phone Number": r.userPhone,
      "College / Institution": r.college,
      Department: r.department,
      Year: r.year,
      "Registered Event": r.eventTitle,
      Category: r.eventCategory,
      "Pass Status": r.status,
      "Gate Checked-In": r.qrCheckedIn ? "YES" : "NO",
      "Amount Paid (INR)": r.amountPaid || 150,
      "Transaction ID": r.paymentId,
      "Registration Timestamp": r.createdAt ? new Date(r.createdAt).toLocaleString() : new Date().toLocaleString(),
    }));
    exportToCSV("MacFiesta_Registrations_Roster", dataToExport);
  };

  // Check-In Action
  const handleCheckInAction = async (passCode: string, id: string) => {
    try {
      await api.post("/admin/qr-checkin", { passCode });
      onRefresh?.();
    } catch {
      onCheckIn?.(passCode);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (reg: RegistrationRecord) => {
    setEditingReg(reg);
    setEditName(reg.userName || "Delegate User");
    setEditEvent(reg.eventTitle || "General Festival Pass");
    setEditAmount(reg.amountPaid ?? 150);
    setEditStatus(reg.status || "ACTIVE");
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg) return;

    try {
      await api.put(`/admin/registrations/${editingReg._id}`, {
        userName: editName,
        eventTitle: editEvent,
        amountPaid: editAmount,
        status: editStatus,
      });
      setEditingReg(null);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to update registration", err);
      setEditingReg(null);
      onRefresh?.();
    }
  };

  // Ban / Revoke Pass
  const handleBanPass = async (id: string, currentStatus?: string) => {
    const newStatus = currentStatus === "BANNED" ? "ACTIVE" : "BANNED";
    try {
      await api.put(`/admin/registrations/${id}`, { status: newStatus });
      onRefresh?.();
    } catch (err) {
      console.error("Failed to toggle ban status", err);
      onRefresh?.();
    }
  };

  // Delete Pass
  const handleDeletePass = async (id: string) => {
    if (confirm("Are you sure you want to permanently revoke & remove this registration pass from database?")) {
      try {
        await api.delete(`/admin/registrations/${id}`);
        onRefresh?.();
      } catch {
        onCancelReg?.(id);
      }
    }
  };

  // Submit Spot Registration
  const handleSpotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSpotSubmitting(true);
    setSpotMsg("");

    try {
      const res = await api.post("/admin/registrations", {
        name: spotName,
        email: spotEmail,
        phone: spotPhone,
        college: spotCollege || "MACFAST Tiruvalla",
        department: spotDept || "General",
        year: spotYear || "1",
        eventTitle: spotEvent,
        amount: spotAmount,
      });

      if (res.data?.success) {
        setSpotMsg("✓ Spot pass generated successfully!");
        setTimeout(() => {
          setShowSpotModal(false);
          setSpotName("");
          setSpotEmail("");
          setSpotPhone("");
          setSpotCollege("");
          setSpotDept("");
          setSpotMsg("");
          onRefresh?.();
        }, 1200);
      } else {
        setSpotMsg("Error: " + (res.data?.message || "Failed to create pass"));
      }
    } catch (err: any) {
      setSpotMsg("Error: " + (err?.response?.data?.message || "Failed to submit spot registration"));
    } finally {
      setSpotSubmitting(false);
    }
  };

  // Print Pass
  const handlePrintPass = () => {
    window.print();
  };

  // Columns definition
  const columns: Column<RegistrationRecord>[] = [
    {
      key: "passCode",
      header: "Pass Code & Delegate Details",
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black text-metallic-gold uppercase bg-metallic-gold/15 px-2.5 py-0.5 rounded border border-metallic-gold/40 shadow-[0_0_8px_rgba(212,175,55,0.2)]">
              {row.passCode}
            </span>
            {row.qrCheckedIn && (
              <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-0.5">
                <RiCheckDoubleLine size={10} /> Gate IN
              </span>
            )}
          </div>
          <p className="font-bold text-white text-xs tracking-wide">{row.userName}</p>
          <div className="text-[10px] text-white/60 font-mono space-y-0.5">
            <p className="flex items-center gap-1">
              <RiMailLine className="text-arc-cyan" /> {row.userEmail}
            </p>
            {row.userPhone && row.userPhone !== "N/A" && (
              <p className="flex items-center gap-1">
                <RiPhoneLine className="text-emerald-400" /> {row.userPhone}
              </p>
            )}
            <p className="flex items-center gap-1 text-white/40">
              <RiBuilding4Line /> {row.college} • {row.department}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "eventTitle",
      header: "Registered Event & Mission",
      render: (row) => (
        <div className="space-y-1">
          <span className="text-xs font-black text-white block">
            {row.eventTitle || "General Festival Pass"}
          </span>
          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-arc-cyan/15 text-arc-cyan border border-arc-cyan/30 inline-block font-mono">
            {row.eventCategory || "GENERAL"}
          </span>
          <p className="text-[10px] text-white/40 font-mono flex items-center gap-1">
            <RiCompass3Line /> {row.eventVenue || "Campus Main Arena"}
          </p>
        </div>
      ),
    },
    {
      key: "amountPaid",
      header: "Payment & Fee",
      render: (row) => (
        <div className="space-y-0.5 font-mono">
          <span className="text-xs font-black text-emerald-400 block">
            ₹{(row.amountPaid ?? 150).toLocaleString()}
          </span>
          <span className="text-[9px] text-white/50 block truncate max-w-[120px]">
            {row.paymentId}
          </span>
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded inline-block">
            VERIFIED
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Security Status",
      render: (row) => {
        const isCheckedIn = row.status === "CHECKED_IN" || row.qrCheckedIn;
        const isBanned = row.status === "BANNED";
        const isCancelled = row.status === "CANCELLED";

        return (
          <div className="space-y-1">
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border inline-flex items-center gap-1 shadow-sm ${
                isCheckedIn
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  : isBanned || isCancelled
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                  : "bg-metallic-gold/20 text-metallic-gold border-metallic-gold/40 shadow-[0_0_10px_rgba(212,175,55,0.3)]"
              }`}
            >
              {isCheckedIn ? (
                <>
                  <RiCheckDoubleLine /> Checked-In
                </>
              ) : isBanned ? (
                <>
                  <RiForbidLine /> Revoked / Banned
                </>
              ) : isCancelled ? (
                <>
                  <RiCloseCircleLine /> Cancelled
                </>
              ) : (
                <>
                  <RiShieldCheckLine /> Active Pass
                </>
              )}
            </span>
            <p className="text-[9px] text-white/40 font-mono">
              {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "24 Sep 2026"}
            </p>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* ─── Top Telemetry Summary Metrics ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            label: "Total Delegates",
            value: stats.total.toLocaleString(),
            icon: RiTicketLine,
            color: "text-metallic-gold",
            bg: "bg-metallic-gold/10",
            border: "border-metallic-gold/30",
          },
          {
            label: "Gate Checked-In",
            value: stats.checkedIn.toLocaleString(),
            icon: RiCheckDoubleLine,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/30",
          },
          {
            label: "Active Valid Passes",
            value: stats.active.toLocaleString(),
            icon: RiShieldCheckLine,
            color: "text-arc-cyan",
            bg: "bg-arc-cyan/10",
            border: "border-arc-cyan/30",
          },
          {
            label: "Revoked / Banned",
            value: stats.revoked.toLocaleString(),
            icon: RiForbidLine,
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/30",
          },
          {
            label: "Revenue Collected",
            value: `₹${stats.revenue.toLocaleString()}`,
            icon: RiMoneyDollarCircleLine,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/30",
          },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className={`p-4 rounded-2xl border ${m.border} ${m.bg} backdrop-blur-xl shadow-lg flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-white/60 uppercase">{m.label}</span>
                <Icon className={m.color} size={16} />
              </div>
              <div className={`text-xl font-black ${m.color} tracking-wider uppercase`}>{m.value}</div>
            </div>
          );
        })}
      </div>

      {/* ─── Filter & Action Controls ─── */}
      <div className="p-4 rounded-3xl bg-black/80 border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl backdrop-blur-xl">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Passes" },
            { id: "active", label: "Active Passes" },
            { id: "checked_in", label: "Checked-In (QR Gate)" },
            { id: "banned", label: "Revoked / Banned" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-metallic-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Spot Registration Button */}
          <button
            onClick={() => setShowSpotModal(true)}
            className="px-4 py-2 rounded-xl bg-marvel-red hover:bg-white hover:text-black text-white font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_#ED1D24] transition-all cursor-pointer"
          >
            <RiUserAddLine size={14} />
            <span>New Spot Registration</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-arc-cyan hover:text-black text-white font-bold text-xs flex items-center gap-1.5 border border-white/15 transition-all cursor-pointer"
            title="Export Roster to CSV"
          >
            <RiFileList3Line size={14} />
            <span>Export CSV</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Refresh from MongoDB Atlas"
          >
            <RiRefreshLine size={16} />
          </button>
        </div>
      </div>

      {/* ─── Main Registrations Table ─── */}
      <DataTable
        title="S.H.I.E.L.D. Delegate Registrations Command Directory"
        columns={columns}
        data={filtered}
        searchKey="passCode"
        searchPlaceholder="Search pass code, delegate name, email, phone, college, event, transaction ID..."
        onRefresh={onRefresh}
        exportFileName="macfiesta_registrations"
        actions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            {/* View Official Ticket Pass Modal */}
            <button
              onClick={() => setSelectedPass(row)}
              className="px-2.5 py-1.5 rounded-lg bg-metallic-gold/15 border border-metallic-gold/40 text-metallic-gold hover:bg-metallic-gold hover:text-black text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              title="View & Print Official Entry Pass"
            >
              <RiTicketLine size={13} />
              <span>Pass</span>
            </button>

            {/* QR Gate Check-In Action */}
            {row.status !== "CHECKED_IN" && !row.qrCheckedIn && (
              <button
                onClick={() => handleCheckInAction(row.passCode || row.entryPass || row._id, row._id)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-black text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                title="Force Gate QR Check-In"
              >
                <RiQrCodeLine size={13} />
                <span>Check-In</span>
              </button>
            )}

            {/* Edit Registration */}
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs cursor-pointer"
              title="Edit Registration Pass"
            >
              <RiEditLine size={14} />
            </button>

            {/* Ban / Restore Pass */}
            <button
              onClick={() => handleBanPass(row._id, row.status)}
              className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                row.status === "BANNED"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
              }`}
              title={row.status === "BANNED" ? "Restore Pass to Active" : "Revoke & Ban Pass"}
            >
              <RiForbidLine size={14} />
            </button>

            {/* Delete / Revoke Pass */}
            <button
              onClick={() => handleDeletePass(row._id)}
              className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs cursor-pointer"
              title="Permanently Remove Pass"
            >
              <RiDeleteBinLine size={14} />
            </button>
          </div>
        )}
      />

      {/* ─── View Official Pass / Ticket Badge Modal ─── */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0A0D1A] border-2 border-arc-cyan/50 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 shadow-[0_0_60px_rgba(0,212,255,0.3)] relative overflow-hidden text-white">
            {/* Hologram top scanner line */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-arc-cyan to-transparent animate-pulse" />

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-arc-cyan animate-ping" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-orbitron">
                  OFFICIAL DELEGATE ENTRY PASS
                </h3>
              </div>
              <button
                onClick={() => setSelectedPass(null)}
                className="p-1 rounded-lg text-white/50 hover:text-white cursor-pointer"
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            {/* Ticket Card View */}
            <div className="stark-panel p-5 rounded-2xl border border-white/15 bg-black/60 space-y-4 text-center relative">
              <div className="space-y-1">
                <p className="text-[10px] text-metallic-gold uppercase font-bold tracking-widest">
                  MACFIESTA MARVELVERSE 2K26
                </p>
                <h4 className="text-lg font-black text-white tracking-wide" style={{ fontFamily: "var(--font-syne)" }}>
                  {selectedPass.userName}
                </h4>
                <p className="text-xs text-arc-cyan font-mono">{selectedPass.userEmail}</p>
                <p className="text-[11px] text-white/60">{selectedPass.college}</p>
              </div>

              {/* Pass Code Badge */}
              <div className="py-2 px-4 rounded-xl bg-metallic-gold/15 border border-metallic-gold/50 inline-block font-mono text-sm font-black text-metallic-gold">
                PASS CODE: {selectedPass.passCode}
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl w-48 h-48 mx-auto shadow-xl">
                {selectedPass.qrCode ? (
                  <img
                    src={selectedPass.qrCode}
                    alt="Delegate Ticket QR"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-black font-mono text-xs">
                    <RiQrCodeLine size={64} className="text-black" />
                    <span className="text-[9px] font-bold mt-1">{selectedPass.passCode}</span>
                  </div>
                )}
              </div>

              <div className="text-left text-[11px] font-mono space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex justify-between">
                  <span className="text-white/40">Registered Event:</span>
                  <span className="font-bold text-white truncate max-w-[180px]">{selectedPass.eventTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Transaction ID:</span>
                  <span className="font-bold text-emerald-400">{selectedPass.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Gate Status:</span>
                  <span className={`font-bold ${selectedPass.qrCheckedIn ? "text-emerald-400" : "text-amber-400"}`}>
                    {selectedPass.qrCheckedIn ? "CHECKED-IN" : "VALID / NOT CHECKED IN"}
                  </span>
                </div>
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handlePrintPass}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20 cursor-pointer"
              >
                <RiPrinterLine size={16} /> Print Badge
              </button>
              {selectedPass.status !== "CHECKED_IN" && !selectedPass.qrCheckedIn && (
                <button
                  onClick={async () => {
                    await handleCheckInAction(selectedPass.passCode || selectedPass._id, selectedPass._id);
                    setSelectedPass(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <RiCheckDoubleLine size={16} /> Confirm Check-In
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Registration Modal ─── */}
      {editingReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0D1A] border border-white/20 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl text-white font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <RiEditLine className="text-metallic-gold" /> Edit Registration Pass ({editingReg.passCode})
              </h3>
              <button
                onClick={() => setEditingReg(null)}
                className="p-1 rounded-lg text-white/50 hover:text-white cursor-pointer"
              >
                <RiCloseLine size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-white/60 font-bold mb-1">Delegate Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-metallic-gold"
                />
              </div>

              <div>
                <label className="block text-white/60 font-bold mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={editEvent}
                  onChange={(e) => setEditEvent(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-metallic-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 font-bold mb-1">Fee Paid (₹)</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-metallic-gold"
                  />
                </div>
                <div>
                  <label className="block text-white/60 font-bold mb-1">Security Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-metallic-gold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="CHECKED_IN">CHECKED_IN</option>
                    <option value="BANNED">BANNED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingReg(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-metallic-gold hover:bg-amber-300 text-black font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <RiSaveLine size={14} /> Save Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Spot Registration Modal ─── */}
      {showSpotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0A0D1A] border-2 border-marvel-red/50 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5 shadow-[0_0_60px_rgba(237,29,36,0.3)] relative overflow-hidden text-white font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <RiUserAddLine className="text-marvel-red text-lg" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-orbitron">
                  WALK-IN SPOT REGISTRATION
                </h3>
              </div>
              <button
                onClick={() => setShowSpotModal(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white cursor-pointer"
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            {spotMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  spotMsg.startsWith("✓")
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                }`}
              >
                {spotMsg}
              </div>
            )}

            <form onSubmit={handleSpotSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 font-bold mb-1">Participant Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Tony Stark"
                    value={spotName}
                    onChange={(e) => setSpotName(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-marvel-red"
                  />
                </div>
                <div>
                  <label className="block text-white/60 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="tony@stark.com"
                    value={spotEmail}
                    onChange={(e) => setSpotEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-marvel-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={spotPhone}
                    onChange={(e) => setSpotPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-marvel-red"
                  />
                </div>
                <div>
                  <label className="block text-white/60 font-bold mb-1">College / Institution</label>
                  <input
                    type="text"
                    placeholder="MACFAST Tiruvalla"
                    value={spotCollege}
                    onChange={(e) => setSpotCollege(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-marvel-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-white/60 font-bold mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Computer Science"
                    value={spotDept}
                    onChange={(e) => setSpotDept(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-marvel-red"
                  />
                </div>
                <div>
                  <label className="block text-white/60 font-bold mb-1">Year</label>
                  <select
                    value={spotYear}
                    onChange={(e) => setSpotYear(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-marvel-red"
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 font-bold mb-1">Event Pass Type</label>
                  <input
                    type="text"
                    value={spotEvent}
                    onChange={(e) => setSpotEvent(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-marvel-red"
                  />
                </div>
                <div>
                  <label className="block text-white/60 font-bold mb-1">Spot Fee (₹)</label>
                  <input
                    type="number"
                    value={spotAmount}
                    onChange={(e) => setSpotAmount(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-marvel-red"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSpotModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={spotSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-marvel-red hover:bg-white hover:text-black text-white font-black flex items-center gap-2 cursor-pointer shadow-[0_0_20px_#ED1D24] transition-all disabled:opacity-50"
                >
                  <RiCheckDoubleLine size={16} />
                  <span>{spotSubmitting ? "Generating QR Pass..." : "Issue Spot Pass"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
