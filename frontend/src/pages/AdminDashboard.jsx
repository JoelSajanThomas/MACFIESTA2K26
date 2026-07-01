import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import OverviewCards from "../components/dashboard/OverviewCards";
import EventTable from "../components/dashboard/EventTable";
import RegistrationsTable from "../components/dashboard/RegistrationsTable";
import ResultsTable from "../components/dashboard/ResultsTable";
import UpcomingEvents from "../components/dashboard/UpcomingEvents";
import LatestAnnouncements from "../components/dashboard/LatestAnnouncements";
import QuickActions from "../components/dashboard/QuickActions";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import {
  getDashboardStats,
  getEvents,
  getResults,
  getAdminRegistrations,
  getCurrentUser,
  getAnnouncements,
  isLoggedIn,
} from "../services/api";
import { isUnauthorized, logout } from "../utils/auth";

function DashSection({ title, subtitle, children }) {
  return (
    <section className="dash-section">
      <div className="dash-section-head">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default function AdminDashboard() {
  const [authState, setAuthState] = useState("checking");
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [results, setResults] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      setAuthState("guest");
      return;
    }

    getCurrentUser()
      .then((res) => {
        if (!res.data.is_staff && !res.data.is_superuser) {
          setAuthState("denied");
          return;
        }
        setUser(res.data);
        setAuthState("authorized");
      })
      .catch((err) => {
        if (isUnauthorized(err)) logout();
        setAuthState("guest");
      });
  }, []);

  useEffect(() => {
    if (authState !== "authorized") return;

    setError("");
    setDataLoading(true);
    Promise.all([
      getDashboardStats(),
      getEvents(),
      getAdminRegistrations(),
      getResults(),
      getAnnouncements(),
    ])
      .then(([statsRes, eventsRes, regsRes, resultsRes, annRes]) => {
        setStats(statsRes.data);
        setEvents(eventsRes.data);
        setRegistrations(regsRes.data);
        setResults(resultsRes.data);
        setAnnouncements(annRes.data);
      })
      .catch(() => setError("Failed to load dashboard data. Please try again."))
      .finally(() => setDataLoading(false));
  }, [authState]);

  function retryLoad() {
    if (authState !== "authorized") return;
    setError("");
    setDataLoading(true);
    Promise.all([
      getDashboardStats(),
      getEvents(),
      getAdminRegistrations(),
      getResults(),
      getAnnouncements(),
    ])
      .then(([statsRes, eventsRes, regsRes, resultsRes, annRes]) => {
        setStats(statsRes.data);
        setEvents(eventsRes.data);
        setRegistrations(regsRes.data);
        setResults(resultsRes.data);
        setAnnouncements(annRes.data);
      })
      .catch(() => setError("Failed to load dashboard data. Please try again."))
      .finally(() => setDataLoading(false));
  }

  if (authState === "checking") {
    return (
      <div className="admin-dashboard">
        <div className="container dash-gate">
          <LoadingState message="Verifying access…" />
        </div>
      </div>
    );
  }

  if (authState === "guest") {
    return (
      <div className="admin-dashboard">
        <div className="container dash-gate">
          <motion.div
            className="dash-gate-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>Coordinator Dashboard</h1>
            <p>Please login with a staff account to access the admin dashboard.</p>
            <Link to="/login" className="btn btn-gold">Login</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (authState === "denied") {
    return (
      <div className="admin-dashboard">
        <div className="container dash-gate">
          <motion.div
            className="dash-gate-card denied"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>Access Denied</h1>
            <p>
              Your account does not have coordinator permissions. Contact a fest
              administrator if you need access.
            </p>
            <Link to="/" className="btn btn-outline">Back to Home</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const recentRegistrations = registrations.slice(0, 15);

  return (
    <div className="admin-dashboard">
      <header className="dash-header">
        <div className="container dash-header-inner">
          <div>
            <span className="section-eyebrow">MacFiesta Pro</span>
            <h1>Coordinator Dashboard</h1>
            <p>Signed in as <strong>{user?.username}</strong></p>
          </div>
          <Link to="/" className="btn btn-outline">View Public Site</Link>
        </div>
      </header>

      <div className="container dash-body">
        {error && <ErrorState message={error} onRetry={retryLoad} />}

        {dataLoading && !stats && <LoadingState message="Loading dashboard…" />}

        {stats && (
          <>
            <OverviewCards stats={stats} />

            <DashSection title="Upcoming Events" subtitle="Next 5 events on the fest calendar">
              <UpcomingEvents events={events} />
            </DashSection>

            <DashSection title="Latest Announcements" subtitle="Top 5 active fest updates">
              <LatestAnnouncements announcements={announcements} />
            </DashSection>

            <DashSection title="Event Overview" subtitle="Registration and result status per event">
              <EventTable events={events} />
            </DashSection>

            <DashSection
              title="Recent Registrations"
              subtitle={`Showing latest ${recentRegistrations.length} of ${registrations.length} total`}
            >
              <RegistrationsTable registrations={recentRegistrations} />
            </DashSection>

            <DashSection title="Results" subtitle="Published winners across all events">
              <ResultsTable results={results} />
            </DashSection>

            <DashSection title="Quick Actions" subtitle="Manage fest content">
              <QuickActions />
            </DashSection>
          </>
        )}
      </div>
    </div>
  );
}
