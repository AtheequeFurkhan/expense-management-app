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

# Query an aggregated claim amount for the given year and optional month.
#
# + year - Year used to filter the claim amount query
# + month - Optional month used to narrow the claim amount query
# + context - Error context included in failures
# + return - Aggregated claim amount if the query succeeds, otherwise an error
public function queryClaimAmount(int? year = (), int? month = (), string context = "claim amount") returns decimal|error {
    mysql:Client expenseDbClient = check getExpenseDbClient();
    AmountRow|error amountResult = expenseDbClient->queryRow(getClaimAmountQuery(year, month), AmountRow);
    if amountResult is error {
        return error(string `Failed to query ${context}: ${amountResult.message()}`);
    }

    return amountResult.total;
}

# Query the number of claims submitted during the given year.
#
# + year - Reporting year used to filter claims
# + return - Claim count for the given year if the query succeeds, otherwise an error
public function queryClaimCount(int year) returns int|error {
    mysql:Client expenseDbClient = check getExpenseDbClient();
    CountRow|error countResult = expenseDbClient->queryRow(getClaimCountQuery(year), CountRow);
    if countResult is error {
        return error(string `Failed to query claim count for year '${year}': ${countResult.message()}`);
    }

    return countResult.count;
}

# Query the number of claims submitted during the configured grace period.
#
# + year - Current reporting year used to evaluate the January grace window
# + gracePeriodDays - Number of days included in the grace period
# + return - Grace period claim count if the query succeeds, otherwise an error
public function queryGracePeriodClaimCount(int year, int gracePeriodDays) returns int|error {
    mysql:Client expenseDbClient = check getExpenseDbClient();
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
# + return - Normalized employee emails from OPD claims if the query succeeds, otherwise an error
public function queryAllClaimEmployeeEmails() returns string[]|error {
    mysql:Client expenseDbClient = check getExpenseDbClient();
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
# + year - Year used for the reporting range
# + monthRange - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + return - Per-employee totals if the query succeeds, otherwise an error
public function queryEmployeeTotals(int year, int monthRange, int months) returns EmployeeTotalRow[]|error {
    mysql:Client expenseDbClient = check getExpenseDbClient();
    stream<EmployeeTotalRow, sql:Error?> employeeTotalsStream =
        expenseDbClient->query(getEmployeeTotalsForRangeQuery(year, monthRange, months), EmployeeTotalRow);
    EmployeeTotalRow[]|error employeeTotalsResult = from EmployeeTotalRow row in employeeTotalsStream
        select row;
    if employeeTotalsResult is error {
        return error(
            string `Failed to query employee totals for year '${year}', month range '${monthRange}', months '${months}': ${employeeTotalsResult.message()}`
        );
    }

    return employeeTotalsResult;
}
