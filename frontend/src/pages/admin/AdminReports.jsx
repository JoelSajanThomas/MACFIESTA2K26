import { useEffect, useState } from "react";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { getAttendanceReport } from "../../services/api";

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

  function exportCsv() {
    const header = [
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
      "Transport",
      "Transport Note",
    ];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
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
          r.needs_transport ? "yes" : "no",
          r.transport_note || "",
        ]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "macfiesta-attendance-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <LoadingState message="Loading reports…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="section-eyebrow">Operations</p>
          <h1>Reports</h1>
          <p>Attendance, food, accommodation and transport preferences.</p>
        </div>
        <button type="button" className="btn btn-gold" onClick={exportCsv} disabled={!rows.length}>
          Export CSV
        </button>
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
              <th>Transport</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.registration_number + r.event}>
                <td>{r.registration_number}</td>
                <td>
                  {r.participant_name}
                  <div className="muted">{r.college_name}</div>
                </td>
                <td>{r.event}</td>
                <td>{r.payment_status}</td>
                <td>{r.attendance_marked ? "Yes" : "No"}</td>
                <td>{r.food_preference}{r.food_notes ? ` (${r.food_notes})` : ""}</td>
                <td>
                  {r.needs_accommodation
                    ? `Yes${r.accommodation_count ? ` · ${r.accommodation_count}` : ""}`
                    : "No"}
                </td>
                <td>{r.needs_transport ? `Yes${r.transport_note ? ` · ${r.transport_note}` : ""}` : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
