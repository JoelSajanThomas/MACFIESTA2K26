import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import StatusChip from "../../components/theme/StatusChip";
import SquadMembersDetailModal from "../../components/admin/SquadMembersDetailModal";
import {
  getAdminRegistrations,
  updateAdminRegistration,
  adminVerifyMemberFinance,
  refundRegistration,
} from "../../services/api";

function money(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

/**
 * Finance desk — payment monitoring + verify/reject with proof review and team members support.
 */
export default function AdminFinance() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("pending");
  const [active, setActive] = useState(null);
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundTxnId, setRefundTxnId] = useState("");
  const [refundNotes, setRefundNotes] = useState("");

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
        r.team_name,
      ].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [rows, search, status]);

  const summary = useMemo(() => {
    const activeRows = rows.filter((r) => r.approval_status !== "cancelled");
    const paid = activeRows.filter((r) => r.payment_status === "paid");
    const pending = activeRows.filter((r) => r.payment_status === "pending");
    const failed = activeRows.filter((r) => r.payment_status === "failed" || r.payment_status === "rejected");
    const refunded = activeRows.filter((r) => r.payment_status === "refunded");
    const sum = (list) =>
      list.reduce((acc, r) => acc + (Number(r.payment_amount) || 0), 0);
    return {
      total: activeRows.length,
      paid: paid.length,
      pending: pending.length,
      failed: failed.length,
      refunded: refunded.length,
      verifiedRevenue: sum(paid),
      pendingAmount: sum(pending),
    };
  }, [rows]);

  async function handleRefundSubmit(e) {
    e.preventDefault();
    if (!active) return;
    setBusy(true);
    try {
      const res = await refundRegistration(active.id, {
        refund_amount: refundAmount,
        refund_transaction_id: refundTxnId,
        refund_notes: refundNotes,
      });
      setRows((prev) => prev.map((r) => (r.id === active.id ? { ...r, ...res.data } : r)));
      setActive({ ...active, ...res.data });
      setShowRefundModal(false);
    } catch {
      alert("Failed to issue refund. Check finance permissions.");
    } finally {
      setBusy(false);
    }
  }

  async function applyAction() {
    if (!confirmAction || !active) return;
    setBusy(true);
    try {
      const expectedStatus = confirmAction === "verify" ? "paid" : "rejected";
      const payload =
        confirmAction === "verify"
          ? { payment_status: "paid", payment_rejection_reason: "" }
          : {
              payment_status: "rejected",
              payment_rejection_reason: rejectReason.trim() || "Payment rejected by finance desk",
            };
      const res = await updateAdminRegistration(active.id, payload);

      if (res.data.payment_status !== expectedStatus) {
        setError("Permission denied: your account does not have Finance/Core access to verify payments.");
        setConfirmAction(null);
        return;
      }

      setRows((prev) => prev.map((r) => (r.id === active.id ? { ...r, ...res.data } : r)));
      setActive({ ...active, ...res.data });
      setConfirmAction(null);
      setRejectReason("");
    } catch {
      setError("Could not update payment status. Check your permissions.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyMember(memberId, verifyStatus) {
    try {
      const res = await adminVerifyMemberFinance(memberId, { status: verifyStatus });
      // Update local member state inside active and rows
      if (active) {
        const updatedMembers = (active.team_members || []).map((m) =>
          m.id === memberId ? { ...m, ...res.data } : m
        );
        setActive({ ...active, team_members: updatedMembers });
      }
      load();
    } catch (err) {
      alert(err?.response?.data?.detail || "Could not update member finance status.");
    }
  }

  function exportFilteredCsv(list) {
    const headers = ["Reg #", "Participant", "Team Name", "Institution", "Event", "Amount", "Txn ID", "Status", "Verified By", "Verified At"];
    const lines = [headers.join(",")].concat(
      list.map((r) =>
        [
          r.registration_number,
          r.participant_name,
          r.team_name || "",
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
        <h1>Payments &amp; Squad Verification Desk</h1>
        <p>Review screenshots, verify captain and individual team member payments. Only verified amounts count as collected.</p>
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
        <article className="admin-kpi-card"><strong>{summary.refunded}</strong><span>Refunded</span></article>
        <article className="admin-kpi-card"><strong>{money(summary.verifiedRevenue)}</strong><span>Total verified amount</span></article>
      </div>

      <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Reg #, name, team name, txn ID…">
        <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All payments</option>
          <option value="pending">Pending verification</option>
          <option value="paid">Verified</option>
          <option value="refunded">Refunded</option>
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
                <h3>{r.participant_name} {r.team_name ? `(Team: ${r.team_name})` : ""}</h3>
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
                <th>Participant / Captain</th>
                <th>Team Roster</th>
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
                    {r.team_name ? <div className="muted-line font-bold">Team: {r.team_name}</div> : null}
                  </td>
                  <td>
                    {r.team_name || (r.team_members && r.team_members.length > 0) ? (
                      <span className="dash-badge payment-pending">
                        1 Cap + {(r.team_members || []).length} Members
                      </span>
                    ) : (
                      <span className="text-white/40 text-xs font-mono">Solo</span>
                    )}
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
            style={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              maxHeight: "100%",
              width: "480px",
            }}
          >
            {/* Header */}
            <header
              className="admin-drawer-head"
              style={{ flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.75rem" }}
            >
              <h2>Payment Review &amp; Squad Roster</h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setActive(null)}>Close</button>
            </header>

            {/* Body */}
            <div
              className="admin-drawer-body"
              style={{ flex: "1 1 auto", overflowY: "auto", padding: "0.75rem 0" }}
            >
              <p><strong>Reg #:</strong> {active.registration_number}</p>
              <p><strong>Captain / Student:</strong> {active.participant_name}</p>
              {active.team_name && <p><strong>Team Name:</strong> {active.team_name}</p>}
              <p><strong>Institution:</strong> {active.college_name}</p>
              <p><strong>Event:</strong> {active.event_title}</p>
              <p><strong>Amount:</strong> {money(active.payment_amount)}</p>
              <p><strong>Method:</strong> {active.payment_method || "—"}</p>
              <p><strong>Transaction ID:</strong> {active.payment_transaction_id || "—"}</p>
              <p><strong>Status:</strong> <StatusChip status={active.payment_status} /></p>

              {active.payment_status === "refunded" && (
                <div style={{
                  padding: "0.6rem 0.8rem",
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  borderRadius: "8px",
                  marginTop: "0.5rem",
                  fontSize: "0.85rem",
                }}>
                  <p style={{ color: "#f87171", fontWeight: "bold", margin: "0 0 0.25rem 0" }}>↩ Refund Processed</p>
                  <p style={{ margin: "0.15rem 0" }}><strong>Refunded Amount:</strong> {money(active.refund_amount)}</p>
                  {active.refund_transaction_id && <p style={{ margin: "0.15rem 0" }}><strong>Refund Txn Ref:</strong> {active.refund_transaction_id}</p>}
                  {active.refund_notes && <p style={{ margin: "0.15rem 0" }}><strong>Notes:</strong> {active.refund_notes}</p>}
                  {active.refunded_at && <p style={{ margin: "0.15rem 0", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>{new Date(active.refunded_at).toLocaleString()}</p>}
                </div>
              )}

              {active.payment_proof_url ? (
                <div style={{ marginTop: "0.75rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Captain Payment Proof:</span>
                  <a href={active.payment_proof_url} target="_blank" rel="noreferrer" className="admin-proof-link" style={{ display: "block", marginTop: "0.3rem" }}>
                    <img src={active.payment_proof_url} alt="Payment proof" className="admin-proof-image" />
                    <span style={{ display: "block", marginTop: "0.3rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                      Click image to open full size ↗
                    </span>
                  </a>
                </div>
              ) : null}

              {/* Team Members List Breakdown */}
              {active.team_members && active.team_members.length > 0 && (
                <div style={{ marginTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h4 style={{ fontSize: "0.9rem", color: "#d4af37", margin: 0 }}>
                      Team Members Verification ({active.team_members.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowSquadModal(true)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.72rem", color: "#fbbf24", borderColor: "rgba(245, 158, 11, 0.4)", cursor: "pointer" }}
                    >
                      View Full Roster ↗
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {active.team_members.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          padding: "0.6rem",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          fontSize: "0.8rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong>{m.name}</strong>
                          <StatusChip status={m.payment_status} />
                        </div>
                        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", margin: "0.2rem 0" }}>
                          {[m.phone, m.email].filter(Boolean).join(" · ")}
                        </p>
                        {(m.college_name || m.department || m.register_number) && (
                          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", margin: "0.15rem 0" }}>
                            {[m.college_name, m.department, m.register_number ? `Roll: ${m.register_number}` : null].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", margin: "0.15rem 0" }}>
                          Txn: {m.payment_transaction_id || "None"}
                        </p>
                        {m.payment_proof_url && (
                          <a href={m.payment_proof_url} target="_blank" rel="noreferrer" style={{ color: "#00d2ff", fontSize: "0.75rem" }}>
                            View Member Proof ↗
                          </a>
                        )}
                        <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem" }}>
                          {m.finance_status !== "verified" && (
                            <button
                              type="button"
                              className="btn btn-gold btn-sm"
                              style={{ padding: "0.2rem 0.6rem", fontSize: "0.7rem" }}
                              onClick={() => handleVerifyMember(m.id, "verified")}
                            >
                              ✓ Verify Member
                            </button>
                          )}
                          {m.finance_status !== "rejected" && (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ padding: "0.2rem 0.6rem", fontSize: "0.7rem" }}
                              onClick={() => handleVerifyMember(m.id, "rejected")}
                            >
                              ✕ Reject Member
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions for Captain / Primary */}
            <footer
              className="admin-drawer-actions"
              style={{
                flexShrink: 0,
                borderTop: "1px solid rgba(255,255,255,0.12)",
                paddingTop: "0.85rem",
                marginTop: "0",
                gap: "0.75rem",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {active.payment_status !== "paid" && (
                <button
                  type="button"
                  className="btn btn-gold"
                  style={{ flex: 1, minWidth: "100px" }}
                  onClick={() => setConfirmAction("verify")}
                >
                  ✓ VERIFY CAPTAIN
                </button>
              )}
              {active.payment_status === "paid" && (
                <>
                  <div style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 1rem",
                    background: "rgba(16,185,129,0.15)",
                    border: "1px solid #10b981",
                    borderRadius: "8px",
                    color: "#10b981",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                  }}>
                    ✓ Captain Payment Verified
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ color: "#f87171", borderColor: "rgba(248,113,113,0.4)" }}
                    onClick={() => {
                      setRefundAmount(active.payment_amount || 0);
                      setRefundTxnId("");
                      setRefundNotes("");
                      setShowRefundModal(true);
                    }}
                  >
                    ↩ ISSUE REFUND
                  </button>
                </>
              )}
              {active.payment_status !== "rejected" && active.payment_status !== "failed" && active.payment_status !== "refunded" && (
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1, minWidth: "100px" }}
                  onClick={() => setConfirmAction("reject")}
                >
                  ✕ REJECT
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
            ? "This marks the primary/captain payment as verified and adds it to verified revenue."
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

      {showRefundModal && active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D1126] border border-red-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white font-excon">Process Registration Refund</h2>
            <p className="text-xs text-white/60">
              Issuing refund for <strong>{active.participant_name}</strong> (Reg #{active.registration_number}).
            </p>
            <form onSubmit={handleRefundSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-white/70 mb-1">Refund Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">Refund Transaction ID / Reference</label>
                <input
                  type="text"
                  placeholder="Bank UTR / UPI Ref ID"
                  value={refundTxnId}
                  onChange={(e) => setRefundTxnId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">Refund Reason / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Reason for refund approval"
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 font-bold transition-colors"
                >
                  {busy ? "Processing…" : "Confirm Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSquadModal && active && (
        <SquadMembersDetailModal
          isOpen={showSquadModal}
          onClose={() => setShowSquadModal(false)}
          registration={active}
          onStatusUpdate={async (reg, field, val) => {
            setBusy(true);
            try {
              const res = await updateAdminRegistration(reg.id, { [field]: val });
              setRows((prev) => prev.map((r) => (r.id === reg.id ? { ...r, ...res.data } : r)));
              setActive({ ...active, ...res.data });
            } catch {
              setError("Failed to update registration status.");
            } finally {
              setBusy(false);
            }
          }}
          isUpdating={busy}
        />
      )}
    </div>
  );
}
