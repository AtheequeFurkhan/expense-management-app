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
import { Box, MenuItem, Select, Tooltip, Typography, useTheme } from "@wso2/oxygen-ui";

import { useState } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface ActiveClaimsChartProps {
  title: string;
  month: string;
  onMonthChange: (value: string) => void;
  monthOptions: FilterOption[];
  values: number[];
  yAxisLabels: number[];
  xAxisLabels: string[];
  maxBarValue: number;
  chartHeight: number;
  barGap: string | number;
}

export default function ActiveClaimsChart({
  title,
  month,
  onMonthChange,
  monthOptions,
  values,
  yAxisLabels,
  xAxisLabels,
  maxBarValue,
  chartHeight,
}: ActiveClaimsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const barColor = isDark ? "#e3f2fd" : "#1976d2";
  const barHoverColor = isDark ? "#bbdefb" : "#1250a0";

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
        gap: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography
            sx={{ fontWeight: 700, fontSize: 16, color: "text.primary", lineHeight: 1.3 }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.disabled", mt: 0.3 }}>
            Claim distribution by amount range
          </Typography>
        </Box>

        <Select
          size="small"
          value={month}
          onChange={(e) => onMonthChange(e.target.value as string)}
          sx={{
            borderRadius: 1,
            fontSize: 13,
            minWidth: 140,
            color: "#1976d2",
            fontWeight: 600,
            "& .MuiSelect-icon": {
              color: "#1976d2",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#1976d2",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#1250a0",
            },
          }}
        >
          {monthOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{
                color: "#1976d2",
                fontWeight: 500,
                "&.Mui-selected": {
                  backgroundColor: "#e3f2fd",
                  color: "#1250a0",
                  fontWeight: 700,
                },
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                },
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Chart area */}
      <Box sx={{ display: "flex", gap: 1 }}>
        {/* Y axis label + values */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {/* Y axis title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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
              Employee Count
            </Typography>
          </Box>

          {/* Y axis values */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-end",
              pr: 1.5,
              height: chartHeight + 24,
              minWidth: 28,
            }}
          >
            {yAxisLabels.map((label) => (
              <Typography key={label} sx={{ fontSize: 11, color: "text.disabled", lineHeight: 1 }}>
                {label}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Bars + X axis */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ flex: 1, position: "relative", height: chartHeight + 24 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${values.length}, 1fr)`,
                height: "100%",
                alignItems: "flex-end",
                position: "relative",
                zIndex: 1,
                gap: 0,
              }}
            >
              {values.map((value, index) => {
                const heightPercent = (value / maxBarValue) * 100;
                const leftLabel = xAxisLabels[index]?.split("-")[0]?.trim() ?? "";
                const rightLabel = xAxisLabels[index]?.split("-")[1]?.trim() ?? "";
                const isHovered = hoveredIndex === index;

                return (
                  <Tooltip
                    key={index}
                    title={
                      <Box sx={{ px: 0.5, py: 0.2 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                          {value} Claims
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)", mt: 0.2 }}>
                          {xAxisLabels[index]}
                        </Typography>
                      </Box>
                    }
                    placement="top"
                    arrow
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, -8],
                            },
                          },
                        ],
                      },
                    }}
                  >
                    <Box
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        height: "100%",
                        position: "relative",
                        cursor: "pointer",
                      }}
                    >
                      <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
                        <Box
                          sx={{
                            width: "100%",
                            height: `${heightPercent}%`,
                            backgroundColor: isHovered ? barHoverColor : barColor,
                            borderRight: index < values.length - 1 ? "1px solid" : "none",
                            borderColor: "background.paper",
                            transition: "background-color 0.25s ease, opacity 0.25s ease",
                            opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1,
                          }}
                        />
                      </Box>

                      {/* X axis edge labels */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.8 }}>
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: isHovered ? "text.primary" : "text.disabled",
                            lineHeight: 1,
                            transform: "translateX(-50%)",
                            transition: "color 0.25s ease",
                            fontWeight: isHovered ? 600 : 400,
                          }}
                        >
                          {leftLabel}
                        </Typography>
                        {index === values.length - 1 && (
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "text.disabled",
                              lineHeight: 1,
                              transform: "translateX(50%)",
                            }}
                          >
                            {rightLabel}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>

          {/* X axis title */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
            <Typography
              sx={{
                fontSize: 11,
                color: "text.disabled",
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              Amount Range
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
