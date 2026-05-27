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
import { Box, Button, Skeleton, Typography } from "@wso2/oxygen-ui";

import { useEffect, useState } from "react";

import CurrencySelector from "@component/common/CurrencySelector";
import { DEFAULT_CURRENCY } from "@config/constant";
import { Role } from "@slices/authSlice/auth";
import { fetchAppConfig, updateAppConfig } from "@slices/configSlice/config";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { State } from "@/types/types";
import { type CurrencyCode } from "@utils/currency";

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

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 6,
  border: "1px solid #e5e7eb",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  color: "#111827",
};

export default function UserSettings() {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const roles = useAppSelector((state) => state.auth.roles);
  const { config, state: configLoadState, updateState } = useAppSelector((state) => state.appConfig);

  const isAdmin = roles.includes(Role.ADMIN);
  const [formError, setFormError] = useState<string | null>(null);

  const [currency, setCurrency] = useState<CurrencyCode>(
    () => (localStorage.getItem("defaultCurrency") as CurrencyCode) ?? DEFAULT_CURRENCY,
  );

  const [form, setForm] = useState({
    claimLimit: "",
    claimRangeStep: "",
    lastYearClaimGracePeriodInDays: "",
    submissionsAllowedLocations: "",
  });

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAppConfig());
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (config) {
      setForm({
        claimLimit: String(config.claimLimit),
        claimRangeStep: String(config.claimRangeStep),
        lastYearClaimGracePeriodInDays: String(config.lastYearClaimGracePeriodInDays),
        submissionsAllowedLocations: config.submissionsAllowedLocations.join(", "),
      });
    }
  }, [config]);

  const handleCurrencyChange = (val: CurrencyCode) => {
    setCurrency(val);
    localStorage.setItem("defaultCurrency", val);
  };

  const handleSave = () => {
    const claimLimit = parseFloat(form.claimLimit);
    const claimRangeStep = parseFloat(form.claimRangeStep);
    const gracePeriod = parseInt(form.lastYearClaimGracePeriodInDays, 10);
    const locations = form.submissionsAllowedLocations
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (!isFinite(claimLimit) || claimLimit <= 0) {
      setFormError("Annual Claim Limit must be a positive number.");
      return;
    }
    if (!isFinite(claimRangeStep) || claimRangeStep <= 0) {
      setFormError("Claim Range Step must be a positive number.");
      return;
    }
    if (!isFinite(gracePeriod) || gracePeriod < 0) {
      setFormError("Grace Period must be a non-negative whole number.");
      return;
    }
    if (locations.length === 0) {
      setFormError("At least one allowed location is required.");
      return;
    }

    setFormError(null);
    dispatch(updateAppConfig({ claimLimit, claimRangeStep, lastYearClaimGracePeriodInDays: gracePeriod, submissionsAllowedLocations: locations }));
  };

  const initials = userInfo
    ? `${userInfo.firstName?.[0] ?? ""}${userInfo.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  const fullName = userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : "—";
  const isSaving = updateState === State.loading;

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Page header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Manage your profile and application preferences
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
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    px: 1.2,
                    py: 0.3,
                    borderRadius: 1,
                    bgcolor: "#ede9fe",
                    color: "#5b21b6",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Admin
                </Box>
              )}
              {roles.includes(Role.EMPLOYEE) && (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    px: 1.2,
                    py: 0.3,
                    borderRadius: 1,
                    bgcolor: "#e0f2fe",
                    color: "#0369a1",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Employee
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ textAlign: "right", flexShrink: 0 }}>
            <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
              Identity managed by Asgardeo
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Display Preferences card */}
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

      {/* Application Configuration card — admin only */}
      {isAdmin && (
        <Box sx={CARD_SX}>
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={SECTION_LABEL_SX}>Application Configuration</Typography>
            <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
              System-wide parameters that affect OPD claim processing. Changes take effect immediately.
            </Typography>
          </Box>

          {configLoadState === State.loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={44} sx={{ borderRadius: 1 }} />
              ))}
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Claim Limit + Range Step */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.8 }}>
                    Annual OPD Claim Limit (Rs)
                  </Typography>
                  <input
                    type="number"
                    min={0}
                    value={form.claimLimit}
                    onChange={(e) => setForm((f) => ({ ...f, claimLimit: e.target.value }))}
                    placeholder="e.g. 40000"
                    style={INPUT_STYLE}
                  />
                  <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.5 }}>
                    Maximum claimable amount per employee per year
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.8 }}>
                    Claim Range Step (Rs)
                  </Typography>
                  <input
                    type="number"
                    min={0}
                    value={form.claimRangeStep}
                    onChange={(e) => setForm((f) => ({ ...f, claimRangeStep: e.target.value }))}
                    placeholder="e.g. 4000"
                    style={INPUT_STYLE}
                  />
                  <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.5 }}>
                    Bucket size for the OPD claim distribution chart
                  </Typography>
                </Box>
              </Box>

              {/* Grace Period */}
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.8 }}>
                  Grace Period (days)
                </Typography>
                <input
                  type="number"
                  min={0}
                  value={form.lastYearClaimGracePeriodInDays}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastYearClaimGracePeriodInDays: e.target.value }))
                  }
                  placeholder="e.g. 15"
                  style={{ ...INPUT_STYLE, width: "48%" }}
                />
                <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.5 }}>
                  Days after year-end during which prior-year claims are still accepted
                </Typography>
              </Box>

              {/* Allowed Locations */}
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.8 }}>
                  Allowed Submission Locations
                </Typography>
                <input
                  type="text"
                  value={form.submissionsAllowedLocations}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, submissionsAllowedLocations: e.target.value }))
                  }
                  placeholder="e.g. Sri Lanka, India"
                  style={INPUT_STYLE}
                />
                <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.5 }}>
                  Comma-separated list of employee locations permitted to submit claims
                </Typography>
              </Box>

              {/* Save row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  pt: 0.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box>
                  {formError && (
                    <Typography sx={{ fontSize: 12, color: "#be123c", fontWeight: 500 }}>{formError}</Typography>
                  )}
                  {!formError && updateState === State.success && (
                    <Typography sx={{ fontSize: 12, color: "#15803d", fontWeight: 500 }}>
                      Configuration saved successfully.
                    </Typography>
                  )}
                  {!formError && updateState === State.failed && (
                    <Typography sx={{ fontSize: 12, color: "#be123c", fontWeight: 500 }}>
                      Failed to save. Please try again.
                    </Typography>
                  )}
                </Box>
                <Button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  aria-label="Save configuration"
                  sx={{
                    display: "inline-flex", alignItems: "center",
                    px: 2.5, py: 1, mt: 1.5, borderRadius: 1.5,
                    bgcolor: "#4f46e5", color: "#fff", fontSize: 13, fontWeight: 600,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#4338ca" },
                    "&.Mui-disabled": { bgcolor: "#c7d2fe", color: "#fff" },
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {isSaving ? "Saving…" : "Save Configuration"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
