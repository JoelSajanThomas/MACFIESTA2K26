import { useEffect, useMemo, useState } from "react";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { getAdminRegistrations, updateAdminRegistration, promoteWaitlist } from "../../services/api";
import { exportCsv, exportExcel } from "../../utils/adminUtils";
import SquadMembersDetailModal from "../../components/admin/SquadMembersDetailModal";
import { RiTeamLine, RiEyeLine } from "react-icons/ri";

const PAYMENT_OPTIONS = ["pending", "paid", "failed", "refunded", "waived"];
const APPROVAL_OPTIONS = ["pending", "approved", "rejected", "cancelled"];

function isSquadEvent(r) {
  if (!r) return false;
  return (
    r.registration_type === "team" ||
    Boolean(r.team_name) ||
    (Array.isArray(r.team_members) && r.team_members.length > 0) ||
    (r.max_team_size && Number(r.max_team_size) > 1)
  );
}

export default function AdminRegistrationsList() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [audience, setAudience] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedSquadReg, setSelectedSquadReg] = useState(null);

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
      "Gate Verification",
      "Event Attendance",
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
      (r.verification_attendance_marked || r.attendance_marked) ? "yes" : "no",
      r.event_attendance_marked ? "yes" : "no",
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
      if (selectedSquadReg && selectedSquadReg.id === reg.id) {
        setSelectedSquadReg(res.data);
      }
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
                <th>Phone</th>
                <th>Payment</th>
                <th>Approval</th>
                <th>Gate Desk</th>
                <th>Event Arena</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isGateVerified = Boolean(r.verification_attendance_marked || r.attendance_marked);
                return (
                <tr key={r.id}>
                  <td data-label="Event">{r.event_title}</td>
                  <td data-label="Participant">
                    <strong>{r.participant_name}</strong>
                    {isSquadEvent(r) ? (
                      <div style={{ marginTop: "0.35rem" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedSquadReg(r)}
                          className="btn btn-outline btn-sm"
                          style={{
                            padding: "0.22rem 0.55rem",
                            fontSize: "0.72rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            borderRadius: "8px",
                            borderColor: "rgba(245, 158, 11, 0.4)",
                            color: "#fbbf24",
                            background: "rgba(245, 158, 11, 0.08)",
                            cursor: "pointer",
                          }}
                          title="View complete squad roster and member credentials"
                        >
                          <RiTeamLine style={{ width: "0.9rem", height: "0.9rem" }} />
                          <span>{r.team_name || "Squad"} ({1 + (r.team_members || []).length} members)</span>
                        </button>
                      </div>
                    ) : null}
                  </td>
                  <td data-label="Reg #">{r.registration_number}</td>
                  <td data-label="College">{r.college_name}</td>
                  <td data-label="Phone">{r.phone}</td>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "nowrap" }}>
                      <select
                        className="admin-select admin-inline-select"
                        value={r.approval_status}
                        disabled={updatingId === r.id}
                        onChange={(e) => handleFieldUpdate(r, "approval_status", e.target.value)}
                        aria-label={`Approval status for ${r.participant_name}`}
                      >
                        {APPROVAL_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {isSquadEvent(r) && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{
                            padding: "0.28rem 0.55rem",
                            fontSize: "0.72rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                            borderColor: "rgba(168, 85, 247, 0.4)",
                            color: "#c084fc",
                            background: "rgba(168, 85, 247, 0.08)",
                          }}
                          onClick={() => setSelectedSquadReg(r)}
                          title="Review squad members before approval"
                        >
                          <RiEyeLine style={{ width: "0.85rem", height: "0.85rem" }} />
                          <span>Members</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td data-label="Gate Desk">
                    <label className="admin-attendance-toggle">
                      <input
                        type="checkbox"
                        checked={isGateVerified}
                        disabled={updatingId === r.id}
                        onChange={(e) => handleFieldUpdate(r, "verification_attendance_marked", e.target.checked)}
                        aria-label={`Gate verification for ${r.participant_name}`}
                      />
                      <span>{isGateVerified ? "Verified" : "Pending"}</span>
                    </label>
                  </td>
                  <td data-label="Event Arena">
                    <label className="admin-attendance-toggle">
                      <input
                        type="checkbox"
                        checked={Boolean(r.event_attendance_marked)}
                        disabled={updatingId === r.id}
                        onChange={(e) => handleFieldUpdate(r, "event_attendance_marked", e.target.checked)}
                        aria-label={`Event arena attendance for ${r.participant_name}`}
                      />
                      <span>{r.event_attendance_marked ? "Present" : "Pending"}</span>
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
              );
            })}
            </tbody>
          </table>
        </div>
      )}

      {selectedSquadReg && (
        <SquadMembersDetailModal
          isOpen={Boolean(selectedSquadReg)}
          onClose={() => setSelectedSquadReg(null)}
          registration={selectedSquadReg}
          onStatusUpdate={handleFieldUpdate}
          isUpdating={updatingId === selectedSquadReg.id}
        />
      )}
    </div>
  );
}
