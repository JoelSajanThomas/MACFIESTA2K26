import { useEffect, useState } from "react";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import { getAuditLogs } from "../../services/api";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  const loadLogs = async (overrideSearch) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (moduleFilter !== "all") params.module = moduleFilter;
      const query = overrideSearch !== undefined ? overrideSearch : search;
      if (query && query.trim()) params.search = query.trim();
      const res = await getAuditLogs(params);
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to fetch system audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleFilter]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    loadLogs();
  };

  if (loading && logs.length === 0) return <LoadingState message="Loading system activity logs…" />;
  if (error && logs.length === 0) return <ErrorState message={error} onRetry={loadLogs} />;

  return (
    <div className="admin-page admin-audit-page">
      <header className="admin-page-header flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 className="admin-page-title text-2xl font-bold font-excon text-white">System Audit Trail</h1>
          <p className="admin-page-subtitle text-sm text-white/60">
            Immutable tracking of sensitive operations: approvals, refunds, role changes, and data purges.
          </p>
        </div>
        <button
          type="button"
          onClick={loadLogs}
          className="admin-btn-secondary px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold uppercase rounded-lg transition-all"
        >
          ↻ Refresh Trail
        </button>
      </header>

      <AdminTableToolbar
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        searchPlaceholder="Search action details, username…"
        totalCount={logs.length}
        filteredCount={logs.length}
      >
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="admin-filter-select bg-black/40 border border-white/20 text-xs text-white rounded px-2.5 py-1.5 font-mono"
        >
          <option value="all">All Subsystems</option>
          <option value="finance">Finance & Refunds</option>
          <option value="registrations">Registrations & Gate</option>
          <option value="users">User Access & Roles</option>
          <option value="events">Events & Scoring</option>
          <option value="institutions">Colleges & Schools</option>
          <option value="system">Core System & Purges</option>
        </select>
      </AdminTableToolbar>

      {logs.length === 0 ? (
        <EmptyState
          title="No activity recorded"
          message="System audit logs will appear as administrative actions occur."
        />
      ) : (
        <div className="admin-table-wrap overflow-x-auto rounded-xl border border-white/10 bg-[#080B18]">
          <table className="dash-table admin-table w-full text-left text-xs font-mono">
            <thead className="bg-white/5 uppercase text-white/60 text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Subsystem</th>
                <th className="p-3">Action</th>
                <th className="p-3">Operator</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Operation Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3 text-white/60 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("en-IN", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    })}
                  </td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-white/80 border border-white/20">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-arc-cyan">{log.action}</td>
                  <td className="p-3 text-metallic-gold font-semibold">{log.username}</td>
                  <td className="p-3 text-white/40">{log.ip_address || "—"}</td>
                  <td className="p-3 text-white/90 max-w-md break-words">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
