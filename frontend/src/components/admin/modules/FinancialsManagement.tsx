"use client";

import { MetricCard } from "../shared/MetricCard";
import { DataTable, Column } from "../shared/DataTable";
import {
  RiMoneyDollarCircleLine,
  RiFileList3Line,
  RiCoupon3Line,
  RiDownload2Line,
  RiCheckDoubleLine,
} from "react-icons/ri";

interface PaymentRecord {
  _id: string;
  txId: string;
  payerName: string;
  payerEmail: string;
  amount: number;
  type: string;
  status: string;
  date: string;
}

interface FinancialsManagementProps {
  payments: PaymentRecord[];
  onRefresh?: () => void;
}

export function FinancialsManagement({ payments, onRefresh }: FinancialsManagementProps) {
  const defaultPayments: PaymentRecord[] = payments.length > 0 ? payments : [
    { _id: "p1", txId: "TXN_984124", payerName: "Rahul Varma", payerEmail: "rahul@cet.ac.in", amount: 350, type: "Registration + Accommodation", status: "SUCCESS", date: "Sep 24, 2026" },
    { _id: "p2", txId: "TXN_984125", payerName: "Ananya Sharma", payerEmail: "ananya@tkm.ac.in", amount: 150, type: "Solo Registration", status: "SUCCESS", date: "Sep 24, 2026" },
    { _id: "p3", txId: "TXN_984126", payerName: "Siddharth Nair", payerEmail: "sid@rajagiri.edu", amount: 200, type: "Gaming Squad Pass", status: "SUCCESS", date: "Sep 24, 2026" },
    { _id: "p4", txId: "TXN_984127", payerName: "Meera Pillai", payerEmail: "meera@rit.ac.in", amount: 350, type: "Registration + Accommodation", status: "PENDING", date: "Sep 24, 2026" },
  ];

  const columns: Column<PaymentRecord>[] = [
    {
      key: "txId",
      header: "Transaction ID",
      render: (row) => <span className="font-mono font-bold text-festival-gold">{row.txId}</span>,
    },
    {
      key: "payerName",
      header: "Delegate Payer",
      render: (row) => (
        <div>
          <p className="font-bold text-white text-xs">{row.payerName}</p>
          <p className="text-[10px] text-white/40">{row.payerEmail}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <span className="text-xs font-black text-emerald-400">
          ₹{row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "type",
      header: "Category",
      render: (row) => <span className="text-xs text-white/70">{row.type}</span>,
    },
    {
      key: "status",
      header: "Payment Status",
      render: (row) => (
        <span
          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
            row.status === "SUCCESS"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Gross Revenue"
          value="₹1,72,500"
          subtitle="Ticket Passes & Food Quotas"
          change="+24% YoY"
          isPositive={true}
          icon={RiMoneyDollarCircleLine}
          accentColor="#10B981"
        />
        <MetricCard
          title="Accommodation Fees"
          value="₹45,200"
          subtitle="Hostel Block Assignments"
          change="128 Delegates"
          isPositive={true}
          icon={RiFileList3Line}
          accentColor="#EAB308"
        />
        <MetricCard
          title="Active Discount Coupons"
          value="4 Promo Codes"
          subtitle="Campus Ambassador Discounts"
          change="15% OFF Active"
          isPositive={true}
          icon={RiCoupon3Line}
          accentColor="#EC4899"
        />
      </div>

      {/* Transaction History Table */}
      <DataTable
        title="Festival Payment Transactions Audit"
        columns={columns}
        data={defaultPayments}
        searchKey="txId"
        searchPlaceholder="Search transaction ID, delegate, or amount..."
        onRefresh={onRefresh}
        exportFileName="macfiesta_financials"
      />
    </div>
  );
}
