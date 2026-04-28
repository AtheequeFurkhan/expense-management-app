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
import { Alert, Box, Button, Skeleton, Stack } from "@wso2/oxygen-ui";

import { useCallback, useEffect, useState } from "react";

import SummaryCard from "@component/card/SummaryCard";
import BarChart from "@component/chart/BarChart";
import ChartCard from "@component/chart/ChartCard";
import ChartPeriodFilter from "@component/chart/ChartPeriodFilter";
import DoughnutChart from "@component/chart/DoughnutChart";
import EmployeeSpendingBreakdownPanel from "@component/chart/EmployeeSpendingBreakdownPanel";
import HorizontalBarChart from "@component/chart/HorizontalBarChart";
import LeadApprovalFrequencyPanel from "@component/chart/LeadApprovalFrequencyPanel";
import CurrencySelector from "@component/common/CurrencySelector";
import { MONTH_OPTIONS, OPD_SUMMARY_CARDS_CONFIG } from "@config/constant";
import { resetExpenseClaims, useExpenseClaims } from "@slices/expenseSlice/useExpenseClaims";
import { useAppDispatch } from "@slices/store";
import {
  CURRENCIES,
  type CurrencyCode,
  formatCurrencyValue,
  formatWithSymbol,
} from "@utils/currency";

import FilterPanel from "./FilterPanel";

const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString(
  "default",
  { month: "long" },
);

const PERIOD_TO_DATE_RANGE: Record<string, string> = {
  all: "All Time",
  current: "This Month",
  pastThree: "Last 3 Months",
  pastSix: "Last 6 Months",
  pastNine: "Last 6 Months",
  pastTwelve: "Year to Date",
};

const DATE_RANGE_TO_PERIOD: Record<string, string> = {
  "All Time": "all",
  "This Month": "current",
  "Last Month": "current",
  "Last 3 Months": "pastThree",
  "Last 6 Months": "pastSix",
  "Year to Date": "pastTwelve",
  "Last Year": "pastTwelve",
};

