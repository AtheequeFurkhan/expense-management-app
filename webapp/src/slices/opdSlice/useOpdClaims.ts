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

export type MonthFilter = "current" | "pastThree" | "pastSix" | "pastNine" | "pastTwelve" | "all";

export interface OpdClaimsData {
  claimAmountLastYear: number;
  currentMonthClaimAmount: number;
  claimsCountPreviousYear: number;
  gracePeriodClaims: number;
  activeClaimsData: number[];
  unclaimedCount: number;
  fullyClaimedCount: number;
  trendLastYear: number;
  trendCurrentMonth: number;
  trendPreviousYear: number;
}

interface BackendClaimBucket {
  range: string;
  count: number;
}

interface BackendOpdClaimsData {
  lastYearClaimAmount?: number;
  currentMonthClaimAmount?: number;
  previousYearClaimCount?: number;
  gracePeriodClaims?: number;
  activeClaimsChart?: BackendClaimBucket[];
  unclaimedEmployees?: number;
  fullyClaimedEmployees?: number;
}

export interface OpdClaimsState {
  data: OpdClaimsData;
  month: MonthFilter;
  year: string;
  loading: boolean;
  error: string | null;
}

export const DEFAULT_OPD_DATA: OpdClaimsData = {
  claimAmountLastYear: 8124500,
  currentMonthClaimAmount: 65210,
  claimsCountPreviousYear: 12470,
  gracePeriodClaims: 984,
  activeClaimsData: [4, 5, 6, 7, 6, 7, 8, 9],
  unclaimedCount: 22,
  fullyClaimedCount: 9,
  trendLastYear: -2.5,
  trendCurrentMonth: 5.8,
  trendPreviousYear: 2.5,
};

const initialState: OpdClaimsState = {
  data: DEFAULT_OPD_DATA,
  month: "current",
  year: new Date().getFullYear().toString(),
  loading: false,
  error: null,
};

const normalizeOpdClaimsData = (
  data?: Partial<OpdClaimsData & BackendOpdClaimsData> | null,
): OpdClaimsData => ({
  claimAmountLastYear:
    data?.claimAmountLastYear ?? data?.lastYearClaimAmount ?? DEFAULT_OPD_DATA.claimAmountLastYear,
  currentMonthClaimAmount:
    data?.currentMonthClaimAmount ?? DEFAULT_OPD_DATA.currentMonthClaimAmount,
  claimsCountPreviousYear:
    data?.claimsCountPreviousYear ??
    data?.previousYearClaimCount ??
    DEFAULT_OPD_DATA.claimsCountPreviousYear,
  gracePeriodClaims: data?.gracePeriodClaims ?? DEFAULT_OPD_DATA.gracePeriodClaims,
  activeClaimsData:
    data?.activeClaimsData ??
    data?.activeClaimsChart?.map((bucket) => bucket.count) ??
    DEFAULT_OPD_DATA.activeClaimsData,
  unclaimedCount:
    data?.unclaimedCount ?? data?.unclaimedEmployees ?? DEFAULT_OPD_DATA.unclaimedCount,
  fullyClaimedCount:
    data?.fullyClaimedCount ?? data?.fullyClaimedEmployees ?? DEFAULT_OPD_DATA.fullyClaimedCount,
  trendLastYear: data?.trendLastYear ?? DEFAULT_OPD_DATA.trendLastYear,
  trendCurrentMonth: data?.trendCurrentMonth ?? DEFAULT_OPD_DATA.trendCurrentMonth,
  trendPreviousYear: data?.trendPreviousYear ?? DEFAULT_OPD_DATA.trendPreviousYear,
});

const resolveMonthParam = (month: MonthFilter): string | undefined => {
  const currentMonth = String(new Date().getMonth() + 1);

  switch (month) {
    case "all":
      return undefined;
    case "current":
    case "pastThree":
    case "pastSix":
    case "pastNine":
    case "pastTwelve":
      return currentMonth;
    default:
      return currentMonth;
  }
};

const resolveMonthsParam = (month: MonthFilter): string | undefined => {
  switch (month) {
    case "current":
      return "1";
    case "pastThree":
      return "3";
    case "pastSix":
      return "6";
    case "pastNine":
      return "9";
    case "pastTwelve":
      return "12";
    case "all":
      return undefined;
    default:
      return "1";
  }
};

export const fetchOpdClaims = createAsyncThunk<
  OpdClaimsData,
  { year: string; month: MonthFilter },
  { rejectValue: string }
>("opdClaims/fetchOpdClaims", async ({ year, month }) => {
  try {
    const params: Record<string, string> = { year };
    const resolvedMonth = resolveMonthParam(month);
    const resolvedMonths = resolveMonthsParam(month);
    if (resolvedMonth) {
      params.month = resolvedMonth;
    }
    if (resolvedMonths) {
      params.months = resolvedMonths;
    }

    const response = await apiService.get<Partial<OpdClaimsData & BackendOpdClaimsData> | null>(
      "/opd-claims",
      { params },
    );
    return normalizeOpdClaimsData(response?.data);
  } catch (err) {
    if (axios.isCancel(err)) {
      return DEFAULT_OPD_DATA;
    }
    console.warn("Error fetching OPD claims, falling back to dummy data:", err);
    return DEFAULT_OPD_DATA;
  }
});

const opdClaimsSlice = createSlice({
  name: "opdClaims",
  initialState,
  reducers: {
    setMonth(state, action: PayloadAction<MonthFilter>) {
      state.month = action.payload;
    },
    setYear(state, action: PayloadAction<string>) {
      state.year = action.payload;
    },
    resetOpdClaims() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpdClaims.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpdClaims.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchOpdClaims.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unexpected error occurred.";
      });
  },
});

export const { setMonth, setYear, resetOpdClaims } = opdClaimsSlice.actions;
export default opdClaimsSlice.reducer;

type RootStateWithOpdClaims = RootState & { opdClaims: OpdClaimsState };

export const selectOpdClaimsState = (state: RootState) =>
  (state as RootStateWithOpdClaims).opdClaims;
export const selectOpdClaimsData = (state: RootState) => selectOpdClaimsState(state).data;
export const selectOpdClaimsLoading = (state: RootState) => selectOpdClaimsState(state).loading;
export const selectOpdClaimsError = (state: RootState) => selectOpdClaimsState(state).error;
export const selectOpdClaimsFilters = (state: RootState) => ({
  month: selectOpdClaimsState(state).month,
  year: selectOpdClaimsState(state).year,
});

/**
 * Encapsulates all OPD claims state access and side-effects.
 * Components only import this hook — they never touch the slice directly
 * unless they need a specific action like resetOpdClaims.
 */
export function useOpdClaims() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, month, year, loading, error } = useSelector(selectOpdClaimsState);

  useEffect(() => {
    void dispatch(fetchOpdClaims({ year, month }));
  }, [dispatch, year, month]);

  const handleMonthChange = (newMonth: MonthFilter) => {
    dispatch(setMonth(newMonth));
  };

  const handleYearChange = (newYear: string) => {
    dispatch(setYear(newYear));
  };

  return {
    data,
    month,
    year,
    loading,
    error,
    handleMonthChange,
    handleYearChange,
  };
}
