import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import StatusChip from "../../components/theme/StatusChip";
import { getAdminRegistrations, getEvent } from "../../services/api";

/**
 * Per-event participant / team roster for Event Operations.
 */
export default function AdminEventParticipants() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      if (status === "attended" && !r.attendance_marked) return false;
      if (status === "not_attended" && r.attendance_marked) return false;
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
          <Link to={`/admin/events/${id}/winners`} className="btn btn-gold btn-sm">
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

      <div className="admin-kpi-grid admin-kpi-grid--compact">
        <article className="admin-kpi-card"><strong>{rows.length}</strong><span>Registrations</span></article>
        <article className="admin-kpi-card"><strong>{participantCount}</strong><span>Participants (incl. teammates)</span></article>
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
          <option value="attended">Checked in</option>
          <option value="not_attended">Not checked in</option>
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
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const members = r.team_members || [];
                const teamSize =
                  r.registration_type === "team" ? 1 + members.length : 1;
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
                    <td>
                      <StatusChip status={r.attendance_marked ? "checked_in" : "pending"} />
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
