import { useEffect, useState } from "react";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { getAttendanceReport } from "../../services/api";
import { exportCsv, exportExcel } from "../../utils/adminUtils";

export default function AdminReports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const exportRows = [
    [
      "Reg #",
      "Participant",
      "College",
      "Event",
      "Payment",
      "Attendance",
      "Verified At",
      "Food",
      "Food Notes",
      "Accommodation",
      "Stay Count",
      "Stay Notes",
    ],
    ...rows.map((r) => [
      r.registration_number,
      r.participant_name,
      r.college_name,
      r.event,
      r.payment_status,
      r.attendance_marked ? "yes" : "no",
      r.verified_at || "",
      r.food_preference,
      r.food_notes || "",
      r.needs_accommodation ? "yes" : "no",
      r.accommodation_count ?? "",
      r.accommodation_notes || "",
    ]),
  ];

  if (loading) return <LoadingState message="Loading reports…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="section-eyebrow">Operations</p>
          <h1>Reports</h1>
          <p>Attendance, food, and accommodation preferences.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => exportCsv("macfiesta-attendance-report.csv", exportRows)}
            disabled={!rows.length}
          >
            Export CSV
          </button>
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => exportExcel("macfiesta-attendance-report.xls", exportRows)}
            disabled={!rows.length}
          >
            Export Excel
          </button>
        </div>
      </header>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reg #</th>
              <th>Participant</th>
              <th>Event</th>
              <th>Payment</th>
              <th>Attendance</th>
              <th>Food</th>
              <th>Stay</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.registration_number}>
                <td>{r.registration_number}</td>
                <td>{r.participant_name}</td>
                <td>{r.event}</td>
                <td>{r.payment_status}</td>
                <td>{r.attendance_marked ? "Yes" : "No"}</td>
                <td>{r.food_preference}</td>
                <td>{r.needs_accommodation ? `Yes (${r.accommodation_count || 1})` : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
