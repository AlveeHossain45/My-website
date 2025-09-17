import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

export function exportCSV(filename, rows) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : filename + '.csv');
  document.body.appendChild(link);
  link.click(); link.remove();
}

export function exportPDF(filename, columns, rows) {
  const doc = new jsPDF();
  doc.text(filename, 14, 16);
  doc.autoTable({ startY: 20, head: [columns], body: rows.map(r => columns.map(c => r[c] ?? '')) });
  doc.save(filename.endsWith('.pdf') ? filename : filename + '.pdf');
}