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
import { Box } from "@wso2/oxygen-ui";
import { CheckCircle, DollarSign, Hash, TrendingUp } from "lucide-react";

import { useState } from "react";

import SummaryCard from "@component/card/SummaryCard";
import BarChart from "@component/chart/BarChart";
import ChartCard from "@component/chart/ChartCard";
import ComparisonChart from "@component/chart/ComparisonChart";
import HorizontalBarChart from "@component/chart/HorizontalBarChart";

import {
  type ExpenseFilters,
  INITIAL_FILTERS,
  MOCK_ACTIVE_CLAIM_STATS,
  MOCK_BU_EXPENSES,
  MOCK_RECURRING_REVENUE,
  MOCK_SUMMARY_STATS,
  MOCK_TOP_APPROVING_LEADS,
  MOCK_TOP_SPENDING_EMPLOYEES,
} from "../data/mockData";
import FilterPanel from "./FilterPanel";

const formatCurrency = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString();
};

export default function ExpenseClaims() {
  const [filters, setFilters] = useState<ExpenseFilters>(INITIAL_FILTERS);

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "background.default",
        minHeight: "100%",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Filter bar */}
      <Box sx={{ mb: 2 }}>
        <FilterPanel filters={filters} onFiltersChange={setFilters} />
      </Box>

      {/* Summary stat cards — 4 across */}
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        <SummaryCard
          icon={DollarSign}
          iconBg="#fff3e0"
          iconColor="#f57c00"
          title="Total Claim Amount"
          chipLabel={new Date().getFullYear().toString()}
          value={MOCK_SUMMARY_STATS.totalClaimAmount.toLocaleString()}
          suffix="LKR"
          trend="+12.4%"
          trendVariant="positive"
        />
        <SummaryCard
          icon={Hash}
          iconBg="#e3f2fd"
          iconColor="#1976d2"
          title="Total Claims"
          chipLabel="YTD"
          value={MOCK_SUMMARY_STATS.totalClaimCount.toLocaleString()}
          trend="+8.2%"
          trendVariant="positive"
        />
        <SummaryCard
          icon={CheckCircle}
          iconBg="#f0fff4"
          iconColor="#2e7d32"
          title="Approved Claims"
          value={MOCK_SUMMARY_STATS.approvedClaims.toLocaleString()}
          trend="+5.1%"
          trendVariant="positive"
          footerRight={MOCK_SUMMARY_STATS.pendingClaims.toString()}
          footerRightLabel="Pending"
        />
        <SummaryCard
          icon={TrendingUp}
          iconBg="#f3e5f5"
          iconColor="#7b1fa2"
          title="Avg. Claim Amount"
          value={MOCK_SUMMARY_STATS.avgClaimAmount.toLocaleString()}
          suffix="LKR"
          trend="-2.3%"
          trendVariant="negative"
          footerRight={MOCK_SUMMARY_STATS.rejectedClaims.toString()}
          footerRightLabel="Rejected"
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
        <ChartCard title="Expense from BU" subtitle="Total expense amount by Business Unit">
          <BarChart
            data={MOCK_BU_EXPENSES.map((d) => ({ label: d.label, value: d.value }))}
            formatValue={formatCurrency}
            yAxisLabel="Amount (LKR)"
            xAxisLabel="Business Unit"
          />
        </ChartCard>

        <ChartCard title="Recurring Revenue" subtitle="Period comparison of recurring expenses">
          <ComparisonChart
            data={MOCK_RECURRING_REVENUE}
            currentLabel={new Date().getFullYear().toString()}
            previousLabel={(new Date().getFullYear() - 1).toString()}
            formatValue={formatCurrency}
            yAxisLabel="Amount (LKR)"
          />
        </ChartCard>
      </Box>

      {/* Row 3: Active Claim Stats (bar) */}
      <Box sx={{ mt: 2 }}>
        <ChartCard title="Active Claim Stats" subtitle="Claim counts by status">
          <BarChart
            data={MOCK_ACTIVE_CLAIM_STATS.map((d) => ({ label: d.label, value: d.value }))}
            height={220}
            yAxisLabel="Count"
            xAxisLabel="Status"
            barColor="#7E4FCA"
            barHoverColor="#6a3cb5"
          />
        </ChartCard>
      </Box>

      {/* Row 4: Top Spending Employees + Top Approving Lead */}
      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2,
        }}
      >
        <ChartCard title="Top Spending Employees" subtitle="Employees with highest spending">
          <HorizontalBarChart
            data={MOCK_TOP_SPENDING_EMPLOYEES.map((d) => ({
              label: d.name,
              sublabel: d.email,
              value: d.amount,
            }))}
            formatValue={(v) => `${formatCurrency(v)} LKR`}
            barColor="#4A8EDB"
            barHoverColor="#3672b5"
          />
        </ChartCard>

        <ChartCard title="Top Approving Lead" subtitle="Leads with most approved claims">
          <HorizontalBarChart
            data={MOCK_TOP_APPROVING_LEADS.map((d) => ({
              label: d.name,
              sublabel: d.email,
              value: d.count,
            }))}
            formatValue={(v) => `${v} claims`}
            barColor="#AB7AE0"
            barHoverColor="#9360cc"
          />
        </ChartCard>
      </Box>
    </Box>
  );
}
