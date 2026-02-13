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
import { AppShell, Box, ColorSchemeToggle, Footer, Header, Sidebar } from "@wso2/oxygen-ui";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useMemo, useState } from "react";

import BreadCrumbs from "@layout/BreadCrumbs/BreadCrumbs";
import { getActiveRouteDetails, routes } from "@src/route";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const allRoutes = useMemo(() => getActiveRouteDetails([]), []);

  // Determine active item based on current path
  const activeItem = useMemo(() => {
    const currentRoute = allRoutes.find((r) => r.path === location.pathname);
    return currentRoute?.path ?? "/";
  }, [allRoutes, location.pathname]);

  const handleSelect = (id: string) => {
    navigate(id);
  };

  return (
    <AppShell>
      {/* Header */}
      <AppShell.Navbar>
        <Header>
          <Header.Toggle collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
          <Header.Brand>
            <Header.BrandTitle>Expense Management</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <ColorSchemeToggle />
          </Header.Actions>
        </Header>
      </AppShell.Navbar>

      {/* Sidebar */}
      <AppShell.Sidebar>
        <Sidebar collapsed={collapsed} activeItem={activeItem} onSelect={handleSelect}>
          <Sidebar.Nav>
            <Sidebar.Category>
              <Sidebar.CategoryLabel>Menu</Sidebar.CategoryLabel>
              {allRoutes
                .filter((route) => !route.bottomNav && !route.children?.length)
                .map((route) => (
                  <Sidebar.Item key={route.path} id={route.path}>
                    <Sidebar.ItemIcon>{route.icon}</Sidebar.ItemIcon>
                    <Sidebar.ItemLabel>{route.text}</Sidebar.ItemLabel>
                  </Sidebar.Item>
                ))}

              {/* Routes with children (expandable) */}
              {allRoutes
                .filter((route) => !route.bottomNav && route.children?.length)
                .map((route) => (
                  <Sidebar.Item key={route.path} id={route.path}>
                    <Sidebar.ItemIcon>{route.icon}</Sidebar.ItemIcon>
                    <Sidebar.ItemLabel>{route.text}</Sidebar.ItemLabel>
                    {route.children?.map((child) => (
                      <Sidebar.Item
                        key={`${route.path}/${child.path}`}
                        id={`${route.path}/${child.path}`}
                      >
                        <Sidebar.ItemIcon>{child.icon}</Sidebar.ItemIcon>
                        <Sidebar.ItemLabel>{child.text}</Sidebar.ItemLabel>
                      </Sidebar.Item>
                    ))}
                  </Sidebar.Item>
                ))}
            </Sidebar.Category>
          </Sidebar.Nav>

          {/* Bottom nav items */}
          <Sidebar.Footer>
            {allRoutes
              .filter((route) => route.bottomNav)
              .map((route) => (
                <Sidebar.Item key={route.path} id={route.path}>
                  <Sidebar.ItemIcon>{route.icon}</Sidebar.ItemIcon>
                  <Sidebar.ItemLabel>{route.text}</Sidebar.ItemLabel>
                </Sidebar.Item>
              ))}
          </Sidebar.Footer>
        </Sidebar>
      </AppShell.Sidebar>

      {/* Main Content */}
      <AppShell.Main>
        <Box sx={{ p: 2 }}>
          <BreadCrumbs />
          <Outlet />
        </Box>
      </AppShell.Main>

      {/* Footer */}
      <AppShell.Footer>
        <Footer companyName="WSO2 LLC" year={new Date().getFullYear()} />
      </AppShell.Footer>
    </AppShell>
  );
}

export default Layout;
