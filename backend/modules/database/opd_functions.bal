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

isolated function formatClaimRangeBoundary(decimal amount) returns string {
    return (<int> amount).toString();
}

isolated function buildClaimRangeLabels(decimal upperLimit, decimal rangeStep) returns string[] {
    string[] rangeLabels = [];
    decimal currentStart = 0.0d;

    while currentStart < upperLimit {
        decimal currentEnd = currentStart + rangeStep;
        if currentEnd > upperLimit {
            currentEnd = upperLimit;
        }

        rangeLabels.push(
            string `${formatClaimRangeBoundary(currentStart)}-${formatClaimRangeBoundary(currentEnd)}`
        );
        currentStart = currentEnd;
    }

    return rangeLabels;
}

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

public function getOpdClaimSummary(int year, int month, int months = 1)
        returns OpdClaimSummaryResponse|error {
    if month < 1 || month > 12 {
        return error(string `Invalid month '${month}'. Expected a value between 1 and 12.`);
    }
    if months <= 0 {
        return error(string `Invalid months '${months}'. Expected a value greater than 0.`);
    }
    decimal claimRangeStep = getClaimRangeStep();
    if claimRangeStep <= 0.0d {
        return error(string `Invalid claim range step '${claimRangeStep}'. Expected a value greater than 0.`);
    }

    mysql:Client expenseDbClient = check getExpenseDbClient();

    AmountRow|error lastYearAmountResult = expenseDbClient->queryRow(getClaimAmountQuery(year), AmountRow);
    if lastYearAmountResult is error {
        return error(string `Failed to query last year claim amount for year '${year}': ${lastYearAmountResult.message()}`);
    }
    AmountRow lastYearAmount = lastYearAmountResult;

    AmountRow|error currentMonthAmountResult =
        expenseDbClient->queryRow(getClaimAmountQuery(year, month), AmountRow);
    if currentMonthAmountResult is error {
        return error(
            string `Failed to query current month claim amount for year '${year}' and month '${month}': ${currentMonthAmountResult.message()}`
        );
    }
    AmountRow currentMonthAmount = currentMonthAmountResult;

    CountRow|error previousYearCountResult =
        expenseDbClient->queryRow(getPreviousYearClaimCountQuery(year), CountRow);
    if previousYearCountResult is error {
        return error(string `Failed to query previous year claim count for year '${year}': ${previousYearCountResult.message()}`);
    }
    CountRow previousYearCount = previousYearCountResult;

    stream<EmployeeEmailRow, sql:Error?> allEmployeesStream =
        expenseDbClient->query(getAllClaimEmployeeEmailsQuery(), EmployeeEmailRow);
    EmployeeEmailRow[]|error allEmployeeRowsResult = from EmployeeEmailRow row in allEmployeesStream
        select row;
    if allEmployeeRowsResult is error {
        return error(string `Failed to query employee emails from OPD claims: ${allEmployeeRowsResult.message()}`);
    }
    EmployeeEmailRow[] allEmployeeRows = allEmployeeRowsResult;
    string[] allEmployeeEmails = from EmployeeEmailRow row in allEmployeeRows
        select row.employeeEmail.toLowerAscii();
    int totalEmployees = allEmployeeEmails.length();

    stream<EmployeeTotalRow, sql:Error?> employeeTotalsStream =
        expenseDbClient->query(getEmployeeTotalsForRangeQuery(year, month, months), EmployeeTotalRow);
    EmployeeTotalRow[]|error employeeTotalsResult = from EmployeeTotalRow row in employeeTotalsStream
        select row;
    if employeeTotalsResult is error {
        return error(
            string `Failed to query employee totals for year '${year}', month '${month}', months '${months}': ${employeeTotalsResult.message()}`
        );
    }
    EmployeeTotalRow[] employeeTotals = employeeTotalsResult;

    map<boolean> employeesWithClaimsSet = {};
    foreach EmployeeTotalRow row in employeeTotals {
        string normalizedEmail = row.employeeEmail.toLowerAscii();
        employeesWithClaimsSet[normalizedEmail] = true;
    }

    int fullyClaimedEmployees = 0;
    foreach EmployeeTotalRow row in employeeTotals {
        if row.totalAmount >= getAnnualClaimLimit() {
            fullyClaimedEmployees += 1;
        }
    }

    string[] rangeLabels = buildClaimRangeLabels(getAnnualClaimLimit(), claimRangeStep);
    map<int> rangeCounts = {};
    foreach string rangeLabel in rangeLabels {
        rangeCounts[rangeLabel] = 0;
    }

    foreach EmployeeTotalRow row in employeeTotals {
        string rangeLabel = resolveClaimRangeLabel(row.totalAmount, rangeLabels, claimRangeStep);
        rangeCounts[rangeLabel] = (rangeCounts[rangeLabel] ?: 0) + 1;
    }

    int unclaimedEmployees = totalEmployees - employeesWithClaimsSet.length();
    if unclaimedEmployees < 0 {
        unclaimedEmployees = 0;
    }

    ClaimBucket[] activeClaimsChart = from string rangeLabel in rangeLabels
        select {
            range: rangeLabel,
            count: rangeCounts[rangeLabel] ?: 0
        };

    return {
        lastYearClaimAmount: lastYearAmount.total,
        currentMonthClaimAmount: currentMonthAmount.total,
        previousYearClaimCount: previousYearCount.count,
        gracePeriodClaims: 0,
        unclaimedEmployees: unclaimedEmployees,
        fullyClaimedEmployees: fullyClaimedEmployees,
        activeClaimsChart: activeClaimsChart
    };
}
