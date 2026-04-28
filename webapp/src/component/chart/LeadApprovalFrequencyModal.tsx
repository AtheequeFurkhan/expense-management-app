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
import { Clock, CreditCard, FileText, Search, Stethoscope, X } from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import {
  type LeadApprovedClaim,
  type LeadClaimTypeBreakdown,
  calcDaysBetween,
  formatApprovalFrequency,
  useLeadApprovalDetail,
} from "@slices/expenseSlice/useLeadApprovalFrequency";
import { type CurrencyCode, formatWithSymbol } from "@utils/currency";

const CLAIM_TYPE_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  Expense: {
    icon: <FileText size={14} />,
    color: "#1976D2",
    bg: "#E3F2FD",
  },
  "Credit Card": {
    icon: <CreditCard size={14} />,
    color: "#7B1FA2",
    bg: "#F3E5F5",
  },
  OPD: {
    icon: <Stethoscope size={14} />,
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
};

function defaultTypeMeta(type: string) {
  return CLAIM_TYPE_META[type] ?? { icon: <FileText size={14} />, color: "#616161", bg: "#F5F5F5" };
}

function ClaimTypeCard({
  breakdown,
  fmtSym,
}: {
  breakdown: LeadClaimTypeBreakdown;
  fmtSym: (v: number) => string;
}) {
  const meta = defaultTypeMeta(breakdown.type);
  return (
    <Box
      sx={{
        flex: 1,
        p: 1.5,
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        minWidth: 0,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
            borderRadius: 1,
            bgcolor: meta.bg,
            color: meta.color,
            flexShrink: 0,
          }}
        >
          {meta.icon}
        </Box>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.primary" }}>
          {breakdown.type}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
        {breakdown.count.toLocaleString()}
      </Typography>
      <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.25 }}>claims</Typography>
      {breakdown.totalAmount > 0 && (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", mt: 0.5 }}>
          {fmtSym(breakdown.totalAmount)}
        </Typography>
      )}
    </Box>
  );
}

function DelayChip({ days }: { days: number | null }) {
  if (days === null)
    return <Typography sx={{ fontSize: 12, color: "text.disabled" }}>—</Typography>;
  const color = days <= 1 ? "#2E7D32" : days <= 3 ? "#F4B400" : "#C62828";
  const bg = days <= 1 ? "#E8F5E9" : days <= 3 ? "#FFF8E1" : "#FFEBEE";
  return (
    <Box sx={{ px: 0.75, py: 0.2, borderRadius: 1, bgcolor: bg, display: "inline-block" }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color, whiteSpace: "nowrap" }}>
        {days === 0 ? "Same day" : `${days}d`}
      </Typography>
    </Box>
  );
}

function StatusChip({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const color =
    normalized === "approved" || normalized === "finance approved" || normalized === "lead approved"
      ? "#2E7D32"
      : normalized === "rejected"
        ? "#C62828"
        : "#F4B400";
  const bg =
    normalized === "approved" || normalized === "finance approved" || normalized === "lead approved"
      ? "#E8F5E9"
      : normalized === "rejected"
        ? "#FFEBEE"
        : "#FFF8E1";
  return (
    <Box sx={{ px: 0.75, py: 0.2, borderRadius: 1, bgcolor: bg }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color }}>{status}</Typography>
    </Box>
  );
}

const TABLE_COLS = [
  { label: "Employee", flex: 1.4 },
  { label: "Type", flex: 0.9 },
  { label: "Category", flex: 1 },
  { label: "Amount", flex: 0.9 },
  { label: "Submitted", flex: 0.9 },
  { label: "Approved", flex: 0.9 },
  { label: "Delay", flex: 0.7 },
  { label: "Status", flex: 1 },
];

