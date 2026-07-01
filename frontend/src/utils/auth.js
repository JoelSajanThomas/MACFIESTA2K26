export const AUTH_CHANGE_EVENT = "macfiesta-auth-change";

export function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  notifyAuthChange();
}

export function isUnauthorized(err) {
  return err?.response?.status === 401;
}
