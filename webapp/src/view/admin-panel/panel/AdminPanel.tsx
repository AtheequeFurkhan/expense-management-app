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
import {
  MapPin,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useEffect, useState } from "react";

import { fetchEmployees } from "@slices/employeeSlice/employee";
import { fetchAppConfig, updateAppConfig } from "@slices/configSlice/config";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { State } from "@/types/types";

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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <Box sx={{ ...CARD_SX, display: "flex", alignItems: "center", gap: 2, p: 2.5 }}>
      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Box sx={{ color }}>{icon}</Box>
      </Box>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>{value}</Typography>
        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.2 }}>{label}</Typography>
      </Box>
    </Box>
  );
}

export default function AdminPanel() {
  const dispatch = useAppDispatch();
  const { employees, state: empState } = useAppSelector((state) => state.employee);
  const { config, state: configState, updateState } = useAppSelector((state) => state.appConfig);

  const [empSearch, setEmpSearch] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    claimLimit: "",
    claimRangeStep: "",
    lastYearClaimGracePeriodInDays: "",
    submissionsAllowedLocations: "",
  });

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchAppConfig());
  }, [dispatch]);

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

  const filteredEmployees = (employees ?? []).filter((e) => {
    const q = empSearch.toLowerCase().trim();
    if (!q) return true;
    return `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) || e.workEmail.toLowerCase().includes(q);
  });

  const isSaving = updateState === State.loading;

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <ShieldCheck size={22} color="#5b21b6" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Admin Panel</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          System management, configuration, and employee oversight
        </Typography>
      </Box>

      {/* Stat cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        <StatCard icon={<Users size={20} />} label="Total Employees" value={empState === State.loading ? "—" : (employees?.length ?? 0)} color="#4f46e5" />
        <StatCard icon={<Settings2 size={20} />} label="Annual Claim Limit (Rs)" value={config ? config.claimLimit.toLocaleString() : "—"} color="#0ea5e9" />
        <StatCard icon={<MapPin size={20} />} label="Allowed Locations" value={config ? config.submissionsAllowedLocations.length : "—"} color="#10b981" />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, alignItems: "start" }}>

        {/* Employee directory */}
        <Box sx={CARD_SX}>
          <Typography sx={SECTION_LABEL_SX}>Employee Directory</Typography>

          {/* Search */}
          <Box sx={{ position: "relative", mb: 1.5 }}>
            <Box sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "text.disabled", display: "flex" }}>
              <Search size={14} />
            </Box>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              style={{ ...INPUT_STYLE, paddingLeft: 32, fontSize: 13 }}
            />
          </Box>

          {empState === State.loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={52} sx={{ borderRadius: 1.5 }} />
              ))}
            </Box>
          ) : filteredEmployees.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
                {empSearch ? "No employees match your search" : "No employees found"}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, maxHeight: 420, overflowY: "auto", pr: 0.5, "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: "text.disabled", borderRadius: 2 } }}>
              {filteredEmployees.map((emp) => {
                const initials = `${emp.firstName?.[0] ?? ""}${emp.lastName?.[0] ?? ""}`.toUpperCase();
                return (
                  <Box key={emp.workEmail} sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1, borderRadius: 1.5, border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "action.hover" } }}>
                    <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0, userSelect: "none" }}>
                      {initials}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {emp.firstName} {emp.lastName}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "text.disabled", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {emp.workEmail}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          {filteredEmployees.length > 0 && (
            <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 1.5, textAlign: "right" }}>
              {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""}
            </Typography>
          )}
        </Box>

        {/* App configuration */}
        <Box sx={CARD_SX}>
          <Typography sx={SECTION_LABEL_SX}>Application Configuration</Typography>
          <Typography sx={{ fontSize: 12, color: "text.disabled", mb: 2.5 }}>
            System-wide parameters affecting OPD claim processing.
          </Typography>

          {configState === State.loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={44} sx={{ borderRadius: 1 }} />
              ))}
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.8 }}>
                    Annual Claim Limit (Rs)
                  </Typography>
                  <input type="number" min={0} value={form.claimLimit} onChange={(e) => setForm((f) => ({ ...f, claimLimit: e.target.value }))} placeholder="e.g. 40000" style={INPUT_STYLE} />
                  <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.4 }}>
                    Max claimable per employee per year
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.8 }}>
                    Claim Range Step (Rs)
                  </Typography>
                  <input type="number" min={0} value={form.claimRangeStep} onChange={(e) => setForm((f) => ({ ...f, claimRangeStep: e.target.value }))} placeholder="e.g. 4000" style={INPUT_STYLE} />
                  <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.4 }}>
                    Bucket size for the distribution chart
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.8 }}>
                  Grace Period (days)
                </Typography>
                <input type="number" min={0} value={form.lastYearClaimGracePeriodInDays} onChange={(e) => setForm((f) => ({ ...f, lastYearClaimGracePeriodInDays: e.target.value }))} placeholder="e.g. 15" style={{ ...INPUT_STYLE, maxWidth: "50%" }} />
                <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.4 }}>
                  Days after year-end to accept prior-year claims
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.8 }}>
                  Allowed Submission Locations
                </Typography>
                <input type="text" value={form.submissionsAllowedLocations} onChange={(e) => setForm((f) => ({ ...f, submissionsAllowedLocations: e.target.value }))} placeholder="e.g. Sri Lanka, India" style={INPUT_STYLE} />
                <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.4 }}>
                  Comma-separated list of permitted locations
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
                <Box>
                  {formError && (
                    <Typography sx={{ fontSize: 12, color: "#be123c", fontWeight: 500 }}>{formError}</Typography>
                  )}
                  {!formError && updateState === State.success && (
                    <Typography sx={{ fontSize: 12, color: "#15803d", fontWeight: 500 }}>Saved successfully.</Typography>
                  )}
                  {!formError && updateState === State.failed && (
                    <Typography sx={{ fontSize: 12, color: "#be123c", fontWeight: 500 }}>Failed to save. Try again.</Typography>
                  )}
                </Box>
                <Button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  aria-label="Save changes"
                  sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.75,
                    px: 2, py: 0.9, borderRadius: 1.5,
                    bgcolor: "#4f46e5", color: "#fff", fontSize: 13, fontWeight: 600,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#4338ca" },
                    "&.Mui-disabled": { bgcolor: "#c7d2fe", color: "#fff" },
                    transition: "background-color 0.15s ease",
                  }}
                >
                  <Save size={14} />
                  {isSaving ? "Saving…" : "Save Changes"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
