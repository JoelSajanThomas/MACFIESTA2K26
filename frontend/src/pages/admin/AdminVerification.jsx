import { useCallback, useEffect, useRef, useState } from "react";

import LoadingState from "../../components/ui/LoadingState";

import ErrorState from "../../components/ui/ErrorState";

import { verifyCheckIn, verifyRegistrationLookup } from "../../services/api";



function statusBannerClass(vStatus) {

  if (vStatus === "VALID") return "is-valid";

  if (vStatus === "ALREADY CHECKED IN") return "is-valid";

  if (vStatus === "PENDING") return "is-pending";

  return "is-bad";

}



function statusTitle(vStatus, paymentStatus) {

  if (vStatus === "VALID") return "VALID";

  if (vStatus === "ALREADY CHECKED IN") return "ALREADY CHECKED IN";

  if (vStatus === "CANCELLED") return "CANCELLED";

  if (vStatus === "INVALID") return "INVALID QR";

  if (vStatus === "PENDING" || paymentStatus === "pending" || paymentStatus === "rejected") {

    return "PAYMENT PENDING";

  }

  return vStatus || "PENDING";

}



/**

 * Simplest ops screen: Scan QR → status → Check in.

 */

export default function AdminVerification() {

  const [query, setQuery] = useState("");

  const [match, setMatch] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [empty, setEmpty] = useState(false);

  const [scanning, setScanning] = useState(false);

  const [scanError, setScanError] = useState("");

  const [busy, setBusy] = useState(false);

  const scannerRef = useRef(null);

  const html5Ref = useRef(null);



  const lookup = useCallback((raw) => {

    const q = String(raw || "").trim();

    if (q.length < 3) {

      setMatch(null);

      setEmpty(false);

      setError("");

      return;

    }

    setLoading(true);

    setError("");

    setEmpty(false);

    verifyRegistrationLookup(q)

      .then((res) => {

        setMatch(res.data);

        setEmpty(false);

      })

      .catch((err) => {

        setMatch(null);

        if (err?.response?.status === 404) setEmpty(true);

        else setError("Unable to connect to server. Try again.");

      })

      .finally(() => setLoading(false));

  }, []);



  async function stopScanner() {

    try {

      if (html5Ref.current) {

        await html5Ref.current.stop();

        await html5Ref.current.clear();

        html5Ref.current = null;

      }

    } catch {

      /* ignore */

    }

    setScanning(false);

  }



  async function startScanner() {

    setScanError("");

    setScanning(true);

    try {

      const { Html5Qrcode } = await import("html5-qrcode");

      await stopScanner();

      setScanning(true);

      const scanner = new Html5Qrcode("mf-qr-reader");

      html5Ref.current = scanner;

      await scanner.start(

        { facingMode: "environment" },

        { fps: 8, qrbox: { width: 240, height: 240 } },

        (decoded) => {

          const text = String(decoded || "").trim();

          if (!text) return;

          setQuery(text);

          lookup(text);

          stopScanner();

        },

        () => {}

      );

    } catch (err) {

      setScanning(false);

      setScanError(

        err?.message?.includes("Permission") || err?.name === "NotAllowedError"

          ? "Camera permission denied. Allow camera, or search by registration number."

          : "Camera unavailable. Search by registration number instead."

      );

    }

  }



  useEffect(() => () => {

    stopScanner();

  }, []);



  async function handleCheckIn() {

    if (!match?.id) return;

    setBusy(true);

    setError("");

    try {

      const res = await verifyCheckIn({

        id: match.id,

        registration_number: match.registration_number,

      });

      setMatch(res.data);

    } catch (err) {

      setError(

        err?.response?.data?.detail || "Payment must be verified before check-in."

      );

    } finally {

      setBusy(false);

    }

  }



  const vStatus = match?.verification_status;

  const title = statusTitle(vStatus, match?.payment_status);

  const paymentLabel =

    match?.payment_status === "paid" || match?.payment_status === "waived"

      ? "Verified"

      : match?.payment_status === "rejected"

        ? "Rejected"

        : "Pending";



  return (

    <div className="admin-page admin-verification admin-ops-page">

      <header className="admin-ops-header">

        <p className="section-eyebrow">Verification</p>

        <h1>Student Verification</h1>

        <p>Scan the registration QR or search the registration number.</p>

      </header>



      <div className="detail-panel verify-panel">
        <div className="verify-hero-scan" style={{ marginBottom: "1.5rem" }}>
          {!scanning ? (
            <button type="button" className="btn btn-gold" onClick={startScanner}>
              SCAN QR
            </button>
          ) : (
            <button type="button" className="btn btn-outline" onClick={stopScanner}>
              Stop scanner
            </button>
          )}
        </div>

        <form
          className="verify-search-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim().length >= 3) lookup(query);
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
            marginTop: "1.25rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <label
            htmlFor="reg-search"
            style={{
              display: "block",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.85)",
              letterSpacing: "0.02em",
            }}
          >
            Search registration number
          </label>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              id="reg-search"
              type="search"
              placeholder="MCF26-…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              style={{
                flex: "1 1 240px",
                minWidth: "220px",
                padding: "0.65rem 1rem",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(0, 0, 0, 0.4)",
                color: "#ffffff",
                fontSize: "0.95rem",
              }}
            />
            <button
              type="submit"
              className="btn btn-outline"
              disabled={query.trim().length < 3}
              style={{ minHeight: "42px", padding: "0 1.25rem" }}
            >
              Search
            </button>
          </div>
        </form>

        {scanError ? <p className="form-error" role="alert" style={{ marginTop: "1rem" }}>{scanError}</p> : null}

        <div

          id="mf-qr-reader"

          ref={scannerRef}

          className={`mf-qr-reader${scanning ? " is-active" : ""}`}

          hidden={!scanning}

        />

      </div>



      {loading && <LoadingState message="Looking up registration…" />}

      {error && <ErrorState message={error} />}

      {!loading && empty && (

        <p className="verification-empty" role="status">

          No registration found.

        </p>

      )}



      {match && (

        <div className="verification-result detail-panel verify-panel">

          <p className={`verify-status-banner ${statusBannerClass(vStatus)}`}>{title}</p>

          <h2 style={{ fontSize: "22px", margin: "0 0 0.75rem" }}>{match.participant_name}</h2>

          <dl className="verification-dl">

            <dt>Registration #</dt>
            <dd style={{ fontSize: "1.15rem", fontWeight: 700 }}>{match.registration_number}</dd>
            <dt>Institution</dt>
            <dd>{match.college_name}</dd>
            <dt>Event</dt>
            <dd>{match.event_title}</dd>
            <dt>Payment</dt>
            <dd>{paymentLabel}</dd>
            <dt>Gate Desk</dt>
            <dd>
              <span className={`admin-badge-status ${(match.verification_attendance_marked || match.attendance_marked) ? "admin-badge-status--active" : "admin-badge-status--draft"}`}>
                {(match.verification_attendance_marked || match.attendance_marked) ? "Verified & Checked In" : "Pending Gate Check-in"}
              </span>
            </dd>
            <dt>Event Arena</dt>
            <dd>
              <span className={`admin-badge-status ${match.event_attendance_marked ? "admin-badge-status--active" : "admin-badge-status--draft"}`}>
                {match.event_attendance_marked ? "Present at Event Arena" : "Awaiting Event Call"}
              </span>
            </dd>
          </dl>

          {vStatus === "PENDING" ? (
            <p className="form-error" role="alert">
              Payment must be verified before check-in.
            </p>
          ) : null}

          <div className="admin-ops-actions" style={{ marginTop: "1rem" }}>
            {!(match.verification_attendance_marked || match.attendance_marked) && vStatus === "VALID" ? (
              <button type="button" className="btn btn-gold" disabled={busy} onClick={handleCheckIn}>
                {busy ? "Saving…" : "CHECK IN AT GATE"}
              </button>
            ) : (match.verification_attendance_marked || match.attendance_marked) ? (
              <div style={{ color: "#4ade80", fontWeight: 700, fontSize: "0.95rem" }}>
                ✓ Gate Attendance Verified
              </div>
            ) : null}
          </div>

        </div>

      )}

    </div>

  );

}


