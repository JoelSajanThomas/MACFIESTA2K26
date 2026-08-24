/**
 * MacFiesta 2026 fest-day helpers.
 * Calendar dates come from project brand config (do not invent dates).
 */
import { BRAND } from "./brand";

export const DAY1_DATE = BRAND.importantDates.festStart; // School Event Day
export const DAY2_DATE = BRAND.importantDates.festEnd; // College Event Day

export const DAY1_THEME = "Explore • Create • Compete";
export const DAY2_THEME = "Compete • Innovate • Entertain";

export const COLLEGE_ZONES = [
  { value: "all", label: "All" },
  { value: "Arena Zone", label: "Arena" },
  { value: "Tech Zone", label: "Tech" },
  { value: "Talent Zone", label: "Talent" },
  { value: "Creative Zone", label: "Creative" },
  { value: "Adventure / Mystery Zone", label: "Adventure / Mystery" },
  { value: "Business Zone", label: "Business" },
];

export function isActiveEvent(event) {
  return event && event.status !== "cancelled";
}

export function isSchoolEvent(event) {
  return event?.audience === "school" || event?.event_date === DAY1_DATE;
}

export function isCollegeEvent(event) {
  return event?.audience === "college" || event?.event_date === DAY2_DATE;
}

export function festDayLabel(event) {
  if (isSchoolEvent(event)) return "Day 1 — School";
  if (isCollegeEvent(event)) return "Day 2 — College";
  return null;
}

export function festDayTheme(event) {
  if (isSchoolEvent(event)) return DAY1_THEME;
  if (isCollegeEvent(event)) return DAY2_THEME;
  return "";
}

/** Format registration fee for public UI. School fees not supplied → TBD when 0. */
export function formatRegistrationFee(event) {
  if (event == null) return "TBD";
  const fee = event.registration_fee;
  if (fee === null || fee === undefined || fee === "") return "TBD";
  const n = Number(fee);
  if (Number.isNaN(n)) return "TBD";
  if (n === 0 && isSchoolEvent(event)) return "TBD";
  if (n === 0) return "Free";
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatPrizePool(event) {
  if (event?.prize_pool === null || event?.prize_pool === undefined || event?.prize_pool === "") {
    return null;
  }
  const n = Number(event.prize_pool);
  if (Number.isNaN(n) || n <= 0) return null;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatDurationHours(event) {
  if (!event?.event_time || !event?.event_end_time) return null;
  const [sh, sm] = String(event.event_time).split(":").map(Number);
  const [eh, em] = String(event.event_end_time).split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return null;
  const hours = mins / 60;
  if (Number.isInteger(hours)) return `${hours} Hour${hours === 1 ? "" : "s"}`;
  return `${hours} Hours`;
}
