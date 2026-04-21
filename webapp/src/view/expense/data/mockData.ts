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

export interface LeadApprovalFrequencyItem {
  label: string;
  value: number;
}

export interface ActiveClaimStatItem {
  label: string;
  value: number;
}

export interface ExpenseFilters {
  dateRange: string;
  department: string;
  employee: string;
  category: string;
  businessUnit: string;
}

export const INITIAL_FILTERS: ExpenseFilters = {
  dateRange: "All Time",
  department: "All Departments",
  employee: "",
  category: "All Categories",
  businessUnit: "All Business Units",
};

export const DATE_RANGE_OPTIONS = [
  "All Time",
  "This Month",
  "Last Month",
  "Last 3 Months",
  "Last 6 Months",
  "Year to Date",
  "Last Year",
];

export const MOCK_EMPLOYEES = [
  { name: "Aiden Carter", email: "aiden.carter@example.com", totalAmount: 148200, claimCount: 14 },
  { name: "Sofia Nguyen", email: "sofia.nguyen@example.com", totalAmount: 131500, claimCount: 11 },
  {
    name: "Marcus Johnson",
    email: "marcus.johnson@example.com",
    totalAmount: 117800,
    claimCount: 9,
  },
  { name: "Priya Sharma", email: "priya.sharma@example.com", totalAmount: 104300, claimCount: 12 },
  { name: "Liam O'Brien", email: "liam.obrien@example.com", totalAmount: 98750, claimCount: 8 },
  { name: "Nadia Hassan", email: "nadia.hassan@example.com", totalAmount: 89400, claimCount: 10 },
  {
    name: "James Whitfield",
    email: "james.whitfield@example.com",
    totalAmount: 82100,
    claimCount: 7,
  },
  { name: "Elena Petrova", email: "elena.petrova@example.com", totalAmount: 74600, claimCount: 13 },
  { name: "Daniel Kim", email: "daniel.kim@example.com", totalAmount: 67300, claimCount: 6 },
  { name: "Amara Osei", email: "amara.osei@example.com", totalAmount: 59800, claimCount: 5 },
  {
    name: "Lucas Ferreira",
    email: "lucas.ferreira@example.com",
    totalAmount: 54200,
    claimCount: 8,
  },
  { name: "Hana Tanaka", email: "hana.tanaka@example.com", totalAmount: 47900, claimCount: 4 },
  { name: "Omar Abdullah", email: "omar.abdullah@example.com", totalAmount: 43100, claimCount: 6 },
  {
    name: "Ingrid Larsson",
    email: "ingrid.larsson@example.com",
    totalAmount: 38500,
    claimCount: 3,
  },
  {
    name: "Carlos Mendoza",
    email: "carlos.mendoza@example.com",
    totalAmount: 32700,
    claimCount: 5,
  },
  {
    name: "Zoe Williamson",
    email: "zoe.williamson@example.com",
    totalAmount: 27400,
    claimCount: 4,
  },
  { name: "Arjun Patel", email: "arjun.patel@example.com", totalAmount: 22800, claimCount: 3 },
  {
    name: "Fatima Al-Rashid",
    email: "fatima.alrashid@example.com",
    totalAmount: 18300,
    claimCount: 2,
  },
];

export const MOCK_BREAKDOWNS: Record<
  string,
  (typeof MOCK_EMPLOYEES)[0] & {
    categories: { category: string; total: number; claimCount: number; percentage: number }[];
  }
