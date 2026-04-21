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
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { Box, CircularProgress, Skeleton, Typography } from "@wso2/oxygen-ui";
import { ChevronDown, ChevronRight, TrendingDown, TrendingUp, X } from "lucide-react";

import { useEffect, useState } from "react";

import {
  type EmployeeSpendingBreakdownResponse,
  useEmployeeBreakdown,
  useEmployeeCategoryTransactions,
} from "@slices/expenseSlice/useEmployeeSpending";
import { type CurrencyCode, formatWithSymbol } from "@utils/currency";

const SEGMENT_COLORS = [
  "#00B4D8",
  "#FF8A4C",
  "#F4B400",
  "#2E8B57",
  "#AB7AE0",
  "#8C9EFF",
  "#00A6A6",
  "#E85D75",
  "#FF6B9D",
  "#FF8C69",
  "#FF4444",
  "#4A8EDB",
  "#90EE90",
  "#DA70D6",
  "#FFD700",
];

const STATUS_TABS = ["All", "Approved", "Pending"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

interface SubCategoryPanelProps {
  email: string;
  category: string;
  dateRange: string;
  compDateRange: string;
  compareLabel: string;
  fmtSym: (v: number) => string;
  color: string;
}

function SubCategoryPanel({
  email,
  category,
  dateRange,
  compDateRange,
  compareLabel,
  fmtSym,
  color,
}: SubCategoryPanelProps) {
  const { transactions: curTxns, loading: curLoading } = useEmployeeCategoryTransactions(
    email,
    category,
    dateRange,
    "All",
  );
  const { transactions: cmpTxns, loading: cmpLoading } = useEmployeeCategoryTransactions(
    email,
    category,
    compDateRange,
    "All",
  );

  const curMap = new Map<string, number>();
  curTxns.forEach((t) => curMap.set(t.description, (curMap.get(t.description) ?? 0) + t.amount));

  const cmpMap = new Map<string, number>();
  cmpTxns.forEach((t) => cmpMap.set(t.description, (cmpMap.get(t.description) ?? 0) + t.amount));

  const allSubs = [...new Set([...curMap.keys(), ...cmpMap.keys()])].sort();

  return (
    <Box
      sx={{
        mx: 1,
        mb: 1,
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          px: 2,
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "action.hover",
        }}
      >
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            color: "text.disabled",
            letterSpacing: 0.8,
            flex: 1,
          }}
        >
          SUB-CATEGORY
        </Typography>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            color: "text.disabled",
            letterSpacing: 0.8,
            minWidth: 100,
            textAlign: "right",
          }}
        >
          THIS PERIOD
        </Typography>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            color: "text.disabled",
            letterSpacing: 0.8,
            minWidth: 100,
            textAlign: "right",
          }}
        >
          {compareLabel.toUpperCase()}
        </Typography>
      </Box>

      {curLoading || cmpLoading ? (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={20} />
        </Box>
      ) : allSubs.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography sx={{ fontSize: 12, color: "text.disabled", textAlign: "center" }}>
            No data found
          </Typography>
        </Box>
      ) : (
        allSubs.map((sub, idx) => {
          const cur = curMap.get(sub) ?? 0;
          const cmp = cmpMap.get(sub) ?? 0;
          return (
            <Box
              key={sub}
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 0.9,
                borderBottom: idx < allSubs.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flex: 1, minWidth: 0 }}>
                <Box
                  sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: color, flexShrink: 0 }}
                />
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "text.primary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={sub}
                >
                  {sub}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: cur > 0 ? "text.primary" : "text.disabled",
                  minWidth: 100,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {cur > 0 ? fmtSym(cur) : "—"}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: cmp > 0 ? "text.secondary" : "text.disabled",
                  minWidth: 100,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {cmp > 0 ? fmtSym(cmp) : "—"}
              </Typography>
            </Box>
          );
        })
      )}
    </Box>
  );
}

interface CategoryRowProps {
  category: string;
  total: number;
  claimCount: number;
  percentage: number;
  color: string;
  maxTotal: number;
  compTotal: number;
  compClaimCount: number;
  maxCompTotal: number;
  email: string;
  dateRange: string;
  compDateRange: string;
  compareLabel: string;
  fmtSym: (v: number) => string;
  isExpanded: boolean;
  onToggle: () => void;
}

