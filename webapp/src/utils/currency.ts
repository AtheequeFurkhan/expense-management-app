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

export type CurrencyCode = "LKR" | "USD" | "EUR";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number; // conversion rate from LKR (base)
}

// Base currency is LKR. Rates represent how many units of the target currency = 1 LKR.
export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  LKR: { code: "LKR", symbol: "Rs", label: "LKR (Rs)", rate: 1 },
  USD: { code: "USD", symbol: "$", label: "USD ($)", rate: 0.0031 },
  EUR: { code: "EUR", symbol: "€", label: "EUR (€)", rate: 0.0029 },
};

export const CURRENCY_OPTIONS: CurrencyCode[] = ["LKR", "USD", "EUR"];

/**
 * Convert a value from LKR to the target currency.
 */
export function convertCurrency(valueLKR: number, target: CurrencyCode): number {
  return valueLKR * CURRENCIES[target].rate;
}

/**
 * Format a converted currency value with abbreviation (K, M).
 */
export function formatCurrencyValue(valueLKR: number, target: CurrencyCode): string {
  const converted = convertCurrency(valueLKR, target);

  if (converted < 1 && converted > 0) return converted.toFixed(2);

  return converted.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/**
 * Format with currency symbol prefix.
 */
export function formatWithSymbol(valueLKR: number, target: CurrencyCode): string {
  const { symbol } = CURRENCIES[target];

  return `${symbol} ${formatCurrencyValue(valueLKR, target)}`;
}
