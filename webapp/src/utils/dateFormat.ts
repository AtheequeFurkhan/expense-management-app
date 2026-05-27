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

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;

/**
 * Converts a CC date-range token into a human-readable label.
 * Preset tokens (e.g. "Last 3 Months") pass through unchanged.
 * Custom tokens ("custom:YYYY-M:YYYY-M") become "Mon YYYY – Mon YYYY".
 */
export function formatCCPeriodLabel(dateRange: string): string {
  if (!dateRange.startsWith("custom:")) return dateRange;
  const parts = dateRange.slice(7).split(":");
  if (parts.length !== 2) return dateRange;
  const [fy, fm] = parts[0].split("-").map(Number);
  const [ty, tm] = parts[1].split("-").map(Number);
  const fromName = MONTH_NAMES[fm - 1];
  const toName = MONTH_NAMES[tm - 1];
  if (!fromName || !toName) return dateRange;
  return `${fromName} ${fy} – ${toName} ${ty}`;
}
