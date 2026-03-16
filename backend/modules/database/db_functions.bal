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

public isolated function getOpdClaimSummary(int year, int month) returns OpdClaimSummaryResponse|error {
    AmountRow lastYearAmount = check databaseClient->queryRow(getLastYearClaimAmountQuery(year), AmountRow);
    AmountRow currentMonthAmount = check databaseClient->queryRow(getCurrentMonthClaimAmountQuery(year, month), AmountRow);
    CountRow previousYearCount = check databaseClient->queryRow(getPreviousYearClaimCountQuery(year), CountRow);
    CountRow totalEmployees = check databaseClient->queryRow(getTotalSriLankaEmployeesQuery(), CountRow);
    CountRow employeesWithClaims = check databaseClient->queryRow(getSriLankaEmployeesWithClaimsForYearQuery(year), CountRow);

    stream<EmployeeTotalRow, sql:Error?> employeeTotalsStream =
        databaseClient->query(getEmployeeTotalsForYearQuery(year), EmployeeTotalRow);
    EmployeeTotalRow[] employeeTotals = check from EmployeeTotalRow row in employeeTotalsStream
        select row;

    int fullyClaimedEmployees = 0;
    foreach EmployeeTotalRow row in employeeTotals {
        if row.totalAmount >= getAnnualClaimLimit() {
            fullyClaimedEmployees += 1;
        }
    }

    stream<BucketRow, sql:Error?> bucketStream =
        databaseClient->query(getActiveClaimsBucketQuery(year, month), BucketRow);
    BucketRow[] rawBuckets = check from BucketRow row in bucketStream
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

    foreach BucketRow row in rawBuckets {
        if bucketMap.hasKey(row.range) {
            bucketMap[row.range] = row.count;
        }
    }

    int unclaimedEmployees = totalEmployees.count - employeesWithClaims.count;
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
