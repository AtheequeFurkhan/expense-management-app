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

isolated function toNormalizedEmailSet(string[] emails) returns map<boolean> {
    map<boolean> emailSet = {};
    foreach string email in emails {
        emailSet[email.toLowerAscii()] = true;
    }
    return emailSet;
}

public isolated function getOpdClaimSummary(int year, int month) returns OpdClaimSummaryResponse|error {
    AmountRow lastYearAmount = check expenseDbClient->queryRow(getLastYearClaimAmountQuery(year), AmountRow);
    AmountRow currentMonthAmount = check expenseDbClient->queryRow(getCurrentMonthClaimAmountQuery(year, month), AmountRow);
    CountRow previousYearCount = check expenseDbClient->queryRow(getPreviousYearClaimCountQuery(year), CountRow);

    stream<EmployeeEmailRow, sql:Error?> activeEmployeesStream =
        hrisDbClient->query(getActiveSriLankaEmployeeEmailsQuery(), EmployeeEmailRow);
    EmployeeEmailRow[] activeEmployeeRows = check from EmployeeEmailRow row in activeEmployeesStream
        select row;

    string[] activeEmployeeEmails = from EmployeeEmailRow row in activeEmployeeRows
        select row.employeeEmail.toLowerAscii();
    map<boolean> activeEmployeeSet = toNormalizedEmailSet(activeEmployeeEmails);
    int totalEmployees = activeEmployeeEmails.length();

    stream<EmployeeEmailRow, sql:Error?> claimEmployeesStream =
        expenseDbClient->query(getClaimEmployeeEmailsForYearQuery(year), EmployeeEmailRow);
    EmployeeEmailRow[] claimEmployeeRows = check from EmployeeEmailRow row in claimEmployeesStream
        select row;

    map<boolean> employeesWithClaimsSet = {};
    foreach EmployeeEmailRow row in claimEmployeeRows {
        string normalizedEmail = row.employeeEmail.toLowerAscii();
        if activeEmployeeSet.hasKey(normalizedEmail) {
            employeesWithClaimsSet[normalizedEmail] = true;
        }
    }

    stream<EmployeeTotalRow, sql:Error?> employeeTotalsStream =
        expenseDbClient->query(getEmployeeTotalsForYearQuery(year), EmployeeTotalRow);
    EmployeeTotalRow[] employeeTotals = check from EmployeeTotalRow row in employeeTotalsStream
        select row;

    int fullyClaimedEmployees = 0;
    foreach EmployeeTotalRow row in employeeTotals {
        if activeEmployeeSet.hasKey(row.employeeEmail.toLowerAscii()) && row.totalAmount >= getAnnualClaimLimit() {
            fullyClaimedEmployees += 1;
        }
    }

    stream<ClaimTransactionRow, sql:Error?> monthlyTransactionsStream =
        expenseDbClient->query(getMonthlyClaimTransactionsQuery(year, month), ClaimTransactionRow);
    ClaimTransactionRow[] monthlyTransactions = check from ClaimTransactionRow row in monthlyTransactionsStream
        select row;

    map<int> bucketMap = {
        "0-5K": 0,
        "5K-10K": 0,
        "10K-15K": 0,
        "15K-20K": 0,
        "20K-25K": 0,
        "25K-30K": 0,
        "30K-35K": 0,
        "35K-40K": 0
    };

    foreach ClaimTransactionRow row in monthlyTransactions {
        if !activeEmployeeSet.hasKey(row.employeeEmail.toLowerAscii()) {
            continue;
        }
        string bucket = "35K-40K";
        if row.amount < 5000.0d {
            bucket = "0-5K";
        } else if row.amount < 10000.0d {
            bucket = "5K-10K";
        } else if row.amount < 15000.0d {
            bucket = "10K-15K";
        } else if row.amount < 20000.0d {
            bucket = "15K-20K";
        } else if row.amount < 25000.0d {
            bucket = "20K-25K";
        } else if row.amount < 30000.0d {
            bucket = "25K-30K";
        } else if row.amount < 35000.0d {
            bucket = "30K-35K";
        }
        bucketMap[bucket] = (bucketMap[bucket] ?: 0) + 1;
    }

    int unclaimedEmployees = totalEmployees - employeesWithClaimsSet.length();
    if unclaimedEmployees < 0 {
        unclaimedEmployees = 0;
    }

    ClaimBucket[] activeClaimsChart = [
        {range: "0-5K", count: bucketMap["0-5K"] ?: 0},
        {range: "5K-10K", count: bucketMap["5K-10K"] ?: 0},
        {range: "10K-15K", count: bucketMap["10K-15K"] ?: 0},
        {range: "15K-20K", count: bucketMap["15K-20K"] ?: 0},
        {range: "20K-25K", count: bucketMap["20K-25K"] ?: 0},
        {range: "25K-30K", count: bucketMap["25K-30K"] ?: 0},
        {range: "30K-35K", count: bucketMap["30K-35K"] ?: 0},
        {range: "35K-40K", count: bucketMap["35K-40K"] ?: 0}
    ];

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