> = {
  "aiden.carter@example.com": {
    name: "Aiden Carter",
    email: "aiden.carter@example.com",
    totalAmount: 148200,
    claimCount: 14,
    categories: [
      { category: "Travel", total: 58400, claimCount: 5, percentage: 39.4 },
      { category: "Accommodation", total: 34200, claimCount: 3, percentage: 23.1 },
      { category: "Telecommunication", total: 24800, claimCount: 2, percentage: 16.7 },
      { category: "Meals", total: 18600, claimCount: 3, percentage: 12.6 },
      { category: "Office Supplies", total: 12200, claimCount: 1, percentage: 8.2 },
    ],
  },
  "sofia.nguyen@example.com": {
    name: "Sofia Nguyen",
    email: "sofia.nguyen@example.com",
    totalAmount: 131500,
    claimCount: 11,
    categories: [
      { category: "Travel", total: 52600, claimCount: 4, percentage: 40.0 },
      { category: "Training", total: 31200, claimCount: 2, percentage: 23.7 },
      { category: "Accommodation", total: 26400, claimCount: 2, percentage: 20.1 },
      { category: "Meals", total: 14100, claimCount: 2, percentage: 10.7 },
      { category: "Transport", total: 7200, claimCount: 1, percentage: 5.5 },
    ],
  },
  "marcus.johnson@example.com": {
    name: "Marcus Johnson",
    email: "marcus.johnson@example.com",
    totalAmount: 117800,
    claimCount: 9,
    categories: [
      { category: "Travel", total: 47200, claimCount: 3, percentage: 40.1 },
      { category: "Telecommunication", total: 29500, claimCount: 2, percentage: 25.0 },
      { category: "Office Supplies", total: 22100, claimCount: 2, percentage: 18.8 },
      { category: "Meals", total: 19000, claimCount: 2, percentage: 16.1 },
    ],
  },
  "priya.sharma@example.com": {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    totalAmount: 104300,
    claimCount: 12,
    categories: [
      { category: "Training", total: 42100, claimCount: 3, percentage: 40.4 },
      { category: "Travel", total: 31600, claimCount: 4, percentage: 30.3 },
      { category: "Meals", total: 16400, claimCount: 3, percentage: 15.7 },
      { category: "Accommodation", total: 14200, claimCount: 2, percentage: 13.6 },
    ],
  },
};

const DEFAULT_BREAKDOWN_CATEGORIES = [
  { category: "Travel", percentage: 42 },
  { category: "Accommodation", percentage: 24 },
  { category: "Meals", percentage: 18 },
  { category: "Office Supplies", percentage: 16 },
];

export function getMockBreakdown(emp: (typeof MOCK_EMPLOYEES)[0]) {
  if (MOCK_BREAKDOWNS[emp.email]) return MOCK_BREAKDOWNS[emp.email];
  let remaining = emp.totalAmount;
  const categories = DEFAULT_BREAKDOWN_CATEGORIES.map((c, i) => {
    const total =
      i < DEFAULT_BREAKDOWN_CATEGORIES.length - 1
        ? Math.round(emp.totalAmount * (c.percentage / 100))
        : remaining;
    remaining -= total;
    const claimCount = Math.max(1, Math.round(emp.claimCount * (c.percentage / 100)));
    return { category: c.category, total, claimCount, percentage: c.percentage };
  });
  return {
    name: emp.name,
    email: emp.email,
    totalAmount: emp.totalAmount,
    claimCount: emp.claimCount,
    categories,
  };
}

export const MOCK_TRANSACTIONS = [
  { description: "Flight to Colombo", txnDate: "Apr 14, 2026", amount: 18400, status: "Approved" },
  {
    description: "International flight return",
    txnDate: "Mar 28, 2026",
    amount: 22100,
    status: "Approved",
  },
  { description: "Domestic flight", txnDate: "Mar 12, 2026", amount: 8900, status: "Pending" },
  { description: "Airport transfer", txnDate: "Feb 18, 2026", amount: 2800, status: "Approved" },
  { description: "Hotel - 3 nights", txnDate: "Apr 15, 2026", amount: 14600, status: "Approved" },
  { description: "Hotel - 1 night", txnDate: "Mar 29, 2026", amount: 5200, status: "Pending" },
  { description: "Client dinner", txnDate: "Apr 10, 2026", amount: 6300, status: "Approved" },
  { description: "Team lunch", txnDate: "Mar 22, 2026", amount: 3800, status: "Approved" },
  { description: "Conference meals", txnDate: "Feb 25, 2026", amount: 4100, status: "Pending" },
  { description: "Monthly mobile plan", txnDate: "Apr 1, 2026", amount: 2800, status: "Approved" },
  { description: "Internet allowance", txnDate: "Mar 1, 2026", amount: 1900, status: "Approved" },
  { description: "Laptop peripherals", txnDate: "Apr 8, 2026", amount: 7400, status: "Pending" },
  {
    description: "Stationery & supplies",
    txnDate: "Mar 5, 2026",
    amount: 2100,
    status: "Approved",
  },
  {
    description: "AWS certification course",
    txnDate: "Feb 10, 2026",
    amount: 18200,
    status: "Approved",
  },
  { description: "Leadership workshop", txnDate: "Jan 20, 2026", amount: 12400, status: "Pending" },
  { description: "Taxi to client site", txnDate: "Apr 12, 2026", amount: 1800, status: "Approved" },
  { description: "Grab ride - office", txnDate: "Apr 3, 2026", amount: 950, status: "Approved" },
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