export default function ExpenseClaims() {
  const dispatch = useAppDispatch();
  const { data, filters, loading, error, handleFiltersChange } = useExpenseClaims();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("all");
  const [currency, setCurrency] = useState<CurrencyCode>("LKR");
  const [selectedRecurringCategory, setSelectedRecurringCategory] = useState<string | null>(null);

  const fmt = (v: number) => formatCurrencyValue(v, currency);
  const fmtSym = (v: number) => formatWithSymbol(v, currency);

  const {
    buExpenses,
    activeClaimStats: claimStats,
    topApprovingLeads: topLeads,
    recurringExpenseTypes: recurringExpenses,
  } = data;

  const buMaxValue = Math.max(...buExpenses.map((d) => d.value), 1);
  const claimStatsMaxValue = Math.max(...claimStats.map((d) => d.value), 1);

  const getRecurringCategory = (expenseName: string) => {
    const normalizedName = expenseName.trim();
    const separators = [" - ", " : "];

    for (const separator of separators) {
      const separatorIndex = normalizedName.indexOf(separator);
      if (separatorIndex > 0) {
        return normalizedName.substring(0, separatorIndex).trim();
      }
    }

    return normalizedName;
  };

  const getRecurringSubcategory = (expenseName: string, category: string) => {
    const normalizedName = expenseName.trim();
    const prefixPatterns = [`${category} - `, `${category} : `];

    for (const prefix of prefixPatterns) {
      if (normalizedName.startsWith(prefix)) {
        return normalizedName.substring(prefix.length).trim();
      }
    }

    return normalizedName;
  };

  const recurringExpenseGroups = recurringExpenses.reduce<
    Record<string, { total: number; items: { name: string; amount: number }[] }>
  >((acc, expense) => {
    const category = getRecurringCategory(expense.name);
    const existingGroup = acc[category] ?? { total: 0, items: [] };

    existingGroup.total += expense.amount;
    existingGroup.items.push(expense);
    acc[category] = existingGroup;

    return acc;
  }, {});

  const recurringCategoryItems = Object.entries(recurringExpenseGroups)
    .map(([label, group]) => ({
      label,
      value: group.total,
      sublabel: `${group.items.length} expense type${group.items.length === 1 ? "" : "s"}`,
    }))
    .sort((a, b) => b.value - a.value);

  const recurringDetailItems = selectedRecurringCategory
    ? (recurringExpenseGroups[selectedRecurringCategory]?.items ?? [])
        .map((expense) => ({
          label: getRecurringSubcategory(expense.name, selectedRecurringCategory),
          sublabel: selectedRecurringCategory,
          value: expense.amount,
        }))
        .sort((a, b) => b.value - a.value)
    : [];

  const recurringChartItems =
    selectedRecurringCategory === null ? recurringCategoryItems : recurringDetailItems;

  const recurringMaxValue = Math.max(...recurringChartItems.map((d) => d.value), 1);

  // Sync main date range → chart period
  useEffect(() => {
    setChartPeriod(DATE_RANGE_TO_PERIOD[filters.dateRange] ?? "pastTwelve");
  }, [filters.dateRange]);

  // When chart period filter changes, update the main date range
  const handlePeriodChange = useCallback(
    (period: string) => {
      setChartPeriod(period);
      const newDateRange = PERIOD_TO_DATE_RANGE[period];
      if (newDateRange && newDateRange !== filters.dateRange) {
        handleFiltersChange({ ...filters, dateRange: newDateRange });
      }
    },
    [filters, handleFiltersChange],
  );

  useEffect(() => {
    return () => {
      dispatch(resetExpenseClaims());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!loading && !error) {
      setHasLoadedOnce(true);
    }
  }, [loading, error]);

  useEffect(() => {
    if (
      selectedRecurringCategory &&
      recurringExpenseGroups[selectedRecurringCategory] === undefined
    ) {
      setSelectedRecurringCategory(null);
    }
  }, [recurringExpenseGroups, selectedRecurringCategory]);

  if (loading && !hasLoadedOnce) {
    return (
      <Box
        sx={{
          p: 2,
          bgcolor: "background.default",
          height: "100%",
          width: "100%",
          boxSizing: "border-box",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1, mb: 2 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          {[0, 1, 2].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={130}
              sx={{ borderRadius: 1 }}
              animation="wave"
            />
          ))}
        </Box>
        <Box
          sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}
        >
          <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 1 }} animation="wave" />
          <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 1 }} animation="wave" />
        </Box>
        <Box
          sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}
        >
          <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 1 }} animation="wave" />
          <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 1 }} animation="wave" />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} animation="wave" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          bgcolor: "background.default",
          overflow: "hidden",
        }}
      >
        <Stack sx={{ width: "fit-content", minWidth: 400, maxWidth: "90%" }} spacing={2}>
          <Alert severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "background.default",
        height: "100%",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Filter bar */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
        <CurrencySelector value={currency} onChange={setCurrency} />
      </Box>

      {/* Summary stat cards — same 3-card layout as OPD Claims */}
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        <SummaryCard
          icon={OPD_SUMMARY_CARDS_CONFIG.lastYearCard.icon}
          iconBg={OPD_SUMMARY_CARDS_CONFIG.lastYearCard.iconBg}
          iconColor={OPD_SUMMARY_CARDS_CONFIG.lastYearCard.iconColor}
          title={OPD_SUMMARY_CARDS_CONFIG.lastYearCard.title}
          chipLabel={OPD_SUMMARY_CARDS_CONFIG.lastYearCard.chipLabel}
          value={fmtSym(data.totalClaimAmount)}
          suffix={CURRENCIES[currency].code}
          trend={`${data.trendTotalAmount > 0 ? "+" : ""}${data.trendTotalAmount}%`}
          trendVariant={data.trendTotalAmount < 0 ? "negative" : "positive"}
        />

        <SummaryCard
          icon={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.icon}
          iconBg={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.iconBg}
          iconColor={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.iconColor}
          title={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.title}
          chipLabel={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.chipLabel}
          value={fmtSym(data.avgClaimAmount)}
          suffix={CURRENCIES[currency].code}
          trend={`${data.trendAvgAmount > 0 ? "+" : ""}${data.trendAvgAmount}%`}
          trendVariant={data.trendAvgAmount < 0 ? "negative" : "positive"}
          trendLabel={`VS ${prevMonth}`}
        />

        <SummaryCard
          icon={OPD_SUMMARY_CARDS_CONFIG.previousYearCard.icon}
          iconBg={OPD_SUMMARY_CARDS_CONFIG.previousYearCard.iconBg}
          iconColor={OPD_SUMMARY_CARDS_CONFIG.previousYearCard.iconColor}
          title={OPD_SUMMARY_CARDS_CONFIG.previousYearCard.title}
          chipLabel={OPD_SUMMARY_CARDS_CONFIG.previousYearCard.chipLabel}
          value={data.totalClaimCount.toLocaleString()}
          trend={`${data.trendTotalCount > 0 ? "+" : ""}${data.trendTotalCount}%`}
          trendVariant={data.trendTotalCount < 0 ? "negative" : "positive"}
          footerRight={data.pendingClaims.toString()}
          footerRightLabel="Grace Period Claims"
        />
      </Box>

      {/* Row 2: Expense from BU (bar) + Recurring Revenue (comparison) */}
      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2,
        }}
      >
        <ChartCard
          title="Expense from BU"
          subtitle="Total expense amount by Business Unit"
          action={
            <ChartPeriodFilter
              value={chartPeriod}
              options={MONTH_OPTIONS}
              onChange={handlePeriodChange}
            />
          }
        >
          <BarChart
            data={buExpenses.map((d) => ({ label: d.label, value: d.value }))}
            formatValue={fmt}
            yAxisLabel={`Amount (${CURRENCIES[currency].code})`}
            xAxisLabel="Business Unit"
            maxValue={buMaxValue}
          />
        </ChartCard>

        <ChartCard
          title="Active Claim Stats"
          subtitle="Claim counts by status"
          action={
            <ChartPeriodFilter
              value={chartPeriod}
              options={MONTH_OPTIONS}
              onChange={handlePeriodChange}
            />
          }
        >
          <BarChart
            data={claimStats.map((d) => ({ label: d.label, value: d.value }))}
            barWidth="72%"
            yAxisLabel="Count"
            xAxisLabel="Status"
            maxValue={claimStatsMaxValue}
          />
        </ChartCard>
      </Box>

      {/* Row 3: Employee Spending Breakdown (standalone full-width) */}
      <Box sx={{ mt: 2 }}>
        <EmployeeSpendingBreakdownPanel
          dateRange={filters.dateRange}
          businessUnit={filters.businessUnit}
          currency={currency}
          chartPeriod={chartPeriod}
          onPeriodChange={handlePeriodChange}
        />
      </Box>

      {/* Row 3.5: Lead Approval Frequency */}
      <Box sx={{ mt: 2 }}>
        <LeadApprovalFrequencyPanel
          dateRange={filters.dateRange}
          businessUnit={filters.businessUnit}
          currency={currency}
          chartPeriod={chartPeriod}
          onPeriodChange={handlePeriodChange}
          fallbackLeads={topLeads}
        />
      </Box>

      {/* Row 5: Recurring Expense Types — scrollable horizontal bar chart */}
      <Box sx={{ mt: 2 }}>
        <ChartCard
          title="Recurring Expense"
          subtitle={
            selectedRecurringCategory
              ? `${selectedRecurringCategory} sub-expenses by recurring spend`
              : "Grouped expense categories by recurring spend"
          }
          minHeight={520}
          action={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {selectedRecurringCategory ? (
                <Button
                  variant="text"
                  onClick={() => setSelectedRecurringCategory(null)}
                  sx={{ minWidth: "auto", px: 1.25, textTransform: "none", fontWeight: 600 }}
                >
                  Back
                </Button>
              ) : null}
              <ChartPeriodFilter
                value={chartPeriod}
                options={MONTH_OPTIONS}
                onChange={handlePeriodChange}
              />
            </Box>
          }
        >
          <Box
            sx={{
              maxHeight: 460,
              overflowY: "auto",
              pr: 1,
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-track": {
                bgcolor: "action.hover",
                borderRadius: 3,
              },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "text.disabled",
                borderRadius: 3,
                "&:hover": { bgcolor: "text.secondary" },
              },
            }}
          >
            {selectedRecurringCategory === null ? (
              <HorizontalBarChart
                data={recurringCategoryItems}
                formatValue={(v) => fmtSym(v)}
                barColor="#2E8B57"
                barHoverColor="#246d45"
                maxValue={recurringMaxValue}
                onItemClick={(item) => {
                  setSelectedRecurringCategory(item.label);
                }}
                showRank={false}
                barHeight={24}
                labelWidth={220}
              />
            ) : (
              <DoughnutChart
                data={recurringDetailItems}
                formatValue={(v) => fmtSym(v)}
                centerLabel={selectedRecurringCategory}
                centerValue={fmtSym(recurringExpenseGroups[selectedRecurringCategory]?.total ?? 0)}
              />
            )}
          </Box>
        </ChartCard>
      </Box>
    </Box>
  );
}