function ClaimsTable({
  claims,
  fmtSym,
}: {
  claims: LeadApprovedClaim[];
  fmtSym: (v: number) => string;
}) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? claims.filter(
        (c) =>
          c.employeeName.toLowerCase().includes(search.toLowerCase()) ||
          (c.claimId ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.category ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : claims;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.7,
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
          mb: 1,
        }}
      >
        <Search
          size={14}
          style={{ color: "var(--mui-palette-text-disabled, #888)", flexShrink: 0 }}
        />
        <Box
          component="input"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Filter by employee, claim ID, or category..."
          sx={{
            flex: 1,
            border: "none",
            outline: "none",
            bgcolor: "transparent",
            fontSize: 12,
            color: "text.primary",
            "::placeholder": { color: "text.disabled" },
          }}
        />
      </Box>

      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1.5,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            px: 2,
            py: 0.85,
            bgcolor: "action.hover",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          {TABLE_COLS.map((col) => (
            <Typography
              key={col.label}
              sx={{
                flex: col.flex,
                fontSize: 10,
                fontWeight: 700,
                color: "text.disabled",
                textTransform: "uppercase",
                letterSpacing: 0.6,
                minWidth: 0,
              }}
            >
              {col.label}
            </Typography>
          ))}
        </Box>

        <Box
          sx={{
            maxHeight: 340,
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-track": { bgcolor: "action.hover", borderRadius: 2 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "text.disabled", borderRadius: 2 },
          }}
        >
          {filtered.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
                {search ? "No claims match your filter" : "No claims found"}
              </Typography>
            </Box>
          ) : (
            filtered.map((claim, idx) => {
              const meta = defaultTypeMeta(claim.claimType);
              const delay = calcDaysBetween(claim.submittedDate, claim.approvedDate);
              const isLast = idx === filtered.length - 1;
              return (
                <Box
                  key={claim.claimId ?? idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    py: 0.9,
                    borderBottom: isLast ? "none" : "1px solid",
                    borderColor: "divider",
                    "&:hover": { bgcolor: "action.hover" },
                    transition: "background 0.12s",
                  }}
                >
                  <Box sx={{ flex: 1.4, minWidth: 0, pr: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "text.primary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {claim.employeeName}
                    </Typography>
                    {claim.claimId && (
                      <Typography sx={{ fontSize: 10, color: "text.disabled" }}>
                        {claim.claimId}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ flex: 0.9 }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.4,
                        px: 0.75,
                        py: 0.2,
                        borderRadius: 1,
                        bgcolor: meta.bg,
                        color: meta.color,
                      }}
                    >
                      {meta.icon}
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: meta.color }}>
                        {claim.claimType}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      flex: 1,
                      fontSize: 12,
                      color: "text.secondary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {claim.category ?? "—"}
                  </Typography>

                  <Typography
                    sx={{ flex: 0.9, fontSize: 13, fontWeight: 700, color: "text.primary" }}
                  >
                    {fmtSym(claim.amount)}
                  </Typography>

                  <Typography sx={{ flex: 0.9, fontSize: 11, color: "text.secondary" }}>
                    {claim.submittedDate
                      ? new Date(claim.submittedDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "—"}
                  </Typography>

                  <Typography sx={{ flex: 0.9, fontSize: 11, color: "text.secondary" }}>
                    {claim.approvedDate
                      ? new Date(claim.approvedDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "—"}
                  </Typography>

                  <Box sx={{ flex: 0.7 }}>
                    <DelayChip days={delay} />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <StatusChip status={claim.status} />
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {filtered.length > 0 && (
        <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.75, textAlign: "right" }}>
          {filtered.length} claim{filtered.length !== 1 ? "s" : ""}
          {search ? ` matching "${search}"` : ""}
        </Typography>
      )}
    </Box>
  );
}

export interface LeadApprovalFrequencyModalProps {
  open: boolean;
  onClose: () => void;
  leadEmail: string | null;
  leadName: string;
  dateRange: string;
  currency: CurrencyCode;
}

