export const SCHEDULE_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "tech", label: "Tech" },
  { value: "arts", label: "Arts" },
  { value: "sports", label: "Sports" },
  { value: "management", label: "Management" },
  { value: "general", label: "General" },
];

export function parseEventDateTime(event) {
  const [h, m, s = "0"] = (event.event_time || "00:00:00").split(":");
  const dt = new Date(event.event_date);
  dt.setHours(Number(h), Number(m), Number(s), 0);
  return dt;
}

export function getEventStatus(event, now = new Date()) {
  const eventDt = parseEventDateTime(event);
  if (eventDt < now) return "completed";

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(event.event_date);
  eventDay.setHours(0, 0, 0, 0);

  if (eventDay.getTime() === today.getTime()) return "today";
  return "upcoming";
}

export const STATUS_LABELS = {
  upcoming: "Upcoming",
  today: "Today",
  completed: "Completed",
};

export function formatScheduleTime(timeStr) {
  if (!timeStr) return "TBA";
  const [h, m] = timeStr.split(":");
  const dt = new Date();
  dt.setHours(Number(h), Number(m));
  return dt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function formatDayLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "long" });
}

export function formatDayDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDateTime(event) {
  return `${formatDayDate(event.event_date)} · ${formatScheduleTime(event.event_time)}`;
}

export function sortEvents(events) {
  return [...events].sort((a, b) => {
    const da = `${a.event_date}T${a.event_time}`;
    const db = `${b.event_date}T${b.event_time}`;
    return da.localeCompare(db);
  });
}

export function filterScheduleEvents(events, category, search) {
  let filtered = events;

  if (category !== "all") {
    filtered = filtered.filter((e) => e.category === category);
  }

  const q = search.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q)
    );
  }

  return filtered;
}

export function groupEventsByDate(events) {
  const sorted = sortEvents(events);
  return sorted.reduce((acc, ev) => {
    const key = ev.event_date;
    if (!acc[key]) {
      acc[key] = { date: key, events: [] };
    }
    acc[key].events.push(ev);
    return acc;
  }, {});
}

export function getUpcomingEvents(events, limit = 5, now = new Date()) {
  return sortEvents(events)
    .filter((e) => parseEventDateTime(e) >= now)
    .slice(0, limit);
}
