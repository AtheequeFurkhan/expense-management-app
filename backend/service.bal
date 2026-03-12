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
// specific language govern
import expense_management.entity;

import ballerina/http;
import ballerina/lang.'int as ints;
import ballerina/log;

service /api on new http:Listener(8080) {

    resource function get health() returns json {
        return {
            status: "ok",
            'service: "expense-management-backend"
        };
    }

    resource function get opdClaimSummary(int year = 2025, int month = 3)
            returns entity:OpdClaimSummaryResponse|entity:HttpInternalServerError {
        do {
            entity:HREmployee[] employees = check entity:getActiveEmployees();
            entity:OpdClaim[] claims = check entity:searchOpdClaims(year - 1, year);

            return buildOpdClaimSummary(claims, employees, year, month);
        } on fail error err {
            log:printError("Failed to build OPD claim summary.", err);
            return {
                body: {
                    message: err.message()
                }
            };
        }
    }
}

function buildOpdClaimSummary(entity:OpdClaim[] claims, entity:HREmployee[] employees, int year, int month)
        returns entity:OpdClaimSummaryResponse {
    decimal lastYearClaimAmount = 0.0d;
    decimal currentMonthClaimAmount = 0.0d;
    int previousYearClaimCount = 0;
    int gracePeriodClaims = 0;

    map<boolean> employeeHasClaim = {};
    map<decimal> employeeClaimTotals = {};

    map<int> buckets = {
        "0-5K": 0,
        "5K-10K": 0,
        "10K-15K": 0,
        "15K-20K": 0,
        "20K-25K": 0,
        "25K-30K": 0,
        "30K-35K": 0,
        "35K-40K": 0
    };

    foreach entity:OpdClaim claim in claims {
        if claim.employeeEmail != "" {
            employeeHasClaim[claim.employeeEmail] = true;

            decimal previousTotal = employeeClaimTotals[claim.employeeEmail] ?: 0.0d;
            employeeClaimTotals[claim.employeeEmail] = previousTotal + claim.amount;
        }

        int? claimYear = extractYear(claim.createdDate);
        int? claimMonth = extractMonth(claim.createdDate);

        if claimYear is int && claimYear == year - 1 {
            lastYearClaimAmount += claim.amount;
            previousYearClaimCount += 1;
        }

        if claimYear is int && claimYear == year && claimMonth is int && claimMonth == month {
            currentMonthClaimAmount += claim.amount;
            incrementBucket(buckets, claim.amount);
        }

        if claim.isGracePeriod {
            gracePeriodClaims += 1;
        }
    }

    int unclaimedEmployees = 0;
    foreach entity:HREmployee employee in employees {
        if !employeeHasClaim.hasKey(employee.email) {
            unclaimedEmployees += 1;
        }
    }

    int fullyClaimedEmployees = 0;
    foreach string email in employeeClaimTotals.keys() {
        decimal total = employeeClaimTotals[email] ?: 0.0d;
        if total >= entity:getAnnualClaimLimit() {
            fullyClaimedEmployees += 1;
        }
    }

    entity:ClaimBucket[] activeClaimsChart = [
        {range: "0-5K", count: buckets["0-5K"] ?: 0},
        {range: "5K-10K", count: buckets["5K-10K"] ?: 0},
        {range: "10K-15K", count: buckets["10K-15K"] ?: 0},
        {range: "15K-20K", count: buckets["15K-20K"] ?: 0},
        {range: "20K-25K", count: buckets["20K-25K"] ?: 0},
        {range: "25K-30K", count: buckets["25K-30K"] ?: 0},
        {range: "30K-35K", count: buckets["30K-35K"] ?: 0},
        {range: "35K-40K", count: buckets["35K-40K"] ?: 0}
    ];

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

function incrementBucket(map<int> buckets, decimal amount) {
    if amount < 5000.0d {
        buckets["0-5K"] = (buckets["0-5K"] ?: 0) + 1;
    } else if amount < 10000.0d {
        buckets["5K-10K"] = (buckets["5K-10K"] ?: 0) + 1;
    } else if amount < 15000.0d {
        buckets["10K-15K"] = (buckets["10K-15K"] ?: 0) + 1;
    } else if amount < 20000.0d {
        buckets["15K-20K"] = (buckets["15K-20K"] ?: 0) + 1;
    } else if amount < 25000.0d {
        buckets["20K-25K"] = (buckets["20K-25K"] ?: 0) + 1;
    } else if amount < 30000.0d {
        buckets["25K-30K"] = (buckets["25K-30K"] ?: 0) + 1;
    } else if amount < 35000.0d {
        buckets["30K-35K"] = (buckets["30K-35K"] ?: 0) + 1;
    } else if amount < 40000.0d {
        buckets["35K-40K"] = (buckets["35K-40K"] ?: 0) + 1;
    }
}

function extractYear(string dateValue) returns int? {
    if dateValue.length() < 4 {
        return ();
    }

    string yearString = dateValue.substring(0, 4);
    int|error parsed = ints:fromString(yearString);
    if parsed is int {
        return parsed;
    }

    return ();
}

function extractMonth(string dateValue) returns int? {
    if dateValue.length() < 7 {
        return ();
    }

    string monthString = dateValue.substring(5, 7);
    int|error parsed = ints:fromString(monthString);
    if parsed is int {
        return parsed;
    }

    return ();
}

