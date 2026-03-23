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
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";

import AppSkeleton from "@component/common/AppSkeleton";
import ErrorHandler from "@component/common/ErrorHandler";
import BackdropProgress from "@component/ui/BackdropProgress";
import Layout from "@layout/Layout";
import NotFoundPage from "@layout/pages/404";
import MaintenancePage from "@layout/pages/Maintenance";
import { RootState, useAppSelector } from "@slices/store";

import { getActiveRoutesV2, routes } from "../route";

const AppHandler = () => {
  const [appState, setAppState] = useState<"loading" | "success" | "failed" | "maintenance">(
    "loading",
  );

  const auth = useAppSelector((state: RootState) => state.auth);
  const isGlobalLoading = useAppSelector(
    (state: RootState) => (state.common as { isGlobalLoading: boolean }).isGlobalLoading,
  );
  const activeRoutes = useMemo(() => getActiveRoutesV2(routes, auth.roles), [auth.roles]);
  const defaultRoute =
    activeRoutes.find((route) => route.path === "/opd-claim-summary")?.path ??
    activeRoutes[0]?.path ??
    "/";

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: "/",
          element: <Layout />,
          errorElement: <NotFoundPage />,
          children: [
            {
              index: true,
              element: <Navigate to={defaultRoute} replace />,
            },
            ...activeRoutes,
          ],
        },
      ]),
    [activeRoutes, defaultRoute],
  );

  useEffect(() => {
    if (auth.status === "idle" || auth.status === "loading") {
      setAppState("loading");
    } else if (auth.mode === "maintenance") {
      setAppState("maintenance");
    } else if (auth.status === "failed") {
      setAppState("failed");
    } else if (auth.status === "success") {
      setAppState("success");
    }
  }, [auth.status, auth.mode]);

  const renderApp = () => {
    switch (appState) {
      case "loading":
        return <AppSkeleton />;

      case "failed":
        return <ErrorHandler error={auth.statusMessage || "An error occurred"} />;

      case "success":
        return <RouterProvider router={router} />;

      case "maintenance":
        return <MaintenancePage />;

      default:
        return <AppSkeleton />;
    }
  };

  return (
    <>
      {renderApp()}
      {appState === "success" && <BackdropProgress open={isGlobalLoading} />}
    </>
  );
};

export default AppHandler;
