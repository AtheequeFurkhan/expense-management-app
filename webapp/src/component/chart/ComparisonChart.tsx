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

import { Box, Tooltip, Typography, useTheme } from "@wso2/oxygen-ui";

import { useState } from "react";

export interface ComparisonChartItem {
  label: string;
  current: number;
  previous: number;
}

export interface ComparisonChartProps {
  data: ComparisonChartItem[];
  height?: number;
  currentLabel?: string;
  previousLabel?: string;
  currentColor?: string;
  previousColor?: string;
  formatValue?: (value: number) => string;
  yAxisLabel?: string;
}

export default function ComparisonChart({
  data,
  height = 260,
  currentLabel = "Current",
  previousLabel = "Previous",
  currentColor,
  previousColor,
  formatValue = (v) => v.toLocaleString(),
  yAxisLabel = "Amount",
}: ComparisonChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredSeries, setHoveredSeries] = useState<"current" | "previous" | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const resolvedCurrentColor = currentColor ?? (isDark ? "#90caf9" : "#4A8EDB");
  const resolvedPreviousColor = previousColor ?? (isDark ? "#ce93d8" : "#AB7AE0");

  const allValues = data.flatMap((d) => [d.current, d.previous]);
  const maxValue = Math.max(...allValues, 1);
  const yAxisValues = [
    maxValue,
    Math.round(maxValue * 0.75),
    Math.round(maxValue * 0.5),
    Math.round(maxValue * 0.25),
    0,
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mb: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "2px",
              bgcolor: resolvedCurrentColor,
            }}
          />
          <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600 }}>
            {currentLabel}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "2px",
              bgcolor: resolvedPreviousColor,
            }}
          />
          <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600 }}>
            {previousLabel}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 0.5, flex: 1 }}>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography
              sx={{
                fontSize: 11,
                color: "text.disabled",
                fontWeight: 600,
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                letterSpacing: 0.5,
                whiteSpace: "nowrap",
              }}
            >
              {yAxisLabel}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-end",
              pr: 1,
              height,
              minWidth: 40,
            }}
          >
            {yAxisValues.map((label, i) => (
              <Typography key={i} sx={{ fontSize: 10, color: "text.disabled", lineHeight: 1 }}>
                {formatValue(label)}
              </Typography>
            ))}
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${data.length}, 1fr)`,
              height,
              alignItems: "flex-end",
              gap: "6px",
            }}
          >
            {data.map((item, index) => {
              const currentHeightPercent = Math.min(100, (item.current / maxValue) * 100);
              const previousHeightPercent = Math.min(100, (item.previous / maxValue) * 100);
              const isHovered = hoveredIndex === index;

              return (
                <Box
                  key={index}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    setHoveredSeries(null);
                  }}
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "2px",
                    cursor: "pointer",
                    opacity: hoveredIndex !== null && !isHovered ? 0.45 : 1,
                    transition: "opacity 0.25s ease",
                  }}
                >
                  <Tooltip
                    title={
                      <Box sx={{ px: 0.5, py: 0.2 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                          {currentLabel}: {formatValue(item.current)}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)", mt: 0.2 }}>
                          {item.label}
                        </Typography>
                      </Box>
                    }
                    placement="top"
                    arrow
                    open={isHovered && hoveredSeries !== "previous"}
                    disableHoverListener
                  >
                    <Box
                      onMouseEnter={() => setHoveredSeries("current")}
                      sx={{
                        flex: 1,
                        height: `${currentHeightPercent}%`,
                        minHeight: currentHeightPercent > 0 ? 4 : 0,
                        bgcolor: resolvedCurrentColor,
                        borderRadius: "3px 3px 0 0",
                        transition: "background-color 0.25s ease",
                      }}
                    />
                  </Tooltip>

                  <Tooltip
                    title={
                      <Box sx={{ px: 0.5, py: 0.2 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                          {previousLabel}: {formatValue(item.previous)}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)", mt: 0.2 }}>
                          {item.label}
                        </Typography>
                      </Box>
                    }
                    placement="top"
                    arrow
                    open={isHovered && hoveredSeries === "previous"}
                    disableHoverListener
                  >
                    <Box
                      onMouseEnter={() => setHoveredSeries("previous")}
                      sx={{
                        flex: 1,
                        height: `${previousHeightPercent}%`,
                        minHeight: previousHeightPercent > 0 ? 4 : 0,
                        bgcolor: resolvedPreviousColor,
                        borderRadius: "3px 3px 0 0",
                        transition: "background-color 0.25s ease",
                      }}
                    />
                  </Tooltip>
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${data.length}, 1fr)`,
              mt: 0.8,
            }}
          >
            {data.map((item, index) => (
              <Typography
                key={index}
                sx={{
                  fontSize: 10.5,
                  color: "text.disabled",
                  fontWeight: 600,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
