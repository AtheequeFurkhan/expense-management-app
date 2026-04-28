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
import axios from "axios";

import { useEffect, useState } from "react";

import { apiService } from "@utils/apiService";

import { resolveDateRangeParams } from "./useEmployeeSpending";

export interface LeadFrequencyItem {
  name: string;
  email: string;
  bu: string;
  totalApproved: number;
  avgFrequencyPerDay: number;
  firstApprovedDate: string | null;
  lastApprovedDate: string | null;
}

export interface LeadClaimTypeBreakdown {
  type: string;
  count: number;
  totalAmount: number;
}

export interface LeadApprovedClaim {
  claimId: string;
  employeeName: string;
  claimType: string;
  amount: number;
  category: string | null;
  submittedDate: string | null;
  approvedDate: string | null;
  status: string;
}

export interface LeadApprovalDetail {
  name: string;
  email: string;
  totalApproved: number;
  avgFrequencyPerDay: number;
  lastApprovedDate: string | null;
  claimTypeBreakdown: LeadClaimTypeBreakdown[];
  claims: LeadApprovedClaim[];
}

export function formatApprovalFrequency(claimsPerDay: number): string {
  if (claimsPerDay <= 0) return "No activity";
  return `${(claimsPerDay * 30).toFixed(1)} claims/month`;
}

export function getFrequencyColor(claimsPerDay: number): string {
  if (claimsPerDay >= 1 / 7) return "#2E8B57";
  if (claimsPerDay >= 1 / 30) return "#F4B400";
  return "#9E9E9E";
}

export function getFrequencyBgColor(claimsPerDay: number): string {
  if (claimsPerDay >= 1 / 7) return "#E8F5E9";
  if (claimsPerDay >= 1 / 30) return "#FFF8E1";
  return "#F5F5F5";
}

function computeFreq(total: number, first: string, last: string): number {
  const days = Math.max(
    1,
    Math.round(Math.abs(new Date(last).getTime() - new Date(first).getTime()) / 86_400_000),
  );
  return total / days;
}

// TODO: Remove mock fallback once /lead-approval-frequency and /lead-approval-detail endpoints are live.
const MOCK_LEADS: LeadFrequencyItem[] = [
  {
    name: "Kashanthini",
    email: "kashanthini@wso2.com",
    bu: "Engineering",
    totalApproved: 40,
    firstApprovedDate: "2025-07-05",
    lastApprovedDate: "2026-04-15",
    avgFrequencyPerDay: computeFreq(40, "2025-07-05", "2026-04-15"),
  },
  {
    name: "Avishka",
    email: "avishka@wso2.com",
    bu: "Engineering",
    totalApproved: 35,
    firstApprovedDate: "2025-08-01",
    lastApprovedDate: "2026-04-10",
    avgFrequencyPerDay: computeFreq(35, "2025-08-01", "2026-04-10"),
  },
  {
    name: "Sanjulah",
    email: "sanjulah@wso2.com",
    bu: "Finance",
    totalApproved: 30,
    firstApprovedDate: "2025-09-15",
    lastApprovedDate: "2026-04-05",
    avgFrequencyPerDay: computeFreq(30, "2025-09-15", "2026-04-05"),
  },
  {
    name: "Hasanga",
    email: "hasanga@wso2.com",
    bu: "Operations",
    totalApproved: 25,
    firstApprovedDate: "2025-10-01",
    lastApprovedDate: "2026-03-30",
    avgFrequencyPerDay: computeFreq(25, "2025-10-01", "2026-03-30"),
  },
  {
    name: "Shazni",
    email: "shazni@wso2.com",
    bu: "Marketing",
    totalApproved: 20,
    firstApprovedDate: "2025-11-01",
    lastApprovedDate: "2026-04-01",
    avgFrequencyPerDay: computeFreq(20, "2025-11-01", "2026-04-01"),
  },
  {
    name: "Dilshan",
    email: "dilshan@wso2.com",
    bu: "Engineering",
    totalApproved: 18,
    firstApprovedDate: "2026-01-10",
    lastApprovedDate: "2026-04-12",
    avgFrequencyPerDay: computeFreq(18, "2026-01-10", "2026-04-12"),
  },
  {
    name: "Nirmala",
    email: "nirmala@wso2.com",
    bu: "HR",
    totalApproved: 12,
    firstApprovedDate: "2025-12-01",
    lastApprovedDate: "2026-03-15",
    avgFrequencyPerDay: computeFreq(12, "2025-12-01", "2026-03-15"),
  },
  {
    name: "Pradeep",
    email: "pradeep@wso2.com",
    bu: "Sales",
    totalApproved: 5,
    firstApprovedDate: "2026-01-01",
    lastApprovedDate: "2026-04-01",
    avgFrequencyPerDay: computeFreq(5, "2026-01-01", "2026-04-01"),
  },
];

