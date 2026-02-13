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
import { useBasicUserInfo, useSignOut } from "@asgardeo/auth-react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@wso2/oxygen-ui";
import { LogOut, Menu as MenuIcon, PanelLeftClose } from "@wso2/oxygen-ui-icons-react";

import { useEffect, useState } from "react";

import { useAppSelector } from "@slices/store";

interface HeaderProps {
  open: boolean;
  handleDrawerToggle: () => void;
  drawerWidth: number;
  collapsedWidth: number;
}

function Header({ open, handleDrawerToggle, drawerWidth, collapsedWidth }: HeaderProps) {
  const theme = useTheme();
  const { getBasicUserInfo } = useBasicUserInfo();
  const { signOut } = useSignOut();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const menuOpen = Boolean(anchorEl);
  const appConfig = useAppSelector((state) => state.appConfig.config);

  useEffect(() => {
    getBasicUserInfo().then((info) => {
      setUserName(info?.displayName || info?.username || "");
      setUserEmail(info?.email || "");
    });
  }, [getBasicUserInfo]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        width: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="toggle drawer"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, color: theme.palette.text.primary }}
        >
          {open ? <PanelLeftClose size={20} /> : <MenuIcon size={20} />}
        </IconButton>

        <Typography variant="h6" noWrap sx={{ flexGrow: 1, color: theme.palette.text.primary }}>
          {appConfig?.appName || ""}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Account settings">
            <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                {userName?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {userName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userEmail}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleSignOut}>
            <ListItemIcon>
              <LogOut size={18} />
            </ListItemIcon>
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
