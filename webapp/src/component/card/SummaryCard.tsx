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
  const isNegative = trendVariant === "negative";
  const trendTextColor = isNegative ? "#f83e3e" : "#13cd4b";
  const trendBgColor = isNegative ? "#fff0f0" : "#f0fff4";

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        minHeight: 130,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          bgcolor: iconColor,
          borderRadius: "1px 1px 0 0",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: iconBg,
            color: iconColor,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={20} />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.3 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1,
              py: 0.3,
              borderRadius: 0.5,
              bgcolor: trendBgColor,
              color: trendTextColor,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 0.3,
            }}
          >
            {trend}
          </Box>
          <Typography sx={{ fontSize: 10, color: "text.disabled", letterSpacing: 0.4 }}>
            {trendLabel}
          </Typography>
        </Box>
      </Box>

      {/* Title and chip side by side */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
            fontWeight: 500,
            letterSpacing: 0.2,
          }}
        >
          {title}
        </Typography>

        {chipLabel && (
          <Box
            sx={{
              px: 0.8,
              py: 0.2,
              borderRadius: 0.5,
              fontSize: 11,
              fontWeight: 700,
              color: iconColor,
              bgcolor: iconBg,
              letterSpacing: 0.5,
              lineHeight: 1.6,
            }}
          >
            {chipLabel}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 1,
          mt: "auto",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 28,
              lineHeight: 1,
              color: "text.primary",
              letterSpacing: -0.5,
            }}
          >
            {value}
          </Typography>
          {suffix && (
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: "text.secondary",
                letterSpacing: 0.3,
              }}
            >
              {suffix}
            </Typography>
          )}
        </Box>

        {footerRight && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 0.3,
            }}
          >
            <Typography sx={{ fontSize: 10, color: "text.disabled", letterSpacing: 0.3 }}>
              {footerRightLabel}
            </Typography>
            <Box
              sx={{
                px: 1,
                py: 0.2,
                borderRadius: 0.5,
                bgcolor: "#7E4FCA",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 0.5,
                minWidth: 32,
                textAlign: "center",
              }}
            >
              {footerRight}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
