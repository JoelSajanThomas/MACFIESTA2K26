import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import StatusChip from "../../components/theme/StatusChip";
import { getAdminRegistrations, getEvent, updateAdminRegistration } from "../../services/api";
import { exportPdf, exportExcel } from "../../utils/adminUtils";

/**
 * Per-event participant / team roster for Event Operations.
 */
export default function AdminEventParticipants() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [institution, setInstitution] = useState("all");
  const [status, setStatus] = useState("all");

  function load() {
    setLoading(true);
    setError("");
    Promise.all([getEvent(id), getAdminRegistrations()])
      .then(([evRes, regRes]) => {
        setEvent(evRes.data);
        const all = Array.isArray(regRes.data) ? regRes.data : regRes.data?.results || [];
        setRows(
          all.filter(
            (r) => String(r.event) === String(id) && r.approval_status !== "cancelled"
          )
        );
      })
      .catch(() => setError("Could not load event participants."))
      .finally(() => setLoading(false));
  }

  async function handleEventAttendanceToggle(r, nextVal) {
    setUpdatingId(r.id);
    try {
      const res = await updateAdminRegistration(r.id, { event_attendance_marked: nextVal });
      setRows((prev) => prev.map((item) => (item.id === r.id ? { ...item, ...res.data } : item)));
    } catch {
      setError("Failed to update event attendance.");
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when event id changes
  }, [id]);

  const institutions = useMemo(() => {
    const set = new Set(rows.map((r) => r.college_name).filter(Boolean));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (institution !== "all" && r.college_name !== institution) return false;
      if (status === "paid" && r.payment_status !== "paid") return false;
      if (status === "pending" && r.payment_status !== "pending") return false;
      if (status === "event_attended" && !r.event_attendance_marked) return false;
      if (status === "event_not_attended" && r.event_attendance_marked) return false;
      if (status === "gate_verified" && !r.verification_attendance_marked && !r.attendance_marked) return false;
      if (status === "gate_pending" && (r.verification_attendance_marked || r.attendance_marked)) return false;
      if (!q) return true;
      const members = (r.team_members || []).map((m) => m.name).join(" ");
      return [
        r.registration_number,
        r.participant_name,
        r.team_name,
        r.college_name,
        members,
      ].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [rows, search, institution, status]);

  const participantCount = useMemo(() => {
    return rows.reduce((acc, r) => {
      if (r.registration_type === "team") {
        return acc + 1 + (r.team_members?.length || 0);
      }
      return acc + 1;
    }, 0);
  }, [rows]);

  const eventAttendedCount = useMemo(() => {
    return rows.filter((r) => r.event_attendance_marked).length;
  }, [rows]);

  const gateVerifiedCount = useMemo(() => {
    return rows.filter((r) => r.verification_attendance_marked || r.attendance_marked).length;
  }, [rows]);

  const eventAttendedRate = rows.length > 0 ? Math.round((eventAttendedCount / rows.length) * 100) : 0;
  const gateVerifiedRate = rows.length > 0 ? Math.round((gateVerifiedCount / rows.length) * 100) : 0;

  const exportRows = useMemo(() => {
    return [
      [
        "Reg #",
        "Participant / Captain",
        "Type",
        "Team Name",
        "Teammates",
        "Institution",
        "Email",
        "Phone",
        "Gender",
        "Payment",
        "Gate Verification",
        "Event Attendance",
      ],
      ...filtered.map((r) => {
        const members = (r.team_members || []).map((m) => m.name).join(", ");
        const gateStatus = (r.verification_attendance_marked || r.attendance_marked) ? "Verified at Gate" : "Gate Pending";
        const eventStatus = r.event_attendance_marked ? "Present at Event" : "Absent";
        return [
          r.registration_number || "",
          r.participant_name || "",
          r.registration_type || "individual",
          r.team_name || "",
          members,
          r.college_name || "",
          r.email || "",
          r.phone || "",
          r.gender || "",
          r.payment_status || "pending",
          gateStatus,
          eventStatus,
        ];
      }),
    ];
  }, [filtered]);

  function handleExportPdf() {
    const slug = (event?.title || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filename = `${slug}-participants-attendance.pdf`;
    const title = `${event?.title || "Event"} — Participants & Attendance Roster`;
    exportPdf(filename, exportRows, title);
  }

  function handleExportExcel() {
    const slug = (event?.title || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filename = `${slug}-participants-attendance.xls`;
    exportExcel(filename, exportRows);
  }

  if (loading) return <LoadingState message="Loading participants…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!event) return <EmptyState title="Event not found" message="This event could not be loaded." />;

  return (
    <div className="admin-ops-page admin-event-participants">
      <Link to="/admin/events" className="back-link">← Back to events</Link>
      <header className="admin-ops-header">
        <p className="section-eyebrow">Event Operations</p>
        <h1>{event.title}</h1>
        <p>
          {[event.audience, event.category, event.venue, event.event_date, event.event_time]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="admin-ops-actions">
          <button
            type="button"
            className="btn btn-gold btn-sm"
            onClick={handleExportPdf}
            disabled={!filtered.length}
            title="Download participants roster as PDF"
          >
            Download PDF
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleExportExcel}
            disabled={!filtered.length}
            title="Export participants roster to Excel"
          >
            Export Excel
          </button>
          <Link to={`/admin/events/${id}/winners`} className="btn btn-outline btn-sm">
            Set winners
          </Link>
          <Link to={`/admin/events/${id}/edit`} className="btn btn-outline btn-sm">
            Edit event
          </Link>
          <Link to="/admin/schedule" className="btn btn-outline btn-sm">
            View schedule
          </Link>
        </div>
      </header>

      <div className="admin-kpi-grid admin-kpi-grid--compact" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <article className="admin-kpi-card"><strong>{rows.length}</strong><span>Registrations</span></article>
        <article className="admin-kpi-card"><strong>{participantCount}</strong><span>Participants (total)</span></article>
        <article className="admin-kpi-card"><strong>{gateVerifiedCount} ({gateVerifiedRate}%)</strong><span>Gate / Desk Verified</span></article>
        <article className="admin-kpi-card"><strong>{eventAttendedCount} ({eventAttendedRate}%)</strong><span>Event Arena Present</span></article>
      </div>

      <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Name, reg #, team…">
        <select className="admin-select" value={institution} onChange={(e) => setInstitution(e.target.value)}>
          <option value="all">All institutions</option>
          {institutions.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Payment pending</option>
          <option value="event_attended">Event: Present</option>
          <option value="event_not_attended">Event: Absent</option>
          <option value="gate_verified">Gate: Verified</option>
          <option value="gate_pending">Gate: Pending</option>
        </select>
      </AdminTableToolbar>

      {filtered.length === 0 ? (
        <EmptyState
          title="No participants registered for this event"
          message="Try clearing filters, or wait for new registrations."
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="dash-table admin-table">
            <thead>
              <tr>
                <th>Reg #</th>
                <th>Participant / Captain</th>
                <th>Team</th>
                <th>Institution</th>
                <th>Contact</th>
                <th>Gender</th>
                <th>Payment</th>
                <th>Gate Desk</th>
                <th>Event Arena</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const members = r.team_members || [];
                const teamSize =
                  r.registration_type === "team" ? 1 + members.length : 1;
                const isGateVerified = Boolean(r.verification_attendance_marked || r.attendance_marked);
                return (
                  <tr key={r.id}>
                    <td>{r.registration_number || "—"}</td>
                    <td>
                      <strong>{r.participant_name}</strong>
                      {r.registration_type === "team" ? (
                        <div className="muted-line">Captain · team size {teamSize}</div>
                      ) : null}
                    </td>
                    <td>
                      {r.registration_type === "team" ? (
                        <>
                          <div>{r.team_name || "—"}</div>
                          {members.length > 0 ? (
                            <ul className="admin-team-list">
                              {members.map((m) => (
                                <li key={m.id || m.name}>{m.name}</li>
                              ))}
                            </ul>
                          ) : (
                            <div className="muted-line">No teammates listed</div>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{r.college_name}</td>
                    <td>
                      <div>{r.email}</div>
                      <div className="muted-line">{r.phone}</div>
                    </td>
                    <td>{r.gender && r.gender !== "unspecified" ? r.gender : "—"}</td>
                    <td><StatusChip status={r.payment_status} /></td>
                    <td data-label="Gate Desk">
                      <span
                        className={`admin-badge-status ${isGateVerified ? "admin-badge-status--active" : "admin-badge-status--draft"}`}
                        title={isGateVerified ? "Verified and checked in at entrance desk" : "Not yet checked in at entrance"}
                      >
                        {isGateVerified ? "Gate Verified" : "Gate Pending"}
                      </span>
                    </td>
                    <td data-label="Event Arena">
                      <label className="admin-attendance-toggle">
                        <input
                          type="checkbox"
                          checked={Boolean(r.event_attendance_marked)}
                          disabled={updatingId === r.id}
                          onChange={(e) => handleEventAttendanceToggle(r, e.target.checked)}
                          aria-label={`Event arena attendance for ${r.participant_name}`}
                        />
                        <StatusChip status={r.event_attendance_marked ? "checked_in" : "pending"} />
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
