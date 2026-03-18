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

import {
  BanknoteArrowDown,
  CreditCard,
  FilePlus,
  HeartPulse,
  Settings,
  Users,
} from "@wso2/oxygen-ui-icons-react";
import { type RouteObject } from "react-router-dom";

import React from "react";

import { Role } from "@slices/authSlice/auth";
import { isIncludedRole } from "@utils/utils";
import { View } from "@view/index";

import type { RouteDetail, RouteObjectWithRole } from "./types/types";

export const routes: RouteObjectWithRole[] = [
  {
    path: "/settings",
    text: "Settings",
    icon: React.createElement(Settings),
    element: React.createElement(View.settings),
    allowRoles: [Role.ADMIN, Role.EMPLOYEE],
    bottomNav: true,
  },
  {
    path: "/opd-claim-summary",
    text: "OPD Claims",
    icon: React.createElement(HeartPulse),
    element: React.createElement(View.opd),
    allowRoles: [Role.ADMIN, Role.EMPLOYEE],
  },
  {
    path: "/expense-claim-summary",
    text: "Expense Claims",
    icon: React.createElement(BanknoteArrowDown),
    element: React.createElement(View.expense),
    allowRoles: [Role.ADMIN, Role.EMPLOYEE],
  },
  {
    path: "/employee-summary",
    text: "Employees",
    icon: React.createElement(Users),
    element: React.createElement(View.employees),
    allowRoles: [Role.ADMIN, Role.EMPLOYEE],
  },
  {
    path: "/credit-card-summary",
    text: "Card Claims",
    icon: React.createElement(CreditCard),
    element: React.createElement(View.card),
    allowRoles: [Role.ADMIN, Role.EMPLOYEE],
  },
  {
    path: "/report-summary",
    text: "Reports",
    icon: React.createElement(FilePlus),
    element: React.createElement(View.reports),
    allowRoles: [Role.ADMIN, Role.EMPLOYEE],
  },
];

const hiddenNavigationPaths = new Set([
  "/expense-claim-summary",
  "/employee-summary",
  "/credit-card-summary",
  "/report-summary",
]);

export const getActiveRoutesV2 = (
  routes: RouteObjectWithRole[] | undefined,
  roles: string[],
): RouteObjectWithRole[] => {
  if (!routes) return [];
  const routesObj: RouteObjectWithRole[] = [];
  routes.forEach((routeObj) => {
    if (isIncludedRole(roles, routeObj.allowRoles)) {
      routesObj.push({
        ...routeObj,
        children: getActiveRoutesV2(routeObj.children, roles),
      });
    }
  });

  return routesObj;
};

export const getActiveRoutes = (roles: string[]): RouteObject[] => {
  const routesObj: RouteObject[] = [];
  routes.forEach((routeObj) => {
    if (isIncludedRole(roles, routeObj.allowRoles)) {
      routesObj.push({
        ...routeObj,
      });
    }
  });
  return routesObj;
};

export const getActiveRouteDetails = (roles: string[]): RouteDetail[] => {
  const routesObj: RouteDetail[] = [];
  routes.forEach((routeObj) => {
    if (
      isIncludedRole(roles, routeObj.allowRoles) &&
      !hiddenNavigationPaths.has(routeObj.path ?? "")
    ) {
      routesObj.push({
        ...routeObj,
        path: routeObj.path ?? "",
      });
    }
  });
  return routesObj;
};

interface getActiveParentRoutesProps {
  routes: RouteObjectWithRole[] | undefined;
  roles: string[];
}

export const getActiveParentRoutes = ({ routes, roles }: getActiveParentRoutesProps): string[] => {
  if (!routes) return [];

  const activeParentPaths: string[] = [];

  routes.forEach((routeObj) => {
    if (!routeObj.element) return;

    if (isIncludedRole(roles, routeObj.allowRoles)) {
      if (routeObj.path) {
        activeParentPaths.push(routeObj.path);
      }
    }
  });

  return activeParentPaths;
};
