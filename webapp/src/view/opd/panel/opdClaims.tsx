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
import { Alert, Box, MenuItem, Select, Stack, Typography } from "@wso2/oxygen-ui";

import { useEffect, useState } from "react";

import { OPD_CHART_CONFIG, OPD_SIDE_CARDS_CONFIG, OPD_SUMMARY_CARDS_CONFIG } from "@config/config";
import { OPD_LOADING_MESSAGES, SnackMessage } from "@root/src/config/constant";

// import { apiService } from "@utils/apiService";

type TrendVariant = "positive" | "negative";

type SummaryCardProps = {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string;
  suffix?: string;
  trend: string;
  trendVariant: TrendVariant;
  footerDotColor?: string;
  footerLeft?: string;
  footerRight?: string;
};

interface OpdClaimsData {
  claimAmountLastYear: number;
  currentMonthClaimAmount: number;
  claimsCountPreviousYear: number;
  gracePeriodClaims: number;
  activeClaimsData: number[];
  unclaimedCount: number;
  fullyClaimedCount: number;
  trendLastYear: number;
  trendCurrentMonth: number;
  trendPreviousYear: number;
}

function SummaryCard(props: SummaryCardProps) {
  const {
    icon,
    iconBg,
    iconColor,
    title,
    value,
    suffix,
    trend,
    trendVariant,
    footerDotColor = "info.main",
    footerLeft,
    footerRight,
  } = props;

  const trendColor = trendVariant === "negative" ? "error.main" : "success.main";
  const trendBg = trendVariant === "negative" ? "error.light" : "success.light";

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        minHeight: 168,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            bgcolor: iconBg,
            color: iconColor,
            display: "grid",
            placeItems: "center",
            fontSize: 20,
            lineHeight: 1,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Box
            sx={{
              display: "inline-flex",
              px: 1,
              py: 0.2,
              borderRadius: 8,
              bgcolor: trendBg,
              color: trendColor,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {trend}
          </Box>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.4,
              letterSpacing: 0.5,
              color: "text.secondary",
              fontSize: 11,
            }}
          >
            VS PREV PERIOD
          </Typography>
        </Box>
      </Box>

      <Box>
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 14, fontWeight: 400 }}>
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8, mt: 0.5 }}>
          <Typography
            sx={{ fontWeight: 700, fontSize: 32, lineHeight: 1.2, color: "text.primary" }}
          >
            {value}
          </Typography>
          {suffix && (
            <Typography sx={{ color: "text.secondary", fontWeight: 500, fontSize: 16 }}>
              {suffix}
            </Typography>
          )}
        </Box>

        {(footerLeft || footerRight) && (
          <Box
            sx={{
              mt: 1.2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            {footerLeft ? (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  fontSize: 13,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: footerDotColor,
                    flexShrink: 0,
                  }}
                />
                {footerLeft}
              </Typography>
            ) : (
              <Box />
            )}

            {footerRight ? (
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 10,
                  px: 1.2,
                  py: 0.4,
                  display: "inline-flex",
                  gap: 0.8,
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600, fontSize: 11 }}
                >
                  GRACE PERIOD CLAIMS
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "info.main",
                    fontWeight: 700,
                    fontSize: 12,
                    bgcolor: "info.light",
                    borderRadius: 4,
                    px: 0.6,
                    py: 0.1,
                  }}
                >
                  {footerRight}
                </Typography>
              </Box>
            ) : null}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function SideCountCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        flex: 1,
      }}
    >
      <Box>
        <Typography
          sx={{ letterSpacing: 1.5, color: "text.secondary", fontWeight: 700, fontSize: 13 }}
        >
          {title}
        </Typography>
        <Typography sx={{ color, my: 1, fontWeight: 700, fontSize: 64, lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Employees
        </Typography>
      </Box>
    </Box>
  );
}

