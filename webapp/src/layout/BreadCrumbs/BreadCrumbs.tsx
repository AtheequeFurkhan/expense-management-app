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
import { Breadcrumbs, Link, Typography, useTheme } from "@wso2/oxygen-ui";
import { ChevronRight, Home } from "@wso2/oxygen-ui-icons-react";
import { useLocation, useNavigate } from "react-router-dom";

function BreadCrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Breadcrumbs separator={<ChevronRight size={16} />} aria-label="breadcrumb" sx={{ mb: 2 }}>
      <Link
        underline="hover"
        color="inherit"
        onClick={() => navigate("/")}
        sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      >
        <Home size={18} style={{ marginRight: theme.spacing(0.5) }} />
        Home
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");

        return isLast ? (
          <Typography key={to} color="text.primary">
            {label}
          </Typography>
        ) : (
          <Link
            key={to}
            underline="hover"
            color="inherit"
            onClick={() => navigate(to)}
            sx={{ cursor: "pointer" }}
          >
            {label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}

export default BreadCrumbs;
