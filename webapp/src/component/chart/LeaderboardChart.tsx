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

import { Box, Typography, useTheme } from "@wso2/oxygen-ui";

import { useState } from "react";

export interface LeaderboardItem {
  label: string;
  sublabel?: string;
  value: number;
}

export interface LeaderboardChartProps {
  data: LeaderboardItem[];
  formatValue?: (value: number) => string;
  accentColor?: string;
  rankColors?: string[];
}

const DEFAULT_RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7f32"];

export default function LeaderboardChart({
  data,
  formatValue = (v) => v.toLocaleString(),
  accentColor,
  rankColors = DEFAULT_RANK_COLORS,
}: LeaderboardChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const resolvedAccent = accentColor ?? (isDark ? "#90caf9" : "#4A8EDB");
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
      {data.map((item, index) => {
        const progressPercent = Math.min(100, (item.value / maxValue) * 100);
        const isHovered = hoveredIndex === index;
        const isTopThree = index < 3;
        const rankColor = isTopThree ? rankColors[index] : undefined;

        return (
          <Box
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: 1,
              bgcolor: isHovered ? "action.hover" : "transparent",
              transition: "background-color 0.2s ease",
              cursor: "default",
              opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1,
            }}
          >
            {/* Rank badge */}
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: rankColor
                  ? `${rankColor}20`
                  : isDark
                    ? "action.selected"
                    : "#f5f5f5",
                border: rankColor ? `2px solid ${rankColor}` : "1px solid",
                borderColor: rankColor ?? "divider",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: rankColor ?? "text.secondary",
                  lineHeight: 1,
                }}
              >
                {index + 1}
              </Typography>
            </Box>

            {/* Name + sublabel */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "text.primary",
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Typography>
              {item.sublabel && (
                <Typography
                  sx={{
                    fontSize: 10.5,
                    color: "text.disabled",
                    lineHeight: 1.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.sublabel}
                </Typography>
              )}

              {/* Progress bar */}
              <Box
                sx={{
                  mt: 0.6,
                  height: 4,
                  borderRadius: 2,
                  bgcolor: isDark ? "action.selected" : "#f0f0f0",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${progressPercent}%`,
                    height: "100%",
                    borderRadius: 2,
                    bgcolor: resolvedAccent,
                    opacity: isHovered ? 1 : 0.8,
                    transition: "width 0.4s ease, opacity 0.25s ease",
                  }}
                />
              </Box>
            </Box>

            {/* Value */}
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: isTopThree ? "text.primary" : "text.secondary",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {formatValue(item.value)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
