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
import { Alert, Box, Stack } from "@wso2/oxygen-ui";

import { useEffect, useState } from "react";

import {
  MONTH_OPTIONS,
  OPD_CHART_CONFIG,
  OPD_LOADING_MESSAGES,
  OPD_SIDE_CARDS_CONFIG,
  OPD_SUMMARY_CARDS_CONFIG,
} from "@config/constant";

import SideCountCard from "../../../component/card/SideCountCard";
import SummaryCard from "../../../component/card/SummaryCard";
import ActiveClaimsChart from "../../../component/chart/ActiveClaimsChart";
import { MonthFilter, resetOpdClaims, useOpdClaims } from "../../../slices/opdSlice/useOpdClaims";
import { useAppDispatch } from "../../../slices/store";

const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString(
  "default",
  { month: "long" },
);

export default function OpdClaims() {
  const dispatch = useAppDispatch();
  const { data, month, loading, error, handleMonthChange } = useOpdClaims();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [showChartLoading, setShowChartLoading] = useState(false);

  const selectedPeriodLabel = MONTH_OPTIONS.find((option) => option.value === month)?.label ?? "";
  const chartMaxValue = Math.max(...data.activeClaimsData, 1);
  const chartYAxisLabels = [
    chartMaxValue,
    Math.round(chartMaxValue * 0.75),
    Math.round(chartMaxValue * 0.5),
    Math.round(chartMaxValue * 0.25),
    0,
  ];

  useEffect(() => {
    return () => {
      dispatch(resetOpdClaims());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!loading && !error) {
      setHasLoadedOnce(true);
    }
  }, [loading, error]);

  useEffect(() => {
    if (!(loading && hasLoadedOnce)) {
      setShowChartLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowChartLoading(true);
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loading, hasLoadedOnce]);

  if (loading && !hasLoadedOnce) {
    return (
      <Box
        sx={{
          p: 2,
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Stack sx={{ width: "100%", maxWidth: 600 }} spacing={1}>
          <Alert severity="info">{OPD_LOADING_MESSAGES.LOADING_DATA}</Alert>
        </Stack>
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
        minHeight: "100%",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        transition: "width 0.3s ease-in-out",
      }}
    >
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
          value={data.claimAmountLastYear.toLocaleString()}
          suffix={OPD_SUMMARY_CARDS_CONFIG.lastYearCard.suffix}
          trend={`${data.trendLastYear > 0 ? "+" : ""}${data.trendLastYear}%`}
          trendVariant={data.trendLastYear < 0 ? "negative" : "positive"}
        />

        <SummaryCard
          icon={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.icon}
          iconBg={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.iconBg}
          iconColor={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.iconColor}
          title={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.title}
          chipLabel={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.chipLabel}
          value={data.currentMonthClaimAmount.toLocaleString()}
          suffix={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.suffix}
          trend={`${data.trendCurrentMonth > 0 ? "+" : ""}${data.trendCurrentMonth}%`}
          trendVariant={data.trendCurrentMonth < 0 ? "negative" : "positive"}
          trendLabel={`VS ${prevMonth}`}
        />

        <SummaryCard
          icon={OPD_SUMMARY_CARDS_CONFIG.previousYearCard.icon}
          iconBg={OPD_SUMMARY_CARDS_CONFIG.previousYearCard.iconBg}
          iconColor={OPD_SUMMARY_CARDS_CONFIG.previousYearCard.iconColor}
          title={OPD_SUMMARY_CARDS_CONFIG.previousYearCard.title}
          chipLabel={OPD_SUMMARY_CARDS_CONFIG.previousYearCard.chipLabel}
          value={data.claimsCountPreviousYear.toLocaleString()}
          trend={`${data.trendPreviousYear > 0 ? "+" : ""}${data.trendPreviousYear}%`}
          trendVariant={data.trendPreviousYear < 0 ? "negative" : "positive"}
          footerRight={data.gracePeriodClaims.toString()}
        />
      </Box>

      <Box
        sx={{
          mt: 2,
          width: "100%",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 3fr) minmax(260px, 1fr)" },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        <ActiveClaimsChart
          key={`${month}-${data.activeClaimsData.join("-")}`}
          title="Total Active Claims"
          month={month}
          onMonthChange={(value) => handleMonthChange(value as MonthFilter)}
          loading={showChartLoading}
          monthOptions={MONTH_OPTIONS}
          values={data.activeClaimsData}
          yAxisLabels={chartYAxisLabels}
          xAxisLabels={OPD_CHART_CONFIG.xAxisLabels}
          maxBarValue={chartMaxValue}
          chartHeight={OPD_CHART_CONFIG.chartHeight}
          barGap={OPD_CHART_CONFIG.barGap}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
          <SideCountCard
            title={OPD_SIDE_CARDS_CONFIG.unclaimed.title}
            value={data.unclaimedCount.toString()}
            period={selectedPeriodLabel}
          />
          <SideCountCard
            title={OPD_SIDE_CARDS_CONFIG.fullyClaimed.title}
            value={data.fullyClaimedCount.toString()}
            period={selectedPeriodLabel}
          />
        </Box>
      </Box>
    </Box>
  );
}
