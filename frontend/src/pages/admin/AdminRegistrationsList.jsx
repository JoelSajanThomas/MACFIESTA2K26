import { useEffect, useMemo, useState } from "react";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { getAdminRegistrations, updateAdminRegistration, promoteWaitlist } from "../../services/api";
import { exportCsv, exportExcel } from "../../utils/adminUtils";

const PAYMENT_OPTIONS = ["pending", "paid", "failed", "refunded", "waived"];
const APPROVAL_OPTIONS = ["pending", "approved", "rejected", "cancelled"];

export default function AdminRegistrationsList() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [audience, setAudience] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  function load() {
    setLoading(true);
    getAdminRegistrations()
      .then((res) => setRegs(res.data))
      .catch(() => setError("Could not load registrations."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const eventOptions = useMemo(() => {
    const titles = [...new Set(regs.map((r) => r.event_title).filter(Boolean))].sort();
    return titles;
  }, [regs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return regs.filter((r) => {
      if (payment !== "all" && r.payment_status !== payment) return false;
      if (eventFilter !== "all" && r.event_title !== eventFilter) return false;
      if (audience !== "all" && r.event_audience !== audience) return false;
      if (!q) return true;
      return [
        r.participant_name,
        r.college_name,
        r.email,
        r.phone,
        r.event_title,
        r.registration_number,
        r.team_name,
      ].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [regs, search, payment, eventFilter, audience]);

  const exportRows = [
    [
      "ID",
      "Reg #",
      "Event",
      "Type",
      "Participant",
      "College",
      "Email",
      "Phone",
      "Amount",
      "Payment",
      "Approval",
      "Attendance",
      "Waiting",
      "Food",
      "Stay",
      "Registered At",
    ],
    ...filtered.map((r) => [
      r.id,
      r.registration_number,
      r.event_title,
      r.registration_type,
      r.participant_name,
      r.college_name,
      r.email,
      r.phone,
      r.payment_amount ?? "",
      r.payment_status,
      r.approval_status,
      r.attendance_marked ? "yes" : "no",
      r.is_waiting_list ? "yes" : "no",
      r.food_preference || "",
      r.needs_accommodation ? `yes (${r.accommodation_count || 1})` : "no",
      r.registered_at,
    ]),
  ];

  async function handleFieldUpdate(reg, field, value) {
    setUpdatingId(reg.id);
    try {
      const res = await updateAdminRegistration(reg.id, { [field]: value });
      setRegs((prev) => prev.map((r) => (r.id === reg.id ? res.data : r)));
    } catch {
      setError("Could not update registration.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handlePromote(reg) {
    if (!reg.event) return;
    setUpdatingId(reg.id);
    try {
      await promoteWaitlist(reg.event);
      load();
    } catch {
      setError("Could not promote waitlisted participant (event may be full).");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="admin-list-page">
      <div className="admin-list-head">
        <h2>All Registrations</h2>
        <div className="admin-list-head-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => exportCsv("macfiesta-registrations.csv", exportRows)}>Export CSV</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => exportExcel("macfiesta-registrations.xls", exportRows)}>Export Excel</button>
        </div>
      </div>

      <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search participant, college, email, phone, event, reg #…">
        <select value={payment} onChange={(e) => setPayment(e.target.value)} className="admin-select" aria-label="Filter by payment">
          <option value="all">All payments</option>
          {PAYMENT_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={audience} onChange={(e) => setAudience(e.target.value)} className="admin-select" aria-label="Filter by day">
          <option value="all">School + College</option>
          <option value="school">School Day</option>
          <option value="college">College Day</option>
        </select>
        <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="admin-select" aria-label="Filter by event">
          <option value="all">All events</option>
          {eventOptions.map((title) => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>
      </AdminTableToolbar>

      {loading && <LoadingState message="Loading registrations…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="dash-table-wrap">
          <table className="dash-table admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Participant</th>
                <th>Reg #</th>
                <th>College</th>
                <th>Payment</th>
                <th>Approval</th>
                <th>Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td data-label="Event">{r.event_title}</td>
                  <td data-label="Participant">
                    <strong>{r.participant_name}</strong>
                    {r.registration_type === "team" ? (
                      <div className="muted-line">
                        Captain{r.team_name ? ` · ${r.team_name}` : ""}
                        {(r.team_members || []).length > 0
                          ? ` · teammates: ${(r.team_members || []).map((m) => m.name).join(", ")}`
                          : ""}
                      </div>
                    ) : null}
                  </td>
                  <td data-label="Reg #">{r.registration_number}</td>
                  <td data-label="College">{r.college_name}</td>
                  <td data-label="Payment">
                    <select
                      className="admin-select admin-inline-select"
                      value={r.payment_status}
                      disabled={updatingId === r.id}
                      onChange={(e) => handleFieldUpdate(r, "payment_status", e.target.value)}
                      aria-label={`Payment status for ${r.participant_name}`}
                    >
                      {PAYMENT_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td data-label="Approval">
                    <select
                      className="admin-select admin-inline-select"
                      value={r.approval_status}
                      disabled={updatingId === r.id}
                      onChange={(e) => handleFieldUpdate(r, "approval_status", e.target.value)}
                      aria-label={`Approval status for ${r.participant_name}`}
                    >
                      {APPROVAL_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td data-label="Attendance">
                    <label className="admin-attendance-toggle">
                      <input
                        type="checkbox"
                        checked={Boolean(r.attendance_marked)}
                        disabled={updatingId === r.id}
                        onChange={(e) => handleFieldUpdate(r, "attendance_marked", e.target.checked)}
                        aria-label={`Attendance for ${r.participant_name}`}
                      />
                      <span>{r.attendance_marked ? "Present" : "Pending"}</span>
                    </label>
                  </td>
                  <td data-label="Status">
                    {r.approval_status === "cancelled" ? (
                      <span className="dash-badge payment-failed">cancelled</span>
                    ) : r.is_waiting_list ? (
                      <span className="dash-badge payment-pending">
                        waiting{r.waitlist_position ? ` #${r.waitlist_position}` : ""}
                        <button
                          type="button"
                          className="btn btn-outline btn-sm admin-promote-btn"
                          disabled={updatingId === r.id}
                          onClick={() => handlePromote(r)}
                        >
                          Promote
                        </button>
                      </span>
                    ) : (
                      <span className="dash-badge payment-paid">confirmed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
