import { lazy, Suspense } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import AdminGate from "./components/admin/AdminGate";
import AdminLayout from "./components/admin/AdminLayout";
import LoadingState from "./components/ui/LoadingState";
import "./App.css";
import "./styles/refined.css";
import "./styles/home-classic.css";
import "./styles/mobile-install.css";
import "./styles/production-polish.css";
import "./styles/motion.css";

const Home = lazy(() => import("./pages/Home"));
const Events = lazy(() => import("./pages/Events"));
const EventDetails = lazy(() => import("./pages/EventDetails"));
const Results = lazy(() => import("./pages/Results"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Schedule = lazy(() => import("./pages/Schedule"));
const About = lazy(() => import("./pages/About"));
const History = lazy(() => import("./pages/History"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Committees = lazy(() => import("./pages/Committees"));
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
const AdminInsights = lazy(() => import("./pages/admin/AdminInsights"));
const AdminVerification = lazy(() => import("./pages/admin/AdminVerification"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
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
const AdminContentDashboard = lazy(() => import("./pages/admin/cms/AdminContentDashboard"));
const AdminSiteSettingsForm = lazy(() => import("./pages/admin/cms/AdminSiteSettingsForm"));
const AdminHomepageSectionsList = lazy(() => import("./pages/admin/cms/AdminHomepageSectionsList"));
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

export default function App() {
  return (
    <div className="app">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="main-content" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:idOrSlug" element={<EventDetails />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/results" element={<Results />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/about" element={<About />} />
            <Route path="/history" element={<History />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/committees" element={<Committees />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
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
              <Route path="verification" element={<AdminVerification />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="schedule" element={<AdminSchedule />} />
              <Route path="events" element={<AdminEventsList />} />
              <Route path="events/new" element={<AdminEventForm />} />
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
        </Suspense>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
