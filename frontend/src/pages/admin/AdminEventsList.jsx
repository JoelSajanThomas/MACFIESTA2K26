import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import {
  deleteEvent,
  getEvents,
  getAdminRegistrations,
  getResults,
  updateEvent,
  invalidateApiGetCache,
} from "../../services/api";
import { EVENT_CATEGORY_OPTIONS, EVENT_AUDIENCE_OPTIONS, exportPdf } from "../../utils/adminUtils";
import { useAdminStaff } from "../../components/admin/AdminStaffContext";

const VALID_CATEGORIES = new Set(EVENT_CATEGORY_OPTIONS.map((o) => o.value));

export default function AdminEventsList() {
  const staff = useAdminStaff();
  const isSuperadmin = Boolean(staff?.is_superuser);

  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [rawRegistrations, setRawRegistrations] = useState([]);
  const [regCounts, setRegCounts] = useState({});
  const [resultMap, setResultMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [publishingId, setPublishingId] = useState(null);
  const categoryParam = searchParams.get("category");
  const category = VALID_CATEGORIES.has(categoryParam) ? categoryParam : "all";
  const [audience, setAudience] = useState("all");
  const [deleteEventTarget, setDeleteEventTarget] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  function setCategory(next) {
    const nextParams = new URLSearchParams(searchParams);
    if (!next || next === "all") nextParams.delete("category");
    else nextParams.set("category", next);
    setSearchParams(nextParams, { replace: true });
  }

  function load() {
    setLoading(true);
    setError("");
    Promise.all([
      getEvents(),
      getAdminRegistrations().catch(() => ({ data: [] })),
      getResults().catch(() => ({ data: [] })),
    ])
      .then(([eventsRes, regsRes, resultsRes]) => {
        setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
        const regs = Array.isArray(regsRes.data) ? regsRes.data : regsRes.data?.results || [];
        setRawRegistrations(regs);
        const counts = {};
        const participants = {};
        const eventAttended = {};
        const gateAttended = {};
        regs.forEach((r) => {
          if (r.approval_status === "cancelled") return;
          const key = r.event;
          counts[key] = (counts[key] || 0) + 1;
          const teamExtra = r.registration_type === "team" ? (r.team_members?.length || 0) : 0;
          participants[key] = (participants[key] || 0) + 1 + teamExtra;

          // Event arena attendance
          if (r.event_attendance_marked) {
            eventAttended[key] = (eventAttended[key] || 0) + 1;
          }
          // Gate / desk verification
          if (r.verification_attendance_marked || r.attendance_marked) {
            gateAttended[key] = (gateAttended[key] || 0) + 1;
          }
        });
        setRegCounts({ counts, participants, eventAttended, gateAttended });
        const results = Array.isArray(resultsRes.data) ? resultsRes.data : resultsRes.data?.results || [];
        const byEvent = {};
        results.forEach((r) => {
          byEvent[r.event] = (byEvent[r.event] || 0) + 1;
        });
        setResultMap(byEvent);
      })
      .catch(() => setError("Could not load events."))
      .finally(() => setLoading(false));
  }

  function downloadEventPdf(event) {
    const eventRegs = rawRegistrations.filter(
      (r) => String(r.event) === String(event.id) && r.approval_status !== "cancelled"
    );
    const exportRows = [
      [
        "Reg #",
        "Participant / Captain",
        "Type",
        "Team Name",
        "Teammates",
        "Institution",
        "Email",
        "Phone",
        "Payment",
        "Gate Desk",
        "Event Arena",
      ],
      ...eventRegs.map((r) => {
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
          r.payment_status || "pending",
          gateStatus,
          eventStatus,
        ];
      }),
    ];
    const slug = (event.title || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    exportPdf(`${slug}-participants.pdf`, exportRows, `${event.title} — Participants & Attendance`);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (audience !== "all" && e.audience !== audience) return false;
      if (!q) return true;
      return [e.title, e.category, e.venue, e.audience, e.department, e.slug].some((v) =>
        String(v || "").toLowerCase().includes(q)
      );
    });
  }, [events, search, category, audience]);

  const summary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const active = events.filter((e) => e.status !== "cancelled");
    return {
      total: active.length,
      registrations: Object.values(regCounts.counts || {}).reduce((a, b) => a + b, 0),
      participants: Object.values(regCounts.participants || {}).reduce((a, b) => a + b, 0),
      attended: Object.values(regCounts.attended || {}).reduce((a, b) => a + b, 0),
      today: active.filter((e) => e.event_date === today).length,
      pendingResults: active.filter((e) => !e.is_result_published).length,
    };
  }, [events, regCounts]);

  async function handleDelete() {
    if (!deleteEventTarget) return;
    if (!deletePassword.trim()) {
      setDeleteError("Please enter your Super Admin password.");
      return;
    }

    setDeleting(true);
    setDeleteError("");
    try {
      await deleteEvent(deleteEventTarget.id, deletePassword);
      invalidateApiGetCache("events");
      setEvents((prev) => prev.filter((e) => e.id !== deleteEventTarget.id));
      setDeleteEventTarget(null);
      setDeletePassword("");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Could not delete event. Verify password or registrations.";
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  }

  function handleCancelDelete() {
    if (deleting) return;
    setDeleteEventTarget(null);
    setDeletePassword("");
    setDeleteError("");
  }

  async function togglePublishResults(eventObj) {
    const nextState = !eventObj.is_result_published;
    setPublishingId(eventObj.id);
    try {
      await updateEvent(eventObj.id, { is_result_published: nextState });
      invalidateApiGetCache("events");
      invalidateApiGetCache("results");
      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventObj.id ? { ...ev, is_result_published: nextState } : ev))
      );
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        (err?.response?.data && typeof err.response.data === "object" ? Object.values(err.response.data)[0] : null) ||
        "Could not update event results publish state.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setPublishingId(null);
    }
  }

  return (
    <div className="admin-ops-page admin-list-page">
      <header className="admin-ops-header">
        <p className="section-eyebrow">Event Operations</p>
        <div className="admin-list-head">
          <h1>Missions</h1>
          <Link to="/admin/events/new" className="btn btn-gold btn-sm">Add Mission</Link>
        </div>
        <p>Open a mission to view participants, set winners, or edit details.</p>
      </header>

      <div className="admin-kpi-grid admin-kpi-grid--compact">
        <article className="admin-kpi-card"><strong>{summary.total}</strong><span>Total events</span></article>
        <article className="admin-kpi-card"><strong>{summary.registrations}</strong><span>Total registrations</span></article>
        <article className="admin-kpi-card"><strong>{summary.participants}</strong><span>Total participants</span></article>
        <article className="admin-kpi-card"><strong>{summary.attended}</strong><span>Total attended</span></article>
        <article className="admin-kpi-card"><strong>{summary.today}</strong><span>Events today</span></article>
        <article className="admin-kpi-card"><strong>{summary.pendingResults}</strong><span>Results pending</span></article>
      </div>

      <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search title, category, venue…">
        <select value={audience} onChange={(e) => setAudience(e.target.value)} className="admin-select">
          <option value="all">All days (School / College)</option>
          {EVENT_AUDIENCE_OPTIONS.filter((o) => o.value).map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-select">
          <option value="all">All categories</option>
          {EVENT_CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </AdminTableToolbar>

      {loading && <LoadingState message="Loading events…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No events found" message="No events match your filters." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="admin-table-wrap">
          <table className="dash-table admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Day</th>
                <th>Time</th>
                <th>Venue</th>
                <th>Regs</th>
                <th>Participants</th>
                <th>Attendance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const regs = regCounts.counts?.[e.id] ?? e.participant_count ?? 0;
                const parts = regCounts.participants?.[e.id] ?? regs;
                const eventAtt = regCounts.eventAttended?.[e.id] ?? 0;
                const gateAtt = regCounts.gateAttended?.[e.id] ?? 0;
                const eventPct = regs > 0 ? Math.round((eventAtt / regs) * 100) : 0;
                const hasResults = (resultMap[e.id] || 0) > 0;
                const isPubBusy = publishingId === e.id;
                return (
                  <tr key={e.id}>
                    <td data-label="Event"><strong>{e.title}</strong></td>
                    <td data-label="Category">{e.category || "—"}</td>
                    <td data-label="Day">{e.audience || "—"}</td>
                    <td data-label="Time">
                      {[e.event_date, e.event_time].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td data-label="Venue">{e.venue || "—"}</td>
                    <td data-label="Regs">{regs}</td>
                    <td data-label="Participants">{parts}</td>
                    <td data-label="Attendance">
                      <div className="admin-attendance-cell" style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-start" }}>
                        <span className={`dash-badge ${eventAtt > 0 ? "payment-paid" : "payment-pending"}`} title="Participants present at this specific event arena">
                          Arena: {eventAtt} / {regs} ({eventPct}%)
                        </span>
                        <span className="text-[10.5px] font-mono text-white/60" title="Participants verified at fest entrance/desk">
                          Gate: {gateAtt} / {regs}
                        </span>
                      </div>
                    </td>
                    <td data-label="Status">
                      {e.status}
                      {e.is_result_published
                        ? " · Published"
                        : hasResults
                          ? " · Draft results"
                          : " · No results"}
                    </td>
                    <td data-label="Actions" className="admin-actions-cell">
                      <Link to={`/admin/events/${e.id}/participants`} className="btn btn-card btn-sm">
                        View participants
                      </Link>
                      <button
                        type="button"
                        className="btn btn-gold btn-sm"
                        onClick={() => downloadEventPdf(e)}
                        title={`Download ${e.title} participants PDF`}
                      >
                        PDF
                      </button>
                      <Link to={`/admin/events/${e.id}/winners`} className="btn btn-card btn-sm">
                        Set winners
                      </Link>
                      {hasResults && (
                        <button
                          type="button"
                          className={`btn ${e.is_result_published ? "btn-outline" : "btn-gold"} btn-sm`}
                          disabled={isPubBusy}
                          onClick={() => togglePublishResults(e)}
                          title={e.is_result_published ? "Hide results from public page" : "Publish results to public page"}
                        >
                          {isPubBusy ? "…" : e.is_result_published ? "Unpublish" : "Publish"}
                        </button>
                      )}
                      <Link to="/admin/schedule" className="btn btn-outline btn-sm">
                        Schedule
                      </Link>
                      <Link to={`/admin/events/${e.id}/edit`} className="btn btn-outline btn-sm">
                        Edit
                      </Link>
                      {isSuperadmin && (
                        <button
                          type="button"
                          className="btn btn-danger-outline btn-sm"
                          onClick={() => {
                            setDeleteEventTarget(e);
                            setDeletePassword("");
                            setDeleteError("");
                          }}
                          title="Super Admin: Delete this mission"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteEventTarget)}
        title={`Delete "${deleteEventTarget?.title || "Event"}"?`}
        message="This action is restricted to Super Admins. Please enter your Super Admin account password to confirm permanent deletion."
        confirmLabel={deleting ? "Verifying & Deleting…" : "Confirm Delete"}
        busy={deleting}
        danger={true}
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
      >
        <div style={{ marginTop: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#F8FAFC" }}>
            Super Admin Password:
          </label>
          <input
            type="password"
            autoFocus
            className="admin-input"
            style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px" }}
            placeholder="Enter your password..."
            value={deletePassword}
            disabled={deleting}
            onChange={(e) => {
              setDeletePassword(e.target.value);
              if (deleteError) setDeleteError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !deleting) {
                e.preventDefault();
                handleDelete();
              }
            }}
          />
          {deleteError && (
            <p style={{ color: "#EF4444", fontSize: "0.82rem", marginTop: "0.5rem" }}>
              {deleteError}
            </p>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
}
