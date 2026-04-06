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
import { Alert, Box, Skeleton, Stack, Typography } from "@wso2/oxygen-ui";

import { useEffect, useMemo, useState } from "react";

import SummaryCard from "@component/card/SummaryCard";
import BarChart from "@component/chart/BarChart";
import ChartCard from "@component/chart/ChartCard";
import ChartPeriodFilter from "@component/chart/ChartPeriodFilter";
import HorizontalBarChart from "@component/chart/HorizontalBarChart";
import { MONTH_OPTIONS, OPD_SUMMARY_CARDS_CONFIG } from "@config/constant";
import { resetExpenseClaims, useExpenseClaims } from "@slices/expenseSlice/useExpenseClaims";
import { useAppDispatch } from "@slices/store";
import {
  getMockActiveClaimStats,
  getMockBuExpenses,
  getMockRecurringExpenseTypes,
  getMockTopApprovingLeads,
  getMockTopSpendingEmployees,
} from "@view/expense/data/mockData";

import FilterPanel from "./FilterPanel";

const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString(
  "default",
  { month: "long" },
);

const formatCurrency = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString();
};

export default function ExpenseClaims() {
  const dispatch = useAppDispatch();
  const { data, filters, loading, error, handleFiltersChange } = useExpenseClaims();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [buPeriod, setBuPeriod] = useState("current");
  const [claimStatsPeriod, setClaimStatsPeriod] = useState("current");
  const [recurringPeriod, setRecurringPeriod] = useState("current");
  const [topEmployeesPeriod, setTopEmployeesPeriod] = useState("current");
  const [topLeadsPeriod, setTopLeadsPeriod] = useState("current");

  const buExpenses = useMemo(() => getMockBuExpenses(buPeriod), [buPeriod]);
  const claimStats = useMemo(() => getMockActiveClaimStats(claimStatsPeriod), [claimStatsPeriod]);
  const topEmployees = useMemo(
    () => getMockTopSpendingEmployees(topEmployeesPeriod),
    [topEmployeesPeriod],
  );
  const topLeads = useMemo(() => getMockTopApprovingLeads(topLeadsPeriod), [topLeadsPeriod]);
  const recurringExpenses = useMemo(
    () => getMockRecurringExpenseTypes(recurringPeriod),
    [recurringPeriod],
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
      <Box sx={{ mb: 2 }}>
        <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
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
          value={data.totalClaimAmount.toLocaleString()}
          suffix={OPD_SUMMARY_CARDS_CONFIG.lastYearCard.suffix}
          trend={`${data.trendTotalAmount > 0 ? "+" : ""}${data.trendTotalAmount}%`}
          trendVariant={data.trendTotalAmount < 0 ? "negative" : "positive"}
        />

        <SummaryCard
          icon={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.icon}
          iconBg={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.iconBg}
          iconColor={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.iconColor}
          title={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.title}
          chipLabel={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.chipLabel}
          value={data.avgClaimAmount.toLocaleString()}
          suffix={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.suffix}
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
            <ChartPeriodFilter value={buPeriod} options={MONTH_OPTIONS} onChange={setBuPeriod} />
          }
        >
          <BarChart
            data={buExpenses.map((d) => ({ label: d.label, value: d.value }))}
            formatValue={formatCurrency}
            yAxisLabel="Amount (LKR)"
            xAxisLabel="Business Unit"
          />
        </ChartCard>

        <ChartCard
          title="Active Claim Stats"
          subtitle="Claim counts by status"
          action={
            <ChartPeriodFilter
              value={claimStatsPeriod}
              options={MONTH_OPTIONS}
              onChange={setClaimStatsPeriod}
            />
          }
        >
          <BarChart
            data={claimStats.map((d) => ({ label: d.label, value: d.value }))}
            yAxisLabel="Count"
            xAxisLabel="Status"
          />
        </ChartCard>
      </Box>

      {/* Row 3: Top Spending Employees + Top Approving Lead (horizontal bars) */}
      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2,
        }}
      >
        <ChartCard
          title="Top Spending Employees"
          subtitle="Employees with highest spending"
          action={
            <ChartPeriodFilter
              value={topEmployeesPeriod}
              options={MONTH_OPTIONS}
              onChange={setTopEmployeesPeriod}
            />
          }
        >
          <HorizontalBarChart
            data={topEmployees.map((d) => ({
              label: d.name,
              sublabel: d.email,
              value: d.amount,
            }))}
            formatValue={(v) => `${formatCurrency(v)} LKR`}
            barColor="#4A8EDB"
            barHoverColor="#3672b5"
            tooltipContent={(_item, index) => {
              const emp = topEmployees[index];
              return (
                <Box sx={{ px: 0.5, py: 0.2 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                    {formatCurrency(emp.amount)} LKR
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)", mt: 0.3 }}>
                    {emp.name}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                    {emp.email}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                    BU: {emp.bu}
                  </Typography>
                </Box>
              );
            }}
          />
        </ChartCard>

        <ChartCard
          title="Top Approving Lead"
          subtitle="Leads with most approved claims"
          action={
            <ChartPeriodFilter
              value={topLeadsPeriod}
              options={MONTH_OPTIONS}
              onChange={setTopLeadsPeriod}
            />
          }
        >
          <HorizontalBarChart
            data={topLeads.map((d) => ({
              label: d.name,
              sublabel: d.email,
              value: d.count,
            }))}
            formatValue={(v) => `${v} claims`}
            barColor="#AB7AE0"
            barHoverColor="#9360cc"
            tooltipContent={(_item, index) => {
              const lead = topLeads[index];
              return (
                <Box sx={{ px: 0.5, py: 0.2 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                    {lead.count} claims
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)", mt: 0.3 }}>
                    {lead.name}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                    {lead.email}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                    BU: {lead.bu}
                  </Typography>
                </Box>
              );
            }}
          />
        </ChartCard>
      </Box>

      {/* Row 4: Recurring Expense Types — scrollable horizontal bar chart */}
      <Box sx={{ mt: 2 }}>
        <ChartCard
          title="Recurring Expense"
          subtitle="Top expense types by recurring spend"
          minHeight={520}
          action={
            <ChartPeriodFilter
              value={recurringPeriod}
              options={MONTH_OPTIONS}
              onChange={setRecurringPeriod}
            />
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
            <HorizontalBarChart
              data={recurringExpenses.map((d) => ({
                label: d.name,
                value: d.amount,
              }))}
              formatValue={(v) => `${formatCurrency(v)} LKR`}
              barColor="#2E8B57"
              barHoverColor="#246d45"
              showRank={false}
              barHeight={24}
              labelWidth={220}
            />
          </Box>
        </ChartCard>
      </Box>
    </Box>
  );
}
