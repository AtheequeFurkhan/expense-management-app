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

import ballerina/sql;
import ballerinax/mysql;

# Build claim range labels for the active claims chart.
#
# + upperLimit - Maximum claim amount represented by the chart
# + rangeStep - Step size used to build each range bucket
# + return - Ordered list of claim range labels
isolated function buildClaimRangeLabels(decimal upperLimit, decimal rangeStep) returns string[] {
    string[] rangeLabels = [];
    decimal currentStart = 0.0d;

    while currentStart < upperLimit {
        decimal currentEnd = currentStart + rangeStep;
        if currentEnd > upperLimit {
            currentEnd = upperLimit;
        }

        rangeLabels.push(
            string `${formatWholeNumber(currentStart)}-${formatWholeNumber(currentEnd)}`
        );
        currentStart = currentEnd;
    }

    return rangeLabels;
}

# Resolve the chart bucket label for a given total claim amount.
#
# + totalAmount - Total claim amount for an employee
# + rangeLabels - Ordered chart range labels
# + rangeStep - Step size used to build the range labels
# + return - Matching range label for the total amount
isolated function resolveClaimRangeLabel(decimal totalAmount, string[] rangeLabels, decimal rangeStep) returns string {
    decimal currentStart = 0.0d;

    foreach string rangeLabel in rangeLabels {
        decimal currentEnd = currentStart + rangeStep;
        if totalAmount < currentEnd {
            return rangeLabel;
        }
        currentStart = currentEnd;
    }

    return rangeLabels[rangeLabels.length() - 1];
}

# Query an aggregated claim amount for the given year and optional month.
#
# + expenseDbClient - Expense database client
# + year - Year used to filter the claim amount query
# + month - Optional month used to narrow the claim amount query
# + context - Error context included in failures
# + return - Aggregated claim amount if the query succeeds, otherwise an error
function queryClaimAmount(mysql:Client expenseDbClient, int? year = (), int? month = (), string context = "claim amount")
        returns decimal|error {
    AmountRow|error amountResult = expenseDbClient->queryRow(getClaimAmountQuery(year, month), AmountRow);
    if amountResult is error {
        return error(string `Failed to query ${context}: ${amountResult.message()}`);
    }

    return amountResult.total;
}

# Query the number of claims submitted during the given year.
#
# + expenseDbClient - Expense database client
# + year - Reporting year used to filter claims
# + return - Claim count for the given year if the query succeeds, otherwise an error
function queryClaimCount(mysql:Client expenseDbClient, int year) returns int|error {
    CountRow|error countResult = expenseDbClient->queryRow(getClaimCountQuery(year), CountRow);
    if countResult is error {
        return error(string `Failed to query claim count for year '${year}': ${countResult.message()}`);
    }

    return countResult.count;
}

# Query the number of claims submitted during the configured grace period.
#
# + expenseDbClient - Expense database client
# + year - Current reporting year used to evaluate the January grace window
# + gracePeriodDays - Number of days included in the grace period
# + return - Grace period claim count if the query succeeds, otherwise an error
function queryGracePeriodClaimCount(mysql:Client expenseDbClient, int year, int gracePeriodDays) returns int|error {
    CountRow|error countResult =
        expenseDbClient->queryRow(getGracePeriodClaimCountQuery(year, gracePeriodDays), CountRow);
    if countResult is error {
        return error(
            string `Failed to query grace period claim count for year '${year}' and grace period '${gracePeriodDays}' days: ${countResult.message()}`
        );
    }

    return countResult.count;
}

# Query all employee emails that have ever appeared in OPD claims.
#
# + expenseDbClient - Expense database client
# + return - Normalized employee emails from OPD claims if the query succeeds, otherwise an error
function queryAllClaimEmployeeEmails(mysql:Client expenseDbClient) returns string[]|error {
    stream<EmployeeEmailRow, sql:Error?> allEmployeesStream =
        expenseDbClient->query(getAllClaimEmployeeEmailsQuery(), EmployeeEmailRow);
    EmployeeEmailRow[]|error allEmployeeRowsResult = from EmployeeEmailRow row in allEmployeesStream
        select row;
    if allEmployeeRowsResult is error {
        return error(string `Failed to query employee emails from OPD claims: ${allEmployeeRowsResult.message()}`);
    }

    return from EmployeeEmailRow row in allEmployeeRowsResult
        select row.employeeEmail.toLowerAscii();
}

# Query total claim amounts per employee for the selected reporting range.
#
# + expenseDbClient - Expense database client
# + year - Year used for the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + return - Per-employee totals if the query succeeds, otherwise an error
function queryEmployeeTotals(mysql:Client expenseDbClient, int year, int month, int months) returns EmployeeTotalRow[]|error {
    stream<EmployeeTotalRow, sql:Error?> employeeTotalsStream =
        expenseDbClient->query(getEmployeeTotalsForRangeQuery(year, month, months), EmployeeTotalRow);
    EmployeeTotalRow[]|error employeeTotalsResult = from EmployeeTotalRow row in employeeTotalsStream
        select row;
    if employeeTotalsResult is error {
        return error(
            string `Failed to query employee totals for year '${year}', month '${month}', months '${months}': ${employeeTotalsResult.message()}`
        );
    }

    return employeeTotalsResult;
}

