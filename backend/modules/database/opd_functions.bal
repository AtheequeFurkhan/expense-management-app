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

isolated function validateOpdClaimSummaryInputs(int month, int months, decimal claimRangeStep) returns error? {
    if month < 1 || month > 12 {
        return error(string `Invalid month '${month}'. Expected a value between 1 and 12.`);
    }
    if months <= 0 {
        return error(string `Invalid months '${months}'. Expected a value greater than 0.`);
    }
    if claimRangeStep <= 0.0d {
        return error(string `Invalid claim range step '${claimRangeStep}'. Expected a value greater than 0.`);
    }
}

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

function queryClaimAmount(mysql:Client expenseDbClient, int? year = (), int? month = (), string context = "claim amount")
        returns decimal|error {
    AmountRow|error amountResult = expenseDbClient->queryRow(getClaimAmountQuery(year, month), AmountRow);
    if amountResult is error {
        return error(string `Failed to query ${context}: ${amountResult.message()}`);
    }

    return amountResult.total;
}

function queryPreviousYearClaimCount(mysql:Client expenseDbClient, int year) returns int|error {
    CountRow|error countResult = expenseDbClient->queryRow(getPreviousYearClaimCountQuery(year), CountRow);
    if countResult is error {
        return error(string `Failed to query previous year claim count for year '${year}': ${countResult.message()}`);
    }

    return countResult.count;
}

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

isolated function toEmployeesWithClaimsSet(EmployeeTotalRow[] employeeTotals) returns map<boolean> {
    map<boolean> employeesWithClaimsSet = {};
    foreach EmployeeTotalRow row in employeeTotals {
        employeesWithClaimsSet[row.employeeEmail.toLowerAscii()] = true;
    }
    return employeesWithClaimsSet;
}

isolated function countFullyClaimedEmployees(EmployeeTotalRow[] employeeTotals, decimal annualClaimLimit) returns int {
    int fullyClaimedEmployees = 0;
    foreach EmployeeTotalRow row in employeeTotals {
        if row.totalAmount >= annualClaimLimit {
            fullyClaimedEmployees += 1;
        }
    }
    return fullyClaimedEmployees;
}

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

public function getOpdClaimSummary(int year, int month, int months = 1)
        returns OpdClaimSummaryResponse|error {
    decimal claimRangeStep = getClaimRangeStep();
    error? validationError = validateOpdClaimSummaryInputs(month, months, claimRangeStep);
    if validationError is error {
        return validationError;
    }

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
    int previousYearClaimCount = check queryPreviousYearClaimCount(expenseDbClient, year);
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
        gracePeriodClaims: 0,
        unclaimedEmployees: unclaimedEmployees,
        fullyClaimedEmployees: fullyClaimedEmployees,
        activeClaimsChart: activeClaimsChart
    };
}