const MOCK_DETAILS: Record<string, LeadApprovalDetail> = {
  "kashanthini@wso2.com": {
    name: "Kashanthini",
    email: "kashanthini@wso2.com",
    totalApproved: 40,
    lastApprovedDate: "2026-04-15",
    avgFrequencyPerDay: computeFreq(40, "2025-07-05", "2026-04-15"),
    claimTypeBreakdown: [
      { type: "Expense", count: 28, totalAmount: 1240000 },
      { type: "Credit Card", count: 8, totalAmount: 380000 },
      { type: "OPD", count: 4, totalAmount: 95000 },
    ],
    claims: [
      {
        claimId: "EXP-2026-041",
        employeeName: "Sarah Chen",
        claimType: "Expense",
        amount: 45200,
        category: "Travel",
        submittedDate: "2026-04-13",
        approvedDate: "2026-04-15",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-038",
        employeeName: "Dilshan Perera",
        claimType: "Expense",
        amount: 12800,
        category: "Meals",
        submittedDate: "2026-04-08",
        approvedDate: "2026-04-10",
        status: "Approved",
      },
      {
        claimId: "CC-2026-015",
        employeeName: "Nimali Silva",
        claimType: "Credit Card",
        amount: 38500,
        category: "Accommodation",
        submittedDate: "2026-04-01",
        approvedDate: "2026-04-01",
        status: "Finance Approved",
      },
      {
        claimId: "OPD-2026-009",
        employeeName: "Arjun Patel",
        claimType: "OPD",
        amount: 24000,
        category: "Medical",
        submittedDate: "2026-03-28",
        approvedDate: "2026-03-29",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-030",
        employeeName: "Fatima Al-Rashid",
        claimType: "Expense",
        amount: 67400,
        category: "Travel",
        submittedDate: "2026-03-20",
        approvedDate: "2026-03-25",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-025",
        employeeName: "Lucas Ferreira",
        claimType: "Expense",
        amount: 18900,
        category: "Office Supplies",
        submittedDate: "2026-03-10",
        approvedDate: "2026-03-12",
        status: "Approved",
      },
      {
        claimId: "CC-2026-011",
        employeeName: "Hana Tanaka",
        claimType: "Credit Card",
        amount: 52100,
        category: "Software",
        submittedDate: "2026-03-05",
        approvedDate: "2026-03-06",
        status: "Finance Approved",
      },
      {
        claimId: "EXP-2026-020",
        employeeName: "Omar Abdullah",
        claimType: "Expense",
        amount: 31600,
        category: "Training",
        submittedDate: "2026-02-25",
        approvedDate: "2026-03-01",
        status: "Approved",
      },
      {
        claimId: "OPD-2026-005",
        employeeName: "Ingrid Larsson",
        claimType: "OPD",
        amount: 18200,
        category: "Medical",
        submittedDate: "2026-02-18",
        approvedDate: "2026-02-19",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-015",
        employeeName: "Carlos Mendoza",
        claimType: "Expense",
        amount: 42800,
        category: "Travel",
        submittedDate: "2026-02-10",
        approvedDate: "2026-02-14",
        status: "Approved",
      },
    ],
  },
  "avishka@wso2.com": {
    name: "Avishka",
    email: "avishka@wso2.com",
    totalApproved: 35,
    lastApprovedDate: "2026-04-10",
    avgFrequencyPerDay: computeFreq(35, "2025-08-01", "2026-04-10"),
    claimTypeBreakdown: [
      { type: "Expense", count: 22, totalAmount: 980000 },
      { type: "Credit Card", count: 10, totalAmount: 430000 },
      { type: "OPD", count: 3, totalAmount: 65000 },
    ],
    claims: [
      {
        claimId: "EXP-2026-040",
        employeeName: "Zoe Williamson",
        claimType: "Expense",
        amount: 38700,
        category: "Travel",
        submittedDate: "2026-04-08",
        approvedDate: "2026-04-10",
        status: "Approved",
      },
      {
        claimId: "CC-2026-014",
        employeeName: "Arjun Patel",
        claimType: "Credit Card",
        amount: 62300,
        category: "Accommodation",
        submittedDate: "2026-04-01",
        approvedDate: "2026-04-02",
        status: "Finance Approved",
      },
      {
        claimId: "EXP-2026-035",
        employeeName: "Elena Petrova",
        claimType: "Expense",
        amount: 21400,
        category: "Meals",
        submittedDate: "2026-03-22",
        approvedDate: "2026-03-24",
        status: "Approved",
      },
      {
        claimId: "OPD-2026-008",
        employeeName: "Daniel Kim",
        claimType: "OPD",
        amount: 15800,
        category: "Medical",
        submittedDate: "2026-03-15",
        approvedDate: "2026-03-16",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-028",
        employeeName: "Amara Osei",
        claimType: "Expense",
        amount: 53900,
        category: "Training",
        submittedDate: "2026-03-05",
        approvedDate: "2026-03-07",
        status: "Approved",
      },
    ],
  },
  "dilshan@wso2.com": {
    name: "Dilshan",
    email: "dilshan@wso2.com",
    totalApproved: 18,
    lastApprovedDate: "2026-04-12",
    avgFrequencyPerDay: computeFreq(18, "2026-01-10", "2026-04-12"),
    claimTypeBreakdown: [
      { type: "Expense", count: 12, totalAmount: 522000 },
      { type: "Credit Card", count: 4, totalAmount: 216000 },
      { type: "OPD", count: 2, totalAmount: 47000 },
    ],
    claims: [
      {
        claimId: "EXP-2026-042",
        employeeName: "Sarah Chen",
        claimType: "Expense",
        amount: 34500,
        category: "Travel",
        submittedDate: "2026-04-10",
        approvedDate: "2026-04-12",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-039",
        employeeName: "Omar Abdullah",
        claimType: "Expense",
        amount: 28700,
        category: "Training",
        submittedDate: "2026-04-03",
        approvedDate: "2026-04-05",
        status: "Approved",
      },
      {
        claimId: "CC-2026-016",
        employeeName: "Sarah Chen",
        claimType: "Credit Card",
        amount: 51200,
        category: "Software",
        submittedDate: "2026-03-25",
        approvedDate: "2026-03-25",
        status: "Finance Approved",
      },
      {
        claimId: "EXP-2026-036",
        employeeName: "Elena Petrova",
        claimType: "Expense",
        amount: 19400,
        category: "Meals",
        submittedDate: "2026-03-18",
        approvedDate: "2026-03-20",
        status: "Approved",
      },
      {
        claimId: "OPD-2026-010",
        employeeName: "Daniel Kim",
        claimType: "OPD",
        amount: 22100,
        category: "Medical",
        submittedDate: "2026-03-10",
        approvedDate: "2026-03-11",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-033",
        employeeName: "Sarah Chen",
        claimType: "Expense",
        amount: 41800,
        category: "Travel",
        submittedDate: "2026-03-02",
        approvedDate: "2026-03-04",
        status: "Approved",
      },
      {
        claimId: "CC-2026-013",
        employeeName: "Hana Tanaka",
        claimType: "Credit Card",
        amount: 63400,
        category: "Equipment",
        submittedDate: "2026-02-20",
        approvedDate: "2026-02-21",
        status: "Finance Approved",
      },
      {
        claimId: "EXP-2026-029",
        employeeName: "Omar Abdullah",
        claimType: "Expense",
        amount: 15600,
        category: "Office Supplies",
        submittedDate: "2026-02-12",
        approvedDate: "2026-02-14",
        status: "Approved",
      },
    ],
  },
  "sanjulah@wso2.com": {
    name: "Sanjulah",
    email: "sanjulah@wso2.com",
    totalApproved: 30,
    lastApprovedDate: "2026-04-05",
    avgFrequencyPerDay: computeFreq(30, "2025-09-15", "2026-04-05"),
    claimTypeBreakdown: [
      { type: "Expense", count: 20, totalAmount: 892000 },
      { type: "Credit Card", count: 7, totalAmount: 310000 },
      { type: "OPD", count: 3, totalAmount: 72000 },
    ],
    claims: [
      {
        claimId: "EXP-2026-050",
        employeeName: "Carlos Mendoza",
        claimType: "Expense",
        amount: 58200,
        category: "Travel",
        submittedDate: "2026-04-02",
        approvedDate: "2026-04-05",
        status: "Approved",
      },
      {
        claimId: "CC-2026-017",
        employeeName: "Zoe Williamson",
        claimType: "Credit Card",
        amount: 47600,
        category: "Accommodation",
        submittedDate: "2026-03-28",
        approvedDate: "2026-03-29",
        status: "Finance Approved",
      },
      {
        claimId: "EXP-2026-047",
        employeeName: "Fatima Al-Rashid",
        claimType: "Expense",
        amount: 32100,
        category: "Training",
        submittedDate: "2026-03-20",
        approvedDate: "2026-03-22",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-044",
        employeeName: "Carlos Mendoza",
        claimType: "Expense",
        amount: 19800,
        category: "Meals",
        submittedDate: "2026-03-10",
        approvedDate: "2026-03-11",
        status: "Approved",
      },
      {
        claimId: "OPD-2026-011",
        employeeName: "Ingrid Larsson",
        claimType: "OPD",
        amount: 24600,
        category: "Medical",
        submittedDate: "2026-03-03",
        approvedDate: "2026-03-04",
        status: "Approved",
      },
      {
        claimId: "CC-2026-015",
        employeeName: "Fatima Al-Rashid",
        claimType: "Credit Card",
        amount: 82300,
        category: "Software",
        submittedDate: "2026-02-22",
        approvedDate: "2026-02-24",
        status: "Finance Approved",
      },
      {
        claimId: "EXP-2026-043",
        employeeName: "Zoe Williamson",
        claimType: "Expense",
        amount: 44500,
        category: "Travel",
        submittedDate: "2026-02-14",
        approvedDate: "2026-02-18",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-040",
        employeeName: "Lucas Ferreira",
        claimType: "Expense",
        amount: 27900,
        category: "Office Supplies",
        submittedDate: "2026-02-05",
        approvedDate: "2026-02-07",
        status: "Approved",
      },
    ],
  },
  "hasanga@wso2.com": {
    name: "Hasanga",
    email: "hasanga@wso2.com",
    totalApproved: 25,
    lastApprovedDate: "2026-03-30",
    avgFrequencyPerDay: computeFreq(25, "2025-10-01", "2026-03-30"),
    claimTypeBreakdown: [
      { type: "Expense", count: 17, totalAmount: 745000 },
      { type: "Credit Card", count: 6, totalAmount: 258000 },
      { type: "OPD", count: 2, totalAmount: 41000 },
    ],
    claims: [
      {
        claimId: "EXP-2026-051",
        employeeName: "Arjun Patel",
        claimType: "Expense",
        amount: 62400,
        category: "Travel",
        submittedDate: "2026-03-27",
        approvedDate: "2026-03-30",
        status: "Approved",
      },
      {
        claimId: "CC-2026-018",
        employeeName: "Amara Osei",
        claimType: "Credit Card",
        amount: 39100,
        category: "Accommodation",
        submittedDate: "2026-03-18",
        approvedDate: "2026-03-19",
        status: "Finance Approved",
      },
      {
        claimId: "EXP-2026-048",
        employeeName: "Arjun Patel",
        claimType: "Expense",
        amount: 28500,
        category: "Training",
        submittedDate: "2026-03-10",
        approvedDate: "2026-03-12",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-045",
        employeeName: "Daniel Kim",
        claimType: "Expense",
        amount: 16200,
        category: "Meals",
        submittedDate: "2026-03-02",
        approvedDate: "2026-03-04",
        status: "Approved",
      },
      {
        claimId: "OPD-2026-012",
        employeeName: "Elena Petrova",
        claimType: "OPD",
        amount: 20500,
        category: "Medical",
        submittedDate: "2026-02-20",
        approvedDate: "2026-02-21",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-046",
        employeeName: "Amara Osei",
        claimType: "Expense",
        amount: 54700,
        category: "Travel",
        submittedDate: "2026-02-10",
        approvedDate: "2026-02-13",
        status: "Approved",
      },
      {
        claimId: "CC-2026-016",
        employeeName: "Daniel Kim",
        claimType: "Credit Card",
        amount: 71200,
        category: "Equipment",
        submittedDate: "2026-01-25",
        approvedDate: "2026-01-26",
        status: "Finance Approved",
      },
    ],
  },
  "shazni@wso2.com": {
    name: "Shazni",
    email: "shazni@wso2.com",
    totalApproved: 20,
    lastApprovedDate: "2026-04-01",
    avgFrequencyPerDay: computeFreq(20, "2025-11-01", "2026-04-01"),
    claimTypeBreakdown: [
      { type: "Expense", count: 14, totalAmount: 610000 },
      { type: "Credit Card", count: 4, totalAmount: 178000 },
      { type: "OPD", count: 2, totalAmount: 36000 },
    ],
    claims: [
      {
        claimId: "EXP-2026-052",
        employeeName: "Hana Tanaka",
        claimType: "Expense",
        amount: 37800,
        category: "Travel",
        submittedDate: "2026-03-29",
        approvedDate: "2026-04-01",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-049",
        employeeName: "Lucas Ferreira",
        claimType: "Expense",
        amount: 21400,
        category: "Training",
        submittedDate: "2026-03-22",
        approvedDate: "2026-03-24",
        status: "Approved",
      },
      {
        claimId: "CC-2026-019",
        employeeName: "Hana Tanaka",
        claimType: "Credit Card",
        amount: 55600,
        category: "Software",
        submittedDate: "2026-03-12",
        approvedDate: "2026-03-13",
        status: "Finance Approved",
      },
      {
        claimId: "OPD-2026-013",
        employeeName: "Carlos Mendoza",
        claimType: "OPD",
        amount: 18900,
        category: "Medical",
        submittedDate: "2026-03-04",
        approvedDate: "2026-03-05",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-046",
        employeeName: "Lucas Ferreira",
        claimType: "Expense",
        amount: 43200,
        category: "Travel",
        submittedDate: "2026-02-22",
        approvedDate: "2026-02-25",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-043",
        employeeName: "Zoe Williamson",
        claimType: "Expense",
        amount: 29700,
        category: "Meals",
        submittedDate: "2026-02-10",
        approvedDate: "2026-02-12",
        status: "Approved",
      },
    ],
  },
  "nirmala@wso2.com": {
    name: "Nirmala",
    email: "nirmala@wso2.com",
    totalApproved: 12,
    lastApprovedDate: "2026-03-15",
    avgFrequencyPerDay: computeFreq(12, "2025-12-01", "2026-03-15"),
    claimTypeBreakdown: [
      { type: "Expense", count: 8, totalAmount: 342000 },
      { type: "Credit Card", count: 3, totalAmount: 125000 },
      { type: "OPD", count: 1, totalAmount: 22000 },
    ],
    claims: [
      {
        claimId: "EXP-2026-053",
        employeeName: "Ingrid Larsson",
        claimType: "Expense",
        amount: 46300,
        category: "Travel",
        submittedDate: "2026-03-12",
        approvedDate: "2026-03-15",
        status: "Approved",
      },
      {
        claimId: "CC-2026-020",
        employeeName: "Omar Abdullah",
        claimType: "Credit Card",
        amount: 38700,
        category: "Equipment",
        submittedDate: "2026-03-04",
        approvedDate: "2026-03-06",
        status: "Finance Approved",
      },
      {
        claimId: "EXP-2026-050",
        employeeName: "Ingrid Larsson",
        claimType: "Expense",
        amount: 24100,
        category: "Meals",
        submittedDate: "2026-02-24",
        approvedDate: "2026-02-26",
        status: "Approved",
      },
      {
        claimId: "EXP-2026-047",
        employeeName: "Sarah Chen",
        claimType: "Expense",
        amount: 57800,
        category: "Training",
        submittedDate: "2026-02-14",
        approvedDate: "2026-02-17",
        status: "Approved",
      },
      {
        claimId: "OPD-2026-014",
        employeeName: "Sarah Chen",
        claimType: "OPD",
        amount: 22000,
        category: "Medical",
        submittedDate: "2026-01-28",
        approvedDate: "2026-01-29",
        status: "Approved",
      },
    ],
  },
  "pradeep@wso2.com": {
    name: "Pradeep",
    email: "pradeep@wso2.com",
    totalApproved: 5,
    lastApprovedDate: "2026-04-01",
    avgFrequencyPerDay: computeFreq(5, "2026-01-01", "2026-04-01"),
    claimTypeBreakdown: [
      { type: "Expense", count: 3, totalAmount: 143000 },
      { type: "Credit Card", count: 2, totalAmount: 89000 },
    ],
    claims: [
      {
        claimId: "EXP-2026-054",
        employeeName: "Fatima Al-Rashid",
        claimType: "Expense",
        amount: 52400,
        category: "Travel",
        submittedDate: "2026-03-28",
        approvedDate: "2026-04-01",
        status: "Approved",
      },
      {
        claimId: "CC-2026-021",
        employeeName: "Amara Osei",
        claimType: "Credit Card",
        amount: 44800,
        category: "Software",
        submittedDate: "2026-03-10",
        approvedDate: "2026-03-12",
        status: "Finance Approved",
      },
      {
        claimId: "EXP-2026-051",
        employeeName: "Fatima Al-Rashid",
        claimType: "Expense",
        amount: 31200,
        category: "Training",
        submittedDate: "2026-02-20",
        approvedDate: "2026-02-22",
        status: "Approved",
      },
      {
        claimId: "CC-2026-022",
        employeeName: "Lucas Ferreira",
        claimType: "Credit Card",
        amount: 44200,
        category: "Equipment",
        submittedDate: "2026-02-01",
        approvedDate: "2026-02-04",
        status: "Finance Approved",
      },
      {
        claimId: "EXP-2026-048",
        employeeName: "Daniel Kim",
        claimType: "Expense",
        amount: 59400,
        category: "Travel",
        submittedDate: "2026-01-15",
        approvedDate: "2026-01-18",
        status: "Approved",
      },
    ],
  },
};

