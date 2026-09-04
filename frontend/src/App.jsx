import { lazy, Suspense, useEffect } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ScrollDirector from "./components/ScrollDirector";
import MobileBottomBar from "./components/MobileBottomBar";
import AdminGate from "./components/admin/AdminGate";
import AdminLayout from "./components/admin/AdminLayout";
import LoadingState from "./components/ui/LoadingState";
import LoadingScreen from "./components/layout/LoadingScreen";
import PageGate from "./components/layout/PageGate";
import PageTransition from "./components/layout/PageTransition";
import CursorGlow from "./components/cinematic/CursorGlow";
import ParticleAtmosphere from "./components/cinematic/ParticleAtmosphere";
import JarvisAssistant from "./components/ui/JarvisAssistant";
import { MaintenanceGuard } from "./components/layout/MaintenanceGuard";
import { LoadingProvider, useLoading } from "./providers/LoadingProvider";
import "./App.css";
import "./styles/mobile-install.css";
import "./styles/admin-simple-ui.css";
import "./styles/production-polish.css";
import "./styles/checkout-events.css";

const Home = lazy(() => import("./pages/Home"));
const Events = lazy(() => import("./pages/Events"));
const EventDetails = lazy(() => import("./pages/EventDetails"));
const Results = lazy(() => import("./pages/Results"));
const Scoreboard = lazy(() => import("./pages/Scoreboard"));
const Accommodation = lazy(() => import("./pages/Accommodation"));
const Brochure = lazy(() => import("./pages/Brochure"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Rules = lazy(() => import("./pages/Rules"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Schedule = lazy(() => import("./pages/Schedule"));
const About = lazy(() => import("./pages/About"));
const History = lazy(() => import("./pages/History"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const PassPage = lazy(() =>
  import("./pages/PassAndCertificate").then((m) => ({ default: m.ParticipantPass }))
);
const CertificateRoute = lazy(() =>
  import("./pages/PassAndCertificate").then((m) => ({ default: m.CertificatePage }))
);
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Announcements = lazy(() => import("./pages/Announcements"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const Sponsors = lazy(() => import("./pages/Sponsors"));
const Checkout = lazy(() => import("./pages/Checkout"));
const AdminInsights = lazy(() => import("./pages/admin/AdminInsights"));
const AdminControls = lazy(() => import("./pages/admin/AdminControls"));
const AdminVerification = lazy(() => import("./pages/admin/AdminVerification"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminParticipantList = lazy(() => import("./pages/admin/AdminParticipantList"));
const AdminSchedule = lazy(() => import("./pages/admin/AdminSchedule"));
const AdminEventsList = lazy(() => import("./pages/admin/AdminEventsList"));
const AdminEventForm = lazy(() => import("./pages/admin/AdminEventForm"));
const AdminResultsList = lazy(() => import("./pages/admin/AdminResultsList"));
const AdminResultForm = lazy(() => import("./pages/admin/AdminResultForm"));
const AdminAnnouncementsList = lazy(() => import("./pages/admin/AdminAnnouncementsList"));
const AdminAnnouncementForm = lazy(() => import("./pages/admin/AdminAnnouncementForm"));
const AdminGalleryList = lazy(() => import("./pages/admin/AdminGalleryList"));
const AdminGalleryForm = lazy(() => import("./pages/admin/AdminGalleryForm"));
const AdminRegistrationsList = lazy(() => import("./pages/admin/AdminRegistrationsList"));
const AdminFinance = lazy(() => import("./pages/admin/AdminFinance"));
const AdminHospitality = lazy(() => import("./pages/admin/AdminHospitality"));
const AdminEventParticipants = lazy(() => import("./pages/admin/AdminEventParticipants"));
const AdminEventWinners = lazy(() => import("./pages/admin/AdminEventWinners"));
const AdminContentDashboard = lazy(() => import("./pages/admin/cms/AdminContentDashboard"));
const AdminSiteSettingsForm = lazy(() => import("./pages/admin/cms/AdminSiteSettingsForm"));
const AdminHomepageSectionsList = lazy(() => import("./pages/admin/cms/AdminHomepageSectionsList"));
const AdminInstitutions = lazy(() => import("./pages/admin/AdminInstitutions"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminThemeForm = lazy(() => import("./pages/admin/cms/AdminThemeForm"));
const AdminCmsList = lazy(() => import("./pages/admin/cms/AdminCmsList"));
const AdminCmsForm = lazy(() => import("./pages/admin/cms/AdminCmsForm"));

function PageLoader() {
  return (
    <div className="page-loader-wrap">
      <LoadingState message="Loading page…" />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:idOrSlug" element={<EventDetails />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/results" element={<Results />} />
      <Route path="/scoreboard" element={<Scoreboard />} />
      <Route path="/accommodation" element={<Accommodation />} />
      <Route path="/brochure" element={<Brochure />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/announcements" element={<Announcements />} />
      <Route path="/about" element={<About />} />
      <Route path="/history" element={<History />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/sponsors" element={<Sponsors />} />
      <Route path="/committees" element={<Navigate to="/events" replace />} />
      <Route path="/desks" element={<Navigate to="/login" replace />} />
      <Route path="/desk/:committeeSlug/login" element={<Navigate to="/login" replace />} />
      <Route path="/volunteer/login" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signin" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/dashboard" element={<Navigate to="/student-dashboard" replace />} />
      <Route path="/pass/:id" element={<PassPage />} />
      <Route path="/certificates/:resultId" element={<CertificateRoute />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      <Route
        path="/admin"
        element={
          <AdminGate>
            {(user) => <AdminLayout user={user} />}
          </AdminGate>
        }
      >
        <Route index element={<Navigate to="insights" replace />} />
        <Route path="insights" element={<AdminInsights />} />
        <Route path="controls" element={<AdminControls />} />
        <Route path="site-controls" element={<Navigate to="/admin/controls" replace />} />
        <Route path="verification" element={<AdminVerification />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="participant-list" element={<AdminParticipantList />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="events" element={<AdminEventsList />} />
        <Route path="events/new" element={<AdminEventForm />} />
        <Route path="events/:id/participants" element={<AdminEventParticipants />} />
        <Route path="events/:id/winners" element={<AdminEventWinners />} />
        <Route path="events/:id/edit" element={<AdminEventForm />} />
        <Route path="results" element={<AdminResultsList />} />
        <Route path="results/new" element={<AdminResultForm />} />
        <Route path="results/:id/edit" element={<AdminResultForm />} />
        <Route path="announcements" element={<AdminAnnouncementsList />} />
        <Route path="announcements/new" element={<AdminAnnouncementForm />} />
        <Route path="announcements/:id/edit" element={<AdminAnnouncementForm />} />
        <Route path="gallery" element={<AdminGalleryList />} />
        <Route path="gallery/new" element={<AdminGalleryForm />} />
        <Route path="gallery/:id/edit" element={<AdminGalleryForm />} />
        <Route path="registrations" element={<AdminRegistrationsList />} />
        <Route path="institutions" element={<AdminInstitutions />} />
        <Route path="payments" element={<AdminFinance />} />
        <Route path="finance" element={<Navigate to="/admin/payments" replace />} />
        <Route path="food" element={<Navigate to="/admin/hospitality?tab=food" replace />} />
        <Route path="hospitality" element={<AdminHospitality />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="content" element={<AdminContentDashboard />} />
        <Route path="content/site-settings" element={<AdminSiteSettingsForm />} />
        <Route path="content/homepage-sections" element={<AdminHomepageSectionsList />} />
        <Route path="content/theme" element={<AdminThemeForm />} />
        <Route path="content/:resource/new" element={<AdminCmsForm />} />
        <Route path="content/:resource/:id/edit" element={<AdminCmsForm />} />
        <Route path="content/:resource" element={<AdminCmsList />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppShell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const { markDone } = useLoading();

  useEffect(() => {
    if (isAdmin) markDone();
  }, [isAdmin, markDone]);

  /* Stop all audio immediately when navigating away from homepage */
  useEffect(() => {
    if (pathname !== "/") {
      try {
        window.dispatchEvent(new CustomEvent("macfiesta:stop-hero-audio"));
        document.querySelectorAll("audio").forEach((el) => {
          el.pause();
          el.currentTime = 0;
        });
      } catch {
        // Ignore errors during audio cleanup
      }
    }
  }, [pathname]);

  /* Clear public mobile-menu scroll lock when entering desks */
  useEffect(() => {
    if (!isAdmin) return;
    document.body.classList.remove("nav-menu-open");
    document.body.style.touchAction = "";
  }, [isAdmin]);

  const main = (
    <main id="main-content" className="main-content" tabIndex={-1}>
      <PageTransition disabled={isAdmin}>
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>
      </PageTransition>
    </main>
  );

  return (
    <div className={`app${isAdmin ? " app--admin" : ""}`}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {!isAdmin && <LoadingScreen />}
      {!isAdmin && <CursorGlow />}
      {!isAdmin && <ParticleAtmosphere />}
      {!isAdmin && <JarvisAssistant />}
      {isAdmin ? (
        main
      ) : (
        <MaintenanceGuard>
          <PageGate>
            <ScrollDirector />
            <Navbar />
            {main}
            <Footer />
            <MobileBottomBar />
            <ScrollToTop />
          </PageGate>
        </MaintenanceGuard>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LoadingProvider>
      <AppShell />
    </LoadingProvider>
  );
}
