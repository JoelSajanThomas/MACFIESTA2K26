import { useEffect, useMemo, useState } from "react";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { getAdminRegistrations } from "../../services/api";

export default function AdminVerification() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    getAdminRegistrations()
      .then((res) => setRegs(res.data))
      .catch(() => setError("Could not load registrations."))
      .finally(() => setLoading(false));
  }, []);

  const match = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return null;
    return regs.find((r) => String(r.registration_number || "").toUpperCase() === q)
      || regs.find((r) => String(r.registration_number || "").toUpperCase().includes(q));
  }, [regs, query]);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <h1>Verification</h1>
        <p>Search by registration number at entry desks.</p>
      </header>

      <div className="verification-search detail-panel">
        <label htmlFor="reg-search">Registration number</label>
        <input
          id="reg-search"
          type="search"
          placeholder="e.g. MF1A2B3C4D5E"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      {loading && <LoadingState message="Loading…" />}
      {error && <ErrorState message={error} />}

      {!loading && query && !match && (
        <p className="verification-empty">No registration found for &quot;{query}&quot;.</p>
      )}

      {match && (
        <div className="verification-result detail-panel">
          <h2>{match.participant_name}</h2>
          <dl className="verification-dl">
            <dt>Reg #</dt><dd>{match.registration_number}</dd>
            <dt>Event</dt><dd>{match.event_title}</dd>
            <dt>College</dt><dd>{match.college_name}</dd>
            <dt>Payment</dt><dd>{match.payment_status}</dd>
            <dt>Approval</dt><dd>{match.approval_status}</dd>
            <dt>Attendance</dt><dd>{match.attendance_marked ? "Marked" : "Not marked"}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}
