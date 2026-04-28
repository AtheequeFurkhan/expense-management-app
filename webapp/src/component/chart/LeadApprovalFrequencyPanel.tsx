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

import { useMemo, useState } from "react";

import ChartCard from "@component/chart/ChartCard";
import ChartPeriodFilter from "@component/chart/ChartPeriodFilter";
import { MONTH_OPTIONS } from "@config/constant";
import {
  type LeadFrequencyItem,
  formatApprovalFrequency,
  getFrequencyBgColor,
  getFrequencyColor,
  useLeadFrequencyList,
} from "@slices/expenseSlice/useLeadApprovalFrequency";
import { type CurrencyCode } from "@utils/currency";
import { type TopLeadItem } from "@view/expense/data/mockData";

import LeadApprovalFrequencyModal from "./LeadApprovalFrequencyModal";

function toFrequencyItem(lead: TopLeadItem): LeadFrequencyItem {
  return {
    name: lead.name,
    email: lead.email,
    bu: lead.bu,
    totalApproved: lead.count,
    avgFrequencyPerDay: 0,
    firstApprovedDate: null,
    lastApprovedDate: null,
  };
}

interface LeadApprovalFrequencyPanelProps {
  dateRange: string;
  businessUnit: string;
  currency: CurrencyCode;
  chartPeriod: string;
  onPeriodChange: (period: string) => void;
  fallbackLeads?: TopLeadItem[];
}

function FrequencyBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <Box
      sx={{
        width: 80,
        height: 4,
        bgcolor: "action.hover",
        borderRadius: 2,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: `${pct}%`,
          bgcolor: color,
          borderRadius: 2,
          transition: "width 0.4s ease",
        }}
      />
    </Box>
  );
}

function LeadRow({
  lead,
  maxFreq,
  onClick,
}: {
  lead: LeadFrequencyItem;
  maxFreq: number;
  onClick: () => void;
}) {
  const freqColor = getFrequencyColor(lead.avgFrequencyPerDay);
  const freqBg = getFrequencyBgColor(lead.avgFrequencyPerDay);
  const freqLabel = formatApprovalFrequency(lead.avgFrequencyPerDay);

  const lastDate = lead.lastApprovedDate
    ? new Date(lead.lastApprovedDate).toLocaleString("default", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
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
        gap: 1.5,
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
          {lead.name}
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
          {lead.email}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
        {lead.avgFrequencyPerDay > 0 && (
          <FrequencyBar value={lead.avgFrequencyPerDay} max={maxFreq} color={freqColor} />
        )}

        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: lead.avgFrequencyPerDay > 0 ? freqBg : "action.hover",
            minWidth: 110,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: lead.avgFrequencyPerDay > 0 ? freqColor : "text.disabled",
              whiteSpace: "nowrap",
            }}
          >
            {lead.avgFrequencyPerDay > 0 ? freqLabel : "Frequency N/A"}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right", minWidth: 64 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>
            {lead.totalApproved.toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: 10, color: "text.disabled" }}>
            {lastDate ? `Last: ${lastDate}` : "claims"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function LeadApprovalFrequencyPanel({
  dateRange,
  businessUnit,
  currency,
  chartPeriod,
  onPeriodChange,
  fallbackLeads = [],
}: LeadApprovalFrequencyPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<LeadFrequencyItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { leads: apiLeads, loading, error } = useLeadFrequencyList(dateRange, businessUnit);

  const usingFallback = apiLeads.length === 0 && fallbackLeads.length > 0;
  const leads = usingFallback ? fallbackLeads.map(toFrequencyItem) : apiLeads;

  const sorted = useMemo(
    () =>
      [...leads].sort((a, b) =>
        b.avgFrequencyPerDay !== a.avgFrequencyPerDay
          ? b.avgFrequencyPerDay - a.avgFrequencyPerDay
          : b.totalApproved - a.totalApproved,
      ),
    [leads],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q),
    );
  }, [sorted, search]);

  const maxFreq = useMemo(
    () => Math.max(...sorted.map((l) => l.avgFrequencyPerDay), 0.0001),
    [sorted],
  );

  const handleLeadClick = (lead: LeadFrequencyItem) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  return (
    <>
      <ChartCard
        title="Lead Approval Frequency"
        subtitle="How often each lead/approver approves claims on average"
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
          <Search
            size={16}
            style={{ color: "var(--mui-palette-text-disabled, #888)", flexShrink: 0 }}
          />
          <Box
            component="input"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search leads by name or email..."
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
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={58} sx={{ borderRadius: 1.5 }} />
              ))}
            </Box>
          ) : error && !usingFallback ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography sx={{ color: "error.main", fontSize: 13 }}>{error}</Typography>
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography sx={{ color: "text.disabled", fontSize: 13 }}>
                {search ? "No leads match your search" : "No lead approval data available"}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {filtered.map((lead) => (
                <LeadRow
                  key={lead.email}
                  lead={lead}
                  maxFreq={maxFreq}
                  onClick={() => handleLeadClick(lead)}
                />
              ))}
            </Box>
          )}
        </Box>
      </ChartCard>

      <LeadApprovalFrequencyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        leadEmail={selectedLead?.email ?? null}
        leadName={selectedLead?.name ?? ""}
        dateRange={dateRange}
        currency={currency}
      />
    </>
  );
}
