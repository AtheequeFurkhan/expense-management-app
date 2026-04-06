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

export interface BuExpenseItem {
  label: string;
  value: number;
}

export interface ExpenseTypeItem {
  name: string;
  amount: number;
}

export interface TopEmployeeItem {
  name: string;
  email: string;
  bu: string;
  amount: number;
}

export interface TopLeadItem {
  name: string;
  email: string;
  bu: string;
  count: number;
}

export interface ActiveClaimStatItem {
  label: string;
  value: number;
}

export interface ExpenseSummaryStats {
  totalClaimAmount: number;
  totalClaimCount: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  avgClaimAmount: number;
}

export const MOCK_SUMMARY_STATS: ExpenseSummaryStats = {
  totalClaimAmount: 2_845_600,
  totalClaimCount: 342,
  pendingClaims: 48,
  approvedClaims: 267,
  rejectedClaims: 27,
  avgClaimAmount: 8_320,
};

export const MOCK_BU_EXPENSES: BuExpenseItem[] = [
  { label: "Engineering", value: 820_000 },
  { label: "Marketing", value: 540_000 },
  { label: "Sales", value: 410_000 },
  { label: "Finance", value: 320_000 },
  { label: "HR", value: 280_000 },
  { label: "Operations", value: 250_000 },
  { label: "Legal", value: 125_000 },
  { label: "Support", value: 100_600 },
];

export const MOCK_RECURRING_EXPENSE_TYPES: ExpenseTypeItem[] = [
  { name: "COS-PublicCloud-AWS", amount: 1_245_000 },
  { name: "RND-AWS-Choreo", amount: 982_400 },
  { name: "Cloud Hosting", amount: 874_500 },
  { name: "RND-GCP-Choreo", amount: 756_200 },
  { name: "Google Apps", amount: 645_800 },
  { name: "COS-Gen-AWS-Subs", amount: 598_300 },
  { name: "Office 365", amount: 534_100 },
  { name: "RND-AWS-IAM", amount: 487_600 },
  { name: "COS-Gen-GCP-Subs", amount: 432_900 },
  { name: "Salesforce Inc", amount: 398_200 },
  { name: "RND-AWS-Integration", amount: 367_500 },
  { name: "MS EA - Choreo (Azure CoS)", amount: 342_100 },
  { name: "Github", amount: 312_400 },
  { name: "COS-Gen-Azure-Subs", amount: 289_700 },
  { name: "Netsuite", amount: 267_300 },
  { name: "COS-Gen-JIRA-License", amount: 245_800 },
  { name: "Rent", amount: 234_500 },
  { name: "Domain/SSL Certs Renewal", amount: 198_600 },
  { name: "Concur", amount: 187_200 },
  { name: "People HR", amount: 176_400 },
  { name: "Intercom", amount: 165_300 },
  { name: "RND-Figma", amount: 154_800 },
  { name: "Pager Duty", amount: 143_200 },
  { name: "RND-Github-Copilot", amount: 132_600 },
  { name: "Zoom", amount: 128_400 },
];

export const MOCK_ACTIVE_CLAIM_STATS: ActiveClaimStatItem[] = [
  { label: "Pending", value: 48 },
  { label: "Approved", value: 267 },
  { label: "Rejected", value: 27 },
  { label: "In Review", value: 35 },
  { label: "Resubmitted", value: 12 },
];

export const MOCK_TOP_SPENDING_EMPLOYEES: TopEmployeeItem[] = [
  { name: "Amal Perera", email: "amal@wso2.com", bu: "Engineering", amount: 185_400 },
  { name: "Nimal Silva", email: "nimal@wso2.com", bu: "Marketing", amount: 142_800 },
  { name: "Kamal Fernando", email: "kamal@wso2.com", bu: "Sales", amount: 128_500 },
  { name: "Sunil Rajapaksa", email: "sunil@wso2.com", bu: "Engineering", amount: 115_200 },
  { name: "Priya Mendis", email: "priya@wso2.com", bu: "Finance", amount: 98_600 },
  { name: "Dinesh Kumara", email: "dinesh@wso2.com", bu: "Operations", amount: 87_300 },
  { name: "Rashmi Jayasinghe", email: "rashmi@wso2.com", bu: "HR", amount: 76_500 },
];

