import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import StatusChip from "../../components/theme/StatusChip";
import { getAdminRegistrations, updateAdminRegistration } from "../../services/api";

function money(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

/**
 * Finance desk — payment monitoring + verify/reject with proof review.
 */
export default function AdminFinance() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("pending");
  const [active, setActive] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    setError("");
    getAdminRegistrations()
      .then((res) => setRows(Array.isArray(res.data) ? res.data : res.data?.results || []))
      .catch(() => setError("Could not load payment registrations."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (r.approval_status === "cancelled") return false;
      if (status !== "all" && r.payment_status !== status) return false;
      if (!q) return true;
      return [
        r.registration_number,
        r.participant_name,
        r.college_name,
        r.payment_transaction_id,
        r.payment_receipt_number,
        r.event_title,
      ].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [rows, search, status]);

  const summary = useMemo(() => {
    const activeRows = rows.filter((r) => r.approval_status !== "cancelled");
    const paid = activeRows.filter((r) => r.payment_status === "paid");
    const pending = activeRows.filter((r) => r.payment_status === "pending");
    const failed = activeRows.filter((r) => r.payment_status === "failed" || r.payment_status === "rejected");
    const sum = (list) =>
      list.reduce((acc, r) => acc + (Number(r.payment_amount) || 0), 0);
    return {
      total: activeRows.length,
      paid: paid.length,
      pending: pending.length,
      failed: failed.length,
      verifiedRevenue: sum(paid),
      pendingAmount: sum(pending),
    };
  }, [rows]);

  async function applyAction() {
    if (!confirmAction || !active) return;
    setBusy(true);
    try {
      const payload =
        confirmAction === "verify"
          ? { payment_status: "paid", payment_rejection_reason: "" }
          : {
              payment_status: "rejected",
              payment_rejection_reason: rejectReason.trim() || "Payment rejected by finance desk",
            };
      const res = await updateAdminRegistration(active.id, payload);
      setRows((prev) => prev.map((r) => (r.id === active.id ? { ...r, ...res.data } : r)));
      setActive({ ...active, ...res.data });
      setConfirmAction(null);
      setRejectReason("");
    } catch {
      setError("Could not update payment status.");
    } finally {
      setBusy(false);
    }
  }


  function exportFilteredCsv(list) {
    const headers = ["Reg #", "Participant", "Institution", "Event", "Amount", "Txn ID", "Status", "Verified By", "Verified At"];
    const lines = [headers.join(",")].concat(
      list.map((r) =>
        [
          r.registration_number,
          r.participant_name,
          r.college_name,
          r.event_title,
          r.payment_amount,
          r.payment_transaction_id,
          r.payment_status,
          r.payment_verified_by_username,
          r.payment_verified_at,
        ]
          .map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`)
          .join(",")
      )
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `macfiesta-payments-${status}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-ops-page admin-finance-page">
      <header className="admin-ops-header">
        <p className="section-eyebrow">Finance</p>
        <h1>Payments</h1>
        <p>Review screenshots, verify or reject. Only verified amounts count as collected.</p>
        <div className="admin-action-grid" style={{ marginTop: "0.85rem" }}>
          <button type="button" className="admin-action-btn admin-action-btn--primary" onClick={() => setStatus("pending")}>
            Review Pending Payments
          </button>
          <button type="button" className="admin-action-btn" onClick={() => { setStatus("all"); setSearch(""); }}>
            Search Payment
          </button>
          <button type="button" className="admin-action-btn" onClick={() => exportFilteredCsv(filtered)}>
            Finance Report (CSV)
          </button>
        </div>
      </header>

      <div className="admin-kpi-grid">
        <article className="admin-kpi-card"><strong>{summary.pending}</strong><span>Pending</span></article>
        <article className="admin-kpi-card"><strong>{summary.paid}</strong><span>Verified</span></article>
        <article className="admin-kpi-card"><strong>{summary.failed}</strong><span>Rejected</span></article>
        <article className="admin-kpi-card"><strong>{money(summary.verifiedRevenue)}</strong><span>Total verified amount</span></article>
      </div>

      <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Reg #, name, txn ID…">
        <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All payments</option>
          <option value="pending">Pending verification</option>
          <option value="paid">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="failed">Failed (legacy)</option>
          <option value="waived">Waived</option>
        </select>
      </AdminTableToolbar>

      {loading && <LoadingState message="Loading payments…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No payments found" message="No payments awaiting verification for this filter." icon="" />
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="admin-ops-card-list admin-show-mobile-cards">
            {filtered.map((r) => (
              <article key={`m-${r.id}`} className="admin-ops-mobile-card">
                <h3>{r.participant_name}</h3>
                <p>{r.registration_number}</p>
                <p>{r.college_name}</p>
                <p>{r.event_title} · {money(r.payment_amount)}</p>
                <StatusChip status={r.payment_status} />
                <div className="admin-ops-card-actions">
                  <button type="button" className="btn btn-gold btn-sm" onClick={() => setActive(r)}>
                    Review
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="admin-table-wrap admin-hide-mobile-table">
          <table className="dash-table admin-table">
            <thead>
              <tr>
                <th>Reg #</th>
                <th>Participant</th>
                <th>Institution</th>
                <th>Event</th>
                <th>Amount</th>
                <th>Txn / Receipt</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.registration_number || "—"}</td>
                  <td>
                    <strong>{r.participant_name}</strong>
                    {r.team_name ? <div className="muted-line">Team: {r.team_name}</div> : null}
                  </td>
                  <td>{r.college_name}</td>
                  <td>{r.event_title}</td>
                  <td>{money(r.payment_amount)}</td>
                  <td>{r.payment_transaction_id || r.payment_receipt_number || "—"}</td>
                  <td><StatusChip status={r.payment_status} /></td>
                  <td>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setActive(r)}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {active && (
        <div className="admin-drawer-backdrop" role="presentation" onClick={() => setActive(null)}>
          <aside
            className="admin-drawer"
            role="dialog"
            aria-label="Payment review"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="admin-drawer-head">
              <h2>Payment review</h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setActive(null)}>Close</button>
            </header>
            <div className="admin-drawer-body">
              <p><strong>Reg #:</strong> {active.registration_number}</p>
              <p><strong>Student:</strong> {active.participant_name}</p>
              <p><strong>Institution:</strong> {active.college_name}</p>
              <p><strong>Event:</strong> {active.event_title}</p>
              <p><strong>Amount:</strong> {money(active.payment_amount)}</p>
              <p><strong>Method:</strong> {active.payment_method || "—"}</p>
              <p><strong>Transaction ID:</strong> {active.payment_transaction_id || "—"}</p>
              <p><strong>Receipt #:</strong> {active.payment_receipt_number || "—"}</p>
              <p><strong>Notes:</strong> {active.payment_notes || "—"}</p>
              <p><strong>Status:</strong> <StatusChip status={active.payment_status} /></p>
              {active.payment_rejection_reason ? (
                <p><strong>Rejection reason:</strong> {active.payment_rejection_reason}</p>
              ) : null}
              {active.payment_verified_by_username ? (
                <p className="muted-line">
                  Verified by {active.payment_verified_by_username}
                  {active.payment_verified_at ? ` · ${new Date(active.payment_verified_at).toLocaleString()}` : ""}
                </p>
              ) : null}
              {active.payment_proof_url ? (
                <a href={active.payment_proof_url} target="_blank" rel="noreferrer" className="admin-proof-link">
                  <img src={active.payment_proof_url} alt="Payment proof" className="admin-proof-image" />
                </a>
              ) : (
                <p className="muted-line">No payment screenshot uploaded yet.</p>
              )}
            </div>
            <footer className="admin-drawer-actions">
              {active.payment_status !== "paid" && (
                <button type="button" className="btn btn-gold" onClick={() => setConfirmAction("verify")}>
                  VERIFY
                </button>
              )}
              {active.payment_status !== "rejected" && active.payment_status !== "failed" && (
                <button type="button" className="btn btn-outline" onClick={() => setConfirmAction("reject")}>
                  REJECT
                </button>
              )}
            </footer>
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmAction === "verify" ? "Verify this payment?" : "Reject this payment?"}
        message={
          confirmAction === "verify"
            ? "This marks the payment as verified and adds it to verified revenue."
            : "The registration is kept. Payment status becomes failed/rejected."
        }
        confirmLabel={confirmAction === "verify" ? "Verify" : "Reject"}
        danger={confirmAction !== "verify"}
        busy={busy}
        onCancel={() => {
          setConfirmAction(null);
          setRejectReason("");
        }}
        onConfirm={applyAction}
      >
        {confirmAction === "reject" && (
          <label className="admin-drawer-reason">
            Rejection reason
            <input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Optional reason"
            />
          </label>
        )}
      </ConfirmDialog>
    </div>
  );
}
