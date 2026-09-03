import axios from "axios";
import { logout, notifyAuthChange } from "../utils/auth";
import { hashPassword } from "../utils/crypto";

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
});

/** Short-lived in-memory cache for public GETs (navigation / remount). */
const GET_CACHE_TTL_MS = 60_000;
const getCache = new Map();

function cachedGet(key, request) {
  const hit = getCache.get(key);
  if (hit?.data && Date.now() - hit.at < GET_CACHE_TTL_MS) {
    return Promise.resolve(hit.data);
  }
  if (hit?.pending) return hit.pending;
  const pending = request()
    .then((res) => {
      getCache.set(key, { at: Date.now(), data: res });
      return res;
    })
    .catch((err) => {
      getCache.delete(key);
      throw err;
    });
  getCache.set(key, { at: 0, pending });
  return pending;
}

export function invalidateApiGetCache(prefix) {
  if (!prefix) {
    getCache.clear();
    return;
  }
  for (const key of [...getCache.keys()]) {
    if (key.startsWith(prefix)) getCache.delete(key);
  }
}

export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SERVER_BASE}${normalized}`;
}

export function getEvents() {
  return cachedGet("events", () => api.get("/events/"));
}

export function getEvent(id) {
  return api.get(`/events/${id}/`);
}

export function getResults() {
  return cachedGet("results", () => api.get("/results/"));
}

export function getGallery() {
  return cachedGet("gallery", () => api.get("/gallery/"));
}

export function getAnnouncements(asAdmin = false) {
  const config = asAdmin ? { headers: authHeaders() } : {};
  return api.get("/announcements/", config);
}

export function getPublicStats() {
  return api.get("/public/stats/");
}

export function getPublicFestConfig() {
  return cachedGet("public:config", () => api.get("/public/config/"));
}

export function getInstitutions() {
  return api.get("/public/institutions/");
}

export function suggestInstitution(name) {
  return api.post("/public/institutions/", { name });
}

export function getDashboardStats() {
  return api.get("/dashboard/stats/", { headers: authHeaders() });
}

export function getStaffDirectory() {
  return api.get("/admin/staff/", { headers: authHeaders() });
}

export async function createStaffAccount(data) {
  const payload = { ...data };
  if (payload.temporary_password) {
    payload.temporary_password = await hashPassword(payload.temporary_password);
  }
  return api.post("/admin/staff/", payload, { headers: authHeaders() });
}

export async function updateStaffAccount(id, data) {
  const payload = { ...data };
  if (payload.temporary_password) {
    payload.temporary_password = await hashPassword(payload.temporary_password);
  }
  return api.patch(`/admin/staff/${id}/`, payload, { headers: authHeaders() });
}

export function getParticipantList(params = {}) {
  return api.get("/admin/participants/", { headers: authHeaders(), params });
}

export async function createParticipant(data) {
  const payload = { ...data };
  if (payload.password) payload.password = await hashPassword(payload.password);
  if (payload.password_confirm) payload.password_confirm = await hashPassword(payload.password_confirm);
  return api.post("/admin/participants/", payload, { headers: authHeaders() });
}

export async function updateParticipant(id, data) {
  const payload = { ...data };
  if (payload.password) payload.password = await hashPassword(payload.password);
  if (payload.password_confirm) payload.password_confirm = await hashPassword(payload.password_confirm);
  return api.patch(`/admin/participants/${id}/`, payload, { headers: authHeaders() });
}

export function exportParticipantsCSV() {
  // Returns a URL that the browser can follow to trigger CSV download
  const token = localStorage.getItem("access_token") || "";
  const base = api.defaults.baseURL || "";
  return `${base}/admin/participants/?export=csv&token=${encodeURIComponent(token)}`;
}


export function getCurrentUser() {
  return api.get("/auth/me/", { headers: authHeaders() });
}

export function getAdminRegistrations() {
  return api.get("/admin/registrations/", { headers: authHeaders() });
}

export function verifyRegistrationLookup(q) {
  return api.get("/admin/verification/lookup/", {
    headers: authHeaders(),
    params: { q },
  });
}

export function verifyCheckIn(data) {
  return api.post("/admin/verification/check-in/", data, { headers: authHeaders() });
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

export function createRegistrationBatch(data) {
  return api.post("/registrations/batch/", data, { headers: authHeaders() });
}

export function cancelRegistration(id) {
  return api.post(`/registrations/${id}/cancel/`, {}, { headers: authHeaders() });
}

export function submitRegistrationPayment(id, { payment_transaction_id, payment_proof, payment_method }) {
  const form = new FormData();
  form.append("payment_transaction_id", payment_transaction_id || "");
  if (payment_method) form.append("payment_method", payment_method);
  if (payment_proof) form.append("payment_proof", payment_proof);
  return api.post(`/registrations/${id}/submit-payment/`, form, adminConfig(form));
}

export function submitRegistrationPaymentBatch({
  payment_batch_id,
  payment_transaction_id,
  payment_proof,
  payment_method,
}) {
  const form = new FormData();
  form.append("payment_batch_id", payment_batch_id || "");
  form.append("payment_transaction_id", payment_transaction_id || "");
  if (payment_method) form.append("payment_method", payment_method);
  if (payment_proof) form.append("payment_proof", payment_proof);
  return api.post(`/registrations/submit-payment-batch/`, form, adminConfig(form));
}

export function getRegistrationPass(id) {
  return api.get(`/registrations/${id}/pass/`, { headers: authHeaders() });
}

export function createTeamRegistration(data) {
  return api.post("/registrations/team/create/", data, { headers: authHeaders() });
}

export function inviteTeamMember(registrationId, data) {
  return api.post(`/registrations/${registrationId}/team/invite/`, data, { headers: authHeaders() });
}

export function removeTeamMember(registrationId, memberId) {
  return api.post(`/registrations/${registrationId}/team/remove-member/`, { member_id: memberId }, { headers: authHeaders() });
}

export function submitMemberPayment(registrationId, memberId, { payment_transaction_id, payment_proof, payment_method }) {
  const form = new FormData();
  form.append("member_id", memberId);
  form.append("payment_transaction_id", payment_transaction_id || "");
  if (payment_method) form.append("payment_method", payment_method);
  if (payment_proof) form.append("payment_proof", payment_proof);
  return api.post(`/registrations/${registrationId}/team/member-payment/`, form, adminConfig(form));
}

export function getMyInvitations() {
  return api.get("/registrations/invitations/my/", { headers: authHeaders() });
}

export function respondTeamInvitation({ invitation_id, action }) {
  return api.post("/registrations/invitations/respond/", { invitation_id, action }, { headers: authHeaders() });
}

export function searchStudents(q) {
  return api.get("/registrations/students/search/", { headers: authHeaders(), params: { q } });
}

export function adminVerifyMemberFinance(memberId, data) {
  return api.post(`/admin/team-members/${memberId}/verify-finance/`, data, { headers: authHeaders() });
}

export function adminVerifyMemberOrganizer(memberId, data) {
  return api.post(`/admin/team-members/${memberId}/verify-organizer/`, data, { headers: authHeaders() });
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

export async function login(credentials) {
  const payload = { ...credentials };
  if (payload.password) {
    payload.password = await hashPassword(payload.password);
  }
  return axios.post(`${API_BASE}/auth/login/`, payload);
}

export async function registerAccount(data) {
  const payload = { ...data };
  if (payload.password) payload.password = await hashPassword(payload.password);
  if (payload.password_confirm) payload.password_confirm = await hashPassword(payload.password_confirm);
  return axios.post(`${API_BASE}/auth/register/`, payload);
}

export function requestPasswordReset(email) {
  return axios.post(`${API_BASE}/auth/password-reset/`, { email });
}

export async function confirmPasswordReset(data) {
  const payload = { ...data };
  if (payload.password) payload.password = await hashPassword(payload.password);
  if (payload.password_confirm) payload.password_confirm = await hashPassword(payload.password_confirm);
  return axios.post(`${API_BASE}/auth/password-reset/confirm/`, payload);
}

export async function changePassword(data) {
  const payload = { ...data };
  if (payload.current_password) payload.current_password = await hashPassword(payload.current_password);
  if (payload.password) payload.password = await hashPassword(payload.password);
  if (payload.password_confirm) payload.password_confirm = await hashPassword(payload.password_confirm);
  return api.post("/auth/change-password/", payload, { headers: authHeaders() });
}

/** Persist JWT pair from login or signup responses. */
export function storeAuthTokens({ access, refresh }) {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
  notifyAuthChange();
}

function adminConfig() {
  return { headers: authHeaders() };
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
  return cachedGet("cms:site-settings", () => api.get("/cms/site-settings/"));
}

export function updateSiteSettings(id, data) {
  invalidateApiGetCache("cms:");
  return api.patch(`/cms/site-settings/${id}/`, data, adminConfig(data));
}

export function patchCmsHomepageSection(id, data) {
  invalidateApiGetCache("cms-homepage-sections");
  return api.patch(`/cms/homepage-sections/${id}/`, data, adminConfig(data));
}

// --- Accommodation & Hospitality ---
export function getHostels() {
  return cachedGet("hostels", () => api.get("/hostels/"));
}

export function createAccommodationBooking(data) {
  return api.post("/accommodation/bookings/", data);
}

export function getMyAccommodationBookings() {
  return api.get("/accommodation/bookings/my_bookings/", { headers: authHeaders() });
}

export function getAdminAccommodationBookings() {
  return api.get("/accommodation/bookings/", { headers: authHeaders() });
}

export function updateAdminAccommodationBooking(id, data) {
  return api.patch(`/accommodation/bookings/${id}/`, data, adminConfig(data));
}

export function getHospitalityStats() {
  return api.get("/admin/hospitality/stats/", { headers: authHeaders() });
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
  return api.get(`/cms/highlights/${id}/`, { headers: authHeaders() });
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
  return api.get(`/cms/categories/${id}/`, { headers: authHeaders() });
}

export function getEventFormats(asAdmin = false) {
  if (asAdmin) return api.get("/cms/formats/", { headers: authHeaders() });
  return cachedGet("cms:formats", () => api.get("/cms/formats/"));
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
  return api.get(`/cms/formats/${id}/`, { headers: authHeaders() });
}

export function getGuestProfiles(asAdmin = false) {
  if (asAdmin) return api.get("/cms/guests/", { headers: authHeaders() });
  return cachedGet("cms:guests", () => api.get("/cms/guests/"));
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
  return api.get(`/cms/guests/${id}/`, { headers: authHeaders() });
}

export function getThemeSections(asAdmin = false) {
  if (asAdmin) return api.get("/cms/theme/", { headers: authHeaders() });
  return cachedGet("cms:theme", () => api.get("/cms/theme/"));
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
  return api.get(`/cms/theme/${id}/`, { headers: authHeaders() });
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
  return api.get(`/cms/testimonials/${id}/`, { headers: authHeaders() });
}

export function getFAQs(asAdmin = false) {
  const config = asAdmin ? { headers: authHeaders() } : {};
  return api.get("/cms/faqs/", config);
}
export const getFaqs = getFAQs;

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
  return api.get(`/cms/faqs/${id}/`, { headers: authHeaders() });
}

export function getSponsors(asAdmin = false) {
  if (asAdmin) return api.get("/cms/sponsors/", { headers: authHeaders() });
  return cachedGet("cms:sponsors", () => api.get("/cms/sponsors/"));
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
  return api.get(`/cms/sponsors/${id}/`, { headers: authHeaders() });
}

export function getFestRewindItems(asAdmin = false) {
  if (asAdmin) return api.get("/cms/rewind/", { headers: authHeaders() });
  return cachedGet("cms:rewind", () => api.get("/cms/rewind/"));
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
  return api.get(`/cms/rewind/${id}/`, { headers: authHeaders() });
}

export function getHomepageSections(asAdmin = false) {
  if (asAdmin) return api.get("/cms/homepage-sections/", { headers: authHeaders() });
  return cachedGet("cms:homepage-sections", () => api.get("/cms/homepage-sections/"));
}

export function updateHomepageSection(id, data) {
  return api.patch(`/cms/homepage-sections/${id}/`, data, adminConfig(data));
}

export async function purgeAllRegisteredData(password) {
  const hashed = await hashPassword(password);
  return api.post(
    "/admin/purge-registered-data/",
    { password: hashed, raw_password: password },
    { headers: authHeaders() }
  );
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
