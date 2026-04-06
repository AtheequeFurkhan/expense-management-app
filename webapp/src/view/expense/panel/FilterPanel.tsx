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
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { useCallback, useState } from "react";

import {
  DATE_RANGE_OPTIONS,
  type ExpenseFilters,
  FILTER_OPTIONS,
  INITIAL_FILTERS,
} from "../data/mockData";

interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Typography
        sx={{ fontSize: 11, fontWeight: 600, color: "text.disabled", letterSpacing: 0.5 }}
      >
        {label}
      </Typography>
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.7,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          cursor: "pointer",
          userSelect: "none",
          minWidth: 150,
          justifyContent: "space-between",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 500,
            color: value ? "text.primary" : "text.disabled",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value || "Select..."}
        </Typography>
        <ChevronDown size={14} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 180,
              maxHeight: 240,
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
            key={option}
            onClick={() => {
              onChange(option);
              setAnchorEl(null);
            }}
            sx={{
              fontSize: 13,
              fontWeight: option === value ? 700 : 400,
              color: option === value ? "primary.main" : "text.primary",
              bgcolor: option === value ? "action.selected" : "transparent",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            {option}
          </MenuItem>
        ))}
      </Popover>
    </Box>
  );
}

interface FilterPanelProps {
  filters: ExpenseFilters;
  onFiltersChange: (filters: ExpenseFilters) => void;
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleToggle = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (open) {
        setOpen(false);
        setAnchorEl(null);
      } else {
        setOpen(true);
        setAnchorEl(e.currentTarget);
      }
    },
    [open],
  );

  const updateFilter = useCallback(
    (key: keyof ExpenseFilters, value: string) => {
      onFiltersChange({ ...filters, [key]: value });
    },
    [filters, onFiltersChange],
  );

  const handleReset = useCallback(() => {
    onFiltersChange(INITIAL_FILTERS);
  }, [onFiltersChange]);

  const activeFilterCount = [
    filters.dateRange !== INITIAL_FILTERS.dateRange,
    filters.department !== INITIAL_FILTERS.department,
    filters.employee !== INITIAL_FILTERS.employee,
    filters.category !== INITIAL_FILTERS.category,
    filters.businessUnit !== INITIAL_FILTERS.businessUnit,
  ].filter(Boolean).length;

  return (
    <>
      <Box
        onClick={handleToggle}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.8,
          px: 1.5,
          py: 0.6,
          borderRadius: 1,
          border: "1px solid",
          borderColor: open ? "primary.main" : "divider",
          bgcolor: open ? "action.selected" : "background.paper",
          cursor: "pointer",
          userSelect: "none",
          "&:hover": { bgcolor: "action.hover" },
          transition: "all 0.2s ease",
        }}
      >
        <SlidersHorizontal size={14} />
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
          Filters
        </Typography>
        {activeFilterCount > 0 && (
          <Box
            sx={{
              px: 0.6,
              py: 0.1,
              borderRadius: 0.5,
              bgcolor: "primary.main",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              minWidth: 16,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {activeFilterCount}
          </Box>
        )}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => {
          setOpen(false);
          setAnchorEl(null);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2.5,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: 4,
              minWidth: 580,
            },
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
            Filter Options
          </Typography>
          <Typography
            onClick={handleReset}
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: "primary.main",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Reset All
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
          }}
        >
          <FilterDropdown
            label="Date Range"
            value={filters.dateRange}
            options={DATE_RANGE_OPTIONS}
            onChange={(v) => updateFilter("dateRange", v)}
          />
          <FilterDropdown
            label="Department"
            value={filters.department}
            options={FILTER_OPTIONS.departments}
            onChange={(v) => updateFilter("department", v)}
          />
          <FilterDropdown
            label="Expense Category"
            value={filters.category}
            options={FILTER_OPTIONS.expenseCategories}
            onChange={(v) => updateFilter("category", v)}
          />
          <FilterDropdown
            label="Business Unit"
            value={filters.businessUnit}
            options={FILTER_OPTIONS.businessUnits}
            onChange={(v) => updateFilter("businessUnit", v)}
          />
        </Box>
      </Popover>
    </>
  );
}
