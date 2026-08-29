import { useEffect, useState } from "react";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import {
  createStaffAccount,
  getStaffDirectory,
  updateStaffAccount,
} from "../../services/api";

const COMMITTEE_OPTIONS = [
  { value: "finance", label: "Finance" },
  { value: "food", label: "Food" },
  { value: "hospitality", label: "Hospitality" },
  { value: "event", label: "Event" },
  { value: "program", label: "Program" },
  { value: "cultural", label: "Cultural" },
  { value: "publicity", label: "Publicity" },
  { value: "invitation", label: "Invitation" },
  { value: "verification", label: "Verification" },
  { value: "core", label: "Core Admin" },
];

const EMPTY_FORM = {
  display_name: "",
  username: "",
  email: "",
  phone: "",
  committee: "finance",
  temporary_password: "",
  is_active: true,
};

function parseErr(err) {
  const data = err?.response?.data;
  if (!data) return "Request failed.";
  if (typeof data === "string") return data;
  if (data.detail) return Array.isArray(data.detail) ? data.detail[0] : String(data.detail);
  const key = Object.keys(data)[0];
  if (key) {
    const val = data[key];
    return `${key}: ${Array.isArray(val) ? val[0] : val}`;
  }
  return "Request failed.";
}

/**
 * Core Admin — create and manage volunteer / staff accounts.
 * Passwords are never shown after save (hashed on server).
 */
export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [formMsg, setFormMsg] = useState("");
  const [editing, setEditing] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  function load() {
    setLoading(true);
    setError("");
    getStaffDirectory()
      .then((res) => setRows(res.data?.results || []))
      .catch(() => setError("Could not load staff / volunteer accounts."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setBusy(true);
    setFormMsg("");
    try {
      await createStaffAccount(form);
      setForm(EMPTY_FORM);
      setFormMsg("Volunteer created. They must change the temporary password on first login.");
      load();
    } catch (err) {
      setFormMsg(parseErr(err));
    } finally {
      setBusy(false);
    }
  }

  function startEdit(row) {
    setEditing(row.id);
    setEditDraft({
      display_name: row.display_name || "",
      email: row.email || "",
      phone: row.phone || "",
      committee: row.committee || "finance",
      is_active: row.is_active,
      temporary_password: "",
    });
    setFormMsg("");
  }

  async function saveEdit(id) {
    setBusy(true);
    setFormMsg("");
    try {
      const payload = { ...editDraft };
      if (!payload.temporary_password) delete payload.temporary_password;
      await updateStaffAccount(id, payload);
      setEditing(null);
      setFormMsg("Account updated.");
      load();
    } catch (err) {
      setFormMsg(parseErr(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(row) {
    setBusy(true);
    try {
      await updateStaffAccount(row.id, { is_active: !row.is_active });
      load();
    } catch (err) {
      setFormMsg(parseErr(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-ops-page admin-page">
      <header className="admin-ops-header">
        <p className="section-eyebrow">Management</p>
        <h1>Staff / Volunteers</h1>
        <p>
          Create volunteer accounts and assign one committee. Everyone signs in at{" "}
          <code>/login</code>. Passwords are stored hashed and never shown here.
        </p>
      </header>

      <section className="admin-ops-section admin-volunteer-section">
        <h2>Add Volunteer</h2>
        <form className="admin-volunteer-form" onSubmit={handleCreate}>
          <div className="admin-volunteer-grid">
            <div className="admin-form-group">
              <label htmlFor="vol-fullname">Full Name</label>
              <input
                id="vol-fullname"
                required
                value={form.display_name}
                onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
                disabled={busy}
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="vol-username">Username</label>
              <input
                id="vol-username"
                required
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                disabled={busy}
                autoComplete="off"
                placeholder="e.g. john_doe"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="vol-email">Email</label>
              <input
                id="vol-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                disabled={busy}
                placeholder="john@example.com"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="vol-phone">Phone (optional)</label>
              <input
                id="vol-phone"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                disabled={busy}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="vol-committee">Assign Committee</label>
              <select
                id="vol-committee"
                value={form.committee}
                onChange={(e) => setForm((p) => ({ ...p, committee: e.target.value }))}
                disabled={busy}
              >
                {COMMITTEE_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label htmlFor="vol-password">Temporary Password</label>
              <input
                id="vol-password"
                type="password"
                required
                minLength={8}
                value={form.temporary_password}
                onChange={(e) => setForm((p) => ({ ...p, temporary_password: e.target.value }))}
                disabled={busy}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-check-group">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  disabled={busy}
                />
                <span>Active</span>
              </label>
            </div>
          </div>

          <div style={{ marginTop: "0.5rem" }}>
            <button type="submit" className="admin-action-btn admin-action-btn--primary" disabled={busy}>
              {busy ? "Saving…" : "Add Volunteer"}
            </button>
          </div>
        </form>
        {formMsg ? <p className="muted-line" style={{ marginTop: "0.75rem" }}>{formMsg}</p> : null}
      </section>

      {loading && <LoadingState message="Loading staff…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && rows.length === 0 && (
        <EmptyState title="No staff accounts" message="Add a volunteer above." icon="" />
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="admin-table-wrap">
          <table className="dash-table admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Committee</th>
                <th>Status</th>
                <th>Last login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  {editing === u.id ? (
                    <>
                      <td>
                        <input
                          value={editDraft.display_name}
                          onChange={(e) =>
                            setEditDraft((p) => ({ ...p, display_name: e.target.value }))
                          }
                        />
                      </td>
                      <td>{u.username}</td>
                      <td>
                        <input
                          value={editDraft.email}
                          onChange={(e) => setEditDraft((p) => ({ ...p, email: e.target.value }))}
                        />
                      </td>
                      <td>
                        <select
                          value={editDraft.committee}
                          onChange={(e) =>
                            setEditDraft((p) => ({ ...p, committee: e.target.value }))
                          }
                        >
                          {COMMITTEE_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="password"
                          placeholder="New temp password (optional)"
                          value={editDraft.temporary_password}
                          onChange={(e) =>
                            setEditDraft((p) => ({ ...p, temporary_password: e.target.value }))
                          }
                          style={{ marginTop: "0.35rem" }}
                        />
                      </td>
                      <td>
                        <label>
                          <input
                            type="checkbox"
                            checked={editDraft.is_active}
                            onChange={(e) =>
                              setEditDraft((p) => ({ ...p, is_active: e.target.checked }))
                            }
                          />{" "}
                          Active
                        </label>
                      </td>
                      <td>{u.last_login ? new Date(u.last_login).toLocaleString() : "Never"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-gold btn-sm"
                          disabled={busy}
                          onClick={() => saveEdit(u.id)}
                        >
                          Save
                        </button>{" "}
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setEditing(null)}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <strong>{u.display_name}</strong>
                        {u.is_superuser ? <div className="muted-line">Superuser</div> : null}
                        {u.phone ? <div className="muted-line">{u.phone}</div> : null}
                      </td>
                      <td>{u.username}</td>
                      <td>{u.email || "—"}</td>
                      <td>{u.committee_label || "—"}</td>
                      <td>{u.is_active ? "Active" : "Inactive"}</td>
                      <td>{u.last_login ? new Date(u.last_login).toLocaleString() : "Never"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-card btn-sm"
                          onClick={() => startEdit(u)}
                          disabled={busy}
                        >
                          Edit
                        </button>{" "}
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => toggleActive(u)}
                          disabled={busy}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