function CategoryRow({
  category,
  total,
  claimCount,
  percentage,
  color,
  maxTotal,
  compTotal,
  compClaimCount,
  maxCompTotal,
  email,
  dateRange,
  compDateRange,
  compareLabel,
  fmtSym,
  isExpanded,
  onToggle,
}: CategoryRowProps) {
  const curBarW = maxTotal > 0 ? Math.min(100, (total / maxTotal) * 100) : 0;
  const cmpBarW = maxCompTotal > 0 ? Math.min(100, (compTotal / maxCompTotal) * 100) : 0;

  return (
    <Box>
      <Box
        onClick={onToggle}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 1.5,
          py: 1.2,
          borderRadius: 1.5,
          cursor: "pointer",
          border: "1px solid",
          borderColor: isExpanded ? color : "divider",
          bgcolor: isExpanded ? `${color}11` : "background.default",
          "&:hover": { bgcolor: isExpanded ? `${color}22` : "action.hover" },
          transition: "all 0.2s ease",
          mb: 0.5,
        }}
      >
        <Box sx={{ color: "text.secondary", display: "flex", alignItems: "center" }}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </Box>

        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "text.primary",
            width: 130,
            maxWidth: 130,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          title={category}
        >
          {category}
        </Typography>

        <Box sx={{ flex: 1, mx: 1.5 }}>
          <Box
            sx={{
              bgcolor: "action.hover",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: 6,
                width: `${curBarW}%`,
                bgcolor: color,
                transition: "width 0.4s ease",
                minWidth: curBarW > 0 ? 4 : 0,
              }}
            />
            <Box sx={{ height: "1px", bgcolor: "background.paper", opacity: 0.6 }} />
            <Box
              sx={{
                height: 4,
                width: `${cmpBarW}%`,
                bgcolor: color,
                opacity: 0.38,
                transition: "width 0.4s ease",
                minWidth: cmpBarW > 0 ? 3 : 0,
              }}
            />
          </Box>
        </Box>

        <Box sx={{ textAlign: "right", flexShrink: 0, minWidth: 155 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>
            {fmtSym(total)}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
            {claimCount} claims • {percentage.toFixed(1)}%
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", mt: 0.3 }}>
            {compTotal > 0 ? fmtSym(compTotal) : "—"}
          </Typography>
          <Typography sx={{ fontSize: 10, color: "text.disabled" }}>
            {compClaimCount > 0 ? `${compClaimCount} claims` : ""} {compareLabel}
          </Typography>
        </Box>
      </Box>

      {isExpanded && (
        <SubCategoryPanel
          email={email}
          category={category}
          dateRange={dateRange}
          compDateRange={compDateRange}
          compareLabel={compareLabel}
          fmtSym={fmtSym}
          color={color}
        />
      )}
    </Box>
  );
}

type CompareMode = "prevMonth" | "prevYear";

interface SummaryBarProps {
  current: EmployeeSpendingBreakdownResponse | null;
  comparison: EmployeeSpendingBreakdownResponse | null;
  compareMode: CompareMode;
  loading: boolean;
  compLoading: boolean;
  fmtSym: (v: number) => string;
}

function SummaryBar({
  current,
  comparison,
  compareMode,
  loading,
  compLoading,
  fmtSym,
}: SummaryBarProps) {
  const curTotal = current?.totalAmount ?? 0;
  const cmpTotal = comparison?.totalAmount ?? 0;
  const pct = cmpTotal > 0 ? ((curTotal - cmpTotal) / cmpTotal) * 100 : null;
  const cmpLabel = compareMode === "prevMonth" ? "Prev Month" : "Prev Year";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            color: "text.disabled",
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          This Period
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={120} height={32} />
        ) : (
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
            {fmtSym(curTotal)}
          </Typography>
        )}
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          {current?.claimCount ?? 0} claims
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 60 }}>
        {pct !== null && !loading && !compLoading ? (
          <>
            {pct > 0 ? (
              <TrendingUp size={16} color="#e53935" />
            ) : pct < 0 ? (
              <TrendingDown size={16} color="#2e7d32" />
            ) : null}
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: pct > 0 ? "error.main" : pct < 0 ? "success.main" : "text.secondary",
              }}
            >
              {pct > 0 ? "+" : ""}
              {pct.toFixed(1)}%
            </Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: 12, color: "text.disabled" }}>vs</Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, textAlign: "right" }}>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            color: "text.disabled",
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          {cmpLabel}
        </Typography>
        {compLoading ? (
          <Skeleton variant="text" width={120} height={32} sx={{ ml: "auto" }} />
        ) : (
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
            {fmtSym(cmpTotal)}
          </Typography>
        )}
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          {comparison?.claimCount ?? 0} claims
        </Typography>
      </Box>
    </Box>
  );
}

export interface EmployeeBreakdownModalProps {
  open: boolean;
  onClose: () => void;
  employeeEmail: string | null;
  employeeName: string;
  dateRange: string;
  currency: CurrencyCode;
}

