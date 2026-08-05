import axios from "axios";
import { logout } from "../utils/auth";

/**
 * Resolve API base for desktop, LAN phone browsers, and Capacitor.
 * - VITE_API_BASE_URL always wins (required for production / APK builds).
 * - In Vite DEV, use same-origin `/api` so phones hit the Vite proxy.
 */
function resolveApiBase() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (import.meta.env.DEV) {
    return "/api";
  }

  // Production builds must set VITE_API_BASE_URL — never bake LAN IPs into the client.
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    const isLoopback = hostname === "localhost" || hostname === "127.0.0.1";
    if (hostname && !isLoopback) {
      return `${protocol}//${hostname}/api`;
    }
  }

  return "/api";
}

const API_BASE = resolveApiBase();
const SERVER_BASE = API_BASE.startsWith("http")
  ? API_BASE.replace(/\/api\/?$/, "")
  : "";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SERVER_BASE}${normalized}`;
}

export function getEvents() {
  return api.get("/events/");
}

export function getEvent(id) {
  return api.get(`/events/${id}/`);
}

export function getResults() {
  return api.get("/results/");
}

export function getGallery() {
  return api.get("/gallery/");
}

export function getAnnouncements(asAdmin = false) {
  const config = asAdmin ? { headers: authHeaders() } : {};
  return api.get("/announcements/", config);
}

export function getPublicStats() {
  return api.get("/public/stats/");
}

export function getDashboardStats() {
  return api.get("/dashboard/stats/", { headers: authHeaders() });
}

export function getCurrentUser() {
  return api.get("/auth/me/", { headers: authHeaders() });
}

export function getAdminRegistrations() {
  return api.get("/admin/registrations/", { headers: authHeaders() });
}

export function updateAdminRegistration(id, data) {
  return api.patch(`/admin/registrations/${id}/`, data, { headers: authHeaders() });
}

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function isLoggedIn() {
  return Boolean(getAccessToken());
}

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getMyRegistrations() {
  return api.get("/registrations/", { headers: authHeaders() });
}

export function createRegistration(data) {
  return api.post("/registrations/", data, { headers: authHeaders() });
}

export function cancelRegistration(id) {
  return api.post(`/registrations/${id}/cancel/`, {}, { headers: authHeaders() });
}

export function getRegistrationPass(id) {
  return api.get(`/registrations/${id}/pass/`, { headers: authHeaders() });
}

export function getCertificate(resultId) {
  return api.get(`/certificates/${resultId}/`);
}

export function getAttendanceReport(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/admin/reports/attendance/${qs ? `?${qs}` : ""}`, { headers: authHeaders() });
}

export function promoteWaitlist(eventId) {
  return api.post(`/admin/events/${eventId}/promote-waitlist/`, {}, { headers: authHeaders() });
}

export function login(credentials) {
  return axios.post(`${API_BASE}/auth/login/`, credentials);
}

export function registerAccount(data) {
  return axios.post(`${API_BASE}/auth/register/`, data);
}

export function requestPasswordReset(email) {
  return axios.post(`${API_BASE}/auth/password-reset/`, { email });
}

export function confirmPasswordReset(data) {
  return axios.post(`${API_BASE}/auth/password-reset/confirm/`, data);
}

export function changePassword(data) {
  return api.post("/auth/change-password/", data, { headers: authHeaders() });
}

