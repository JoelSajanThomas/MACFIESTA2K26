export const POSITION_ORDER = ["first", "second", "third", "special"];

export const POSITION_META = {
  first: { label: "1st Prize", cls: "gold", filter: "first", rank: 1 },
  second: { label: "2nd Prize", cls: "silver", filter: "second", rank: 2 },
  third: { label: "3rd Prize", cls: "bronze", filter: "third", rank: 3 },
  special: { label: "Special Mention", cls: "special", filter: "special", rank: 4 },
};

export const FILTER_OPTIONS = [
  { value: "all", label: "All Results" },
  { value: "first", label: "First Prize" },
  { value: "second", label: "Second Prize" },
  { value: "third", label: "Third Prize" },
  { value: "special", label: "Special Mention" },
];

export function formatResultDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function groupResultsByEvent(results) {
  return Object.values(
    results.reduce((acc, r) => {
      if (!acc[r.event]) {
        acc[r.event] = {
          id: r.event,
          title: r.event_title,
          category: r.event_category,
          venue: r.event_venue,
          date: r.event_date,
          items: [],
        };
      }
      acc[r.event].items.push(r);
      return acc;
    }, {})
  );
}

export function sortByPosition(items) {
  return [...items].sort(
    (a, b) => POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position)
  );
}

export function sortEventGroups(groups, sortBy = "name") {
  const sorted = [...groups];
  if (sortBy === "date") {
    sorted.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return sorted;
  }
  sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  return sorted;
}

export function filterResults(results, positionFilter, searchQuery) {
  let filtered = results;

  if (positionFilter !== "all") {
    filtered = filtered.filter((r) => r.position === positionFilter);
  }

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (r) =>
        r.event_title?.toLowerCase().includes(q) ||
        r.participant_name?.toLowerCase().includes(q) ||
        r.college_name?.toLowerCase().includes(q)
    );
  }

  return filtered;
}
