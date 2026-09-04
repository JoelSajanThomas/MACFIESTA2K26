import { useMemo, useState } from "react";
import {
  RiShieldFlashLine,
  RiCheckboxCircleFill,
  RiQrCodeLine,
  RiHotelBedLine,
  RiTrophyLine,
  RiUploadCloud2Line,
  RiFileCopyLine,
  RiCheckLine,
  RiInformationLine,
  RiExternalLinkLine,
} from "react-icons/ri";
import StatusChip from "./theme/StatusChip";
import { submitRegistrationPayment, submitRegistrationPaymentBatch } from "../services/api";
import {
  MACFIESTA_PAYMENT,
  paymentQrImageUrl,
  hostelPaymentQrImageUrl,
  buildUpiPayLink,
  calculateBatchFees,
} from "../utils/registrationFees";

function money(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

/**
 * Modern Marvel Cinematic Payment & Proof Verification Component.
 * Supports dual QR (Events vs Hostel), UPI deep links, copied reference, and screenshot uploads.
 */
export default function PaymentProofPanel({
  registration,
  registrations,
  paymentAmountTotal,
  eventFeeTotal,
  accommodationFeeTotal,
  foodFeeTotal,
  hospitalityTotal,
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

  const fallbackFees = useMemo(() => {
    return calculateBatchFees(regs);
  }, [regs]);

  const hasAccommodation = useMemo(() => {
    if (accommodationFeeTotal != null && Number(accommodationFeeTotal) > 0) return true;
    if (hospitalityTotal != null && Number(hospitalityTotal) > 0) return true;
    return fallbackFees.hasAccommodation;
  }, [accommodationFeeTotal, hospitalityTotal, fallbackFees]);

  const stayAmount = useMemo(() => {
    if (accommodationFeeTotal != null && accommodationFeeTotal !== "") return Number(accommodationFeeTotal) || 0;
    return fallbackFees.accommodationFeeTotal;
  }, [accommodationFeeTotal, fallbackFees]);

  const foodAmount = useMemo(() => {
    if (foodFeeTotal != null && foodFeeTotal !== "") return Number(foodFeeTotal) || 0;
    return fallbackFees.foodFeeTotal;
  }, [foodFeeTotal, fallbackFees]);

  const totalHospitality = useMemo(() => {
    if (hospitalityTotal != null && hospitalityTotal !== "") return Number(hospitalityTotal) || 0;
    return stayAmount + foodAmount;
  }, [hospitalityTotal, stayAmount, foodAmount]);

  const totalAmount = useMemo(() => {
    if (paymentAmountTotal != null && paymentAmountTotal !== "") {
      return Number(paymentAmountTotal) || 0;
    }
    return fallbackFees.paymentAmountTotal;
  }, [paymentAmountTotal, fallbackFees]);

  const eventAmount = useMemo(() => {
    if (eventFeeTotal != null && eventFeeTotal !== "") return Number(eventFeeTotal) || 0;
    if (fallbackFees.eventFeeTotal > 0) return fallbackFees.eventFeeTotal;
    const diff = totalAmount - totalHospitality;
    return diff > 0 ? diff : 0;
  }, [eventFeeTotal, fallbackFees, totalAmount, totalHospitality]);

  const [txnId, setTxnId] = useState(
    () => primary?.payment_transaction_id || ""
  );
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrType, setQrType] = useState("events"); // 'events' | 'hostel'

  if (!primary) return null;

  const status = primary.payment_status;
  const entryStatus = primary.entry_qr_status || "PENDING";
  const payNote = paymentReference || primary.registration_number || "MacFiesta";

  const activeAmount = qrType === "hostel" ? (totalHospitality > 0 ? totalHospitality : totalAmount) : eventAmount;

  const eventQr = paymentQrImageUrl(payment, 220, { amount: eventAmount, note: `${payNote}-EVENT` });
  const hostelQr = hostelPaymentQrImageUrl(payment);
  const currentQr = qrType === "hostel" ? hostelQr : eventQr;
  const upiLink = buildUpiPayLink(
    qrType === "hostel"
      ? { ...payment, upiId: payment.hostelUpiId || payment.upiId, accountName: payment.hostelAccountName || payment.accountName }
      : payment,
    { amount: activeAmount, note: `${payNote}-${qrType.toUpperCase()}` }
  );

  function handleCopy(text) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (totalAmount <= 0 || status === "waived") {
    return (
      <div className="marvel-card p-6 rounded-3xl border border-metallic-gold/30 bg-[#0A0D1A]/95 text-left font-excon space-y-3">
        <div className="flex items-center gap-2 text-metallic-gold">
          <RiShieldFlashLine className="text-xl" />
          <h4 className="text-lg font-black uppercase tracking-wider text-white font-excon-black m-0">
            Payment Cleared
          </h4>
        </div>
        <p className="text-xs text-white/70 font-space m-0">
          No payment is required for this registration. Your entry pass is activated.
        </p>
        <StatusChip status="waived" label="Fee Cleared / Free" />
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="marvel-card p-6 rounded-3xl border border-emerald-500/40 bg-[#0A0D1A]/95 text-left font-excon space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xl">
              <RiCheckboxCircleFill />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">
                FINANCE CLEARED
              </span>
              <h4 className="text-lg font-black uppercase text-white font-excon-black m-0">
                Payment Verified
              </h4>
            </div>
          </div>
          <StatusChip status="paid" label="Verified &amp; Paid" />
        </div>
        <p className="text-xs text-white/80 font-space m-0 leading-relaxed">
          Finance has verified your transaction. Your entry QR pass is active and verified for check-in at the security gate.
        </p>
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono">
          <span className="text-white/50">ENTRY GATE STATUS:</span>
          <span className="text-emerald-400 font-bold uppercase">{entryStatus}</span>
        </div>
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
        payment_transaction_id: txnId.trim(),
        payment_proof: file,
      };
      let res;
      if (batchId && regs.length > 1) {
        res = await submitRegistrationPaymentBatch({
          payment_batch_id: batchId,
          ...payload,
        });
        setOk("Payment verification proof submitted for all selected missions. Finance will verify shortly.");
        onUpdated?.(res.data?.registrations || regs);
      } else {
        res = await submitRegistrationPayment(primary.id, payload);
        setOk("Payment verification proof submitted. Finance will verify your pass shortly.");
        setFile(null);
        onUpdated?.(res.data);
      }
      setFile(null);
    } catch (err) {
      const data = err?.response?.data;
      let msg = "Could not submit payment proof. Please verify file format and transaction ID.";
      if (typeof data === "string") {
        msg = data;
      } else if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        if (Array.isArray(val) && val.length) {
          msg = typeof val[0] === "string" ? val[0] : JSON.stringify(val[0]);
        } else if (typeof val === "string") {
          msg = val;
        } else if (data.detail) {
          msg = data.detail;
        }
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 font-excon text-left">
      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-metallic-gold/15 text-metallic-gold border border-metallic-gold/30 text-[10px] font-mono font-bold uppercase">
            Step 2 of 2
          </span>
          <span className="text-[11px] text-white/50 font-space">S.H.I.E.L.D. Secure Payment Protocol</span>
        </div>
        <h3 className="text-2xl font-black uppercase text-white font-excon-black tracking-tight">
          Payment Breakdown &amp; Pass Verification
        </h3>
        <p className="text-xs text-white/70 font-space leading-relaxed">
          {hasAccommodation
            ? "Your payment calculation is split into separate accounts for Event Entry Passes and Accommodation/Hostel Services."
            : "Pay the mission registration amount below to finalize entry pass approval."}
        </p>
      </div>

      {/* SEPARATE PAYMENT CALCULATION BOXES */}
      <div className={`grid grid-cols-1 ${hasAccommodation ? "sm:grid-cols-2" : "grid-cols-1"} gap-4`}>
        {/* 1. Event Registration Amount Card */}
        <div
          onClick={() => setQrType("events")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${qrType === "events"
              ? "bg-metallic-gold/15 border-metallic-gold shadow-[0_0_25px_rgba(212,175,55,0.3)] ring-1 ring-metallic-gold"
              : "bg-white/[0.02] border-white/10 hover:border-white/25"
            }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-[10px] uppercase tracking-wider font-bold text-metallic-gold font-mono flex items-center gap-1.5">
              <RiTrophyLine />
              <span>Event Entry Passes ({regs.length})</span>
            </span>
            {qrType === "events" && (
              <span className="px-2 py-0.5 rounded-full bg-metallic-gold text-black text-[9px] font-bold uppercase font-mono">
                Active QR
              </span>
            )}
          </div>
          <div className="pt-3 flex items-baseline justify-between">
            <span className="text-xs text-white/60 font-space">Beneficiary: MACFAST</span>
            <div className="text-2xl sm:text-3xl font-black text-metallic-gold font-excon-black">
              {money(eventAmount)}
            </div>
          </div>
        </div>

        {/* 2. Accommodation & Hospitality Amount Card (Separate) */}
        {hasAccommodation && (
          <div
            onClick={() => setQrType("hostel")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${qrType === "hostel"
                ? "bg-arc-cyan/15 border-arc-cyan shadow-[0_0_25px_rgba(0,212,255,0.3)] ring-1 ring-arc-cyan"
                : "bg-white/[0.02] border-white/10 hover:border-white/25"
              }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-arc-cyan font-mono flex items-center gap-1.5">
                <RiHotelBedLine />
                <span>Stay &amp; Food Services</span>
              </span>
              {qrType === "hostel" && (
                <span className="px-2 py-0.5 rounded-full bg-arc-cyan text-black text-[9px] font-bold uppercase font-mono">
                  Active QR
                </span>
              )}
            </div>
            <div className="pt-3 space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-white/60 font-space">
                  {stayAmount > 0 && foodAmount > 0
                    ? `Stay ${money(stayAmount)} + Meals ${money(foodAmount)}`
                    : "Beneficiary: Hostel Office"}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-arc-cyan font-excon-black">
                  {money(totalHospitality)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grand Combined Total Box */}
      {hasAccommodation && (
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono">
          <span className="text-white/60 uppercase font-bold">Total Combined Calculation:</span>
          <span className="text-white font-bold text-sm">
            Event {money(eventAmount)} + Hospitality {money(totalHospitality)} = <strong className="text-metallic-gold font-mono">{money(totalAmount)}</strong>
          </span>
        </div>
      )}

      {/* Saved Auto Reference Banner */}
      {paymentReference ? (
        <div className="p-3.5 rounded-2xl bg-metallic-gold/10 border border-metallic-gold/30 flex items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5 font-space">
            <span className="text-[10px] font-mono uppercase font-bold text-metallic-gold block">
              Auto Payment Reference:
            </span>
            <span className="text-white font-mono font-black text-sm">{paymentReference}</span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(paymentReference)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border border-white/15"
          >
            {copied ? <RiCheckLine className="text-emerald-400" /> : <RiFileCopyLine />}
            <span>{copied ? "Copied" : "Copy Ref"}</span>
          </button>
        </div>
      ) : null}

      {/* QR Code Segment */}
      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 text-center">
        {/* Dual Tab Buttons */}
        <div className="flex gap-2 p-1 bg-black/50 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setQrType("events")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all font-excon-black cursor-pointer flex items-center justify-center gap-2 ${qrType === "events"
                ? "bg-metallic-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                : "text-white/60 hover:text-white"
              }`}
          >
            <RiQrCodeLine className="text-sm" />
            <span>Event Pass QR</span>
          </button>
          <button
            type="button"
            onClick={() => setQrType("hostel")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all font-excon-black cursor-pointer flex items-center justify-center gap-2 ${qrType === "hostel"
                ? "bg-arc-cyan text-black shadow-[0_0_15px_rgba(0,212,255,0.4)]"
                : "text-white/60 hover:text-white"
              }`}
          >
            <RiHotelBedLine className="text-sm" />
            <span>Hostel Residency QR {hasAccommodation ? "★" : ""}</span>
          </button>
        </div>

        {/* QR Image Display */}
        <div className="flex flex-col items-center py-2">
          <div className="p-3 bg-white rounded-2xl shadow-[0_0_35px_rgba(212,175,55,0.3)] border-2 border-metallic-gold/50 inline-block">
            <img
              src={currentQr}
              alt={qrType === "hostel" ? "Hostel Payment QR" : "Event Payment QR"}
              width={220}
              height={220}
              className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] object-contain rounded-lg"
            />
          </div>
          <p className="text-xs text-white/70 font-space mt-3 max-w-sm mx-auto">
            {qrType === "hostel"
              ? "Scan with Google Pay, PhonePe, Paytm, or BHIM for on-campus hostel residency accommodation fees."
              : "Scan with Google Pay, PhonePe, Paytm, or BHIM for festival event pass registrations."}
          </p>
        </div>

        {/* Deep Link to UPI App if available */}
        {upiLink && (
          <a
            href={upiLink}
            className={`w-full py-3.5 px-4 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg font-excon-black inline-flex items-center justify-center gap-2 cursor-pointer ${qrType === "hostel"
                ? "bg-arc-cyan hover:bg-white text-black shadow-[0_0_20px_rgba(0,212,255,0.35)]"
                : "bg-metallic-gold hover:bg-white text-black shadow-[0_0_20px_rgba(212,175,55,0.35)]"
              }`}
          >
            <span>Open UPI / GPay App ({money(activeAmount)})</span>
            <RiExternalLinkLine className="text-sm" />
          </a>
        )}

        {/* Beneficiary Details */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-left font-space space-y-1.5">
          <div className="flex justify-between items-start gap-4">
            <span className="text-white/50 shrink-0">Beneficiary:</span>
            <span className="text-white font-bold text-right">
              {qrType === "hostel"
                ? (payment.hostelAccountName || "ST ALPHONSA HOSTEL")
                : payment.accountName}
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-white/50">UPI ID:</span>
            <span className="text-metallic-gold font-mono font-bold">
              {qrType === "hostel"
                ? (payment.hostelUpiId || "stalphonsahostel@iob")
                : payment.upiId}
            </span>
          </div>
          {payment.instructions && (
            <p className="text-[11px] text-white/60 pt-1 border-t border-white/5 m-0 italic">
              {payment.instructions}
            </p>
          )}
        </div>
      </div>

      {/* Verification Status Row */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs font-mono">
        <span className="text-white/50">CURRENT PASS STATUS:</span>
        <div className="flex items-center gap-2">
          <StatusChip status={status} />
          <span className="text-white/60 text-[11px]">QR: {entryStatus}</span>
        </div>
      </div>

      {/* Submission Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label
            htmlFor="txn-id-input"
            className="block text-[10px] uppercase font-bold tracking-wider text-white/60 font-excon-bold"
          >
            Transaction ID / UPI Reference / UTR *
          </label>
          <input
            id="txn-id-input"
            type="text"
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder="Please enter your transaction ID (e.g. 12-digit UPI UTR)"
            required
            disabled={busy}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-metallic-gold focus:outline-none text-white text-xs font-mono"
          />
          <span className="text-[10px] text-white/40 font-space block">
            Please enter your transaction ID / UTR reference from your payment receipt (Google Pay, PhonePe, Paytm, etc.).
          </span>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="payment-proof-file"
            className="block text-[10px] uppercase font-bold tracking-wider text-white/60 font-excon-bold flex items-center justify-between"
          >
            <span>Payment Screenshot / Proof</span>
            {primary.payment_proof_uploaded && (
              <span className="text-emerald-400 font-mono text-[10px]">Proof previously uploaded</span>
            )}
          </label>
          <div className="relative">
            <input
              id="payment-proof-file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required={!primary.payment_proof_uploaded}
              disabled={busy}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-space file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-black file:uppercase file:bg-metallic-gold/20 file:text-metallic-gold hover:file:bg-metallic-gold hover:file:text-black cursor-pointer"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-mono">
            <RiInformationLine className="shrink-0 text-base" />
            <span>{error}</span>
          </div>
        )}

        {ok && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono">
            <RiCheckboxCircleFill className="shrink-0 text-base" />
            <span>{ok}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-4 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] font-excon-black cursor-pointer inline-flex items-center justify-center gap-2"
          disabled={busy || !txnId.trim()}
        >
          <RiUploadCloud2Line className="text-base" />
          <span>{busy ? "Submitting Proof…" : "Submit Payment Verification Proof"}</span>
        </button>
      </form>
    </div>
  );
}
