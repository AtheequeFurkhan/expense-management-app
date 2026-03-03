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

import { type ComponentType, type LazyExoticComponent, Suspense, lazy } from "react";

import AppSkeleton from "@component/common/AppSkeleton";

type AnyComponent =
  | ComponentType<Record<string, unknown>>
  | LazyExoticComponent<ComponentType<Record<string, unknown>>>;

const withSuspense = (Component: AnyComponent) => {
  return function WrappedComponent(props: Record<string, unknown>) {
    return (
      <Suspense fallback={<AppSkeleton />}>
        <Component {...props} />
      </Suspense>
    );
  };
};

const dashboard = withSuspense(lazy(() => import("@view/dashboard/dashboard")));
const opd = withSuspense(lazy(() => import("@view/opd/opd")));
const expense = withSuspense(lazy(() => import("@view/expense/expense")));
const employees = withSuspense(lazy(() => import("@view/employees/employees")));
const card = withSuspense(lazy(() => import("@view/credit-cards/credit")));
const reports = withSuspense(lazy(() => import("@view/reports/reports")));
const settings = withSuspense(lazy(() => import("@view/settings/settings")));

export const View = {
  dashboard,
  opd,
  expense,
  employees,
  card,
  reports,
  settings,
};
