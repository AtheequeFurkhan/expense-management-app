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
import { Box, Divider, Typography } from "@wso2/oxygen-ui";
import {
  BadgeCheck,
  Building2,
  Mail,
  ShieldCheck,
  User,
  UserCog,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Role } from "@slices/authSlice/auth";
import { useAppSelector } from "@slices/store";

const CARD_SX = {
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2,
  p: 3,
};

const SECTION_LABEL_SX = {
  fontSize: 11,
  fontWeight: 700,
  color: "text.disabled",
  textTransform: "uppercase" as const,
  letterSpacing: 0.8,
  mb: 2,
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.2, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: "none" } }}>
      <Box sx={{ color: "text.disabled", display: "flex", alignItems: "center", width: 18 }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: 13, color: "text.secondary", width: 140, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const roles = useAppSelector((state) => state.auth.roles);

  const isAdmin = roles.includes(Role.ADMIN);
  const isEmployee = roles.includes(Role.EMPLOYEE);

  const fullName = userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : "—";
  const initials = userInfo
    ? `${userInfo.firstName?.[0] ?? ""}${userInfo.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Profile</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Your account details and role information
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, alignItems: "start" }}>
        {/* Left column */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          {/* Avatar + name card */}
          <Box sx={{ ...CARD_SX, display: "flex", flexDirection: "column", alignItems: "center", py: 4, gap: 2 }}>
            <Box
              sx={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                bgcolor: "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 800,
                color: "#fff",
                userSelect: "none",
                boxShadow: "0 4px 16px rgba(79,70,229,0.3)",
              }}
            >
              {initials}
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
                {fullName}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.3 }}>
                {userInfo?.workEmail ?? "—"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", justifyContent: "center" }}>
              {isAdmin && (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.2, py: 0.4, borderRadius: 1, bgcolor: "#ede9fe", color: "#5b21b6", fontSize: 11, fontWeight: 700 }}>
                  <ShieldCheck size={11} /> Admin
                </Box>
              )}
              {isEmployee && (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.2, py: 0.4, borderRadius: 1, bgcolor: "#e0f2fe", color: "#0369a1", fontSize: 11, fontWeight: 700 }}>
                  <User size={11} /> Employee
                </Box>
              )}
            </Box>
          </Box>

          {/* Quick actions */}
          <Box sx={CARD_SX}>
            <Typography sx={SECTION_LABEL_SX}>Quick Actions</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {[
                { label: "Edit preferences", sub: "Currency & display settings", path: "/settings", icon: <UserCog size={16} /> },
                ...(isAdmin ? [{ label: "Admin Panel", sub: "Manage users & configuration", path: "/admin", icon: <ShieldCheck size={16} /> }] : []),
              ].map((item) => (
                <Box
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1.2,
                    borderRadius: 1.5, cursor: "pointer", border: "1px solid", borderColor: "divider",
                    "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },
                    transition: "all 0.15s ease",
                  }}
                >
                  <Box sx={{ color: "primary.main" }}>{item.icon}</Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{item.sub}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Right column */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          {/* Account information */}
          <Box sx={CARD_SX}>
            <Typography sx={SECTION_LABEL_SX}>Account Information</Typography>
            <InfoRow icon={<User size={14} />} label="Full Name" value={fullName} />
            <InfoRow icon={<Mail size={14} />} label="Work Email" value={userInfo?.workEmail ?? "—"} />
            <InfoRow icon={<Building2 size={14} />} label="Identity Provider" value="Asgardeo" />
            <InfoRow icon={<BadgeCheck size={14} />} label="Account Status" value="Active" />
          </Box>

          {/* Roles & access */}
          <Box sx={CARD_SX}>
            <Typography sx={SECTION_LABEL_SX}>Roles & Access</Typography>
            {roles.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: "text.disabled" }}>No roles assigned</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {isAdmin && (
                  <Box sx={{ p: 1.5, borderRadius: 1.5, border: "1px solid #ede9fe", bgcolor: "#faf5ff" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4 }}>
                      <ShieldCheck size={14} color="#5b21b6" />
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#5b21b6" }}>Administrator</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      Full access to system configuration, employee management, and all reports.
                    </Typography>
                  </Box>
                )}
                {isEmployee && (
                  <Box sx={{ p: 1.5, borderRadius: 1.5, border: "1px solid #e0f2fe", bgcolor: "#f0f9ff" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4 }}>
                      <User size={14} color="#0369a1" />
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0369a1" }}>Employee</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      Can submit OPD and expense claims, and view personal dashboard data.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Security */}
          <Box sx={CARD_SX}>
            <Typography sx={SECTION_LABEL_SX}>Security</Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1 }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
                  Authentication
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.disabled", mt: 0.2 }}>
                  Managed externally via Asgardeo SSO
                </Typography>
              </Box>
              <Box sx={{ px: 1.2, py: 0.4, borderRadius: 1, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#15803d" }}>SSO Active</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1 }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
                  Password Management
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.disabled", mt: 0.2 }}>
                  Passwords are managed by your identity provider
                </Typography>
              </Box>
              <Box sx={{ px: 1.2, py: 0.4, borderRadius: 1, bgcolor: "#f8fafc", border: "1px solid", borderColor: "divider" }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary" }}>Asgardeo</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
