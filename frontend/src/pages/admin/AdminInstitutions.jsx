import { useEffect, useMemo, useState } from "react";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import {
  getAdminInstitutions,
  createAdminInstitution,
  deleteAdminInstitution,
} from "../../services/api";

export default function AdminInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [newInst, setNewInst] = useState({ name: "", institution_type: "college" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminInstitutions();
      setInstitutions(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      setError("Failed to load institutions list.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newInst.name.trim()) return;
    setSubmitting(true);
    try {
      await createAdminInstitution(newInst);
      setNewInst({ name: "", institution_type: "college" });
      setShowAddModal(false);
      await loadData();
    } catch {
      alert("Failed to add institution. Make sure the name is unique.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    setDeletingId(id);
    try {
      await deleteAdminInstitution(id);
      setInstitutions((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert("Failed to delete institution.");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return institutions.filter((inst) => {
      if (typeFilter !== "all" && inst.institution_type !== typeFilter) return false;
      if (q && !inst.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [institutions, search, typeFilter]);

  if (loading) return <LoadingState message="Loading colleges & schools…" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="admin-page admin-institutions-page">
      <header className="admin-page-header flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 className="admin-page-title text-2xl font-bold font-excon text-white">Institutions Directory</h1>
          <p className="admin-page-subtitle text-sm text-white/60">
            Manage colleges, universities, and schools recognized across registration portals.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="admin-btn-primary px-4 py-2 bg-arc-cyan/20 border border-arc-cyan text-arc-cyan hover:bg-arc-cyan hover:text-black font-mono text-xs font-bold uppercase rounded-lg transition-all"
        >
          + Add Institution
        </button>
      </header>

      <AdminTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search colleges or schools…"
        totalCount={institutions.length}
        filteredCount={filtered.length}
      >
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="admin-filter-select bg-black/40 border border-white/20 text-xs text-white rounded px-2.5 py-1.5 font-mono"
        >
          <option value="all">All Institution Types</option>
          <option value="college">Colleges & Universities</option>
          <option value="school">Higher Secondary Schools</option>
        </select>
      </AdminTableToolbar>

      {filtered.length === 0 ? (
        <EmptyState
          title="No institutions match your search"
          message="Adjust your filters or add a new institution."
        />
      ) : (
        <div className="admin-table-wrap overflow-x-auto rounded-xl border border-white/10 bg-[#080B18]">
          <table className="dash-table admin-table w-full text-left text-xs font-mono">
            <thead className="bg-white/5 uppercase text-white/60 text-[10px] tracking-wider">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Institution Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Registered Delegates</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((inst, index) => (
                <tr key={inst.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3 text-white/40">{index + 1}</td>
                  <td className="p-3 font-semibold text-white">{inst.name}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inst.institution_type === "school"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-arc-cyan/20 text-arc-cyan border border-arc-cyan/30"
                      }`}
                    >
                      {inst.institution_type || "college"}
                    </span>
                  </td>
                  <td className="p-3 text-metallic-gold font-bold">
                    {inst.registration_count ?? "—"}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      disabled={deletingId === inst.id}
                      onClick={() => handleDelete(inst.id, inst.name)}
                      className="px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all text-[11px] font-bold cursor-pointer"
                    >
                      {deletingId === inst.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D1126] border border-arc-cyan/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white font-excon">Add Recognized Institution</h2>
            <form onSubmit={handleAdd} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-white/70 mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mar Athanasios College (MACFAST)"
                  value={newInst.name}
                  onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-white focus:border-arc-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">Institution Category *</label>
                <select
                  value={newInst.institution_type}
                  onChange={(e) => setNewInst({ ...newInst, institution_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-white focus:border-arc-cyan focus:outline-none"
                >
                  <option value="college">College / University</option>
                  <option value="school">Higher Secondary School</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-arc-cyan text-black hover:bg-white font-bold transition-colors"
                >
                  {submitting ? "Saving…" : "Save Institution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