export default function LeadApprovalFrequencyModal({
  open,
  onClose,
  leadEmail,
  leadName,
  dateRange,
  currency,
}: LeadApprovalFrequencyModalProps) {
  const { detail, loading, error } = useLeadApprovalDetail(open ? leadEmail : null, dateRange);

  const fmtSym = (v: number) => formatWithSymbol(v, currency);

  useEffect(() => {
    if (!open) return;
  }, [open, leadEmail]);

  const employeeBreakdown = useMemo(() => {
    if (!detail?.claims?.length) return [];
    const map = new Map<string, { count: number; amount: number }>();
    detail.claims.forEach((c) => {
      const prev = map.get(c.employeeName) ?? { count: 0, amount: 0 };
      map.set(c.employeeName, { count: prev.count + 1, amount: prev.amount + c.amount });
    });
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, count: d.count, amount: d.amount }))
      .sort((a, b) => b.count - a.count);
  }, [detail]);

  const freqLabel = detail ? formatApprovalFrequency(detail.avgFrequencyPerDay) : null;

  const lastDate = detail?.lastApprovedDate
    ? new Date(detail.lastApprovedDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

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
          pt: 1.5,
          pb: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
            {leadName}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.disabled", mt: 0.2 }}>
            {leadEmail}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.5 }}>
            {detail && (
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>
                {detail.totalApproved.toLocaleString()} total approvals
              </Typography>
            )}
            {freqLabel && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1,
                  py: 0.3,
                  borderRadius: 1,
                  bgcolor: "#E8F5E9",
                }}
              >
                <Clock size={12} color="#2E7D32" />
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#2E7D32" }}>
                  {freqLabel}
                </Typography>
              </Box>
            )}
            {lastDate && (
              <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                Last approved: {lastDate}
              </Typography>
            )}
          </Box>
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

      <DialogContent sx={{ p: 2.5 }}>
        {loading ? (
          <Box>
            <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
              {[0, 1, 2].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={90}
                  sx={{ flex: 1, borderRadius: 1.5 }}
                />
              ))}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={46} sx={{ borderRadius: 1 }} />
              ))}
            </Box>
          </Box>
        ) : error ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography sx={{ color: "error.main", fontSize: 14 }}>{error}</Typography>
          </Box>
        ) : !detail ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography sx={{ color: "text.disabled", fontSize: 14 }}>
              No approval data found for this period
            </Typography>
          </Box>
        ) : (
          <>
            {detail.claimTypeBreakdown.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.primary", mb: 1 }}>
                  Claim type breakdown
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  {detail.claimTypeBreakdown.map((b) => (
                    <ClaimTypeCard key={b.type} breakdown={b} fmtSym={fmtSym} />
                  ))}
                </Box>
              </Box>
            )}

            {employeeBreakdown.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.primary", mb: 1 }}>
                  Approvals by employee
                </Typography>
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1.5,
                    overflow: "hidden",
                  }}
                >
                  {employeeBreakdown.map((emp, idx) => {
                    const pct = Math.min(100, (emp.count / employeeBreakdown[0].count) * 100);
                    const isLast = idx === employeeBreakdown.length - 1;
                    return (
                      <Box
                        key={emp.name}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          px: 2,
                          py: 0.9,
                          gap: 1.5,
                          borderBottom: isLast ? "none" : "1px solid",
                          borderColor: "divider",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "text.primary",
                            minWidth: 160,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {emp.name}
                        </Typography>
                        <Box
                          sx={{
                            flex: 1,
                            height: 6,
                            bgcolor: "action.hover",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width: `${pct}%`,
                              bgcolor: "primary.main",
                              borderRadius: 2,
                              transition: "width 0.4s ease",
                            }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "text.primary",
                            minWidth: 28,
                            textAlign: "right",
                          }}
                        >
                          {emp.count}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "text.disabled", minWidth: 40 }}>
                          {emp.count === 1 ? "claim" : "claims"}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "text.secondary",
                            minWidth: 80,
                            textAlign: "right",
                          }}
                        >
                          {fmtSym(emp.amount)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.primary", mb: 1 }}>
                Approved claims
              </Typography>
              {detail.claims.length === 0 ? (
                <Box
                  sx={{
                    py: 5,
                    textAlign: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1.5,
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
                    No claims found for this period
                  </Typography>
                </Box>
              ) : (
                <ClaimsTable claims={detail.claims} fmtSym={fmtSym} />
              )}
            </Box>
          </>
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={20} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
