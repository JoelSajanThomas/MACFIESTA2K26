import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const SERVER_BASE = API_BASE.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SERVER_BASE}${path.startsWith("/") ? path : `/${path}`}`;
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

export function getAnnouncements() {
  return api.get("/announcements/");
}

export function getDashboardStats() {
  return api.get("/dashboard/stats/");
}

export function getCurrentUser() {
  return api.get("/auth/me/", { headers: authHeaders() });
}

export function getAdminRegistrations() {
  return api.get("/admin/registrations/", { headers: authHeaders() });
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

export function login(credentials) {
  return axios.post(`${API_BASE}/auth/login/`, credentials);
}

export { API_BASE, SERVER_BASE };
export default api;
