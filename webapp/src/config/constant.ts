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
import { DollarSign, Hash, TrendingUp } from "lucide-react";

export const SnackMessage = {
  success: {
    addCollections: "Successfully added the Collection",
  },
  error: {
    fetchCollectionsMessage: "Unable to retrieve list of selected Collections",
    addCollections: "Unable to create the Collection",
    insufficientPrivileges: "Insufficient Privileges",
    fetchPrivileges: "Failed to fetch Privileges",
    fetchContacts: "Unable to retrieve list of Contacts",
    fetchEmployees: "Unable to retrieve list of Employees",
    fetchCustomers: "Unable to retrieve list of Customers",
    fetchAppConfigMessage: "Unable to retrieve app configurations",
    fetchOpdStatus: "Unable to retrieve OPD Data",
    fetchOpdDataStatus:
      "Failed to load OPD claims data. Please check your connection and try again.",
    fetchOpdNetworkError: "Network error. Please check your internet connection.",
    fetchOpdServerError: "Server error. Please try again later.",
    fetchOpdTimeout: "Request timeout. Please try again.",
  },
  warning: {},
};

export const redirectUrl = "iapm-marketplace-redirect-url";
export const OPD_LOADING_MESSAGES = {
  LOADING_DATA: "Loading OPD claims data...",
};

export const OPD_CHART_CONFIG = {
  xAxisLabels: ["0-5K", "5K-10K", "10K-15K", "15K-20K", "20K-25K", "25K-30K", "30K-35K", "35K-40K"],
  yAxisLabels: [12, 9, 6, 3, 0],
  chartHeight: 320,
  maxBarValue: 12,
  barGap: "2px",
};

const currentYear = new Date().getFullYear();
const currentMonth = new Date().toLocaleString("default", { month: "long" });

export const OPD_SUMMARY_CARDS_CONFIG = {
  lastYearCard: {
    icon: DollarSign,
    iconBg: "#fff3e0",
    iconColor: "#f57c00",
    title: "Claim Amount in",
    chipLabel: `${currentYear}`,
    suffix: "LKR",
  },
  currentMonthCard: {
    icon: TrendingUp,
    iconBg: "#e3f2fd",
    iconColor: "#1976d2",
    title: "Claim Amount in",
    chipLabel: `${currentMonth}`,
    suffix: "LKR",
  },
  previousYearCard: {
    icon: Hash,
    iconBg: "#f3e5f5",
    iconColor: "#7b1fa2",
    title: "Number of Claims",
    chipLabel: `${currentYear - 1}`,
  },
};

export const OPD_SIDE_CARDS_CONFIG = {
  unclaimed: {
    title: "Unclaimed",
  },
  fullyClaimed: {
    title: "Fully Claimed",
  },
};
