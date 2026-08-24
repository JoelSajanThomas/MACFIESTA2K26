import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatusChip from "../components/theme/StatusChip";
import BrandLogo from "../components/BrandLogo";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { getCertificate, getPublicFestConfig, getRegistrationPass } from "../services/api";
import { applyPublicFestConfig, registrationQrImageUrl } from "../utils/registrationFees";
import { PAGE_IMAGES } from "../utils/assets";
import { BRAND } from "../utils/brand";
import { UNIVERSES } from "../theme/roster";
import { ORIGINAL_BACKGROUNDS } from "../theme/originalAssets";
import { LOADING_MESSAGES } from "../theme/roster";

export function ParticipantPass() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [universe, setUniverse] = useState("red");

  useEffect(() => {
    let mounted = true;
    getPublicFestConfig()
      .then((res) => {
        if (mounted) applyPublicFestConfig(res.data);
      })
      .catch(() => {});
    getRegistrationPass(id)
      .then((res) => {
        if (mounted) setData(res.data);
      })
      .catch(() => {
        if (mounted) setError("Could not load your participant pass.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <LoadingState message={LOADING_MESSAGES[3]} variant="multiverse" />;
  if (error || !data) return <ErrorState message={error || "Pass not found"} />;

  const qrPayload = data.registration_number || data.pass_token || "";
  const qr = registrationQrImageUrl(qrPayload, 200);
  const entryStatus = data.entry_qr_status || "PENDING";
  const paymentOk = data.payment_status === "paid" || data.payment_status === "waived" || !(Number(data.payment_amount) > 0);
  const uni = UNIVERSES[universe] || UNIVERSES.red;

  return (
    <>
      <PageHeader
        eyebrow="Hero Pass"
        title={data.registration_number}
        subtitle={data.event_title}
        image={PAGE_IMAGES.login}
      />
      <section className="section page-content">
        <div className="container narrow">
          <div className="pass-universe-toggle print-hide" role="group" aria-label="Universe visual">
            <button
              type="button"
              className={`chip${universe === "red" ? " active" : ""}`}
              onClick={() => setUniverse("red")}
            >
              Red Universe
            </button>
            <button
              type="button"
              className={`chip${universe === "blue" ? " active" : ""}`}
              onClick={() => setUniverse("blue")}
            >
              Blue Universe
            </button>
          </div>

          <div
            className={`pass-card hero-pass detail-panel printable hero-pass--${universe}`}
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.97), rgba(255,255,255,0.99)), url(${ORIGINAL_BACKGROUNDS.pass})`,
            }}
          >
            <img src={uni.emblem} alt="" className="hero-pass__watermark" width={120} height={120} aria-hidden="true" />
            <BrandLogo className="pass-brand" />
            <p className="section-eyebrow">{BRAND.festFullName}</p>
            <p className="hero-pass__label">Hero Identity</p>
            <h3>{data.participant_name}</h3>
            <p>{data.college_name}</p>

            <p className="hero-pass__label">Mission Assignment</p>
            <p>
              <strong>Event:</strong> {data.event_title}
            </p>
            <p>
              {data.event_date} · {data.event_venue}
            </p>
            <p>
              <strong>Registration:</strong> {data.registration_number}
            </p>
            {data.team_name && (
              <p>
                <strong>Team:</strong> {data.team_name}
              </p>
            )}

            <p className="hero-pass__label">Access Status</p>
            <p style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              <StatusChip status={data.payment_status} />
            <StatusChip status={paymentOk ? "verified" : "pending"} label={`Entry QR: ${entryStatus}`} />
              {data.is_waiting_list ? <StatusChip status="waitlisted" /> : null}
            </p>

            <p className="hero-pass__label">Verification Clearance</p>
            <p>
              {data.attendance_marked ? (
                <StatusChip status="verified" />
              ) : (
                <StatusChip status="pending" label="Check-in pending" />
              )}
            </p>

            {(data.needs_accommodation ||
              (data.food_preference && data.food_preference !== "none")) && (
              <p className="pass-ops">
                {data.food_preference !== "none" && <>Food: {data.food_preference}</>}
                {data.food_preference !== "none" && data.needs_accommodation ? " · " : null}
                {data.needs_accommodation && <>Accommodation requested</>}
              </p>
            )}
            <img src={qr} alt="Registration QR" width={180} height={180} className="registration-qr" style={{ opacity: paymentOk ? 1 : 0.55 }} />
            <button type="button" className="btn btn-gold btn-full print-keep" onClick={() => window.print()}>
              Print / Save pass
            </button>
            <Link to="/student-dashboard" className="btn btn-outline btn-full print-hide">
              Back to dashboard
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function CertificatePage() {
  const { resultId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCertificate(resultId)
      .then((res) => {
        if (mounted) setData(res.data);
      })
      .catch(() => {
        if (mounted) setError("Certificate not available.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [resultId]);

  if (loading) return <LoadingState message="Loading certificate…" />;
  if (error || !data) return <ErrorState message={error || "Not found"} />;

  return (
    <section className="section page-content certificate-page">
      <div className="container narrow">
        <div
          className="certificate-sheet detail-panel printable"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.96), #fff), url(${ORIGINAL_BACKGROUNDS.certificate})`,
          }}
        >
          <p className="section-eyebrow">{data.fest_name}</p>
          <h1>Certificate of Achievement</h1>
          <p>This is to certify that</p>
          <h2>{data.participant_name}</h2>
          <p>of {data.college_name}</p>
          <p>
            secured <strong>{data.position}</strong> in <strong>{data.event_title}</strong>
          </p>
          {data.remarks && <p>{data.remarks}</p>}
          <p className="certificate-date">Issued {data.issued_at}</p>
          <button type="button" className="btn btn-gold" onClick={() => window.print()}>
            Print certificate
          </button>
          <Link to="/results" className="btn btn-outline print-hide">
            Back to results
          </Link>
        </div>
      </div>
    </section>
  );
}
