"use client";

import { useState } from "react";
import {
  RiSearchLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiDownload2Line,
  RiDeleteBinLine,
  RiFilter3Line,
  RiRefreshLine,
} from "react-icons/ri";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (row: T) => any;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  searchKey?: string;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  onBulkDelete?: (selectedRows: T[]) => void;
  exportFileName?: string;
  loading?: boolean;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends { _id?: string; id?: string }>({
  title,
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search records...",
  onRefresh,
  onBulkDelete,
  exportFileName = "macfiesta_report",
  loading = false,
  actions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtering
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    if (searchKey) {
      const val = (row as any)[searchKey];
      return String(val || "").toLowerCase().includes(searchTerm.toLowerCase());
    }
    return Object.values(row).some((val) =>
      String(val || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const col = columns.find((c) => c.key === sortKey);
    const valA = col?.accessor ? col.accessor(a) : (a as any)[sortKey];
    const valB = col?.accessor ? col.accessor(b) : (b as any)[sortKey];

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getRowId = (row: T) => row._id || row.id || JSON.stringify(row);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedData.map(getRowId));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Export CSV
  const exportCSV = () => {
    const headers = columns.map((c) => c.header).join(",");
    const rows = sortedData.map((row) =>
      columns
        .map((c) => {
          const val = c.accessor ? c.accessor(row) : (row as any)[c.key];
          return `"${String(val || "").replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${exportFileName}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(title || "MacFiesta Report", 14, 15);
    const head = [columns.map((c) => c.header)];
    const body = sortedData.map((row) =>
      columns.map((c) => (c.accessor ? c.accessor(row) : (row as any)[c.key] || ""))
    );
    autoTable(doc, {
      startY: 20,
      head,
      body,
      theme: "striped",
      styles: { fontSize: 8 },
    });
    doc.save(`${exportFileName}_${Date.now()}.pdf`);
  };

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden space-y-4 p-4 md:p-6 shadow-xl">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {title && (
          <h3 className="text-base font-extrabold text-white uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
            {title} ({data.length})
          </h3>
        )}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[180px]">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-festival-gold transition-colors"
            />
          </div>

          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl text-white/70 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              title="Refresh dataset"
            >
              <RiRefreshLine size={16} />
            </button>
          )}

          {/* Bulk Delete */}
          {selectedIds.length > 0 && onBulkDelete && (
            <button
              onClick={() => {
                const selectedRows = data.filter((row) =>
                  selectedIds.includes(getRowId(row))
                );
                onBulkDelete(selectedRows);
                setSelectedIds([]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/30 transition-colors cursor-pointer"
            >
              <RiDeleteBinLine size={14} />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}

          {/* Export & Utility Toolbar */}
          <div className="flex items-center gap-1">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Export CSV File"
            >
              <RiDownload2Line size={14} className="text-festival-gold" />
              <span>CSV</span>
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Export PDF Document"
            >
              <RiDownload2Line size={14} className="text-festival-pink" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => {
                const jsonContent = JSON.stringify(sortedData, null, 2);
                const blob = new Blob([jsonContent], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${exportFileName}_${Date.now()}.json`;
                a.click();
              }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Export JSON Data"
            >
              <RiDownload2Line size={14} className="text-cyan-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => {
                const textData = sortedData.map((row) => JSON.stringify(row)).join("\n");
                navigator.clipboard.writeText(textData);
                alert("✓ Table dataset copied to clipboard!");
              }}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Copy Table Data"
            >
              <span>Copy</span>
            </button>
            <button
              onClick={() => window.print()}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Print Table View"
            >
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Internal Scroll Table Wrapper with Sticky Header */}
      <div className="overflow-x-auto max-h-[580px] overflow-y-auto rounded-xl border border-white/5 bg-zinc-950/50 scrollbar-thin scrollbar-thumb-white/10">
        <table className="w-full text-left text-xs text-white/80 border-collapse">
          <thead className="sticky top-0 z-10 bg-zinc-950 uppercase text-[10px] tracking-wider text-white/60 border-b border-white/10 font-bold shadow-sm" style={{ fontFamily: "var(--font-heading)" }}>
            <tr>
              <th className="p-3.5 w-10 text-center bg-zinc-950">
                <input
                  type="checkbox"
                  checked={
                    paginatedData.length > 0 &&
                    selectedIds.length === paginatedData.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-white/20 bg-white/5 text-festival-gold focus:ring-0 cursor-pointer"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`p-3.5 bg-zinc-950 ${
                    col.sortable !== false
                      ? "cursor-pointer hover:text-white select-none"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable !== false && sortKey === col.key && (
                      sortDirection === "asc" ? <RiArrowUpSLine /> : <RiArrowDownSLine />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="p-3.5 text-right bg-zinc-950">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-3.5 text-center"><div className="h-4 bg-white/10 rounded" /></td>
                  {columns.map((col) => (
                    <td key={col.key} className="p-3.5">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                    </td>
                  ))}
                  {actions && <td className="p-3.5"><div className="h-4 bg-white/10 rounded w-16 ml-auto" /></td>}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 2 : 1)}
                  className="p-8 text-center text-white/40 uppercase tracking-widest text-xs font-semibold"
                >
                  No matching records found
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const id = getRowId(row);
                const isSelected = selectedIds.includes(id);
                return (
                  <tr
                    key={id}
                    className={`hover:bg-white/5 transition-colors ${
                      isSelected ? "bg-festival-gold/5" : ""
                    }`}
                  >
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(id)}
                        className="rounded border-white/20 bg-white/5 text-festival-gold focus:ring-0 cursor-pointer"
                      />
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="p-3.5">
                        {col.render
                          ? col.render(row)
                          : col.accessor
                          ? col.accessor(row)
                          : (row as any)[col.key]}
                      </td>
                    ))}
                    {actions && <td className="p-3.5 text-right">{actions(row)}</td>}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 pt-2">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-zinc-950 border border-white/10 rounded-lg text-white text-xs focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="ml-2">
            Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} -{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            Previous
          </button>
          <span className="px-3 py-1 font-bold text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
