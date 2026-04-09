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
import expense_management.database;

# Derive a human-readable display name from an email address.
#
# + email - Email address to derive a name from
# + return - Capitalized name derived from the email prefix
isolated function deriveDisplayName(string email) returns string {
    string prefix = email;
    int? atIndex = email.indexOf("@");
    if atIndex is int {
        prefix = email.substring(0, atIndex);
    }

    // Split by common separators (dot, underscore, dash)
    string[] parts = [];
    string current = "";
    foreach string:Char ch in prefix {
        if ch == "." || ch == "_" || ch == "-" {
            if current.length() > 0 {
                parts.push(current);
            }
            current = "";
        } else {
            current = current + ch;
        }
    }
    if current.length() > 0 {
        parts.push(current);
    }

    // Capitalize each part and join with space
    string result = "";
    foreach int i in 0 ..< parts.length() {
        if i > 0 {
            result = result + " ";
        }
        result = result + capitalizeWord(parts[i]);
    }

    return result;
}

# Capitalize the first letter of a word.
#
# + word - Word to capitalize
# + return - Capitalized word
isolated function capitalizeWord(string word) returns string {
    if word.length() == 0 {
        return word;
    }
    string first = word.substring(0, 1).toUpperAscii();
    if word.length() == 1 {
        return first;
    }
    return first + word.substring(1);
}

# Calculate the trend percentage between a current and previous value.
#
# + current - Current period value
# + previous - Previous period value
# + return - Percentage change rounded to one decimal place
isolated function calculateTrend(decimal current, decimal previous) returns decimal {
    if previous == 0.0d {
        return current > 0.0d ? 100.0d : 0.0d;
    }
    decimal change = ((current - previous) / previous) * 100.0d;
    // Round to 1 decimal
    return <decimal>(<int>(change * 10.0d)) / 10.0d;
}

# Build the expense claims summary used by the dashboard.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + businessUnit - Optional business unit filter
# + return - Expense claim summary response if all queries succeed, otherwise an error
public function getExpenseClaimSummary(int year, int month, int months,
        string? businessUnit = ()) returns ExpenseClaimSummaryResponse|error {

    // Current period data
    decimal totalClaimAmount = check database:queryExpenseTotalAmount(year, month, months, businessUnit);
    int totalClaimCount = check database:queryExpenseClaimCount(year, month, months, businessUnit);
    decimal avgClaimAmount = check database:queryExpenseAvgAmount(year, month, months, businessUnit);

    // Status counts (numeric codes: -1=Rejected, 0=Draft, 1=Submitted, 2=Lead Approved, 3=Finance Approved)
    int pendingClaims = check database:queryExpenseCountByStatuses(year, month, months, ["0", "1"], businessUnit);
    int approvedClaims = check database:queryExpenseCountByStatuses(year, month, months, ["2", "3"], businessUnit);
    int rejectedClaims = check database:queryExpenseCountByStatuses(year, month, months, ["-1"], businessUnit);

    // Chart data
    database:BuExpenseRow[] buExpenseRows = check database:queryExpenseByBu(year, month, months);
    database:ClaimStatusRow[] claimStatusRows = check database:queryExpenseClaimsByStatus(year, month, months, businessUnit);
    database:TopSpendingEmployeeRow[] topEmployeeRows = check database:queryTopSpendingEmployees(year, month, months, 7, businessUnit);
    database:LeadApprovalFrequencyRow[] leadApprovalFrequencyRows = check database:queryLeadApprovalFrequency(
        year,
        month,
        months,
        businessUnit
    );
    database:TopApprovingLeadRow[] topLeadRows = check database:queryTopApprovingLeads(year, month, months, 7, businessUnit);
    database:RecurringExpenseTypeRow[] recurringRows = check database:queryRecurringExpenseTypes(year, month, months, 25, businessUnit);

    // Previous period data for trend calculation (skip for All Time where months=0)
    decimal prevTotalAmount = 0;
    int prevTotalCount = 0;
    decimal prevAvgAmount = 0;
    int prevApproved = 0;

    if months > 0 {
        int prevMonth = month - months;
        int prevYear = year;
        if prevMonth <= 0 {
            prevMonth = prevMonth + 12;
            prevYear = prevYear - 1;
        }

        prevTotalAmount = check database:queryExpenseTotalAmount(prevYear, prevMonth, months, businessUnit);
        prevTotalCount = check database:queryExpenseClaimCount(prevYear, prevMonth, months, businessUnit);
        prevAvgAmount = check database:queryExpenseAvgAmount(prevYear, prevMonth, months, businessUnit);
        prevApproved = check database:queryExpenseCountByStatuses(prevYear, prevMonth, months, ["2", "3"], businessUnit);
    }

    // Transform rows into response types
    BuExpenseItem[] buExpenses = from database:BuExpenseRow row in buExpenseRows
        select {
            label: row.businessUnit,
            value: row.total
        };

    ActiveClaimStatItem[] activeClaimStats = from database:ClaimStatusRow row in claimStatusRows
        select {
            label: row.status,
            value: row.count
        };

    TopEmployeeItem[] topSpendingEmployees = from database:TopSpendingEmployeeRow row in topEmployeeRows
        select {
            name: deriveDisplayName(row.employeeEmail),
            email: row.employeeEmail,
            bu: row.businessUnit,
            amount: row.total
        };

    LeadApprovalFrequencyItem[] leadApprovalFrequency = from database:LeadApprovalFrequencyRow row in leadApprovalFrequencyRows
        select {
            label: row.label,
            value: row.count
        };

    TopLeadItem[] topApprovingLeads = from database:TopApprovingLeadRow row in topLeadRows
        select {
            name: deriveDisplayName(row.leadEmail),
            email: row.leadEmail,
            bu: row.businessUnit,
            count: row.count
        };

    ExpenseTypeItem[] recurringExpenseTypes = from database:RecurringExpenseTypeRow row in recurringRows
        select {
            name: row.expenseType,
            amount: row.total
        };

    return {
        totalClaimAmount: totalClaimAmount,
        totalClaimCount: totalClaimCount,
        pendingClaims: pendingClaims,
        approvedClaims: approvedClaims,
        rejectedClaims: rejectedClaims,
        avgClaimAmount: avgClaimAmount,
        buExpenses: buExpenses,
        activeClaimStats: activeClaimStats,
        topSpendingEmployees: topSpendingEmployees,
        leadApprovalFrequency: leadApprovalFrequency,
        topApprovingLeads: topApprovingLeads,
        recurringExpenseTypes: recurringExpenseTypes,
        trendTotalAmount: calculateTrend(totalClaimAmount, prevTotalAmount),
        trendTotalCount: calculateTrend(<decimal>totalClaimCount, <decimal>prevTotalCount),
        trendApproved: calculateTrend(<decimal>approvedClaims, <decimal>prevApproved),
        trendAvgAmount: calculateTrend(avgClaimAmount, prevAvgAmount)
    };
}
