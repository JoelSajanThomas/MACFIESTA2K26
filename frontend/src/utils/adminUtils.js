export const EVENT_CATEGORY_OPTIONS = [
  { value: "tech", label: "Tech" },
  { value: "arts", label: "Arts" },
  { value: "sports", label: "Sports" },
  { value: "management", label: "Management" },
  { value: "general", label: "General" },
];

export const EVENT_STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const POSITION_OPTIONS = [
  { value: "first", label: "First Prize" },
  { value: "second", label: "Second Prize" },
  { value: "third", label: "Third Prize" },
  { value: "special", label: "Special Mention" },
];

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseApiError(err) {
  const data = err.response?.data;
  if (!data) return "Request failed. Please try again.";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  const key = Object.keys(data)[0];
  if (key) {
    const val = data[key];
    return Array.isArray(val) ? val[0] : String(val);
  }
  return "Request failed. Please try again.";
}

export function exportCsv(filename, rows) {
  const csv = rows.map((row) =>
    row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportExcel(filename, rows) {
  const tsv = rows.map((row) => row.map((cell) => String(cell ?? "").replace(/\t/g, " ")).join("\t")).join("\n");
  const blob = new Blob(["\uFEFF" + tsv], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".xls") ? filename : `${filename.replace(/\.csv$/i, "")}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}
