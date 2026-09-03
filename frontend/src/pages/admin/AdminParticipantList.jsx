import { useCallback, useEffect, useRef, useState } from "react";
import {
  RiSearchLine,
  RiDownloadLine,
  RiUserLine,
  RiMailLine,
  RiRefreshLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiLoginBoxLine,
  RiCloseLine,
  RiUserAddLine,
  RiLockPasswordLine,
  RiToggleLine,
  RiToggleFill,
  RiSaveLine,
  RiEyeLine,
  RiEyeOffLine,
  RiDeleteBin7Line,
} from "react-icons/ri";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import PurgeDataModal from "../../components/admin/PurgeDataModal";
import { getParticipantList, createParticipant, updateParticipant } from "../../services/api";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function parseErr(err) {
  const data = err?.response?.data;
  if (!data) return "Request failed.";
  if (typeof data === "string") return data;
  if (data.detail) return String(data.detail);
  const key = Object.keys(data)[0];
  if (key) return `${key}: ${Array.isArray(data[key]) ? data[key][0] : data[key]}`;
  return "Request failed.";
}

const EMPTY_FORM = {
  full_name: "", username: "", email: "",
  password: "", password_confirm: "", is_active: true,
};

const PAGE_SIZE = 50;

// ─── Add/Edit Drawer ─────────────────────────────────────────────────────────

