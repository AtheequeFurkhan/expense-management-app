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
import { Box, Typography } from "@wso2/oxygen-ui";
import type { LucideIcon } from "lucide-react";

export type TrendVariant = "positive" | "negative";

export interface SummaryCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  chipLabel?: string;
  value: string;
  suffix?: string;
  trend: string;
  trendVariant: TrendVariant;
  trendLabel?: string;
  footerRight?: string;
  footerRightLabel?: string;
}

export default function SummaryCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  chipLabel,
  value,
  suffix,
  trend,
  trendVariant,
  trendLabel = `VS ${new Date().getFullYear() - 1}`,
  footerRight,
  footerRightLabel = "Grace Period Claims",
}: SummaryCardProps) {
  const trendColor = trendVariant === "negative" ? "#fcdfdf" : "#dcffe6";
  const trendBg = trendVariant === "negative" ? "#f83e3e" : "#13cd4b";

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        minHeight: 110,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      {/* Top row — icon + trend */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "20%",
            bgcolor: iconBg,
            color: iconColor,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon size={18} />
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Box
            sx={{
              display: "inline-flex",
              px: 1,
              py: 0.2,
              borderRadius: 0.5,
              bgcolor: trendBg,
              color: trendColor,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {trend}
          </Box>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.3,
              letterSpacing: 0.5,
              color: "text.secondary",
              fontSize: 10,
            }}
          >
            {trendLabel}
          </Typography>
        </Box>
      </Box>

      {/* Title*/}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13, fontWeight: 400 }}>
          {title}
        </Typography>
        {chipLabel && (
          <Box
            sx={{
              px: 0.8,
              py: 0.2,
              borderRadius: 1,
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
              fontSize: 11,
              fontWeight: 600,
              color: "text.secondary",
            }}
          >
            {chipLabel}
          </Box>
        )}
      </Box>

      {/* Value + suffix + Grace Period */}
      <Box
        sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}
      >
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8 }}>
          <Typography
            sx={{ fontWeight: 700, fontSize: 26, lineHeight: 1.2, color: "text.primary" }}
          >
            {value}
          </Typography>
          {suffix && (
            <Typography sx={{ color: "text.secondary", fontWeight: 500, fontSize: 14 }}>
              {suffix}
            </Typography>
          )}
        </Box>

        {footerRight && (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 0.8,
              px: 1,
              py: 0.3,
              display: "inline-flex",
              gap: 0.6,
              alignItems: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 600, fontSize: 10 }}
            >
              {footerRightLabel}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 11,
                bgcolor: "#7E4FCA",
                borderRadius: 0.5,
                px: 0.6,
                py: 0.1,
              }}
            >
              {footerRight}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
