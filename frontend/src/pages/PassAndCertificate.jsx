import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { getCertificate, getRegistrationPass } from "../services/api";
import { PAGE_IMAGES } from "../utils/assets";

export function ParticipantPass() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
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

  if (loading) return <LoadingState message="Loading pass…" />;
  if (error || !data) return <ErrorState message={error || "Pass not found"} />;

  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    data.registration_number || ""
  )}`;

  return (
    <>
      <PageHeader
        eyebrow="Participant Pass"
        title={data.registration_number}
        subtitle={data.event_title}
        image={PAGE_IMAGES.login}
      />
      <section className="section page-content">
        <div className="container narrow">
          <div className="pass-card detail-panel printable">
            <h3>{data.participant_name}</h3>
            <p>{data.college_name}</p>
            <p>
              {data.event_date} · {data.event_venue}
            </p>
            <p>
              Payment: <strong>{data.payment_status}</strong>
              {data.is_waiting_list ? " · Waiting list" : ""}
            </p>
            {(data.needs_accommodation ||
              data.needs_transport ||
              (data.food_preference && data.food_preference !== "none")) && (
              <p className="pass-ops">
                {data.food_preference !== "none" && <>Food: {data.food_preference} · </>}
                {data.needs_accommodation && <>Accommodation requested · </>}
                {data.needs_transport && <>Transport requested</>}
              </p>
            )}
            <img src={qr} alt="Registration QR" width={180} height={180} className="registration-qr" />
            <button type="button" className="btn btn-gold btn-full" onClick={() => window.print()}>
              Print / Save pass
            </button>
            <Link to="/student-dashboard" className="btn btn-outline btn-full">
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
        <div className="certificate-sheet detail-panel printable">
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
          <Link to="/results" className="btn btn-outline">
            Back to results
          </Link>
        </div>
      </div>
    </section>
  );
}
