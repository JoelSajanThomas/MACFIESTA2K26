export function getSeatsRemaining(event) {
  const max = event?.max_participants ?? 0;
  const count = event?.participant_count ?? 0;
  return Math.max(0, max - count);
}

export function getSeatsFillPercent(event) {
  const max = event?.max_participants || 1;
  const count = event?.participant_count ?? 0;
  return Math.min(100, Math.round((count / max) * 100));
}

export function formatCategoryLabel(category) {
  if (!category) return "General";
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function formatRegistrationDeadline(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
