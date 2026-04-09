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
