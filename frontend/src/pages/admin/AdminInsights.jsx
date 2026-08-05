import { Link } from "react-router-dom";
import InsightsCards from "../../components/dashboard/InsightsCards";
import VolunteerOps from "../../components/dashboard/VolunteerOps";
import EventTable from "../../components/dashboard/EventTable";
import RegistrationsTable from "../../components/dashboard/RegistrationsTable";
import UpcomingEvents from "../../components/dashboard/UpcomingEvents";
import LatestAnnouncements from "../../components/dashboard/LatestAnnouncements";
import LaunchAssetReminder from "../../components/admin/LaunchAssetReminder";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import GenderDistributionChart from "../../components/dashboard/GenderDistributionChart";
import {
  getDashboardStats,
  getEvents,
  getAdminRegistrations,
  getAnnouncements,
  getCurrentUser,
} from "../../services/api";
import { useEffect, useState } from "react";

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

export default function AdminInsights() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCurrentUser(),
      getDashboardStats(),
      getEvents(),
      getAdminRegistrations(),
      getAnnouncements(),
    ])
      .then(([userRes, statsRes, eventsRes, regsRes, annRes]) => {
        setUser(userRes.data);
        setStats(statsRes.data);
        setEvents(eventsRes.data);
        setRegistrations(regsRes.data);
        setAnnouncements(annRes.data);
      })
      .catch(() => setError("Failed to load insights."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading insights…" />;
  if (error) return <ErrorState message={error} />;

  const recentRegistrations = registrations.slice(0, 12);

  return (
    <div className="admin-dashboard admin-insights-page">
      <header className="dash-header compact">
        <span className="section-eyebrow">Insights</span>
        <h1>Coordinator Dashboard</h1>
        <p>Signed in as <strong>{user?.username}</strong></p>
      </header>

      <LaunchAssetReminder />
      <InsightsCards stats={stats} />
      <GenderDistributionChart />

      <DashSection title="Volunteer Operations" subtitle="Quick links for fest desk workflows">
        <VolunteerOps />
      </DashSection>

      <DashSection title="Upcoming Events" subtitle="Next events on the calendar">
        <UpcomingEvents events={events} />
      </DashSection>

      <DashSection title="Latest Announcements">
        <LatestAnnouncements announcements={announcements} />
      </DashSection>

      <DashSection title="Event Overview">
        <EventTable events={events} />
      </DashSection>

      <DashSection
        title="Recent Registrations"
        subtitle={`Latest ${recentRegistrations.length} of ${registrations.length}`}
      >
        <RegistrationsTable registrations={recentRegistrations} />
        <Link to="/admin/registrations" className="home-text-link">View all registrations →</Link>
      </DashSection>
    </div>
  );
}