# Convert employee totals into a lookup set of employees with claims.
#
# + employeeTotals - Per-employee totals for the selected reporting range
# + return - Map keyed by normalized employee email
isolated function toEmployeesWithClaimsSet(EmployeeTotalRow[] employeeTotals) returns map<boolean> {
    map<boolean> employeesWithClaimsSet = {};
    foreach EmployeeTotalRow row in employeeTotals {
        employeesWithClaimsSet[row.employeeEmail.toLowerAscii()] = true;
    }
    return employeesWithClaimsSet;
}

# Count employees whose total claims reached the annual claim limit.
#
# + employeeTotals - Per-employee totals for the selected reporting range
# + annualClaimLimit - Configured annual claim limit
# + return - Number of fully claimed employees
isolated function countFullyClaimedEmployees(EmployeeTotalRow[] employeeTotals, decimal annualClaimLimit) returns int {
    int fullyClaimedEmployees = 0;
    foreach EmployeeTotalRow row in employeeTotals {
        if row.totalAmount >= annualClaimLimit {
            fullyClaimedEmployees += 1;
        }
    }
    return fullyClaimedEmployees;
}

# Build chart buckets representing the active claim distribution.
#
# + employeeTotals - Per-employee totals for the selected reporting range
# + annualClaimLimit - Configured upper limit for the chart
# + claimRangeStep - Configured amount step used for chart buckets
# + return - Ordered claim bucket data for the chart
isolated function buildActiveClaimsChart(EmployeeTotalRow[] employeeTotals, decimal annualClaimLimit, decimal claimRangeStep)
        returns ClaimBucket[] {
    string[] rangeLabels = buildClaimRangeLabels(annualClaimLimit, claimRangeStep);
    map<int> rangeCounts = {};
    foreach string rangeLabel in rangeLabels {
        rangeCounts[rangeLabel] = 0;
    }

    foreach EmployeeTotalRow row in employeeTotals {
        string rangeLabel = resolveClaimRangeLabel(row.totalAmount, rangeLabels, claimRangeStep);
        rangeCounts[rangeLabel] = (rangeCounts[rangeLabel] ?: 0) + 1;
    }

    return from string rangeLabel in rangeLabels
        select {
            range: rangeLabel,
            count: rangeCounts[rangeLabel] ?: 0
        };
}

# Build the OPD claim summary used by the dashboard.
#
# + year - Reporting year for the summary
# + month - Reporting month for the summary
# + months - Number of months included in the reporting window
# + return - OPD claim summary response if all queries succeed, otherwise an error
public function getOpdClaimSummary(int year, int month, int months = 1)
        returns OpdClaimSummaryResponse|error {
    decimal claimRangeStep = getClaimRangeStep();
    mysql:Client expenseDbClient = check getExpenseDbClient();

    decimal lastYearClaimAmount = check queryClaimAmount(
        expenseDbClient,
        year,
        (),
        string `last year claim amount for year '${year}'`
    );
    decimal currentMonthClaimAmount = check queryClaimAmount(
        expenseDbClient,
        year,
        month,
        string `current month claim amount for year '${year}' and month '${month}'`
    );
    int previousYearClaimCount = check queryClaimCount(expenseDbClient, year - 1);
    int gracePeriodClaims = check queryGracePeriodClaimCount(
        expenseDbClient,
        year,
        getLastYearClaimGracePeriodInDays()
    );
    string[] allEmployeeEmails = check queryAllClaimEmployeeEmails(expenseDbClient);
    int totalEmployees = allEmployeeEmails.length();
    EmployeeTotalRow[] employeeTotals = check queryEmployeeTotals(expenseDbClient, year, month, months);

    map<boolean> employeesWithClaimsSet = toEmployeesWithClaimsSet(employeeTotals);
    decimal annualClaimLimit = getAnnualClaimLimit();
    int fullyClaimedEmployees = countFullyClaimedEmployees(employeeTotals, annualClaimLimit);
    ClaimBucket[] activeClaimsChart = buildActiveClaimsChart(employeeTotals, annualClaimLimit, claimRangeStep);

    int unclaimedEmployees = totalEmployees - employeesWithClaimsSet.length();
    if unclaimedEmployees < 0 {
        unclaimedEmployees = 0;
    }

    return {
        lastYearClaimAmount: lastYearClaimAmount,
        currentMonthClaimAmount: currentMonthClaimAmount,
        previousYearClaimCount: previousYearClaimCount,
        gracePeriodClaims: gracePeriodClaims,
        unclaimedEmployees: unclaimedEmployees,
        fullyClaimedEmployees: fullyClaimedEmployees,
        activeClaimsChart: activeClaimsChart
    };
}