/** Persist JWT pair from login or signup responses. */
export function storeAuthTokens({ access, refresh }) {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

function adminConfig(data) {
  const headers = authHeaders();
  if (data instanceof FormData) {
    return { headers };
  }
  return { headers };
}

export function createEvent(data) {
  return api.post("/events/", data, adminConfig(data));
}

export function updateEvent(id, data) {
  return api.patch(`/events/${id}/`, data, adminConfig(data));
}

export function deleteEvent(id) {
  return api.delete(`/events/${id}/`, { headers: authHeaders() });
}

export function createResult(data) {
  return api.post("/results/", data, adminConfig(data));
}

export function updateResult(id, data) {
  return api.patch(`/results/${id}/`, data, adminConfig(data));
}

export function deleteResult(id) {
  return api.delete(`/results/${id}/`, { headers: authHeaders() });
}

export function createAnnouncement(data) {
  return api.post("/announcements/", data, adminConfig(data));
}

export function updateAnnouncement(id, data) {
  return api.patch(`/announcements/${id}/`, data, adminConfig(data));
}

export function deleteAnnouncement(id) {
  return api.delete(`/announcements/${id}/`, { headers: authHeaders() });
}

export function createGalleryImage(data) {
  return api.post("/gallery/", data, adminConfig(data));
}

export function updateGalleryImage(id, data) {
  return api.patch(`/gallery/${id}/`, data, adminConfig(data));
}

export function deleteGalleryImage(id) {
  return api.delete(`/gallery/${id}/`, { headers: authHeaders() });
}

export function getGalleryItem(id) {
  return api.get(`/gallery/${id}/`);
}

export function getAnnouncement(id) {
  return api.get(`/announcements/${id}/`);
}

export function getResult(id) {
  return api.get(`/results/${id}/`);
}

// ── CMS ─────────────────────────────────────────────────────

export function getSiteSettings() {
  return api.get("/cms/site-settings/");
}

export function updateSiteSettings(id, data) {
  return api.patch(`/cms/site-settings/${id}/`, data, adminConfig(data));
}

export function createSiteSettings(data) {
  return api.post("/cms/site-settings/", data, adminConfig(data));
}

export function getHighlights(asAdmin = false) {
  const config = asAdmin ? { headers: authHeaders() } : {};
  return api.get("/cms/highlights/", config);
}

export function createHighlight(data) {
  return api.post("/cms/highlights/", data, adminConfig(data));
}

export function updateHighlight(id, data) {
  return api.patch(`/cms/highlights/${id}/`, data, adminConfig(data));
}

export function deleteHighlight(id) {
  return api.delete(`/cms/highlights/${id}/`, { headers: authHeaders() });
}

export function getHighlight(id) {
  return api.get(`/cms/highlights/${id}/`);
}

export function getCategoryContents(asAdmin = false) {
  const config = asAdmin ? { headers: authHeaders() } : {};
  return api.get("/cms/categories/", config);
}

export function createCategoryContent(data) {
  return api.post("/cms/categories/", data, adminConfig(data));
}

export function updateCategoryContent(id, data) {
  return api.patch(`/cms/categories/${id}/`, data, adminConfig(data));
}

export function deleteCategoryContent(id) {
  return api.delete(`/cms/categories/${id}/`, { headers: authHeaders() });
}

export function getCategoryContent(id) {
  return api.get(`/cms/categories/${id}/`);
}

export function getEventFormats(asAdmin = false) {
  const config = asAdmin ? { headers: authHeaders() } : {};
  return api.get("/cms/formats/", config);
}

export function createEventFormat(data) {
  return api.post("/cms/formats/", data, adminConfig(data));
}

export function updateEventFormat(id, data) {
  return api.patch(`/cms/formats/${id}/`, data, adminConfig(data));
}

export function deleteEventFormat(id) {
  return api.delete(`/cms/formats/${id}/`, { headers: authHeaders() });
}

export function getEventFormat(id) {
  return api.get(`/cms/formats/${id}/`);
}

export function getGuestProfiles(asAdmin = false) {
  const config = asAdmin ? { headers: authHeaders() } : {};
  return api.get("/cms/guests/", config);
}

export function createGuestProfile(data) {
  return api.post("/cms/guests/", data, adminConfig(data));
}

export function updateGuestProfile(id, data) {
  return api.patch(`/cms/guests/${id}/`, data, adminConfig(data));
}

export function deleteGuestProfile(id) {
  return api.delete(`/cms/guests/${id}/`, { headers: authHeaders() });
}

export function getGuestProfile(id) {
  return api.get(`/cms/guests/${id}/`);
}

export function getThemeSections(asAdmin = false) {
  const config = asAdmin ? { headers: authHeaders() } : {};
  return api.get("/cms/theme/", config);
}

export function createThemeSection(data) {
  return api.post("/cms/theme/", data, adminConfig(data));
}

export function updateThemeSection(id, data) {
  return api.patch(`/cms/theme/${id}/`, data, adminConfig(data));
}

export function deleteThemeSection(id) {
  return api.delete(`/cms/theme/${id}/`, { headers: authHeaders() });
}

export function getThemeSection(id) {
  return api.get(`/cms/theme/${id}/`);
}

export function getTestimonials(asAdmin = false) {
  const config = asAdmin ? { headers: authHeaders() } : {};
  return api.get("/cms/testimonials/", config);
}

export function createTestimonial(data) {
  return api.post("/cms/testimonials/", data, adminConfig(data));
}

export function updateTestimonial(id, data) {
  return api.patch(`/cms/testimonials/${id}/`, data, adminConfig(data));
}

export function deleteTestimonial(id) {
  return api.delete(`/cms/testimonials/${id}/`, { headers: authHeaders() });
}

export function getTestimonial(id) {
  return api.get(`/cms/testimonials/${id}/`);
}

export function getFAQs(asAdmin = false) {
  const config = asAdmin ? { headers: authHeaders() } : {};
  return api.get("/cms/faqs/", config);
}

export function createFAQ(data) {
  return api.post("/cms/faqs/", data, adminConfig(data));
}

export function updateFAQ(id, data) {
  return api.patch(`/cms/faqs/${id}/`, data, adminConfig(data));
}

export function deleteFAQ(id) {
  return api.delete(`/cms/faqs/${id}/`, { headers: authHeaders() });
}

export function getFAQ(id) {
  return api.get(`/cms/faqs/${id}/`);
}

export function getSponsors(asAdmin = false) {
  const config = asAdmin ? { headers: authHeaders() } : {};
  return api.get("/cms/sponsors/", config);
}

export function createSponsor(data) {
  return api.post("/cms/sponsors/", data, adminConfig(data));
}

export function updateSponsor(id, data) {
  return api.patch(`/cms/sponsors/${id}/`, data, adminConfig(data));
}

export function deleteSponsor(id) {
  return api.delete(`/cms/sponsors/${id}/`, { headers: authHeaders() });
}

export function getSponsor(id) {
  return api.get(`/cms/sponsors/${id}/`);
}

export function getFestRewindItems(asAdmin = false) {
  const config = asAdmin ? { headers: authHeaders() } : {};
  return api.get("/cms/rewind/", config);
}

export function createFestRewindItem(data) {
  return api.post("/cms/rewind/", data, adminConfig(data));
}

export function updateFestRewindItem(id, data) {
  return api.patch(`/cms/rewind/${id}/`, data, adminConfig(data));
}

export function deleteFestRewindItem(id) {
  return api.delete(`/cms/rewind/${id}/`, { headers: authHeaders() });
}

export function getFestRewindItem(id) {
  return api.get(`/cms/rewind/${id}/`);
}

export function getHomepageSections(asAdmin = false) {
  const config = asAdmin ? { headers: authHeaders() } : {};
  return api.get("/cms/homepage-sections/", config);
}

export function updateHomepageSection(id, data) {
  return api.patch(`/cms/homepage-sections/${id}/`, data, adminConfig(data));
}

let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) throw new Error("No refresh token");
  const res = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
  localStorage.setItem("access_token", res.data.access);
  if (res.data.refresh) {
    localStorage.setItem("refresh_token", res.data.refresh);
  }
  return res.data.access;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthError = error.response?.status === 401;
    const hadToken = Boolean(getAccessToken());
    const isRefreshRequest = original?.url?.includes("/auth/refresh/");
    const isLoginRequest = original?.url?.includes("/auth/login/");

    if (isAuthError && hadToken && original && !original._retry && !isRefreshRequest && !isLoginRequest) {
      original._retry = true;
      try {
        if (!refreshPromise) refreshPromise = refreshAccessToken();
        await refreshPromise;
        refreshPromise = null;
        original.headers = {
          ...original.headers,
          Authorization: `Bearer ${getAccessToken()}`,
        };
        return api(original);
      } catch {
        refreshPromise = null;
        logout();
      }
    } else if (isAuthError && hadToken && !isRefreshRequest && !isLoginRequest) {
      logout();
    }

    return Promise.reject(error);
  }
);

export { API_BASE, SERVER_BASE };
export default api;
