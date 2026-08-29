import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const EVENT_CATEGORY_OPTIONS = [
  { value: "tech", label: "Tech" },
  { value: "arts", label: "Arts" },
  { value: "sports", label: "Sports" },
  { value: "management", label: "Management" },
  { value: "general", label: "General" },
];

export const EVENT_AUDIENCE_OPTIONS = [
  { value: "", label: "— Not set —" },
  { value: "school", label: "School Day" },
  { value: "college", label: "College Day" },
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
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Excel-friendly HTML table (.xls). Opens in Excel/Google Sheets as real columns.
 */
export function exportExcel(filename, rows) {
  const escape = (cell) =>
    String(cell ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const [header, ...body] = rows;
  const thead = `<tr>${(header || []).map((h) => `<th>${escape(h)}</th>`).join("")}</tr>`;
  const tbody = body
    .map((row) => `<tr>${row.map((c) => `<td>${escape(c)}</td>`).join("")}</tr>`)
    .join("");

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<style>
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #333; padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: #111; color: #fff; font-weight: 700; }
</style>
</head><body>
<table>
<thead>${thead}</thead>
<tbody>${tbody}</tbody>
</table>
</body></html>`;

  const blob = new Blob(["\uFEFF" + html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const base = filename.replace(/\.(csv|xls|xlsx)$/i, "");
  link.download = `${base}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportPdf(filename, rows, title = "MacFiesta Report") {
  if (!rows || rows.length === 0) return;
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 21);

  const [header, ...body] = rows;
  autoTable(doc, {
    startY: 25,
    head: [header || []],
    body: body || [],
    theme: "striped",
    styles: { fontSize: 7, cellPadding: 2.5 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
  });

  const base = filename.replace(/\.(csv|xls|xlsx|pdf)$/i, "");
  doc.save(`${base}.pdf`);
}
