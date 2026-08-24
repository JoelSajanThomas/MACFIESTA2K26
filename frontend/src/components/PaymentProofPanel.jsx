import { useMemo, useState } from "react";
import StatusChip from "./theme/StatusChip";
import { submitRegistrationPayment, submitRegistrationPaymentBatch } from "../services/api";
import {
  MACFIESTA_PAYMENT,
  paymentQrImageUrl,
  paymentAmountQrImageUrl,
  buildUpiPayLink,
} from "../utils/registrationFees";

function money(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

/**
 * Shown only AFTER registration submit.
 * Auto-fills transaction field with server payment_reference (stored in DB).
 * True GPay UTR cannot be fetched without a payment gateway — reference is the secure stand-in.
 */
export default function PaymentProofPanel({
  registration,
  registrations,
  paymentAmountTotal,
  payment = MACFIESTA_PAYMENT,
  onUpdated,
}) {
  const regs = useMemo(() => {
    if (Array.isArray(registrations) && registrations.length) return registrations;
    return registration ? [registration] : [];
  }, [registration, registrations]);

  const primary = regs[0] || null;
  const batchId = primary?.payment_batch_id || "";
  const paymentReference = primary?.payment_reference || "";

  const amount = useMemo(() => {
    if (paymentAmountTotal != null && paymentAmountTotal !== "") {
      return Number(paymentAmountTotal) || 0;
    }
    return regs.reduce((sum, r) => sum + (Number(r.payment_amount) || 0), 0);
  }, [regs, paymentAmountTotal]);

  const [txnId, setTxnId] = useState(
    () => primary?.payment_transaction_id || paymentReference || ""
  );
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  if (!primary) return null;

  const status = primary.payment_status;
  const entryStatus = primary.entry_qr_status || "PENDING";
  const payNote = paymentReference || primary.registration_number || "MacFiesta";
  const staticQr = paymentQrImageUrl(payment, 220);
  const amountQr = payment.upiId ? paymentAmountQrImageUrl(payment, amount, payNote, 220) : "";
  const upiLink = buildUpiPayLink(payment, { amount, note: payNote });

  if (amount <= 0 || status === "waived") {
    return (
      <div className="payment-proof-panel detail-panel">
        <h4>Payment</h4>
        <p className="muted-line">No payment required for this registration.</p>
        <StatusChip status="waived" label="Cleared" />
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="payment-proof-panel detail-panel">
        <h4>Payment verified</h4>
        <p>Finance has verified your payment. Your entry QR is valid for check-in.</p>
        <StatusChip status="paid" label="Paid / Verified" />
        <p className="muted-line">
          Entry QR status: <strong>{entryStatus}</strong>
        </p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setOk("");
    try {
      const payload = {
        payment_transaction_id: txnId.trim() || paymentReference,
        payment_proof: file,
      };
      let res;
      if (batchId && regs.length > 1) {
        res = await submitRegistrationPaymentBatch({
          payment_batch_id: batchId,
          ...payload,
        });
        setOk("Payment proof submitted for all selected events. Finance will verify soon.");
        onUpdated?.(res.data?.registrations || regs);
      } else {
        res = await submitRegistrationPayment(primary.id, payload);
        setOk("Payment proof submitted. Finance will verify it soon.");
        setFile(null);
        onUpdated?.(res.data);
      }
      setFile(null);
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.payment_transaction_id?.[0] ||
        data?.payment_proof?.[0] ||
        data?.detail ||
        "Could not submit payment proof.";
      setError(typeof msg === "string" ? msg : "Could not submit payment proof.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="payment-proof-panel detail-panel payment-proof-panel--post">
      <h4>Complete payment</h4>
      <p className="muted-line">
        Registration saved. Pay the total below, then upload your UPI screenshot. Entry QR stays{" "}
        <strong>PENDING</strong> until Finance verifies.
      </p>

      {regs.length > 1 ? (
        <ul className="payment-event-list">
          {regs.map((r) => (
            <li key={r.id}>
              <span>{r.event_title || `Event #${r.event}`}</span>
              <strong>{money(r.payment_amount)}</strong>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="payment-amount-box">
        <span>Amount to pay</span>
        <strong>{money(amount)}</strong>
      </div>

      {paymentReference ? (
        <p className="payment-ref-banner">
          Auto payment reference (saved): <strong>{paymentReference}</strong>
          <span className="muted-line"> — already filled below; keep it in the UPI note.</span>
        </p>
      ) : null}

      <div className="payment-qr-block">
        <p className="registration-number-label">Scan to pay</p>
        {staticQr ? (
          <img className="payment-qr-image" src={staticQr} alt="Payment QR" width={220} height={220} />
        ) : null}
        {amountQr ? (
          <img
            className="payment-qr-image"
            src={amountQr}
            alt={`UPI QR for ${money(amount)}`}
            width={220}
            height={220}
          />
        ) : null}
        {upiLink ? (
          <a className="btn btn-gold btn-full registration-pay-open" href={upiLink}>
            Open UPI / GPay for {money(amount)}
          </a>
        ) : null}
        <p>
          <strong>Pay to:</strong> {payment.accountName}
        </p>
        {payment.upiId ? <p>UPI: {payment.upiId}</p> : null}
        <p className="registration-pay-note">{payment.instructions}</p>
      </div>

      <div className="payment-status-row">
        <StatusChip status={status} />
        <span className="muted-line">Entry QR: {entryStatus}</span>
      </div>

      <form className="payment-proof-form" onSubmit={handleSubmit}>
        <label>
          Transaction / reference ID
          <input
            type="text"
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder={paymentReference || "UPI Ref / Bank UTR"}
            required
            disabled={busy}
          />
          <span className="field-hint">
            Prefills your MacFiesta reference. You may replace it with the UPI Ref from GPay after paying.
          </span>
        </label>
        <label>
          Payment screenshot
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required={!primary.payment_proof_uploaded}
            disabled={busy}
          />
        </label>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        {ok ? <p className="form-success">{ok}</p> : null}
        <button type="submit" className="btn btn-gold" disabled={busy || !txnId.trim()}>
          {busy ? "Submitting…" : "Submit payment proof"}
        </button>
      </form>
    </div>
  );
}
