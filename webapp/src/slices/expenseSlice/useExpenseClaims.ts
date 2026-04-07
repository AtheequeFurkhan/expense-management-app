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
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import { useEffect } from "react";

import type { AppDispatch, RootState } from "@slices/store";
import { apiService } from "@utils/apiService";
import {
  type ActiveClaimStatItem,
  type BuExpenseItem,
  type ExpenseFilters,
  type ExpenseTypeItem,
  INITIAL_FILTERS,
  type TopEmployeeItem,
  type TopLeadItem,
} from "@view/expense/data/mockData";

export interface ExpenseClaimsData {
  totalClaimAmount: number;
  totalClaimCount: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  avgClaimAmount: number;
  buExpenses: BuExpenseItem[];
  recurringExpenseTypes: ExpenseTypeItem[];
  activeClaimStats: ActiveClaimStatItem[];
  topSpendingEmployees: TopEmployeeItem[];
  topApprovingLeads: TopLeadItem[];
  trendTotalAmount: number;
  trendTotalCount: number;
  trendApproved: number;
  trendAvgAmount: number;
}

export interface ExpenseClaimsState {
  data: ExpenseClaimsData;
  filters: ExpenseFilters;
  loading: boolean;
  error: string | null;
}

export const DEFAULT_EXPENSE_DATA: ExpenseClaimsData = {
  totalClaimAmount: 0,
  totalClaimCount: 0,
  pendingClaims: 0,
  approvedClaims: 0,
  rejectedClaims: 0,
  avgClaimAmount: 0,
  buExpenses: [],
  recurringExpenseTypes: [],
  activeClaimStats: [],
  topSpendingEmployees: [],
  topApprovingLeads: [],
  trendTotalAmount: 0,
  trendTotalCount: 0,
  trendApproved: 0,
  trendAvgAmount: 0,
};

const initialState: ExpenseClaimsState = {
  data: DEFAULT_EXPENSE_DATA,
  filters: INITIAL_FILTERS,
  loading: false,
  error: null,
};

interface BackendExpenseClaimsData {
  totalClaimAmount?: number;
  totalClaimCount?: number;
  pendingClaims?: number;
  approvedClaims?: number;
  rejectedClaims?: number;
  avgClaimAmount?: number;
  buExpenses?: BuExpenseItem[];
  recurringExpenseTypes?: { name: string; amount: number }[];
  activeClaimStats?: ActiveClaimStatItem[];
  topSpendingEmployees?: TopEmployeeItem[];
  topApprovingLeads?: TopLeadItem[];
  trendTotalAmount?: number;
  trendTotalCount?: number;
  trendApproved?: number;
  trendAvgAmount?: number;
}

const resolveDateRangeParams = (
  dateRange: string,
): { year: string; month: string; months: string } => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  switch (dateRange) {
    case "All Time":
      return { year: String(currentYear), month: String(currentMonth), months: "0" };
    case "This Month":
      return { year: String(currentYear), month: String(currentMonth), months: "1" };
    case "Last Month": {
      const m = currentMonth === 1 ? 12 : currentMonth - 1;
      const y = currentMonth === 1 ? currentYear - 1 : currentYear;
      return { year: String(y), month: String(m), months: "1" };
    }
    case "Last 3 Months":
      return { year: String(currentYear), month: String(currentMonth), months: "3" };
    case "Last 6 Months":
      return { year: String(currentYear), month: String(currentMonth), months: "6" };
    case "Year to Date":
      return {
        year: String(currentYear),
        month: String(currentMonth),
        months: String(currentMonth),
      };
    case "Last Year":
      return { year: String(currentYear - 1), month: "12", months: "12" };
    default:
      return {
        year: String(currentYear),
        month: String(currentMonth),
        months: "0",
      };
  }
};

