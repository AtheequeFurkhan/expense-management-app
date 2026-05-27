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
import {
  CreditCard,
  FileText,
  HeartPulse,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useEffect } from "react";

import { fetchAppConfig } from "@slices/configSlice/config";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { CARD_SX, SECTION_LABEL_SX } from "@src/styles/panelStyles";
import { State } from "@/types/types";
import LocationChips from "@component/common/LocationChips";

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <Box sx={{ ...CARD_SX, display: "flex", alignItems: "center", gap: 2, p: 2.5 }}>
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: 2,
          bgcolor: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Box sx={{ color }}>{icon}</Box>
      </Box>
      <Box>
        <Typography sx={{ fontSize: 24, fontWeight: 800, color: "text.primary", lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.2 }}>{label}</Typography>
        {sub && (
          <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.1 }}>{sub}</Typography>
        )}
      </Box>
    </Box>
  );
}

function ConfigRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.9,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{label}</Typography>
      <Box>{value}</Box>
    </Box>
  );
}

function SectionHeader({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
      <Box sx={{ color }}>{icon}</Box>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>{label}</Typography>
    </Box>
  );
}

const fmt = (n: number) =>
  `Rs ${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function AdminPanel() {
  const dispatch = useAppDispatch();
  const { config, state: configState } = useAppSelector((s) => s.appConfig);

  useEffect(() => {
    dispatch(fetchAppConfig());
  }, [dispatch]);

  const claimCapDisplay = config ? fmt(config.claimLimit) : "—";
  const locationCount = config ? config.submissionsAllowedLocations.length : "—";

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <ShieldCheck size={22} color="#5b21b6" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Admin Panel
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Claim configuration and system parameters
        </Typography>
      </Box>

      {/* Stat cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
        <StatCard
          icon={<FileText size={20} />}
          label="Annual Claim Cap"
          value={claimCapDisplay}
          sub="OPD claims"
          color="#0ea5e9"
        />
        <StatCard
          icon={<MapPin size={20} />}
          label="Allowed Locations"
          value={locationCount}
          sub="Across all claim types"
          color="#10b981"
        />
      </Box>

      {/* System Configuration — full width */}
      <Box sx={CARD_SX}>
        <Typography sx={SECTION_LABEL_SX}>System Configuration</Typography>
        <Typography sx={{ fontSize: 12, color: "text.disabled", mb: 2.5 }}>
          Read-only view — contact your system administrator to make changes.
        </Typography>

        {configState === State.loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: 1.5 }} />
            ))}
          </Box>
        ) : config ? (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>

            {/* OPD Claims */}
            <Box sx={{ p: 2, borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
              <SectionHeader icon={<HeartPulse size={14} />} label="OPD Claims" color="#e11d48" />
              <ConfigRow
                label="Annual Claim Cap"
                value={
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.primary" }}>
                    {fmt(config.claimLimit)}
                  </Typography>
                }
              />
              <ConfigRow
                label="Grace Period"
                value={
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.primary" }}>
                    {config.lastYearClaimGracePeriodInDays} day
                    {config.lastYearClaimGracePeriodInDays !== 1 ? "s" : ""}
                  </Typography>
                }
              />
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontSize: 11, color: "text.secondary", mb: 0.3 }}>
                  Allowed Submission Locations
                </Typography>
                <LocationChips locations={config.submissionsAllowedLocations} />
              </Box>
            </Box>

            {/* Expense Claims */}
            <Box sx={{ p: 2, borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
              <SectionHeader icon={<FileText size={14} />} label="Expense Claims" color="#0ea5e9" />
              <ConfigRow
                label="Annual Claim Cap"
                value={
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.primary" }}>
                    {fmt(config.claimLimit)}
                  </Typography>
                }
              />
              <ConfigRow
                label="Claim Range Step"
                value={
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.primary" }}>
                    {fmt(config.claimRangeStep)}
                  </Typography>
                }
              />
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontSize: 11, color: "text.secondary", mb: 0.3 }}>
                  Allowed Submission Locations
                </Typography>
                <LocationChips locations={config.submissionsAllowedLocations} />
              </Box>
            </Box>

            {/* Credit Card Claims */}
            <Box sx={{ p: 2, borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
              <SectionHeader icon={<CreditCard size={14} />} label="Credit Card Claims" color="#7c3aed" />
              <ConfigRow
                label="Statement Cycle"
                value={
                  <Box
                    sx={{
                      px: 1.2,
                      py: 0.3,
                      borderRadius: 1,
                      bgcolor: "#f5f3ff",
                      border: "1px solid #ede9fe",
                    }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#5b21b6" }}>
                      Monthly
                    </Typography>
                  </Box>
                }
              />
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontSize: 11, color: "text.secondary", mb: 0.3 }}>
                  Allowed Submission Locations
                </Typography>
                <LocationChips locations={config.submissionsAllowedLocations} />
              </Box>
            </Box>

          </Box>
        ) : (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
              Configuration unavailable
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
