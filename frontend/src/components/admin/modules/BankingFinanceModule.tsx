"use client";

import { useState } from "react";
import {
  RiBankLine,
  RiMoneyDollarCircleLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiSearchLine,
  RiDownloadCloud2Line,
  RiFileTextLine,
  RiCoupon3Line,
  RiCalendarLine,
  RiAddLine,
} from "react-icons/ri";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/exportUtils";

interface BankTransaction {
  id: string;
  date: string;
  refNo: string;
  payer: string;
  purpose: string;
  credit?: number;
  debit?: number;
  balance: number;
  status: "CONFIRMED" | "PENDING" | "REFUNDED";
}

interface BankingFinanceModuleProps {
  payments: any[];
  onRefresh?: () => void;
}

export function BankingFinanceModule({ payments, onRefresh }: BankingFinanceModuleProps) {
  const [activeTab, setActiveTab] = useState<"statement" | "income" | "expenses" | "sponsorships" | "refunds">("statement");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [transactions, setTransactions] = useState<BankTransaction[]>([
    {
      id: "txn-101",
      date: "2026-09-24 09:15 AM",
      refNo: "PAY-MF-889012",
      payer: "Rahul Varma (CET Trivandrum)",
      purpose: "All-Access Delegate Pass + Males Hostel Block B",
      credit: 1850,
      balance: 172500,
      status: "CONFIRMED",
    },
    {
      id: "txn-102",
      date: "2026-09-24 09:40 AM",
      refNo: "PAY-MF-889013",
      payer: "Ananya Sharma (TKM Kollam)",
      purpose: "ValoFiesta Gaming Team Pass",
      credit: 1500,
      balance: 174000,
      status: "CONFIRMED",
    },
    {
      id: "txn-103",
      date: "2026-09-24 10:10 AM",
      refNo: "PAY-MF-REF-002",
      payer: "Mathew Joseph (SJCET Pala)",
      purpose: "Refund: Duplicate Accommodation Fee",
      debit: 350,
      balance: 173650,
      status: "REFUNDED",
    },
    {
      id: "txn-104",
      date: "2026-09-24 11:30 AM",
      refNo: "PAY-SPON-001",
      payer: "TechCorp Global (Platinum Sponsor)",
      purpose: "Sponsorship Installment 1",
      credit: 75000,
      balance: 248650,
      status: "CONFIRMED",
    },
    {
      id: "txn-105",
      date: "2026-09-24 12:00 PM",
      refNo: "PAY-EXP-001",
      payer: "Sound & Stage Vendor (AV Systems)",
      purpose: "Debit: Main Auditorium AV Equipment Advance",
      debit: 25000,
      balance: 223650,
      status: "CONFIRMED",
    },
  ]);

  const filteredTxns = transactions.filter((t) => {
    const matchesSearch =
      t.payer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const exportStatement = (format: "csv" | "excel" | "pdf") => {
    const exportRows = filteredTxns.map((t) => ({
      Date: t.date,
      "Ref Number": t.refNo,
      "Payer / Payee": t.payer,
      Purpose: t.purpose,
      "Credit (₹)": t.credit ? `+₹${t.credit}` : "-",
      "Debit (₹)": t.debit ? `-₹${t.debit}` : "-",
      "Running Balance (₹)": `₹${t.balance}`,
      Status: t.status,
    }));

    if (format === "csv") exportToCSV("MacFiesta_Bank_Statement", exportRows);
    else if (format === "excel") exportToExcel("MacFiesta_Bank_Statement", exportRows);
    else if (format === "pdf") exportToPDF("BANK ACCOUNT STATEMENT LEDGER", "MacFiesta_Bank_Statement", exportRows);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Banner */}
      <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <RiBankLine className="text-festival-gold text-lg" />
            <span>Online Banking Style Finance Ledger & Statements</span>
          </h2>
          <p className="text-xs text-white/40">Itemized statement view for registration income, sponsorships, vendor debits, and balance</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => exportStatement("excel")}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold cursor-pointer flex items-center gap-1"
          >
            <RiFileTextLine size={14} /> Download Statement (.xls)
          </button>
          <button
            onClick={() => exportStatement("pdf")}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 font-bold cursor-pointer flex items-center gap-1"
          >
            <RiFileTextLine size={14} /> PDF Statement
          </button>
        </div>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 backdrop-blur-xl space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Total Net Balance</span>
          <h3 className="text-2xl font-black text-white">₹2,23,650</h3>
          <p className="text-[10px] text-white/40">MACFAST Festival Treasury Account</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 backdrop-blur-xl space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Total Gross Income</span>
          <h3 className="text-2xl font-black text-white">₹2,49,000</h3>
          <p className="text-[10px] text-white/40">Tickets + Sponsorships</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-500/10 border border-rose-500/30 backdrop-blur-xl space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Total Vendor Debits</span>
          <h3 className="text-2xl font-black text-white">₹25,350</h3>
          <p className="text-[10px] text-white/40">AV Systems + Refunds</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 backdrop-blur-xl space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Today&apos;s Collection</span>
          <h3 className="text-2xl font-black text-white">₹78,350</h3>
          <p className="text-[10px] text-white/40">Live Velocity Stream</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <RiSearchLine className="absolute left-3 top-2.5 text-white/40 text-sm" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference #, participant name, purpose..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-festival-gold"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          {["all", "confirmed", "refunded", "pending"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl uppercase font-bold text-[10px] tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-festival-gold text-festival-dark shadow-[0_0_15px_rgba(234,179,8,0.25)]"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bank Statement Table */}
      <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Passbook Statement Ledger</span>
            <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/60">
              Account #: MF-2026-BANK-0991
            </span>
          </h3>
          <span className="text-[10px] font-bold text-emerald-400">Auto-Reconciled</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest font-black text-[10px]">
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Ref Number</th>
                <th className="py-3 px-3">Participant / Payee</th>
                <th className="py-3 px-3">Purpose & Category</th>
                <th className="py-3 px-3 text-right">Credit (+)</th>
                <th className="py-3 px-3 text-right">Debit (-)</th>
                <th className="py-3 px-3 text-right">Running Balance</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {filteredTxns.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono text-[11px] text-white/50">{row.date}</td>
                  <td className="py-3 px-3 font-mono text-festival-gold font-bold">{row.refNo}</td>
                  <td className="py-3 px-3 font-extrabold">{row.payer}</td>
                  <td className="py-3 px-3 text-white/70">{row.purpose}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    {row.credit ? `+₹${row.credit.toLocaleString()}` : "-"}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                    {row.debit ? `-₹${row.debit.toLocaleString()}` : "-"}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-white">
                    ₹{row.balance.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        row.status === "CONFIRMED"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : row.status === "REFUNDED"
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
