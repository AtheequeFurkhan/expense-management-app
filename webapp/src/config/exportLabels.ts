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

// ─── Lead Approval ────────────────────────────────────────────────────────────

export const LEAD_SUMMARY_FIELDS = {
  leadName:          "Lead Name",
  email:             "Email",
  period:            "Period",
  currency:          "Currency",
  totalApprovals:    "Total Approvals",
  avgResponseTime:   "Avg Response Time (days)",
  firstApprovalDate: "First Approval Date",
  lastApprovalDate:  "Last Approval Date",
} as const;

export const LEAD_CATEGORY_COLS = {
  category:   "Category",
  subCategory: "Sub Category",
  claims:     "Claims",
  amount:     "Amount",
  pctOfTotal: "% of Total",
} as const;

export const LEAD_BY_EMPLOYEE_COLS = {
  employee:       "Employee",
  claimsApproved: "Claims Approved",
  totalAmount:    "Total Amount",
} as const;

// Used by both the UI claims table headers and the export sheet.
export const LEAD_CLAIMS_COLS = [
  { key: "employee",     label: "Employee",       flex: 1.4  },
  { key: "subCategory",  label: "Sub Category",   flex: 1.5  },
  { key: "category",     label: "Category",       flex: 1    },
  { key: "amount",       label: "Amount",         flex: 0.9  },
  { key: "submitted",    label: "Submitted Date", flex: 0.9  },
  { key: "approved",     label: "Approved Date",  flex: 0.9  },
  { key: "delay",        label: "Delay (days)",   flex: 0.65 },
  { key: "status",       label: "Status",         flex: 0.7  },
] as const;

export const LEAD_CLAIMS_EXTRA_COLS = {
  claimId: "Claim ID",
} as const;

// ─── Employee Breakdown ───────────────────────────────────────────────────────

export const EMP_SUMMARY_FIELDS = {
  employeeName: "Employee Name",
  email:        "Email",
  period:       "Period",
  statusFilter: "Status Filter",
  currency:     "Currency",
  totalAmount:  "Total Amount",
  totalClaims:  "Total Claims",
} as const;

export const EMP_CATEGORY_COLS = {
  category:      "Category",
  subCategory:   "Sub Category",
  // compAmount and compClaims are prefixed with the comparison period label at runtime
  compAmount:    "Amount",
  compClaims:    "Claims",
  currentAmount: "Current Amount",
  currentClaims: "Current Claims",
  pctOfTotal:    "% of Total",
  change:        "Change %",
} as const;
