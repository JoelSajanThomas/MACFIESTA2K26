import { useEffect, useMemo, useState } from "react";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import { getAttendanceReport } from "../../services/api";
import { exportExcel, exportPdf } from "../../utils/adminUtils";

export default function AdminReports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [foodFilter, setFoodFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    getAttendanceReport()
      .then((res) => {
        if (mounted) setRows(res.data.results || []);
      })
      .catch(() => {
        if (mounted) setError("Could not load attendance report.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const total = rows.length;
    const gateVerified = rows.filter((r) => r.verification_attendance_marked || r.attendance_marked).length;
    const eventAttended = rows.filter((r) => r.event_attendance_marked).length;
    const food = rows.filter((r) => r.food_preference && r.food_preference.toLowerCase() !== "none").length;
    const stay = rows.filter((r) => r.needs_accommodation).length;
    const paid = rows.filter((r) => r.payment_status === "paid").length;
    return { total, gateVerified, eventAttended, food, stay, paid };
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (attendanceFilter === "gate_verified" && !r.verification_attendance_marked && !r.attendance_marked) return false;
      if (attendanceFilter === "gate_pending" && (r.verification_attendance_marked || r.attendance_marked)) return false;
      if (attendanceFilter === "event_attended" && !r.event_attendance_marked) return false;
      if (attendanceFilter === "event_absent" && r.event_attendance_marked) return false;
      if (paymentFilter !== "all" && (r.payment_status || "").toLowerCase() !== paymentFilter.toLowerCase()) return false;
      if (foodFilter === "required" && (!r.food_preference || r.food_preference.toLowerCase() === "none")) return false;
      if (foodFilter === "none" && r.food_preference && r.food_preference.toLowerCase() !== "none") return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (r.participant_name || "").toLowerCase().includes(q) ||
        (r.registration_number || "").toLowerCase().includes(q) ||
        (r.college_name || "").toLowerCase().includes(q) ||
        (r.event || "").toLowerCase().includes(q) ||
        (r.food_preference || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, attendanceFilter, paymentFilter, foodFilter]);

  const exportRows = [
    [
      "Reg #",
      "Participant",
      "College",
      "Event",
      "Payment",
      "Gate Verification",
      "Gate Verified At",
      "Event Attendance",
      "Food",
      "Food Notes",
      "Accommodation",
      "Stay Count",
      "Stay Notes",
    ],
    ...filteredRows.map((r) => [
      r.registration_number,
      r.participant_name,
      r.college_name,
      r.event,
      r.payment_status,
      (r.verification_attendance_marked || r.attendance_marked) ? "Verified at Gate" : "Pending",
      r.verified_at || "",
      r.event_attendance_marked ? "Present at Event" : "Absent",
      r.food_preference,
      r.food_notes || "",
      r.needs_accommodation ? "yes" : "no",
      r.accommodation_count ?? "",
      r.accommodation_notes || "",
    ]),
  ];

  if (loading) return <LoadingState message="Loading operational reports…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="admin-ops-page admin-reports-page">
      <header className="admin-ops-header">
        <p className="section-eyebrow">Operations & Analytics</p>
        <h1>Reports & Logistics</h1>
        <p>Export and monitor verified attendance records, dining preferences, and accommodation requirements.</p>

        <div className="admin-action-grid" style={{ marginTop: "1.25rem" }}>
          <button
            type="button"
            className="admin-action-btn admin-action-btn--primary"
            onClick={() => exportExcel("macfiesta-attendance-report.xls", exportRows)}
            disabled={!filteredRows.length}
          >
            Export Excel Sheet
          </button>
          <button
            type="button"
            className="admin-action-btn"
            onClick={() => exportPdf("macfiesta-attendance-report.pdf", exportRows, "MacFiesta Attendance & Logistics Report")}
            disabled={!filteredRows.length}
          >
            Export PDF Document
          </button>
        </div>
      </header>

      <div className="admin-kpi-grid">
        <article className="admin-kpi-card">
          <strong>{summary.total}</strong>
          <span>Total Records</span>
        </article>
        <article className="admin-kpi-card">
          <strong>{summary.gateVerified}</strong>
          <span>Gate / Desk Verified</span>
        </article>
        <article className="admin-kpi-card">
          <strong>{summary.eventAttended}</strong>
          <span>Event Arena Present</span>
        </article>
        <article className="admin-kpi-card">
          <strong>{summary.paid}</strong>
          <span>Payments Confirmed</span>
        </article>
        <article className="admin-kpi-card">
          <strong>{summary.food}</strong>
          <span>Food Preferences</span>
        </article>
        <article className="admin-kpi-card">
          <strong>{summary.stay}</strong>
          <span>Stay Requested</span>
        </article>
      </div>

      <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search reg #, participant, college, event…">
        <select
          className="admin-select"
          value={attendanceFilter}
          onChange={(e) => setAttendanceFilter(e.target.value)}
          aria-label="Filter by attendance"
        >
          <option value="all">All Attendance</option>
          <option value="gate_verified">Gate: Verified</option>
          <option value="gate_pending">Gate: Pending</option>
          <option value="event_attended">Event: Present</option>
          <option value="event_absent">Event: Absent</option>
        </select>

        <select
          className="admin-select"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          aria-label="Filter by payment"
        >
          <option value="all">All Payments</option>
          <option value="paid">Verified Paid</option>
          <option value="pending">Pending</option>
        </select>

        <select
          className="admin-select"
          value={foodFilter}
          onChange={(e) => setFoodFilter(e.target.value)}
          aria-label="Filter by food"
        >
          <option value="all">All Food Plans</option>
          <option value="required">Food Requested</option>
          <option value="none">No Food Needed</option>
        </select>
      </AdminTableToolbar>

      <div className="admin-table-wrap" style={{ marginTop: "1rem" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reg #</th>
              <th>Participant</th>
              <th>Event</th>
              <th>Payment</th>
              <th>Gate Desk</th>
              <th>Event Arena</th>
              <th>Food Plan</th>
              <th>Stay</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "2.5rem 1rem", color: "rgba(255, 255, 255, 0.5)" }}>
                  No report records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => {
                const isGateVerified = Boolean(r.verification_attendance_marked || r.attendance_marked);
                return (
                <tr key={r.registration_number}>
                  <td>
                    <strong style={{ fontFamily: "Space Grotesk, sans-serif", color: "#FFD700", letterSpacing: "0.05em" }}>
                      {r.registration_number}
                    </strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#FFFFFF" }}>{r.participant_name}</div>
                    {r.college_name && (
                      <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginTop: "2px" }}>
                        {r.college_name}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: "#E2E8F0" }}>{r.event}</span>
                  </td>
                  <td>
                    <span
                      className={`status-chip ${
                        (r.payment_status || "").toLowerCase() === "paid"
                          ? "status-chip--confirmed"
                          : "status-chip--pending"
                      }`}
                    >
                      {r.payment_status || "Pending"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-chip ${
                        isGateVerified ? "status-chip--confirmed" : "status-chip--pending"
                      }`}
                    >
                      {isGateVerified ? "Gate Verified" : "Gate Pending"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-chip ${
                        r.event_attendance_marked ? "status-chip--confirmed" : "status-chip--pending"
                      }`}
                    >
                      {r.event_attendance_marked ? "Arena Present" : "Unmarked"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-chip ${
                        r.food_preference && r.food_preference.toLowerCase() !== "none"
                          ? "status-chip--confirmed"
                          : "status-chip--muted"
                      }`}
                    >
                      {r.food_preference || "Standard"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-chip ${
                        r.needs_accommodation ? "status-chip--warning" : "status-chip--muted"
                      }`}
                    >
                      {r.needs_accommodation ? `Required (${r.accommodation_count || 1})` : "None"}
                    </span>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
