// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
import jsPDF from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

type RGB = [number, number, number];

const WHITE: RGB = [255, 255, 255];
const NEAR_BLACK: RGB = [25, 25, 35];
const MID_GRAY: RGB = [110, 110, 120];
const LIGHT_BG: RGB = [247, 248, 250];
const DIVIDER: RGB = [220, 222, 228];
const CAT_BG: RGB = [232, 238, 255];
const SUB_BG: RGB = [251, 251, 253];

function fmt(amount: number, currency: string): string {
  if (amount === 0) return "—";
  return `${currency} ${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function pct(change: number): string {
  if (change === Infinity || isNaN(change)) return "+100%";
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
}

function safeFile(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "_");
}

/** Draws the coloured header band and returns the y position just below it. */
function drawHeader(
  doc: jsPDF,
  accent: RGB,
  title: string,
  subtitle: string,
  generatedAt: string,
): number {
  const W = doc.internal.pageSize.width;
  doc.setFillColor(...accent);
  doc.rect(0, 0, W, 32, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...WHITE);
  doc.text(title, 14, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(subtitle, 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(200, 210, 255);
  doc.text(`Generated ${generatedAt}`, W - 14, 22, { align: "right" });

  return 38;
}

/** Draws a two-column info row (label: value) and returns next y. */
function infoLine(doc: jsPDF, y: number, label: string, value: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...MID_GRAY);
  doc.text(label, 14, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...NEAR_BLACK);
  doc.text(value, 60, y);
  return y + 5.5;
}

/** Draws a labelled section heading and returns next y. */
function sectionHeading(doc: jsPDF, y: number, title: string, accent: RGB): number {
  doc.setFillColor(...accent);
  doc.rect(14, y, 3, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NEAR_BLACK);
  doc.text(title, 20, y + 4);
  return y + 10;
}

// ---------------------------------------------------------------------------
// Employee Breakdown PDF
// ---------------------------------------------------------------------------

export interface SubExpenseEntry {
  name: string;
  currentAmount: number;
  compAmount: number;
}

export interface CategoryExportEntry {
  category: string;
  total: number;
  claimCount: number;
  percentage: number;
  compTotal: number;
  compClaimCount: number;
  subExpenses: SubExpenseEntry[];
}

export interface EmployeeBreakdownPdfParams {
  name: string;
  email: string;
  dateRange: string;
  statusTab: string;
  currency: string;
  totalAmount: number;
  claimCount: number;
  compareMode: "prevMonth" | "prevYear";
  prevTotalAmount: number;
  prevClaimCount: number;
  categories: CategoryExportEntry[];
}

export function exportEmployeeBreakdownPdf(p: EmployeeBreakdownPdfParams): void {
  const ACCENT: RGB = [41, 98, 255];
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const generatedAt = new Date().toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const compLabel = p.compareMode === "prevMonth" ? "Last Month" : "Last Year";
  const changePct =
    p.prevTotalAmount > 0
      ? pct(((p.totalAmount - p.prevTotalAmount) / p.prevTotalAmount) * 100)
      : p.totalAmount > 0 ? "+100%" : "—";

  let y = drawHeader(
    doc,
    ACCENT,
    p.name,
    `${p.email}  ·  ${p.dateRange}`,
    generatedAt,
  );

  // ── Info block ──────────────────────────────────────────────────────────
  y = infoLine(doc, y, "Total Amount", fmt(p.totalAmount, p.currency));
  y = infoLine(doc, y, "Total Claims", String(p.claimCount));
  y = infoLine(doc, y, "Status Filter", p.statusTab);
  y = infoLine(doc, y, "Currency", p.currency);
  y += 3;

  // ── Period comparison box ────────────────────────────────────────────────
  const boxH = 22;
  doc.setDrawColor(...DIVIDER);
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(14, y, 182, boxH, 2, 2, "FD");

  // Left — prev period
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...MID_GRAY);
  doc.text("PREVIOUS PERIOD", 18, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...NEAR_BLACK);
  doc.text(compLabel, 18, y + 11);
  doc.setFontSize(11);
  doc.text(fmt(p.prevTotalAmount, p.currency), 18, y + 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MID_GRAY);
  doc.text(`${p.prevClaimCount} claims`, 18, y + 21.5);

  // Center — delta
  const cx = 105;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const isPositive = p.totalAmount >= p.prevTotalAmount;
  doc.setTextColor(...(isPositive ? ([200, 30, 30] as RGB) : ([20, 140, 50] as RGB)));
  doc.text(changePct, cx, y + 13, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MID_GRAY);
  doc.text(`vs ${compLabel.toLowerCase()}`, cx, y + 18, { align: "center" });

  // Right — current period
  const rx = 192;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...MID_GRAY);
  doc.text("CURRENT PERIOD", rx, y + 6, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...NEAR_BLACK);
  doc.text(p.dateRange, rx, y + 11, { align: "right" });
  doc.setFontSize(11);
  doc.text(fmt(p.totalAmount, p.currency), rx, y + 17, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MID_GRAY);
  doc.text(`${p.claimCount} claims`, rx, y + 21.5, { align: "right" });

  y += boxH + 8;

  // ── Category breakdown table ─────────────────────────────────────────────
  y = sectionHeading(doc, y, `Category Breakdown — ${p.dateRange} vs ${compLabel}`, ACCENT);

  const bodyRows: RowInput[] = [];

  p.categories.forEach((cat) => {
    const catChange =
      cat.compTotal > 0
        ? pct(((cat.total - cat.compTotal) / cat.compTotal) * 100)
        : cat.total > 0 ? "+100%" : "—";

    // Category row
    bodyRows.push([
      { content: cat.category, styles: { fontStyle: "bold", fillColor: CAT_BG, textColor: NEAR_BLACK } },
      { content: cat.compTotal > 0 ? fmt(cat.compTotal, p.currency) : "—", styles: { fontStyle: "bold", fillColor: CAT_BG, halign: "right" } },
      { content: cat.compClaimCount > 0 ? String(cat.compClaimCount) : "—", styles: { fontStyle: "bold", fillColor: CAT_BG, halign: "center" } },
      { content: fmt(cat.total, p.currency), styles: { fontStyle: "bold", fillColor: CAT_BG, halign: "right" } },
      { content: String(cat.claimCount), styles: { fontStyle: "bold", fillColor: CAT_BG, halign: "center" } },
      { content: `${cat.percentage.toFixed(1)}%`, styles: { fontStyle: "bold", fillColor: CAT_BG, halign: "center" } },
      { content: catChange, styles: { fontStyle: "bold", fillColor: CAT_BG, halign: "right",
          textColor: catChange.startsWith("+") ? [180, 30, 30] : [20, 130, 50] as RGB } },
    ]);

    // Sub-expense rows
    cat.subExpenses.forEach((sub) => {
      bodyRows.push([
        { content: `    ↳  ${sub.name}`, styles: { fillColor: SUB_BG, textColor: [60, 60, 80] as RGB } },
        { content: sub.compAmount > 0 ? fmt(sub.compAmount, p.currency) : "—", styles: { fillColor: SUB_BG, halign: "right", textColor: MID_GRAY } },
        { content: "", styles: { fillColor: SUB_BG } },
        { content: sub.currentAmount > 0 ? fmt(sub.currentAmount, p.currency) : "—", styles: { fillColor: SUB_BG, halign: "right" } },
        { content: "", styles: { fillColor: SUB_BG } },
        { content: "", styles: { fillColor: SUB_BG } },
        { content: "", styles: { fillColor: SUB_BG } },
      ]);
    });
  });

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [[
      "Category / Sub-expense",
      `${compLabel} Amount`,
      "Cls",
      "Current Amount",
      "Cls",
      "% Total",
      "Change",
    ]],
    body: bodyRows,
    styles: { fontSize: 8, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 }, overflow: "linebreak" },
    headStyles: { fillColor: ACCENT, textColor: WHITE, fontStyle: "bold", fontSize: 8, halign: "center" },
    columnStyles: {
      0: { cellWidth: 52 },
      1: { cellWidth: 32, halign: "right" },
      2: { cellWidth: 10, halign: "center" },
      3: { cellWidth: 32, halign: "right" },
      4: { cellWidth: 10, halign: "center" },
      5: { cellWidth: 16, halign: "center" },
      6: { cellWidth: 20, halign: "right" },
    },
    alternateRowStyles: {},
    tableLineColor: DIVIDER,
    tableLineWidth: 0.2,
  });

  // Footer on each page
  const totalPages = (doc as jsPDF & { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MID_GRAY);
    doc.text(
      `Expense Management Dashboard  ·  Page ${i} of ${totalPages}`,
      105,
      doc.internal.pageSize.height - 6,
      { align: "center" },
    );
  }

  doc.save(`employee-breakdown-${safeFile(p.name)}-${safeFile(p.dateRange)}.pdf`);
}

// ---------------------------------------------------------------------------
// Lead Approval PDF
// ---------------------------------------------------------------------------

export interface LeadApprovalPdfParams {
  name: string;
  email: string;
  dateRange: string;
  currency: string;
  totalApproved: number;
  avgFrequencyPerDay: number;
  firstApprovedDate: string | null;
  lastApprovedDate: string | null;
  employeeBreakdown: Array<{ name: string; count: number; amount: number }>;
  claims: Array<{
    claimId: string;
    employeeName: string;
    claimType: string;
    category: string | null;
    amount: number;
    submittedDate: string | null;
    approvedDate: string | null;
    status: string;
  }>;
}

export function exportLeadApprovalsPdf(p: LeadApprovalPdfParams): void {
  const ACCENT: RGB = [200, 55, 20];
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const generatedAt = new Date().toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  let y = drawHeader(
    doc,
    ACCENT,
    p.name,
    `${p.email}  ·  ${p.dateRange}`,
    generatedAt,
  );

  // ── Info block ──────────────────────────────────────────────────────────
  y = infoLine(doc, y, "Total Approvals", String(p.totalApproved));
  y = infoLine(
    doc,
    y,
    "Avg Frequency",
    p.avgFrequencyPerDay > 0
      ? `${p.avgFrequencyPerDay.toFixed(2)} claims / day`
      : "—",
  );
  if (p.firstApprovedDate) {
    y = infoLine(doc, y, "First Approval", fmtDate(p.firstApprovedDate));
  }
  y = infoLine(doc, y, "Last Approval", fmtDate(p.lastApprovedDate));
  y = infoLine(doc, y, "Currency", p.currency);
  y += 5;

  // ── Approvals by employee ────────────────────────────────────────────────
  y = sectionHeading(doc, y, "Approvals by Employee", ACCENT);

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [["Employee", "Claims Approved", `Total Amount (${p.currency})`]],
    body: p.employeeBreakdown.map((e) => [
      e.name,
      { content: String(e.count), styles: { halign: "center" } },
      { content: fmt(e.amount, p.currency), styles: { halign: "right" } },
    ]),
    styles: { fontSize: 8.5, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 } },
    headStyles: { fillColor: ACCENT, textColor: WHITE, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT_BG },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 40, halign: "center" },
      2: { cellWidth: 52, halign: "right" },
    },
    tableLineColor: DIVIDER,
    tableLineWidth: 0.2,
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ── Approved claims table ────────────────────────────────────────────────
  y = sectionHeading(doc, y, `All Approved Claims (${p.claims.length})`, ACCENT);

  const claimRows: RowInput[] = p.claims.map((c) => {
    let delay: string = "—";
    if (c.submittedDate && c.approvedDate) {
      const days = Math.round(
        (new Date(c.approvedDate).getTime() - new Date(c.submittedDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      delay = days === 0 ? "Same day" : `${days}d`;
    }
    return [
      c.claimId,
      c.employeeName,
      c.claimType,
      c.category ?? "—",
      { content: fmt(c.amount, p.currency), styles: { halign: "right" } },
      c.submittedDate
        ? new Date(c.submittedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
        : "—",
      c.approvedDate
        ? new Date(c.approvedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
        : "—",
      { content: delay, styles: { halign: "center" } },
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [["Claim ID", "Employee", "Type", "Category", `Amount (${p.currency})`, "Submitted", "Approved", "Delay"]],
    body: claimRows,
    styles: { fontSize: 7.5, cellPadding: { top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 }, overflow: "linebreak" },
    headStyles: { fillColor: ACCENT, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_BG },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 38 },
      2: { cellWidth: 20 },
      3: { cellWidth: 28 },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 18, halign: "center" },
      6: { cellWidth: 18, halign: "center" },
      7: { cellWidth: 14, halign: "center" },
    },
    tableLineColor: DIVIDER,
    tableLineWidth: 0.2,
  });

  // Footer
  const totalPages = (doc as jsPDF & { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MID_GRAY);
    doc.text(
      `Expense Management Dashboard  ·  Page ${i} of ${totalPages}`,
      105,
      doc.internal.pageSize.height - 6,
      { align: "center" },
    );
  }

  doc.save(`lead-approvals-${safeFile(p.name)}-${safeFile(p.dateRange)}.pdf`);
}
