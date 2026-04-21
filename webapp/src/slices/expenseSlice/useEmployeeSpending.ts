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
import axios from "axios";

import { useCallback, useEffect, useRef, useState } from "react";

import { apiService } from "@utils/apiService";

export interface EmployeeSpendingItem {
  name: string;
  email: string;
  totalAmount: number;
  claimCount: number;
}

export interface EmployeeCategoryItem {
  category: string;
  total: number;
  claimCount: number;
  percentage: number;
}

export interface EmployeeSpendingBreakdownResponse {
  name: string;
  email: string;
  totalAmount: number;
  claimCount: number;
  categories: EmployeeCategoryItem[];
}

export interface EmployeeCategoryTransactionItem {
  description: string;
  txnDate: string;
  amount: number;
  status: string;
}

export interface DateRangeParams {
  year: string;
  month: string;
  months: string;
}

export function resolveDateRangeParams(dateRange: string): DateRangeParams {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  switch (dateRange) {
    case "All Time":
      return { year: String(currentYear), month: String(currentMonth), months: "0" };
    case "This Month":
      return { year: String(currentYear), month: String(currentMonth), months: "1" };
    case "Last Month": {
      const m = currentMonth === 1 ? 12 : currentMonth - 1;
      const y = currentMonth === 1 ? currentYear - 1 : currentYear;
      return { year: String(y), month: String(m), months: "1" };
    }
    case "Last 3 Months":
      return { year: String(currentYear), month: String(currentMonth), months: "3" };
    case "Last 6 Months":
      return { year: String(currentYear), month: String(currentMonth), months: "6" };
    case "Year to Date":
      return {
        year: String(currentYear),
        month: String(currentMonth),
        months: String(currentMonth),
      };
    case "Last Year":
      return { year: String(currentYear - 1), month: "12", months: "12" };
    default:
      return { year: String(currentYear), month: String(currentMonth), months: "0" };
  }
}

export function useEmployeeSpendingList(dateRange: string, businessUnit: string) {
  const [employees, setEmployees] = useState<EmployeeSpendingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const { year, month, months } = resolveDateRangeParams(dateRange);
    const params: Record<string, string> = { year, month, months };
    if (businessUnit && businessUnit !== "All Business Units") {
      params.businessUnit = businessUnit;
    }

    apiService
      .get<EmployeeSpendingItem[]>("/employee-spending", { params })
      .then((res) => {
        if (!cancelled) {
          setEmployees(
            (res.data ?? []).map((e) => ({
              ...e,
              totalAmount: Number(e.totalAmount),
              claimCount: Number(e.claimCount),
            })),
          );
        }
      })
      .catch((err) => {
        if (!cancelled && !axios.isCancel(err)) {
          setError("Failed to load employee spending data.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dateRange, businessUnit]);

  return { employees, loading, error };
}

export function useEmployeeBreakdown(
  email: string | null,
  dateRange: string,
  statusFilter: string,
) {
  const [breakdown, setBreakdown] = useState<EmployeeSpendingBreakdownResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      setBreakdown(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setBreakdown(null);

    const { year, month, months } = resolveDateRangeParams(dateRange);
    const params: Record<string, string> = { email, year, month, months };
    if (statusFilter && statusFilter !== "All") {
      params.statusFilter = statusFilter;
    }

    apiService
      .get<EmployeeSpendingBreakdownResponse>("/employee-spending-breakdown", { params })
      .then((res) => {
        if (!cancelled && res.data) {
          setBreakdown({
            ...res.data,
            totalAmount: Number(res.data.totalAmount),
            claimCount: Number(res.data.claimCount),
            categories: (res.data.categories ?? []).map((c) => ({
              ...c,
              total: Number(c.total),
              claimCount: Number(c.claimCount),
              percentage: Number(c.percentage),
            })),
          });
        }
      })
      .catch((err) => {
        if (!cancelled && !axios.isCancel(err)) {
          setError("Failed to load employee breakdown.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [email, dateRange, statusFilter]);

  return { breakdown, loading, error };
}

export interface EmployeeComparisonData {
  currentMonth: EmployeeSpendingBreakdownResponse | null;
  prevMonth: EmployeeSpendingBreakdownResponse | null;
  currentYear: EmployeeSpendingBreakdownResponse | null;
  prevYear: EmployeeSpendingBreakdownResponse | null;
}

export function useEmployeeComparisonData(email: string | null) {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  const pm = cm === 1 ? 12 : cm - 1;
  const pmy = cm === 1 ? cy - 1 : cy;
  const py = cy - 1;

  const [data, setData] = useState<EmployeeComparisonData>({
    currentMonth: null,
    prevMonth: null,
    currentYear: null,
    prevYear: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetch = (year: number, month: number, months: number) =>
      apiService.get<EmployeeSpendingBreakdownResponse>("/employee-spending-breakdown", {
        params: { email, year, month, months },
      });

    const mapRes = (res: {
      data: EmployeeSpendingBreakdownResponse;
    }): EmployeeSpendingBreakdownResponse => ({
      ...res.data,
      totalAmount: Number(res.data.totalAmount),
      claimCount: Number(res.data.claimCount),
      categories: (res.data.categories ?? []).map((c) => ({
        ...c,
        total: Number(c.total),
        claimCount: Number(c.claimCount),
        percentage: Number(c.percentage),
      })),
    });

    Promise.all([fetch(cy, cm, 1), fetch(pmy, pm, 1), fetch(cy, cm, cm), fetch(py, 12, 12)])
      .then(([r0, r1, r2, r3]) => {
        if (!cancelled) {
          setData({
            currentMonth: r0.data ? mapRes(r0) : null,
            prevMonth: r1.data ? mapRes(r1) : null,
            currentYear: r2.data ? mapRes(r2) : null,
            prevYear: r3.data ? mapRes(r3) : null,
          });
        }
      })
      .catch((err) => {
        if (!cancelled && !axios.isCancel(err)) {
          setError("Failed to load comparison data.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  return { data, loading, error, cy, cm, pm, pmy, py };
}

export function useEmployeeCategoryTransactions(
  email: string | null,
  category: string | null,
  dateRange: string,
  statusFilter: string,
) {
  const [transactions, setTransactions] = useState<EmployeeCategoryTransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, EmployeeCategoryTransactionItem[]>>(new Map());

  const fetchTransactions = useCallback(
    (emp: string, cat: string) => {
      const cacheKey = `${emp}::${cat}::${dateRange}::${statusFilter}`;
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        setTransactions(cached);
        return;
      }

      setLoading(true);
      setError(null);

      const { year, month, months } = resolveDateRangeParams(dateRange);
      const params: Record<string, string> = { email: emp, category: cat, year, month, months };
      if (statusFilter && statusFilter !== "All") {
        params.statusFilter = statusFilter;
      }

      apiService
        .get<EmployeeCategoryTransactionItem[]>("/employee-category-transactions", { params })
        .then((res) => {
          const data = (res.data ?? []).map((t) => ({
            ...t,
            amount: Number(t.amount),
          }));
          cacheRef.current.set(cacheKey, data);
          setTransactions(data);
        })
        .catch((err) => {
          if (!axios.isCancel(err)) {
            setError("Failed to load transactions.");
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [dateRange, statusFilter],
  );

  useEffect(() => {
    if (email && category) {
      fetchTransactions(email, category);
    } else {
      setTransactions([]);
    }
  }, [email, category, fetchTransactions]);

  return { transactions, loading, error };
}