const normalizeExpenseClaimsData = (
  data?: Partial<BackendExpenseClaimsData> | null,
): ExpenseClaimsData => ({
  totalClaimAmount: data?.totalClaimAmount ?? DEFAULT_EXPENSE_DATA.totalClaimAmount,
  totalClaimCount: data?.totalClaimCount ?? DEFAULT_EXPENSE_DATA.totalClaimCount,
  pendingClaims: data?.pendingClaims ?? DEFAULT_EXPENSE_DATA.pendingClaims,
  approvedClaims: data?.approvedClaims ?? DEFAULT_EXPENSE_DATA.approvedClaims,
  rejectedClaims: data?.rejectedClaims ?? DEFAULT_EXPENSE_DATA.rejectedClaims,
  avgClaimAmount: data?.avgClaimAmount ?? DEFAULT_EXPENSE_DATA.avgClaimAmount,
  buExpenses:
    data?.buExpenses?.map((b) => ({ label: b.label, value: Number(b.value) })) ??
    DEFAULT_EXPENSE_DATA.buExpenses,
  recurringExpenseTypes:
    data?.recurringExpenseTypes?.map((r) => ({ name: r.name, amount: Number(r.amount) })) ??
    DEFAULT_EXPENSE_DATA.recurringExpenseTypes,
  activeClaimStats:
    data?.activeClaimStats?.map((a) => ({ label: a.label, value: Number(a.value) })) ??
    DEFAULT_EXPENSE_DATA.activeClaimStats,
  topSpendingEmployees:
    data?.topSpendingEmployees?.map((e) => ({
      name: e.name,
      email: e.email,
      bu: e.bu,
      amount: Number(e.amount),
    })) ?? DEFAULT_EXPENSE_DATA.topSpendingEmployees,
  topApprovingLeads:
    data?.topApprovingLeads?.map((l) => ({
      name: l.name,
      email: l.email,
      bu: l.bu,
      count: Number(l.count),
    })) ?? DEFAULT_EXPENSE_DATA.topApprovingLeads,
  trendTotalAmount: data?.trendTotalAmount ?? DEFAULT_EXPENSE_DATA.trendTotalAmount,
  trendTotalCount: data?.trendTotalCount ?? DEFAULT_EXPENSE_DATA.trendTotalCount,
  trendApproved: data?.trendApproved ?? DEFAULT_EXPENSE_DATA.trendApproved,
  trendAvgAmount: data?.trendAvgAmount ?? DEFAULT_EXPENSE_DATA.trendAvgAmount,
});

export const fetchExpenseClaims = createAsyncThunk<
  ExpenseClaimsData,
  { filters: ExpenseFilters },
  { rejectValue: string }
>("expenseClaims/fetchExpenseClaims", async ({ filters }, { rejectWithValue }) => {
  try {
    const { year, month, months } = resolveDateRangeParams(filters.dateRange);
    const params: Record<string, string> = { year, month, months };

    if (filters.businessUnit && filters.businessUnit !== "All Business Units") {
      params.businessUnit = filters.businessUnit;
    }

    const response = await apiService.get<BackendExpenseClaimsData | null>("/expense-claims", {
      params,
    });
    return normalizeExpenseClaimsData(response?.data);
  } catch (err) {
    if (axios.isCancel(err)) {
      return DEFAULT_EXPENSE_DATA;
    }
    console.warn("Error fetching expense claims:", err);
    return rejectWithValue("Failed to load expense claims data.");
  }
});

const expenseClaimsSlice = createSlice({
  name: "expenseClaims",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<ExpenseFilters>) {
      state.filters = action.payload;
    },
    resetExpenseClaims() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenseClaims.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseClaims.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchExpenseClaims.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unexpected error occurred.";
      });
  },
});

export const { setFilters, resetExpenseClaims } = expenseClaimsSlice.actions;
export default expenseClaimsSlice.reducer;

type RootStateWithExpenseClaims = RootState & { expenseClaims: ExpenseClaimsState };

export const selectExpenseClaimsState = (state: RootState) =>
  (state as RootStateWithExpenseClaims).expenseClaims;
export const selectExpenseClaimsData = (state: RootState) => selectExpenseClaimsState(state).data;
export const selectExpenseClaimsLoading = (state: RootState) =>
  selectExpenseClaimsState(state).loading;
export const selectExpenseClaimsError = (state: RootState) => selectExpenseClaimsState(state).error;
export const selectExpenseClaimsFilters = (state: RootState) =>
  selectExpenseClaimsState(state).filters;

export function useExpenseClaims() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, filters, loading, error } = useSelector(selectExpenseClaimsState);

  useEffect(() => {
    void dispatch(fetchExpenseClaims({ filters }));
  }, [dispatch, filters]);

  const handleFiltersChange = (newFilters: ExpenseFilters) => {
    dispatch(setFilters(newFilters));
  };

  return {
    data,
    filters,
    loading,
    error,
    handleFiltersChange,
  };
}
