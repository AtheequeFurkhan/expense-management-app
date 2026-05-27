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
import { Box, Skeleton, Typography } from "@wso2/oxygen-ui";
import { MapPin, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";

import CurrencySelector from "@component/common/CurrencySelector";
import LocationChips from "@component/common/LocationChips";
import { DEFAULT_CURRENCY } from "@config/constant";
import { THEMES, useAppTheme } from "@context/ThemeContext";
import { fetchAppConfig } from "@slices/configSlice/config";
import { Role } from "@slices/authSlice/auth";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { CARD_SX, SECTION_LABEL_SX } from "@src/styles/panelStyles";
import { type CurrencyCode } from "@utils/currency";
import { State } from "@/types/types";

export default function UserSettings() {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const roles = useAppSelector((state) => state.auth.roles);
  const { config, state: configState } = useAppSelector((state) => state.appConfig);

  const isAdmin = roles.includes(Role.ADMIN);

  const { themeName, setThemeName } = useAppTheme();

  const [currency, setCurrency] = useState<CurrencyCode>(
    () => (localStorage.getItem("defaultCurrency") as CurrencyCode) ?? DEFAULT_CURRENCY,
  );

  useEffect(() => {
    dispatch(fetchAppConfig());
  }, [dispatch]);

  const handleCurrencyChange = (val: CurrencyCode) => {
    setCurrency(val);
    localStorage.setItem("defaultCurrency", val);
  };

  const initials = userInfo
    ? (`${userInfo.firstName?.[0] ?? ""}${userInfo.lastName?.[0] ?? ""}`.toUpperCase() || "?")
    : "?";

  const fullName = userInfo
    ? [userInfo.firstName, userInfo.lastName].filter(Boolean).join(" ") || "—"
    : "—";

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Page header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Settings</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Manage your profile and display preferences
        </Typography>
      </Box>

      {/* Profile card */}
      <Box sx={CARD_SX}>
        <Typography sx={SECTION_LABEL_SX}>My Profile</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              bgcolor: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 22,
              fontWeight: 700,
              flexShrink: 0,
              userSelect: "none",
            }}
          >
            {initials}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: "text.primary" }}>
              {fullName}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.2 }}>
              {userInfo?.workEmail ?? "—"}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.8, mt: 1, flexWrap: "wrap" }}>
              {isAdmin && (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.2, py: 0.3, borderRadius: 1, bgcolor: "#ede9fe", color: "#5b21b6", fontSize: 11, fontWeight: 700 }}>
                  <ShieldCheck size={10} /> Finance Admin
                </Box>
              )}
              {roles.includes(Role.EMPLOYEE) && (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.2, py: 0.3, borderRadius: 1, bgcolor: "#e0f2fe", color: "#0369a1", fontSize: 11, fontWeight: 700 }}>
                  <User size={10} /> Employee
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Theme Appearance */}
      <Box sx={CARD_SX}>
        <Typography sx={SECTION_LABEL_SX}>Theme Appearance</Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}>
              Color Theme
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.disabled", mt: 0.3 }}>
              Persisted locally — takes effect immediately
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            {THEMES.map((t) => (
              <Box
                key={t.name}
                onClick={() => setThemeName(t.name)}
                role="radio"
                aria-checked={themeName === t.name}
                aria-label={`${t.label} theme`}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setThemeName(t.name); }}
                sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.6, cursor: "pointer", userSelect: "none" }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: t.color,
                    border: themeName === t.name ? `3px solid ${t.color}` : "3px solid transparent",
                    outline: themeName === t.name ? `2px solid ${t.ring}` : "2px solid transparent",
                    outlineOffset: 2,
                    transition: "outline 0.15s ease, border 0.15s ease",
                    boxShadow: themeName === t.name ? `0 0 0 2px ${t.ring}` : "none",
                  }}
                />
                <Typography sx={{ fontSize: 10, fontWeight: themeName === t.name ? 700 : 500, color: themeName === t.name ? "text.primary" : "text.disabled" }}>
                  {t.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Display Preferences */}
      <Box sx={CARD_SX}>
        <Typography sx={SECTION_LABEL_SX}>Display Preferences</Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}>
              Default Currency
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.disabled", mt: 0.3 }}>
              Saved locally — applies when opening each dashboard page
            </Typography>
          </Box>
          <CurrencySelector value={currency} onChange={handleCurrencyChange} />
        </Box>
      </Box>

      {/* System Info — view only, non-sensitive */}
      <Box sx={CARD_SX}>
        <Typography sx={SECTION_LABEL_SX}>System Information</Typography>
        <Typography sx={{ fontSize: 12, color: "text.disabled", mb: 2 }}>
          Read-only — managed by your Finance Admin
        </Typography>
        {configState === State.loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Skeleton variant="rectangular" height={28} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={28} sx={{ borderRadius: 1 }} />
          </Box>
        ) : config ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <MapPin size={13} color="#10b981" />
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
                  Allowed Submission Locations
                </Typography>
              </Box>
              <LocationChips locations={config.submissionsAllowedLocations} />
            </Box>
          </Box>
        ) : (
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>Configuration unavailable</Typography>
        )}
      </Box>
    </Box>
  );
}
