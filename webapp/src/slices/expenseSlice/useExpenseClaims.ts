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
import { useDispatch, useSelector } from "react-redux";

import { useEffect } from "react";

import type { AppDispatch, RootState } from "@slices/store";
import {
  type ActiveClaimStatItem,
  type BuExpenseItem,
  type ExpenseFilters,
  type ExpenseTypeItem,
  INITIAL_FILTERS,
  MOCK_ACTIVE_CLAIM_STATS,
  MOCK_BU_EXPENSES,
  MOCK_RECURRING_EXPENSE_TYPES,
  MOCK_SUMMARY_STATS,
  MOCK_TOP_APPROVING_LEADS,
  MOCK_TOP_SPENDING_EMPLOYEES,
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

// TODO: Replace mock fetch with real API call once backend is ready
export const fetchExpenseClaims = createAsyncThunk<
  ExpenseClaimsData,
  { filters: ExpenseFilters },
  { rejectValue: string }
>("expenseClaims/fetchExpenseClaims", async (_args, { rejectWithValue }) => {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Return mock data — replace with real API call later:
    // const response = await apiService.get<...>("/expense-claims", { params });
    // return normalizeExpenseClaimsData(response?.data);
    return {
      totalClaimAmount: MOCK_SUMMARY_STATS.totalClaimAmount,
      totalClaimCount: MOCK_SUMMARY_STATS.totalClaimCount,
      pendingClaims: MOCK_SUMMARY_STATS.pendingClaims,
      approvedClaims: MOCK_SUMMARY_STATS.approvedClaims,
      rejectedClaims: MOCK_SUMMARY_STATS.rejectedClaims,
      avgClaimAmount: MOCK_SUMMARY_STATS.avgClaimAmount,
      buExpenses: MOCK_BU_EXPENSES,
      recurringExpenseTypes: MOCK_RECURRING_EXPENSE_TYPES,
      activeClaimStats: MOCK_ACTIVE_CLAIM_STATS,
      topSpendingEmployees: MOCK_TOP_SPENDING_EMPLOYEES,
      topApprovingLeads: MOCK_TOP_APPROVING_LEADS,
      trendTotalAmount: 12.4,
      trendTotalCount: 8.2,
      trendApproved: 5.1,
      trendAvgAmount: -2.3,
    };
  } catch (err) {
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