function UserDrawer({ open, onClose, onSaved, editUser }) {
  const isEdit = Boolean(editUser);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setForm({
          full_name: editUser.full_name || "",
          username: editUser.username || "",
          email: editUser.email || "",
          password: "", password_confirm: "",
          is_active: editUser.is_active,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
      setSuccessMsg("");
      setShowPw(false);
    }
  }, [open, editUser, isEdit]);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setSuccessMsg("");
    try {
      if (isEdit) {
        const payload = {
          full_name: form.full_name,
          email: form.email,
          is_active: form.is_active,
        };
        if (form.password) {
          payload.password = form.password;
          payload.password_confirm = form.password_confirm;
        }
        await updateParticipant(editUser.id, payload);
        setSuccessMsg("User updated successfully.");
      } else {
        await createParticipant(form);
        setSuccessMsg("User created successfully.");
        setForm(EMPTY_FORM);
      }
      onSaved();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object" && !data.detail) {
        setErrors(data);
      } else {
        setErrors({ _global: parseErr(err) });
      }
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        }}
      />
      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50,
        width: "min(100vw, 440px)",
        background: "#0A0D1A",
        borderLeft: "1px solid rgba(255,215,0,0.2)",
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.6)",
      }}>
        {/* Header */}
        <div style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(255,215,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <RiUserAddLine style={{ color: "#FFD700", fontSize: "1.2rem" }} />
            <strong style={{ color: "#fff", fontSize: "1rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {isEdit ? "Edit User" : "Add New User"}
            </strong>
          </div>
          <button type="button" onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#888", fontSize: "1.25rem", display: "flex", padding: "0.25rem",
          }}>
            <RiCloseLine />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

          {errors._global && (
            <div style={{ padding: "0.75rem 1rem", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.35)", borderRadius: "0.75rem", color: "#f43f5e", fontSize: "0.82rem" }}>
              {errors._global}
            </div>
          )}
          {successMsg && (
            <div style={{ padding: "0.75rem 1rem", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: "0.75rem", color: "#10b981", fontSize: "0.82rem" }}>
              {successMsg}
            </div>
          )}

          {/* Full Name */}
          <div className="admin-form-group">
            <label htmlFor="pu-fullname">Full Name *</label>
            <input id="pu-fullname" required value={form.full_name} onChange={set("full_name")} disabled={busy} placeholder="e.g. Joel Thomas" />
            {errors.full_name && <span style={{ color: "#f43f5e", fontSize: "0.75rem" }}>{errors.full_name}</span>}
          </div>

          {/* Username */}
          <div className="admin-form-group">
            <label htmlFor="pu-username">Username *</label>
            <input id="pu-username" required value={form.username} onChange={set("username")} disabled={busy || isEdit} placeholder="e.g. joel_thomas" autoComplete="off" />
            {isEdit && <span style={{ color: "#888", fontSize: "0.72rem" }}>Username cannot be changed after creation.</span>}
            {errors.username && <span style={{ color: "#f43f5e", fontSize: "0.75rem" }}>{errors.username}</span>}
          </div>

          {/* Email */}
          <div className="admin-form-group">
            <label htmlFor="pu-email">Email</label>
            <input id="pu-email" type="email" value={form.email} onChange={set("email")} disabled={busy} placeholder="joel@college.edu" />
            {errors.email && <span style={{ color: "#f43f5e", fontSize: "0.75rem" }}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="admin-form-group">
            <label htmlFor="pu-password">
              {isEdit ? "New Password (leave blank to keep)" : "Password *"}
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="pu-password"
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                disabled={busy}
                required={!isEdit}
                minLength={isEdit ? undefined : 8}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                style={{ paddingRight: "2.5rem", width: "100%" }}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "1rem", display: "flex", padding: 0 }}>
                {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
            {errors.password && <span style={{ color: "#f43f5e", fontSize: "0.75rem" }}>{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          {(!isEdit || form.password) && (
            <div className="admin-form-group">
              <label htmlFor="pu-confirm">Confirm Password {!isEdit && "*"}</label>
              <input
                id="pu-confirm"
                type={showPw ? "text" : "password"}
                value={form.password_confirm}
                onChange={set("password_confirm")}
                disabled={busy}
                required={!isEdit}
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
              {errors.password_confirm && <span style={{ color: "#f43f5e", fontSize: "0.75rem" }}>{errors.password_confirm}</span>}
            </div>
          )}

          {/* Active toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={form.is_active} onChange={set("is_active")} disabled={busy} style={{ width: "1rem", height: "1rem" }} />
            <span style={{ color: "#ccc", fontSize: "0.85rem" }}>Account Active</span>
          </label>
        </form>

        {/* Footer */}
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "0.75rem" }}>
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm" disabled={busy} style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="submit" form="pu-form-hidden" onClick={handleSubmit} className="btn btn-gold btn-sm" disabled={busy} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
            <RiSaveLine />
            {busy ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save Changes" : "Create User")}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminParticipantList() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [numPages, setNumPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [purgeModalOpen, setPurgeModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const debounceRef = useRef(null);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 350);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    getParticipantList({ q: debouncedSearch, page, page_size: PAGE_SIZE })
      .then((res) => {
        setRows(res.data?.results || []);
        setTotal(res.data?.count ?? 0);
        setNumPages(res.data?.num_pages ?? 1);
      })
      .catch((err) => setError(parseErr(err)))
      .finally(() => setLoading(false));
  }, [debouncedSearch, page]);

  useEffect(() => { load(); }, [load]);

  async function handleToggleActive(u) {
    setTogglingId(u.id);
    try {
      await updateParticipant(u.id, { is_active: !u.is_active });
      load();
    } catch {
      // silent
    } finally {
      setTogglingId(null);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      const params = new URLSearchParams({ export: "csv" });
      if (debouncedSearch) params.set("q", debouncedSearch);
      const res = await fetch(`/api/admin/participants/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "macfiesta_participants.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("CSV export failed."); }
    finally { setExporting(false); }
  }

  const startIndex = (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="admin-ops-page admin-page">
      {/* Drawer */}
      <UserDrawer
        open={drawerOpen}
        editUser={editUser}
        onClose={() => { setDrawerOpen(false); setEditUser(null); }}
        onSaved={() => { load(); }}
      />

      {/* Header */}
      <header className="admin-ops-header">
        <p className="section-eyebrow">Management</p>
        <h1>Participant User List</h1>
        <p>All registered participants on MacFiesta 2026. Add, edit, or manage accounts below.</p>
      </header>

      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1.25rem" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 0 }}>
          <RiSearchLine style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: "1rem", pointerEvents: "none" }} />
          <input
            id="participant-search" type="text" value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search name, username, email..."
            style={{ width: "100%", paddingLeft: "2.25rem", paddingRight: search ? "2.25rem" : "0.75rem" }}
          />
          {search && (
            <button type="button" onClick={() => handleSearch("")} aria-label="Clear"
              style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "1rem", padding: 0, display: "flex" }}>
              <RiCloseLine />
            </button>
          )}
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={load} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <RiRefreshLine /> Refresh
        </button>

        <button type="button" className="btn btn-outline btn-sm" onClick={handleExport} disabled={exporting || loading} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <RiDownloadLine /> {exporting ? "Exporting…" : "Export CSV"}
        </button>

        {/* ★ ADD USER BUTTON */}
        <button
          type="button"
          className="btn btn-gold btn-sm"
          onClick={() => { setEditUser(null); setDrawerOpen(true); }}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700 }}
        >
          <RiUserAddLine /> Add New User
        </button>

        {/* ★ CLEAR ALL USER DATA BUTTON */}
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => setPurgeModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontWeight: 700,
            background: "rgba(225, 29, 72, 0.15)",
            color: "#fb7185",
            border: "1px solid rgba(244, 63, 94, 0.4)",
            cursor: "pointer",
          }}
        >
          <RiDeleteBin7Line /> Clear All Data
        </button>
      </div>

      {/* Purge Verification Modal */}
      <PurgeDataModal
        open={purgeModalOpen}
        onClose={() => setPurgeModalOpen(false)}
        onSuccess={() => {
          load();
        }}
      />

      {/* Stats */}
      {!loading && !error && (
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", flexWrap: "wrap", fontSize: "0.78rem", color: "#888" }}>
          <span><strong style={{ color: "#fff" }}>{total}</strong> {debouncedSearch ? "matching" : "total"} participant{total !== 1 ? "s" : ""}</span>
          {total > 0 && <span>Showing {startIndex}–{endIndex}</span>}
        </div>
      )}

      {loading && <LoadingState message="Loading participants…" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState icon="" title={debouncedSearch ? "No results found" : "No participants yet"}
          message={debouncedSearch ? `No users match "${debouncedSearch}".` : "Use 'Add New User' above to create the first participant account."} />
      )}

      {/* Table */}
      {!loading && !error && rows.length > 0 && (
        <div className="admin-table-wrap">
          <table className="dash-table admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th><span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><RiUserLine /> Name</span></th>
                <th>Username</th>
                <th><span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><RiMailLine /> Email</span></th>
                <th><span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><RiShieldCheckLine /> Status</span></th>
                <th><span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><RiTimeLine /> Joined</span></th>
                <th><span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><RiLoginBoxLine /> Last Login</span></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: "#888", fontSize: "0.75rem" }}>{startIndex + i}</td>
                  <td><strong>{u.full_name || u.username}</strong></td>
                  <td><code style={{ fontSize: "0.8rem" }}>{u.username}</code></td>
                  <td>
                    {u.email
                      ? <a href={`mailto:${u.email}`} style={{ color: "#FFD700", textDecoration: "none", fontSize: "0.85rem" }}>{u.email}</a>
                      : <span style={{ color: "#888" }}>—</span>}
                  </td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "999px", background: u.is_active ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)", color: u.is_active ? "#10b981" : "#f43f5e", border: `1px solid ${u.is_active ? "rgba(16,185,129,0.4)" : "rgba(244,63,94,0.4)"}` }}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8rem" }}>{fmtDate(u.date_joined)}</td>
                  <td style={{ fontSize: "0.8rem", color: "#888" }}>{u.last_login ? fmtDate(u.last_login) : "Never"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {/* Edit */}
                      <button type="button" className="btn btn-card btn-sm"
                        onClick={() => { setEditUser(u); setDrawerOpen(true); }}
                        style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <RiLockPasswordLine /> Edit
                      </button>
                      {/* Toggle Active */}
                      <button type="button"
                        className={`btn btn-sm ${u.is_active ? "btn-outline" : "btn-gold"}`}
                        onClick={() => handleToggleActive(u)}
                        disabled={togglingId === u.id}
                        style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        {u.is_active ? <RiToggleFill style={{ color: "#10b981" }} /> : <RiToggleLine />}
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && numPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Prev</button>
          {Array.from({ length: numPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === numPages || Math.abs(p - page) <= 2)
            .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push("..."); acc.push(p); return acc; }, [])
            .map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} style={{ color: "#888", padding: "0 0.25rem" }}>…</span>
              ) : (
                <button key={p} type="button" className={`btn btn-sm ${p === page ? "btn-gold" : "btn-outline"}`} onClick={() => setPage(p)} style={{ minWidth: "2.2rem" }}>{p}</button>
              )
            )}
          <button type="button" className="btn btn-outline btn-sm" disabled={page === numPages} onClick={() => setPage((p) => Math.min(numPages, p + 1))}>Next →</button>
        </div>
      )}
    </div>
  );
}