export default function OpdClaims() {
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState("2025");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OpdClaimsData>({
    claimAmountLastYear: 8124500,
    currentMonthClaimAmount: 65210,
    claimsCountPreviousYear: 12470,
    gracePeriodClaims: 984,
    activeClaimsData: [4, 5, 6, 7, 6, 7, 8, 9],
    unclaimedCount: 22,
    fullyClaimedCount: 9,
    trendLastYear: -2.5,
    trendCurrentMonth: 5.8,
    trendPreviousYear: 2.5,
  });

  const fetchOpdClaimsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // const params: Record<string, string> = {
      //   year,
      // };

      // if (month !== "all") {
      //   params.month = month;
      // }

      // const response = await apiService.get("/opd-claims", { params });

      // if (response?.data) {
      //   setData({
      //     claimAmountLastYear: response.data.claimAmountLastYear ?? 8124500,
      //     currentMonthClaimAmount: response.data.currentMonthClaimAmount ?? 65210,
      //     claimsCountPreviousYear: response.data.claimsCountPreviousYear ?? 12470,
      //     gracePeriodClaims: response.data.gracePeriodClaims ?? 984,
      //     activeClaimsData: response.data.activeClaimsData ?? [4, 5, 6, 7, 6, 7, 8, 9],
      //     unclaimedCount: response.data.unclaimedCount ?? 22,
      //     fullyClaimedCount: response.data.fullyClaimedCount ?? 9,
      //     trendLastYear: response.data.trendLastYear ?? -2.5,
      //     trendCurrentMonth: response.data.trendCurrentMonth ?? 5.8,
      //     trendPreviousYear: response.data.trendPreviousYear ?? 2.5,
      //   });
      // }

      //TODO : Remove dummy data
      const dummyData = {
        claimAmountLastYear: 8124500,
        currentMonthClaimAmount: 65210,
        claimsCountPreviousYear: 12470,
        gracePeriodClaims: 984,
        activeClaimsData: [4, 5, 6, 7, 6, 7, 8, 9],
        unclaimedCount: 22,
        fullyClaimedCount: 9,
        trendLastYear: -2.5,
        trendCurrentMonth: 5.8,
        trendPreviousYear: 2.5,
      };
      setData(dummyData);
    } catch (err) {
      console.error("Error fetching OPD claims:", err);
      if (err instanceof TypeError) {
        setError(SnackMessage.error.fetchOpdStatus);
      } else if ((err as any)?.code === "ECONNABORTED") {
        setError(SnackMessage.error.fetchOpdTimeout);
      } else if ((err as any)?.response?.status >= 500) {
        setError(SnackMessage.error.fetchOpdServerError);
      } else {
        setError(SnackMessage.error.fetchOpdDataStatus);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpdClaimsData();
  }, [month, year]);

  if (loading) {
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
        <Stack sx={{ width: "fit-content", minWidth: "400", maxWidth: "90%" }} spacing={2}>
          <Alert
            severity="error"
            sx={{
              width: "100%",
            }}
          >
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
      {/* Summary Cards Row */}
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
          value={data.currentMonthClaimAmount.toLocaleString()}
          suffix={OPD_SUMMARY_CARDS_CONFIG.currentMonthCard.suffix}
          trend={`${data.trendCurrentMonth > 0 ? "+" : ""}${data.trendCurrentMonth}%`}
          trendVariant="positive"
          footerDotColor="info.main"
          footerLeft={`${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()}`}
        />

        <SummaryCard
          icon={OPD_SUMMARY_CARDS_CONFIG.previousYearCard.icon}
          iconBg={OPD_SUMMARY_CARDS_CONFIG.previousYearCard.iconBg}
          iconColor={OPD_SUMMARY_CARDS_CONFIG.previousYearCard.iconColor}
          title={OPD_SUMMARY_CARDS_CONFIG.previousYearCard.title}
          value={data.claimsCountPreviousYear.toLocaleString()}
          trend={`+${data.trendPreviousYear}`}
          trendVariant="positive"
          footerDotColor="warning.main"
          footerLeft={`Year ${year}`}
          footerRight={data.gracePeriodClaims.toString()}
        />
      </Box>

      {/* Chart + Side Cards Row */}
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
        {/* Bar Chart Card */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: "text.primary" }}>
              Active claims count
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Select
                size="small"
                value={month}
                onChange={(e) => setMonth(e.target.value as string)}
                sx={{ borderRadius: 6, fontSize: 14, minWidth: 130 }}
              >
                <MenuItem value="all">All Months</MenuItem>
                <MenuItem value="jan">January</MenuItem>
                <MenuItem value="feb">February</MenuItem>
                <MenuItem value="mar">March</MenuItem>
              </Select>
              <Select
                size="small"
                value={year}
                onChange={(e) => setYear(e.target.value as string)}
                sx={{ borderRadius: 6, fontSize: 14, minWidth: 80 }}
              >
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
                <MenuItem value="2026">2026</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* Chart Area */}
          <Box sx={{ display: "flex", gap: 0 }}>
            {/* Y-Axis Labels */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                pr: 1,
                height: OPD_CHART_CONFIG.chartHeight,
              }}
            >
              {OPD_CHART_CONFIG.yAxisLabels.map((label) => (
                <Typography
                  key={label}
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: 12 }}
                >
                  {label}
                </Typography>
              ))}
            </Box>

            {/* Bars + Grid */}
            <Box sx={{ flex: 1, position: "relative", height: OPD_CHART_CONFIG.chartHeight }}>
              {/* Horizontal dashed grid lines */}
              {OPD_CHART_CONFIG.yAxisLabels.map((label) => (
                <Box
                  key={`grid-${label}`}
                  sx={{
                    position: "absolute",
                    top: `${((OPD_CHART_CONFIG.maxBarValue - label) / OPD_CHART_CONFIG.maxBarValue) * 100}%`,
                    left: 0,
                    right: 0,
                    borderTop: "1px dashed",
                    borderColor: "divider",
                    zIndex: 0,
                  }}
                />
              ))}

              {/* Bar columns */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${data.activeClaimsData.length}, 1fr)`,
                  height: "100%",
                  position: "relative",
                  zIndex: 1,
                  gap: OPD_CHART_CONFIG.barGap,
                }}
              >
                {data.activeClaimsData.map((v, i) => (
                  <Box
                    key={i}
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
                          height: `${(v / OPD_CHART_CONFIG.maxBarValue) * 100}%`,
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

          {/* X-Axis Labels */}
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
                gridTemplateColumns: `repeat(${data.activeClaimsData.length}, 1fr)`,
              }}
            >
              {OPD_CHART_CONFIG.xAxisLabels.slice(0, data.activeClaimsData.length).map((label) => (
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

        {/* Side Cards */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <SideCountCard
            title={OPD_SIDE_CARDS_CONFIG.unclaimed.title}
            value={data.unclaimedCount.toString()}
            color={OPD_SIDE_CARDS_CONFIG.unclaimed.color}
          />
          <SideCountCard
            title={OPD_SIDE_CARDS_CONFIG.fullyClaimed.title}
            value={data.fullyClaimedCount.toString()}
            color={OPD_SIDE_CARDS_CONFIG.fullyClaimed.color}
          />
        </Box>
      </Box>
    </Box>
  );
}
