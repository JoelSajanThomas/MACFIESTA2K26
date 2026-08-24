/**
 * MacFiesta Pro — Complete Export Utilities for CSV, Excel, PDF, and JSON Reporting
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const val = row[header];
          const escaped = ("" + (val ?? "")).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(filename: string, rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = Object.keys(rows[0]);
  let xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="MacFiesta Export">
  <Table>
   <Row>`;
  
  headers.forEach((h) => {
    xml += `<Cell><Data ss:Type="String">${h}</Data></Cell>`;
  });
  xml += `</Row>`;

  rows.forEach((row) => {
    xml += `<Row>`;
    headers.forEach((h) => {
      const val = row[h] ?? "";
      xml += `<Cell><Data ss:Type="String">${("" + val).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data></Cell>`;
    });
    xml += `</Row>`;
  });

  xml += `</Table></Worksheet></Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${Date.now()}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(title: string, filename: string, rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) {
    alert("No data available to export.");
    return;
  }

  const doc = new jsPDF();
  const headers = Object.keys(rows[0]);
  const tableData = rows.map((r) => headers.map((h) => "" + (r[h] ?? "")));

  doc.setFontSize(16);
  doc.setTextColor(234, 179, 8);
  doc.text(`MacFiesta 2K26 — ${title}`, 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [headers],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], textColor: [234, 179, 8], fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  doc.save(`${filename}_${Date.now()}.pdf`);
}

export function exportToJSON(filename: string, data: any) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
