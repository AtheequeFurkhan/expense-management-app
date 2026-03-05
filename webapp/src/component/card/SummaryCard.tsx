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
  value: string;
  suffix?: string;
  trend: string;
  trendVariant: TrendVariant;
  trendLabel?: string;
  footerDotColor?: string;
  footerLeft?: string;
  footerRight?: string;
  footerRightLabel?: string;
}

export default function SummaryCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  value,
  suffix,
  trend,
  trendVariant,
  trendLabel = "VS PREV PERIOD",
  footerDotColor = "info.main",
  footerLeft,
  footerRight,
  footerRightLabel = "Grace Period Claims",
}: SummaryCardProps) {
  const trendColor = trendVariant === "negative" ? "#fcdfdf" : "#dcffe6";
  const trendBg = trendVariant === "negative" ? "#f83e3e" : "#13cd4b";

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        minHeight: 168,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "20%",
            bgcolor: iconBg,
            color: iconColor,
            display: "grid",
            placeItems: "center",
            fontSize: 20,
            lineHeight: 1,
          }}
        >
          <Icon size={20} />
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
              fontSize: 14,
            }}
          >
            {trend}
          </Box>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.4,
              letterSpacing: 0.5,
              color: "text.secondary",
              fontSize: 11,
            }}
          >
            {trendLabel}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 14, fontWeight: 400 }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8, mt: 0.5 }}>
          <Typography
            sx={{ fontWeight: 700, fontSize: 30, lineHeight: 1.2, color: "text.primary" }}
          >
            {value}
          </Typography>
          {suffix && (
            <Typography sx={{ color: "text.secondary", fontWeight: 500, fontSize: 16 }}>
              {suffix}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          mt: 2,
          minHeight: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        {footerLeft ? (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              fontSize: 13,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: footerDotColor,
                flexShrink: 0,
              }}
            />
            {footerLeft}
          </Typography>
        ) : (
          <Box sx={{ width: 80 }} />
        )}

        {footerRight ? (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 0.8,
              px: 1.2,
              py: 0.4,
              display: "inline-flex",
              gap: 0.8,
              alignItems: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 600, fontSize: 11 }}
            >
              {footerRightLabel}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#cff9ff",
                fontWeight: 700,
                fontSize: 12,
                bgcolor: "#13b8cd",
                borderRadius: 0.5,
                px: 0.6,
                py: 0.1,
              }}
            >
              {footerRight}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: 120 }} />
        )}
      </Box>
    </Box>
  );
}
