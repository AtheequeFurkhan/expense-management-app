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
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@wso2/oxygen-ui";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarSubMenuProps {
  item: {
    label: string;
    path: string;
    icon?: React.ReactNode;
  };
  open: boolean;
}

function SidebarSubMenu({ item, open }: SidebarSubMenuProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === item.path;

  return (
    <ListItemButton
      onClick={() => navigate(item.path)}
      selected={isActive}
      sx={{
        pl: open ? 4 : 2.5,
        minHeight: 40,
        "&.Mui-selected": {
          backgroundColor: theme.palette.action.selected,
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          mr: open ? 2 : "auto",
          justifyContent: "center",
        }}
      >
        {item.icon}
      </ListItemIcon>
      <ListItemText primary={item.label} sx={{ opacity: open ? 1 : 0 }} />
    </ListItemButton>
  );
}

export default SidebarSubMenu;