export default function EmployeeBreakdownModal({
  open,
  onClose,
  employeeEmail,
  employeeName,
  dateRange,
  currency,
}: EmployeeBreakdownModalProps) {
  const [statusTab, setStatusTab] = useState<StatusTab>("All");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<CompareMode>("prevMonth");

  const fmtSym = (v: number) => formatWithSymbol(v, currency);

  const { breakdown, loading } = useEmployeeBreakdown(
    open ? employeeEmail : null,
    dateRange,
    statusTab === "All" ? "" : statusTab,
  );

  const compDateRange = compareMode === "prevMonth" ? "Last Month" : "Last Year";
  const { breakdown: compBreakdown, loading: compLoading } = useEmployeeBreakdown(
    open ? employeeEmail : null,
    compDateRange,
    statusTab === "All" ? "" : statusTab,
  );

  useEffect(() => {
    if (open) {
      setStatusTab("All");
      setExpandedCategory(null);
    }
  }, [open, employeeEmail]);

  useEffect(() => {
    setExpandedCategory(null);
  }, [statusTab]);

  const maxCurrent = breakdown ? Math.max(...breakdown.categories.map((c) => c.total), 1) : 1;
  const maxComp = compBreakdown ? Math.max(...compBreakdown.categories.map((c) => c.total), 1) : 1;
  const compMap = new Map((compBreakdown?.categories ?? []).map((c) => [c.category, c]));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          backgroundImage: "none",
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: "text.primary" }}>
            {employeeName}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.disabled", mt: 0.3 }}>
            {employeeEmail}
          </Typography>
          {breakdown && (
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary", mt: 0.8 }}>
              Total: {fmtSym(breakdown.totalAmount)}
            </Typography>
          )}
        </Box>
        <Box
          onClick={onClose}
          sx={{
            cursor: "pointer",
            color: "text.secondary",
            p: 0.5,
            borderRadius: 1,
            "&:hover": { bgcolor: "action.hover", color: "text.primary" },
          }}
        >
          <X size={20} />
        </Box>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", mb: 2 }}>
          Expense breakdown by category
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 0,
            mb: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            overflow: "hidden",
          }}
        >
          {STATUS_TABS.map((tab) => (
            <Box
              key={tab}
              onClick={() => setStatusTab(tab)}
              sx={{
                flex: 1,
                py: 0.9,
                textAlign: "center",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: statusTab === tab ? 700 : 500,
                color: statusTab === tab ? "#fff" : "text.secondary",
                bgcolor: statusTab === tab ? "text.primary" : "transparent",
                transition: "all 0.2s",
                "&:hover": { bgcolor: statusTab === tab ? "text.primary" : "action.hover" },
              }}
            >
              {tab}
            </Box>
          ))}
        </Box>

        <SummaryBar
          current={breakdown}
          comparison={compBreakdown}
          compareMode={compareMode}
          loading={loading}
          compLoading={compLoading}
          fmtSym={fmtSym}
        />

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          {(["prevMonth", "prevYear"] as const).map((mode) => (
            <Box
              key={mode}
              onClick={() => setCompareMode(mode)}
              sx={{
                cursor: "pointer",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                border: "1px solid",
                borderColor: compareMode === mode ? "primary.main" : "divider",
                bgcolor: compareMode === mode ? "primary.main" : "transparent",
                color: compareMode === mode ? "#fff" : "text.secondary",
                fontSize: 12,
                fontWeight: 600,
                transition: "all 0.2s",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              {mode === "prevMonth" ? "vs Prev Month" : "vs Prev Year"}
            </Box>
          ))}
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={62}
                  sx={{ borderRadius: 1.5, mb: 0.5 }}
                />
              ))}
            </Box>
            <Box sx={{ flex: 1 }}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={62}
                  sx={{ borderRadius: 1.5, mb: 0.5 }}
                />
              ))}
            </Box>
          </Box>
        ) : !breakdown || breakdown.categories.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography sx={{ color: "text.disabled", fontSize: 14 }}>
              No expense data found for this period
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              maxHeight: 460,
              overflowY: "auto",
              pr: 0.5,
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-track": { bgcolor: "action.hover", borderRadius: 2 },
              "&::-webkit-scrollbar-thumb": { bgcolor: "text.disabled", borderRadius: 2 },
            }}
          >
            {breakdown.categories.map((cat, i) => {
              const cmp = compMap.get(cat.category);
              return (
                <CategoryRow
                  key={cat.category}
                  category={cat.category}
                  total={cat.total}
                  claimCount={cat.claimCount}
                  percentage={cat.percentage}
                  color={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                  maxTotal={maxCurrent}
                  compTotal={cmp?.total ?? 0}
                  compClaimCount={cmp?.claimCount ?? 0}
                  maxCompTotal={maxComp}
                  email={employeeEmail ?? ""}
                  dateRange={dateRange}
                  compDateRange={compDateRange}
                  compareLabel={compareMode === "prevMonth" ? "Prev Month" : "Prev Year"}
                  fmtSym={fmtSym}
                  isExpanded={expandedCategory === cat.category}
                  onToggle={() =>
                    setExpandedCategory((prev) => (prev === cat.category ? null : cat.category))
                  }
                />
              );
            })}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
