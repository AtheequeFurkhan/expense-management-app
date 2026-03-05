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
import { Box, MenuItem, Select, Typography } from "@wso2/oxygen-ui";

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
  barGap,
}: ActiveClaimsChartProps) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 18, color: "text.primary" }}>
          {title}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Select
            size="small"
            value={month}
            onChange={(e) => onMonthChange(e.target.value as string)}
            sx={{ borderRadius: 2, fontSize: 14, minWidth: 130 }}
          >
            {monthOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            pr: 1,
            height: chartHeight,
          }}
        >
          {yAxisLabels.map((label) => (
            <Typography
              key={label}
              variant="caption"
              sx={{ color: "text.secondary", fontSize: 12 }}
            >
              {label}
            </Typography>
          ))}
        </Box>

        <Box sx={{ flex: 1, position: "relative", height: chartHeight }}>
          {yAxisLabels.map((label) => (
            <Box
              key={`grid-${label}`}
              sx={{
                position: "absolute",
                top: `${((maxBarValue - label) / maxBarValue) * 100}%`,
                left: 0,
                right: 0,
                borderTop: "1px dashed",
                borderColor: "divider",
                zIndex: 0,
              }}
            />
          ))}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${values.length}, 1fr)`,
              height: "100%",
              position: "relative",
              zIndex: 1,
              gap: barGap,
            }}
          >
            {values.map((value, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  height: "100%",
                }}
              >
                <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end", px: 0.5 }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: `${(value / maxBarValue) * 100}%`,
                      bgcolor: "primary.main",
                      borderRadius: "2px 2px 0 0",
                      transition: "height 0.3s ease",
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          mt: 1,
        }}
      >
        <Box sx={{ pr: 1 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${values.length}, 1fr)`,
          }}
        >
          {xAxisLabels.slice(0, values.length).map((label) => (
            <Typography
              key={label}
              variant="caption"
              sx={{ textAlign: "center", color: "text.secondary", fontSize: 12 }}
            >
              {label}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
