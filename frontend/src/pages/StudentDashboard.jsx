import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { getCurrentUser, getMyRegistrations, getEvents, isLoggedIn, cancelRegistration } from "../services/api";
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
      <div className="student-dashboard">
        <PageHeader eyebrow="My Fest" title="Student Dashboard" subtitle="View your event registrations." />
        <section className="section page-content">
          <div className="container narrow">
            <EmptyState
              icon="🔐"
              title="Login required"
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
        eyebrow="My Fest"
        title="Student Dashboard"
        subtitle={`Welcome back, ${user?.username}`}
      />
      <section className="section page-content student-dashboard">
        <div className="container">
          <div className="student-dash-summary">
            <div className="student-stat-card">
              <span className="student-stat-value">{registrations.length}</span>
              <span className="student-stat-label">Events Registered</span>
            </div>
            <div className="student-user-card detail-panel">
              <h3>Account</h3>
              <dl className="detail-facts">
                <div><dt>Username</dt><dd>{user?.username}</dd></div>
                <div><dt>Email</dt><dd>{user?.email || "—"}</dd></div>
              </dl>
            </div>
          </div>

          <h2 className="student-section-title">My Registrations</h2>

          {registrations.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No registrations yet"
              message="Browse competitions and register for events you're interested in."
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
                      <span className={`dash-badge payment-${reg.payment_status}`}>
                        {reg.payment_status}
                      </span>
                      {reg.is_waiting_list && (
                        <span className="dash-badge payment-pending">waiting list</span>
                      )}
                    </div>
                    <p className="student-reg-number">Reg #{reg.registration_number}</p>
                    <ul className="student-reg-meta">
                      <li><strong>Date</strong>{ev ? formatDate(ev.event_date) : "—"}</li>
                      <li><strong>Time</strong>{ev ? formatScheduleTime(ev.event_time) : "—"}</li>
                      <li><strong>Venue</strong>{ev?.venue || "—"}</li>
                      <li><strong>Participant</strong>{reg.participant_name}</li>
                      {reg.approval_status && (
                        <li><strong>Status</strong>{reg.approval_status}</li>
                      )}
                    </ul>
                    <div className="student-reg-actions">
                      <Link to={detailPath} className="btn btn-card">View Event</Link>
                      <Link to={`/pass/${reg.id}`} className="btn btn-card">Digital Pass / QR</Link>
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
