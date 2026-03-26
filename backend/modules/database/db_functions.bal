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

import expense_management.entity;

import ballerina/sql;
import ballerinax/mysql;

public function getOpdClaimSummary(int year, int month, int months = 1)
        returns OpdClaimSummaryResponse|error {
    if month < 1 || month > 12 {
        return error(string `Invalid month '${month}'. Expected a value between 1 and 12.`);
    }
    if months <= 0 {
        return error(string `Invalid months '${months}'. Expected a value greater than 0.`);
    }

    mysql:Client expenseDbClient = check getExpenseDbClient();

    AmountRow lastYearAmount = check expenseDbClient->queryRow(getLastYearClaimAmountQuery(year), AmountRow);
    AmountRow currentMonthAmount = check expenseDbClient->queryRow(getCurrentMonthClaimAmountQuery(year, month), AmountRow);
    CountRow previousYearCount = check expenseDbClient->queryRow(getPreviousYearClaimCountQuery(year), CountRow);

    string[] activeEmployeeEmails = check entity:fetchActiveSriLankaEmployeeEmails();
    int totalEmployees = activeEmployeeEmails.length();

    stream<EmployeeEmailRow, sql:Error?> claimEmployeesStream =
        expenseDbClient->query(getClaimEmployeeEmailsForRangeQuery(year, month, months), EmployeeEmailRow);
    EmployeeEmailRow[] claimEmployeeRows = check from EmployeeEmailRow row in claimEmployeesStream
        select row;

    map<boolean> employeesWithClaimsSet = {};
    foreach EmployeeEmailRow row in claimEmployeeRows {
        string normalizedEmail = row.employeeEmail.toLowerAscii();
        employeesWithClaimsSet[normalizedEmail] = true;
    }

    stream<EmployeeTotalRow, sql:Error?> employeeTotalsStream =
        expenseDbClient->query(getEmployeeTotalsForRangeQuery(year, month, months), EmployeeTotalRow);
    EmployeeTotalRow[] employeeTotals = check from EmployeeTotalRow row in employeeTotalsStream
        select row;

    int fullyClaimedEmployees = 0;
    foreach EmployeeTotalRow row in employeeTotals {
        if row.totalAmount >= getAnnualClaimLimit() {
            fullyClaimedEmployees += 1;
        }
    }

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

    foreach EmployeeTotalRow row in employeeTotals {
        string bucket = "35K-40K";
        if row.totalAmount < 5000.0d {
            bucket = "0-5K";
        } else if row.totalAmount < 10000.0d {
            bucket = "5K-10K";
        } else if row.totalAmount < 15000.0d {
            bucket = "10K-15K";
        } else if row.totalAmount < 20000.0d {
            bucket = "15K-20K";
        } else if row.totalAmount < 25000.0d {
            bucket = "20K-25K";
        } else if row.totalAmount < 30000.0d {
            bucket = "25K-30K";
        } else if row.totalAmount < 35000.0d {
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