export function calcDaysBetween(dateA: string | null, dateB: string | null): number | null {
  if (!dateA || !dateB) return null;
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  if (isNaN(a) || isNaN(b)) return null;
  return Math.round(Math.abs(b - a) / 86_400_000);
}

export function useLeadFrequencyList(dateRange: string, businessUnit: string) {
  const [leads, setLeads] = useState<LeadFrequencyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const { year, month, months } = resolveDateRangeParams(dateRange);
    const params: Record<string, string> = { year, month, months };
    if (businessUnit && businessUnit !== "All Business Units") {
      params.businessUnit = businessUnit;
    }

    apiService
      .get<LeadFrequencyItem[]>("/lead-approval-frequency", { params })
      .then((res) => {
        if (!cancelled) {
          const items = res.data ?? [];
          setLeads(
            items.length > 0
              ? items.map((l) => ({
                  ...l,
                  totalApproved: Number(l.totalApproved),
                  avgFrequencyPerDay:
                    Number(l.avgFrequencyPerDay) ||
                    computeFreq(
                      Number(l.totalApproved),
                      l.firstApprovedDate ?? "",
                      l.lastApprovedDate ?? "",
                    ),
                }))
              : MOCK_LEADS,
          );
        }
      })
      .catch((err) => {
        // TODO: Remove mock fallback once /lead-approval-frequency endpoint is live.
        if (!cancelled && !axios.isCancel(err)) {
          setLeads(MOCK_LEADS);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dateRange, businessUnit]);

  return { leads, loading, error };
}

export function useLeadApprovalDetail(email: string | null, dateRange: string) {
  const [detail, setDetail] = useState<LeadApprovalDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetail(null);

    const { year, month, months } = resolveDateRangeParams(dateRange);

    apiService
      .get<LeadApprovalDetail>("/lead-approval-detail", {
        params: { email, year, month, months },
      })
      .then((res) => {
        if (!cancelled && res.data) {
          const d = res.data;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const firstDate: string | null = (d as any).firstApprovedDate ?? null;
          const computedFreq =
            Number(d.avgFrequencyPerDay) ||
            computeFreq(Number(d.totalApproved), firstDate ?? "", d.lastApprovedDate ?? "");
          setDetail({
            ...d,
            totalApproved: Number(d.totalApproved),
            avgFrequencyPerDay: computedFreq,
            claimTypeBreakdown: (d.claimTypeBreakdown ?? []).map((c) => ({
              ...c,
              count: Number(c.count),
              totalAmount: Number(c.totalAmount),
            })),
            claims: (d.claims ?? []).map((c) => ({
              ...c,
              amount: Number(c.amount),
            })),
          });
        }
      })
      .catch((err) => {
        // TODO: Remove mock fallback once /lead-approval-detail endpoint is live.
        if (!cancelled && !axios.isCancel(err)) {
          const mock = email ? MOCK_DETAILS[email] : null;
          if (mock) {
            setDetail(mock);
          } else {
            setError("Failed to load lead approval details.");
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [email, dateRange]);

  return { detail, loading, error };
}
