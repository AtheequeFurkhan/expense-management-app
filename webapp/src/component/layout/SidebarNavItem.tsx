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
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@wso2/oxygen-ui";
import { ChevronDown, ChevronUp } from "@wso2/oxygen-ui-icons-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import SidebarSubMenu from "@component/layout/SidebarSubMenu";

interface SidebarNavItemProps {
  item: {
    label: string;
    path?: string;
    icon?: React.ReactNode;
    children?: Array<{
      label: string;
      path: string;
      icon?: React.ReactNode;
    }>;
  };
  open: boolean;
}

function SidebarNavItem({ item, open }: SidebarNavItemProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.path ? location.pathname === item.path : false;

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        selected={isActive}
        sx={{
          minHeight: 48,
          justifyContent: open ? "initial" : "center",
          px: 2.5,
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
        {hasChildren && open && (expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
      </ListItemButton>
      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children?.map((child) => (
              <SidebarSubMenu key={child.label} item={child} open={open} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

export default SidebarNavItem;