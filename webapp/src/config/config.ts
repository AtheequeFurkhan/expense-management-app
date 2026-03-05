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
import { BaseURLAuthClientConfig } from "@asgardeo/auth-react";
import { DollarSign, Hash, TrendingUp } from "lucide-react";

declare global {
  interface Window {
    config: {
      APP_NAME: string;
      APP_DOMAIN: string;
      ASGARDEO_BASE_URL: string;
      ASGARDEO_CLIENT_ID: string;
      ASGARDEO_REVOKE_ENDPOINT: string;
      AUTH_SIGN_IN_REDIRECT_URL: string;
      AUTH_SIGN_OUT_REDIRECT_URL: string;
      REACT_APP_BACKEND_BASE_URL: string;
    };
  }
}

export const AsgardeoConfig: BaseURLAuthClientConfig = {
  scope: ["openid", "email", "groups"],
  baseUrl: window.config?.ASGARDEO_BASE_URL ?? "",
  clientID: window.config?.ASGARDEO_CLIENT_ID ?? "",
  signInRedirectURL: window.config?.AUTH_SIGN_IN_REDIRECT_URL ?? "",
  signOutRedirectURL: window.config?.AUTH_SIGN_OUT_REDIRECT_URL ?? "",
};

const requiredAsgardeoKeys: (keyof typeof AsgardeoConfig)[] = [
  "baseUrl",
  "clientID",
  "signInRedirectURL",
  "signOutRedirectURL",
];

const missingKeys = requiredAsgardeoKeys.filter((key) => !AsgardeoConfig[key]);

if (missingKeys.length > 0) {
  throw new Error(
    `Missing required Asgardeo configuration: ${missingKeys.join(", ")}. Ensure window.config is populated before the app boots.`,
  );
}

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
    color: "#2e7d32",
  },
  fullyClaimed: {
    title: "Fully Claimed",
    color: "#c62828",
  },
};

export const APP_NAME = window.config?.APP_NAME ?? "";
export const APP_DOMAIN = window.config?.APP_DOMAIN ?? "";
export const ServiceBaseUrl = window.config?.REACT_APP_BACKEND_BASE_URL ?? "";

export const AppConfig = {
  serviceUrls: {
    contacts: ServiceBaseUrl + "/contacts",
    userInfo: ServiceBaseUrl + "/user-info",
    employees: ServiceBaseUrl + "/employees",
    appConfig: ServiceBaseUrl + "/app-config",
    collections: ServiceBaseUrl + "/collections",
  },
};
