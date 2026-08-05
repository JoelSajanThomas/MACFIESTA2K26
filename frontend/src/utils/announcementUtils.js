import { ANNOUNCEMENT_PLACEHOLDERS } from "./constants";

export function formatAnnouncementDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getActiveAnnouncements(announcements = []) {
  return announcements.filter((a) => a.is_active !== false);
}

export function resolveAnnouncements(announcements = []) {
  const active = getActiveAnnouncements(announcements);
  if (active.length > 0) return active;
  return ANNOUNCEMENT_PLACEHOLDERS;
}

export function getLastUpdated(announcements = []) {
  const dates = announcements
    .map((a) => a.updated_at || a.created_at)
    .filter(Boolean)
    .map((d) => new Date(d).getTime());
  if (!dates.length) return null;
  return new Date(Math.max(...dates));
}

export function isUsingPlaceholders(announcements = []) {
  return getActiveAnnouncements(announcements).length === 0;
}
