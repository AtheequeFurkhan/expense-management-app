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

import { Box, MenuItem, Popover, Typography, useTheme } from "@wso2/oxygen-ui";
import { ChevronDown } from "@wso2/oxygen-ui-icons-react";

import { useState } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface ChartPeriodFilterProps {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

export default function ChartPeriodFilter({ value, options, onChange }: ChartPeriodFilterProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  return (
    <>
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.4,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          cursor: "pointer",
          userSelect: "none",
          minWidth: 140,
          justifyContent: "space-between",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.primary" }}>
          {selectedLabel}
        </Typography>
        <ChevronDown size={16} style={{ color: theme.palette.text.secondary }} />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 160,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: 3,
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => {
              onChange(option.value);
              setAnchorEl(null);
            }}
            sx={{
              fontSize: 13,
              fontWeight: option.value === value ? 700 : 400,
              color: option.value === value ? "primary.main" : "text.primary",
              bgcolor: option.value === value ? "action.selected" : "transparent",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Popover>
    </>
  );
}
