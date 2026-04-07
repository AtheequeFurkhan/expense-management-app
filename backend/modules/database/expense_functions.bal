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

# Query the total reimbursement amount for the given date range.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + businessUnit - Optional business unit filter
# + return - Total reimbursement amount if the query succeeds, otherwise an error
public function queryExpenseTotalAmount(int year, int month, int months,
        string? businessUnit = ()) returns decimal|error {
    ExpenseAmountRow result = check expenseDbClient->queryRow(
        getExpenseTotalAmountQuery(year, month, months, businessUnit), ExpenseAmountRow
    );
    return result.total;
}

# Query the total number of expense claims for the given date range.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + businessUnit - Optional business unit filter
# + return - Claim count if the query succeeds, otherwise an error
public function queryExpenseClaimCount(int year, int month, int months,
        string? businessUnit = ()) returns int|error {
    ExpenseCountRow result = check expenseDbClient->queryRow(
        getExpenseClaimCountQuery(year, month, months, businessUnit), ExpenseCountRow
    );
    return result.count;
}

# Query the average reimbursement amount for the given date range.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + businessUnit - Optional business unit filter
# + return - Average reimbursement amount if the query succeeds, otherwise an error
public function queryExpenseAvgAmount(int year, int month, int months,
        string? businessUnit = ()) returns decimal|error {
    ExpenseAvgRow result = check expenseDbClient->queryRow(
        getExpenseAvgAmountQuery(year, month, months, businessUnit), ExpenseAvgRow
    );
    return result.avg;
}

# Query the number of expense claims with a specific status.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + status - Claim status to count
# + businessUnit - Optional business unit filter
# + return - Claim count for the given status if the query succeeds, otherwise an error
public function queryExpenseCountByStatus(int year, int month, int months,
        string status, string? businessUnit = ()) returns int|error {
    ExpenseCountRow result = check expenseDbClient->queryRow(
        getExpenseCountByStatusQuery(year, month, months, status, businessUnit), ExpenseCountRow
    );
    return result.count;
}

# Query the number of expense claims matching any of the given status codes.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + statuses - Status codes to match
# + businessUnit - Optional business unit filter
# + return - Claim count if the query succeeds, otherwise an error
public function queryExpenseCountByStatuses(int year, int month, int months,
        string[] statuses, string? businessUnit = ()) returns int|error {
    ExpenseCountRow result = check expenseDbClient->queryRow(
        getExpenseCountByStatusesQuery(year, month, months, statuses, businessUnit), ExpenseCountRow
    );
    return result.count;
}

# Query expense amounts grouped by business unit for the given date range.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + return - Business unit expense rows if the query succeeds, otherwise an error
public function queryExpenseByBu(int year, int month, int months)
        returns BuExpenseRow[]|error {
    stream<BuExpenseRow, sql:Error?> resultStream =
        expenseDbClient->query(getExpenseByBuQuery(year, month, months), BuExpenseRow);
    return check from BuExpenseRow row in resultStream
        select row;
}

# Query claim counts grouped by status for the given date range.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + businessUnit - Optional business unit filter
# + return - Claim status rows if the query succeeds, otherwise an error
public function queryExpenseClaimsByStatus(int year, int month, int months,
        string? businessUnit = ()) returns ClaimStatusRow[]|error {
    stream<ClaimStatusRow, sql:Error?> resultStream =
        expenseDbClient->query(
            getExpenseClaimsByStatusQuery(year, month, months, businessUnit), ClaimStatusRow
        );
    return check from ClaimStatusRow row in resultStream
        select row;
}

# Query the top spending employees for the given date range.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + 'limit - Maximum number of results to return
# + businessUnit - Optional business unit filter
# + return - Top spending employee rows if the query succeeds, otherwise an error
public function queryTopSpendingEmployees(int year, int month, int months,
        int 'limit = 7, string? businessUnit = ()) returns TopSpendingEmployeeRow[]|error {
    stream<TopSpendingEmployeeRow, sql:Error?> resultStream =
        expenseDbClient->query(
            getTopSpendingEmployeesQuery(year, month, months, 'limit, businessUnit),
            TopSpendingEmployeeRow
        );
    return check from TopSpendingEmployeeRow row in resultStream
        select row;
}

# Query the top approving leads for the given date range.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + 'limit - Maximum number of results to return
# + businessUnit - Optional business unit filter
# + return - Top approving lead rows if the query succeeds, otherwise an error
public function queryTopApprovingLeads(int year, int month, int months,
        int 'limit = 7, string? businessUnit = ()) returns TopApprovingLeadRow[]|error {
    stream<TopApprovingLeadRow, sql:Error?> resultStream =
        expenseDbClient->query(
            getTopApprovingLeadsQuery(year, month, months, 'limit, businessUnit),
            TopApprovingLeadRow
        );
    return check from TopApprovingLeadRow row in resultStream
        select row;
}

# Query the top recurring expense types for the given date range.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + 'limit - Maximum number of results to return
# + businessUnit - Optional business unit filter
# + return - Recurring expense type rows if the query succeeds, otherwise an error
public function queryRecurringExpenseTypes(int year, int month, int months,
        int 'limit = 25, string? businessUnit = ()) returns RecurringExpenseTypeRow[]|error {
    stream<RecurringExpenseTypeRow, sql:Error?> resultStream =
        expenseDbClient->query(
            getRecurringExpenseTypesQuery(year, month, months, 'limit, businessUnit),
            RecurringExpenseTypeRow
        );
    return check from RecurringExpenseTypeRow row in resultStream
        select row;
}
