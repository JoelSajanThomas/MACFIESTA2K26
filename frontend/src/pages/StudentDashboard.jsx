import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import StatusChip from "../components/theme/StatusChip";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import PaymentProofPanel from "../components/PaymentProofPanel";
import { getCurrentUser, getMyRegistrations, getEvents, getPublicFestConfig, isLoggedIn, cancelRegistration } from "../services/api";
import { applyPublicFestConfig, MACFIESTA_PAYMENT } from "../utils/registrationFees";
import { isUnauthorized, logout } from "../utils/auth";
import { formatScheduleTime } from "../utils/scheduleUtils";
import { EASE_PREMIUM, MOTION } from "../utils/animations";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function StudentDashboard() {
  const [authState, setAuthState] = useState("checking");
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState("");

  const [busyId, setBusyId] = useState(null);
  const [payment, setPayment] = useState(() => ({ ...MACFIESTA_PAYMENT }));
  const [expandedPayId, setExpandedPayId] = useState(null);


  useEffect(() => {
    getPublicFestConfig()
      .then((res) => {
        applyPublicFestConfig(res.data);
        setPayment({ ...MACFIESTA_PAYMENT });
      })
      .catch(() => {});
  }, []);

  async function handleCancel(regId) {
    if (!window.confirm("Cancel this registration? If you were confirmed, the next waitlisted participant may be promoted.")) {
      return;
    }
    setBusyId(regId);
    try {
      await cancelRegistration(regId);
      load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not cancel registration.");
    } finally {
      setBusyId(null);
    }
  }

  const load = useCallback(() => {
    if (!isLoggedIn()) {
      setAuthState("guest");
      return;
    }

    setError("");
    Promise.all([getCurrentUser(), getMyRegistrations(), getEvents()])
      .then(([userRes, regsRes, eventsRes]) => {
        const eventMap = Object.fromEntries(eventsRes.data.map((e) => [e.id, e]));
        const merged = regsRes.data.map((r) => ({
          ...r,
          eventData: eventMap[r.event],
        }));
        setUser(userRes.data);
        setRegistrations(merged);
        setAuthState("ready");
      })
      .catch((err) => {
        if (isUnauthorized(err)) {
          logout();
          setAuthState("guest");
          return;
        }
        setError("Could not load your dashboard.");
        setAuthState("error");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (authState === "checking") {
    return (
      <div className="student-dashboard page-content container">
        <LoadingState message="Loading your dashboard…" />
      </div>
    );
  }

  if (authState === "guest") {
    return (
      <div className="student-dashboard student-command-cinematic">
        <PageHeader eyebrow="Hero Command Center" title="My Dashboard" subtitle="Registrations, passes, payment and verification status." />
        <section className="section page-content">
          <div className="container narrow">
            <EmptyState
              icon="🔐"
              title="Your clearance level does not permit access."
              message="Sign in to see your registered events and payment status."
              action={<Link to="/login" className="btn btn-gold">Login</Link>}
            />
          </div>
        </section>
      </div>
    );
  }

  if (authState === "error") {
    return (
      <div className="student-dashboard page-content container">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Participant"
        title="My Dashboard"
        subtitle={`Welcome, ${user?.full_name || user?.email || "participant"} — registrations, QR pass, and status.`}
      />
      <section className="section page-content student-dashboard student-command-cinematic">
        <div className="container">
          <div className="student-dash-summary stats-hud">
            <div className="student-stat-card stats-hud__item">
              <span className="student-stat-value stats-hud__value">{registrations.length}</span>
              <span className="student-stat-label stats-hud__label">Events Registered</span>
            </div>
            <div className="student-user-card detail-panel">
              <h3>Account</h3>
              <dl className="detail-facts">
                <div><dt>Name</dt><dd>{user?.full_name || "—"}</dd></div>
                <div><dt>Email</dt><dd>{user?.email || "—"}</dd></div>
              </dl>
            </div>
          </div>

          <h2 className="student-section-title">My Registrations</h2>

          {registrations.length === 0 ? (
            <EmptyState
              icon="📋"
              title="Your mission list is empty."
              message="Explore events and register to begin your MacFiesta journey."
              action={<Link to="/events" className="btn btn-gold">Browse Events</Link>}
            />
          ) : (
            <div className="student-regs-list">
              {registrations.map((reg, i) => {
                const ev = reg.eventData;
                const detailPath = ev ? `/events/${ev.slug || ev.id}` : "/events";
                return (
                  <motion.article
                    key={reg.id}
                    className="student-reg-card detail-panel"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * MOTION.stagger, duration: MOTION.reveal, ease: EASE_PREMIUM }}
                  >
                    <div className="student-reg-head">
                      <h3>{reg.event_title || ev?.title}</h3>
                      <StatusChip status={reg.payment_status} />
                      {reg.is_waiting_list && <StatusChip status="waitlisted" />}
                      {reg.attendance_marked && <StatusChip status="verified" label="Verified" />}
                      {reg.approval_status === "cancelled" && <StatusChip status="cancelled" />}
                    </div>
                    <p className="student-reg-number">Reg #{reg.registration_number}</p>
                    <ul className="student-reg-meta">
                      <li><strong>Date</strong>{ev ? formatDate(ev.event_date) : "—"}</li>
                      <li><strong>Time</strong>{ev ? formatScheduleTime(ev.event_time) : "—"}</li>
                      <li><strong>Venue</strong>{ev?.venue || "—"}</li>
                      <li><strong>Participant</strong>{reg.participant_name}</li>
                      {reg.approval_status && (
                        <li><strong>Status</strong><StatusChip status={reg.approval_status} /></li>
                      )}
                    </ul>
                    <div className="student-reg-actions">
                      <Link to={detailPath} className="btn btn-card">View Event</Link>
                      <Link to={`/pass/${reg.id}`} className="btn btn-gold">View Pass</Link>
                      {reg.payment_status !== "paid" && reg.payment_status !== "waived" && Number(reg.payment_amount) > 0 && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setExpandedPayId(expandedPayId === reg.id ? null : reg.id)}
                        >
                          {expandedPayId === reg.id ? "Hide payment" : "Pay / Upload proof"}
                        </button>
                      )}
                      {!reg.attendance_marked && reg.approval_status !== "cancelled" && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          disabled={busyId === reg.id}
                          onClick={() => handleCancel(reg.id)}
                        >
                          {busyId === reg.id ? "Cancelling…" : "Cancel"}
                        </button>
                      )}
                    </div>
                    {expandedPayId === reg.id ? (
                      <PaymentProofPanel
                        registration={reg}
                        payment={payment}
                        onUpdated={(data) =>
                          setRegistrations((prev) =>
                            prev.map((r) => (r.id === reg.id ? { ...r, ...data } : r))
                          )
                        }
                      />
                    ) : null}
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
