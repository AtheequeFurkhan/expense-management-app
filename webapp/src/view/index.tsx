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
import { lazy } from "react";

const dashboard = lazy(() => import("@view/dashboard/dashboard"));
const opd = lazy(() => import("@view/opd/opd"));
const expense = lazy(() => import("@view/expense/expense"));
const employees = lazy(() => import("@view/employees/employees"));
const card = lazy(() => import("@view/credit-cards/credit"));
const reports = lazy(() => import("@view/reports/reports"));

const settings = lazy(() => import("@view/settings/settings"));
const logOut = lazy(() => import("@view/logout/logout"));
const help = lazy(() => import("@view/help/help"));

export const View = {
  help,
  dashboard,
  opd,
  expense,
  employees,
  card,
  reports,
  settings,
  logOut,
};
