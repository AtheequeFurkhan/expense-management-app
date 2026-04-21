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
import { Search } from "lucide-react";

import { useState, useMemo } from "react";

import ChartCard from "@component/chart/ChartCard";
import ChartPeriodFilter from "@component/chart/ChartPeriodFilter";
import EmployeeBreakdownModal from "@component/chart/EmployeeBreakdownModal";
import { MONTH_OPTIONS } from "@config/constant";
import {
  useEmployeeSpendingList,
  type EmployeeSpendingItem,
} from "@slices/expenseSlice/useEmployeeSpending";
import { type CurrencyCode, formatWithSymbol } from "@utils/currency";

interface EmployeeSpendingBreakdownPanelProps {
  dateRange: string;
  businessUnit: string;
  currency: CurrencyCode;
  chartPeriod: string;
  onPeriodChange: (period: string) => void;
}

export default function EmployeeSpendingBreakdownPanel({
  dateRange,
  businessUnit,
  currency,
  chartPeriod,
  onPeriodChange,
}: EmployeeSpendingBreakdownPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSpendingItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fmtSym = (v: number) => formatWithSymbol(v, currency);

  const { employees, loading, error } = useEmployeeSpendingList(dateRange, businessUnit);

  const filtered = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.toLowerCase();
    return employees.filter(
      (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q),
    );
  }, [employees, search]);

  const handleEmployeeClick = (emp: EmployeeSpendingItem) => {
    setSelectedEmployee(emp);
    setModalOpen(true);
  };

  return (
    <>
      <ChartCard
        title="Employee spending breakdown"
        subtitle="Employees with highest spending"
        minHeight={420}
        action={
          <ChartPeriodFilter
            value={chartPeriod}
            options={MONTH_OPTIONS}
            onChange={onPeriodChange}
          />
        }
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.8,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
            mb: 1.5,
          }}
        >
          <Search size={16} style={{ color: "var(--mui-palette-text-disabled, #888)", flexShrink: 0 }} />
          <Box
            component="input"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search employees by name or email..."
            sx={{
              flex: 1,
              border: "none",
              outline: "none",
              bgcolor: "transparent",
              fontSize: 13,
              color: "text.primary",
              "::placeholder": { color: "text.disabled" },
            }}
          />
        </Box>

        <Box
          sx={{
            maxHeight: 500,
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-track": { bgcolor: "action.hover", borderRadius: 3 },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "text.disabled",
              borderRadius: 3,
              "&:hover": { bgcolor: "text.secondary" },
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={62} sx={{ borderRadius: 1.5 }} />
              ))}
            </Box>
          ) : error ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography sx={{ color: "error.main", fontSize: 13 }}>{error}</Typography>
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography sx={{ color: "text.disabled", fontSize: 13 }}>
                {search ? "No employees match your search" : "No employee data available"}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {filtered.map((emp) => (
                <Box
                  key={emp.email}
                  onClick={() => handleEmployeeClick(emp)}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                    py: 1.2,
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "action.hover",
                      borderColor: "primary.main",
                    },
                    transition: "all 0.15s ease",
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "text.primary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {emp.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "text.disabled",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {emp.email}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0, ml: 2 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                      {fmtSym(emp.totalAmount)}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                      {emp.claimCount.toLocaleString()} claims
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </ChartCard>

      <EmployeeBreakdownModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        employeeEmail={selectedEmployee?.email ?? null}
        employeeName={selectedEmployee?.name ?? ""}
        dateRange={dateRange}
        currency={currency}
      />
    </>
  );
}
