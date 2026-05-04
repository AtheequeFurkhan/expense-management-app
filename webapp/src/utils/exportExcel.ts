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
import * as XLSX from "xlsx";

function applyAutoWidths(ws: XLSX.WorkSheet): void {
  const ref = ws["!ref"];
  if (!ref) return;
  const range = XLSX.utils.decode_range(ref);
  const colWidths: number[] = [];
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      const len = cell ? String(cell.v ?? "").length : 0;
      colWidths[C] = Math.max(colWidths[C] ?? 8, len);
    }
  }
  ws["!cols"] = colWidths.map((w) => ({ wch: Math.min(w + 3, 55) }));
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "_");
}

// ---------------------------------------------------------------------------
// Employee Breakdown Export
// ---------------------------------------------------------------------------

export interface EmployeeBreakdownExportParams {
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
  categories: Array<{
    category: string;
    total: number;
    claimCount: number;
    percentage: number;
    compTotal: number;
    compClaimCount: number;
  }>;
}

export function exportEmployeeBreakdown(p: EmployeeBreakdownExportParams): void {
  const wb = XLSX.utils.book_new();
  const compLabel = p.compareMode === "prevMonth" ? "Last Month" : "Last Year";

  // Sheet 1 — Summary
  const wsSummary = XLSX.utils.aoa_to_sheet([
    ["Field", "Value"],
    ["Employee Name", p.name],
    ["Email", p.email],
    ["Period", p.dateRange],
    ["Status Filter", p.statusTab],
    ["Currency", p.currency],
    [],
    ["", "Current Period", compLabel],
    ["Total Amount", p.totalAmount, p.prevTotalAmount],
    ["Total Claims", p.claimCount, p.prevClaimCount],
  ]);
  applyAutoWidths(wsSummary);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // Sheet 2 — Category Breakdown
  const headers = [
    "Category",
    `${compLabel} Amount (${p.currency})`,
    `${compLabel} Claims`,
    `Current Amount (${p.currency})`,
    "Current Claims",
    "% of Total",
    "Change %",
  ];
  const rows = p.categories.map((cat) => {
    const change =
      cat.compTotal > 0
        ? `${(((cat.total - cat.compTotal) / cat.compTotal) * 100).toFixed(1)}%`
        : cat.total > 0
          ? "+100%"
          : "—";
    return [
      cat.category,
      cat.compTotal,
      cat.compClaimCount,
      cat.total,
      cat.claimCount,
      `${cat.percentage.toFixed(1)}%`,
      change,
    ];
  });
  const wsBreakdown = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  applyAutoWidths(wsBreakdown);
  XLSX.utils.book_append_sheet(wb, wsBreakdown, "Category Breakdown");

  XLSX.writeFile(
    wb,
    `employee-breakdown-${safeFileName(p.name)}-${safeFileName(p.dateRange)}.xlsx`,
  );
}

// ---------------------------------------------------------------------------
// Lead Approval Export
// ---------------------------------------------------------------------------

export interface LeadApprovalsExportParams {
  name: string;
  email: string;
  dateRange: string;
  currency: string;
  totalApproved: number;
  avgFrequencyPerDay: number;
  firstApprovedDate: string | null;
  lastApprovedDate: string | null;
  employeeBreakdown: Array<{
    name: string;
    count: number;
    amount: number;
  }>;
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

export function exportLeadApprovals(p: LeadApprovalsExportParams): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1 — Lead Summary
  const wsSummary = XLSX.utils.aoa_to_sheet([
    ["Field", "Value"],
    ["Lead Name", p.name],
    ["Email", p.email],
    ["Period", p.dateRange],
    ["Currency", p.currency],
    ["Total Approvals", p.totalApproved],
    ["Avg Frequency (claims/day)", p.avgFrequencyPerDay],
    ["First Approval Date", p.firstApprovedDate ?? "—"],
    ["Last Approval Date", p.lastApprovedDate ?? "—"],
  ]);
  applyAutoWidths(wsSummary);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Lead Summary");

  // Sheet 2 — Approvals by Employee
  const empRows = p.employeeBreakdown.map((e) => [e.name, e.count, e.amount]);
  const wsEmp = XLSX.utils.aoa_to_sheet([
    ["Employee", "Claims Approved", `Total Amount (${p.currency})`],
    ...empRows,
  ]);
  applyAutoWidths(wsEmp);
  XLSX.utils.book_append_sheet(wb, wsEmp, "By Employee");

  // Sheet 3 — Approved Claims
  const claimRows = p.claims.map((c) => {
    let delay: number | string = "—";
    if (c.submittedDate && c.approvedDate) {
      const ms = new Date(c.approvedDate).getTime() - new Date(c.submittedDate).getTime();
      delay = Math.round(ms / (1000 * 60 * 60 * 24));
    }
    return [
      c.claimId,
      c.employeeName,
      c.claimType,
      c.category ?? "—",
      c.amount,
      c.submittedDate ?? "—",
      c.approvedDate ?? "—",
      delay,
      c.status,
    ];
  });
  const wsClaims = XLSX.utils.aoa_to_sheet([
    [
      "Claim ID",
      "Employee",
      "Type",
      "Category",
      `Amount (${p.currency})`,
      "Submitted Date",
      "Approved Date",
      "Delay (days)",
      "Status",
    ],
    ...claimRows,
  ]);
  applyAutoWidths(wsClaims);
  XLSX.utils.book_append_sheet(wb, wsClaims, "Approved Claims");

  XLSX.writeFile(
    wb,
    `lead-approvals-${safeFileName(p.name)}-${safeFileName(p.dateRange)}.xlsx`,
  );
}
