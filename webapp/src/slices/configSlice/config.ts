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

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { HttpStatusCode } from "axios";

import { State } from "@/types/types";
import { AppConfig } from "@config/config";
import { SnackMessage } from "@config/constant";
import { enqueueSnackbarMessage } from "@slices/commonSlice/common";
import { APIService } from "@utils/apiService";

export interface AppConfigInfo {
  claimLimit: number;
  claimRangeStep: number;
  lastYearClaimGracePeriodInDays: number;
  submissionsAllowedLocations: string[];
}

interface AppConfigState {
  state: State;
  updateState: State;
  stateMessage: string | null;
  errorMessage: string | null;
  config: AppConfigInfo | null;
}

const initialState: AppConfigState = {
  state: State.idle,
  updateState: State.idle,
  stateMessage: null,
  errorMessage: null,
  config: null,
};

export const fetchAppConfig = createAsyncThunk(
  "appConfig/fetchAppConfig",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.get<AppConfigInfo>(AppConfig.serviceUrls.appConfig);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        (error as Error).message ||
        "An unknown error occurred.";
      dispatch(
        enqueueSnackbarMessage({
          message:
            (error as { response?: { status?: HttpStatusCode } }).response?.status ===
            HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchAppConfigMessage
              : message,
          type: "error",
        }),
      );
      return rejectWithValue(message);
    }
  },
);

export const updateAppConfig = createAsyncThunk(
  "appConfig/updateAppConfig",
  async (payload: Partial<AppConfigInfo>, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.put<AppConfigInfo>(AppConfig.serviceUrls.appConfig, payload);
      dispatch(
        enqueueSnackbarMessage({
          message: "Application configuration updated successfully.",
          type: "success",
        }),
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        (error as Error).message ||
        "Failed to update application configuration.";
      dispatch(
        enqueueSnackbarMessage({
          message,
          type: "error",
        }),
      );
      return rejectWithValue(message);
    }
  },
);

const AppConfigSlice = createSlice({
  name: "appConfig",
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.state = State.idle;
      state.updateState = State.idle;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppConfig.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching application configurations...";
      })
      .addCase(fetchAppConfig.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched app configurations!";
        const toNum = (v: unknown, fallback = 0) => { const n = Number(v); return isFinite(n) ? n : fallback; };
        state.config = {
          claimLimit: toNum(action.payload.claimLimit),
          claimRangeStep: toNum(action.payload.claimRangeStep),
          lastYearClaimGracePeriodInDays: toNum(action.payload.lastYearClaimGracePeriodInDays),
          submissionsAllowedLocations: action.payload.submissionsAllowedLocations ?? [],
        };
      })
      .addCase(fetchAppConfig.rejected, (state, action) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch application configurations.";
        state.errorMessage = (action.payload as string) ?? action.error?.message ?? null;
      })
      .addCase(updateAppConfig.pending, (state) => {
        state.updateState = State.loading;
      })
      .addCase(updateAppConfig.fulfilled, (state, action) => {
        state.updateState = State.success;
        const toNum = (v: unknown, fallback = 0) => { const n = Number(v); return isFinite(n) ? n : fallback; };
        state.config = {
          claimLimit: toNum(action.payload.claimLimit),
          claimRangeStep: toNum(action.payload.claimRangeStep),
          lastYearClaimGracePeriodInDays: toNum(action.payload.lastYearClaimGracePeriodInDays),
          submissionsAllowedLocations: action.payload.submissionsAllowedLocations ?? [],
        };
      })
      .addCase(updateAppConfig.rejected, (state) => {
        state.updateState = State.failed;
      });
  },
});

export const { resetSubmitState } = AppConfigSlice.actions;
export default AppConfigSlice.reducer;