export const MOCK_TOP_APPROVING_LEADS: TopLeadItem[] = [
  { name: "Saman Kumara", email: "saman@wso2.com", bu: "Engineering", count: 58 },
  { name: "Lakshmi Rao", email: "lakshmi@wso2.com", bu: "Marketing", count: 45 },
  { name: "Ravi Shankar", email: "ravi@wso2.com", bu: "Sales", count: 39 },
  { name: "Chaminda Bandara", email: "chaminda@wso2.com", bu: "Finance", count: 34 },
  { name: "Niluka Perera", email: "niluka@wso2.com", bu: "Engineering", count: 28 },
  { name: "Tharushi Silva", email: "tharushi@wso2.com", bu: "Operations", count: 22 },
  { name: "Kasun Wijesekara", email: "kasun@wso2.com", bu: "HR", count: 18 },
];

// Period multipliers to simulate different data for each chart filter period
const PERIOD_MULTIPLIERS: Record<string, number> = {
  current: 1,
  pastThree: 2.8,
  pastSix: 5.2,
  pastNine: 7.6,
  pastTwelve: 10.4,
};

// Seeded-ish variation so each item shifts differently per period
function varyValue(base: number, period: string, seed: number): number {
  const multiplier = PERIOD_MULTIPLIERS[period] ?? 1;
  const jitter = 0.85 + ((seed * 7 + 3) % 10) / 30; // 0.85–1.18
  return Math.round(base * multiplier * jitter);
}

export function getMockBuExpenses(period: string): BuExpenseItem[] {
  return MOCK_BU_EXPENSES.map((d, i) => ({
    ...d,
    value: varyValue(d.value, period, i),
  }));
}

export function getMockActiveClaimStats(period: string): ActiveClaimStatItem[] {
  return MOCK_ACTIVE_CLAIM_STATS.map((d, i) => ({
    ...d,
    value: varyValue(d.value, period, i),
  }));
}

export function getMockTopSpendingEmployees(period: string): TopEmployeeItem[] {
  return MOCK_TOP_SPENDING_EMPLOYEES.map((d, i) => ({
    ...d,
    amount: varyValue(d.amount, period, i + 10),
  }));
}

export function getMockTopApprovingLeads(period: string): TopLeadItem[] {
  return MOCK_TOP_APPROVING_LEADS.map((d, i) => ({
    ...d,
    count: varyValue(d.count, period, i + 20),
  }));
}

export function getMockRecurringExpenseTypes(period: string): ExpenseTypeItem[] {
  return MOCK_RECURRING_EXPENSE_TYPES.map((d, i) => ({
    ...d,
    amount: varyValue(d.amount, period, i + 5),
  }));
}

export interface ExpenseFilters {
  dateRange: string;
  department: string;
  employee: string;
  category: string;
  businessUnit: string;
}

export const INITIAL_FILTERS: ExpenseFilters = {
  dateRange: "Year to Date",
  department: "All Departments",
  employee: "",
  category: "All Categories",
  businessUnit: "All Business Units",
};

export const DATE_RANGE_OPTIONS = [
  "This Month",
  "Last Month",
  "Last 3 Months",
  "Last 6 Months",
  "Year to Date",
  "Last Year",
];

export const FILTER_OPTIONS = {
  departments: [
    "All Departments",
    "Engineering",
    "Marketing",
    "Sales",
    "Finance",
    "HR",
    "Operations",
    "Legal",
    "Support",
  ],
  expenseCategories: [
    "All Categories",
    "Travel",
    "Accommodation",
    "Meals",
    "Transport",
    "Office Supplies",
    "Software",
    "Training",
    "Miscellaneous",
  ],
  businessUnits: [
    "All Business Units",
    "Engineering",
    "Marketing",
    "Sales",
    "Finance",
    "HR",
    "Operations",
    "Legal",
    "Support",
  ],
};
