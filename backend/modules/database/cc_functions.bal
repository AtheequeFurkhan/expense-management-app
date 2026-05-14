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

# Query aggregated spend statistics from cc_txn for summary and trend calculations.
#
# + return - Spend stats row if the query succeeds, otherwise an error
public function queryCCSpendStats() returns CCSpendStatsRow|error {
    return check expenseDbClient->queryRow(getCCSpendStatsQuery(), CCSpendStatsRow);
}

# Query the count of active corporate cards.
#
# + return - Active card count row if the query succeeds, otherwise an error
public function queryCCActiveCount() returns CCActiveCountRow|error {
    return check expenseDbClient->queryRow(getCCActiveCountQuery(), CCActiveCountRow);
}

# Query the highest-spending corporate card.
#
# + return - Highest spend card row if the query succeeds, otherwise an error
public function queryCCHighestSpend() returns CCHighestSpendRow|error {
    return check expenseDbClient->queryRow(getCCHighestSpendQuery(), CCHighestSpendRow);
}

# Query spend and transaction count grouped by engagement category.
#
# + return - Card type rows if the query succeeds, otherwise an error
public function queryCCCardTypeAnalysis() returns CCCardTypeRow[]|error {
    stream<CCCardTypeRow, sql:Error?> resultStream =
        expenseDbClient->query(getCCCardTypeAnalysisQuery(), CCCardTypeRow);
    return check from CCCardTypeRow row in resultStream
        select row;
}

# Query the top-spending corporate cards.
#
# + topN - Number of top cards to return (default 5)
# + return - Top card rows if the query succeeds, otherwise an error
public function queryCCTopCards(int topN = 5) returns CCTopCardRow[]|error {
    stream<CCTopCardRow, sql:Error?> resultStream =
        expenseDbClient->query(getCCTopCardsQuery(topN), CCTopCardRow);
    return check from CCTopCardRow row in resultStream
        select row;
}

# Query the full list of corporate cards ordered by spend.
#
# + return - Card rows if the query succeeds, otherwise an error
public function queryCCCardList() returns CCCardRow[]|error {
    stream<CCCardRow, sql:Error?> resultStream =
        expenseDbClient->query(getCCCardListQuery(), CCCardRow);
    return check from CCCardRow row in resultStream
        select row;
}

# Query employees and their total CC spend for the given date range.
#
# + year - Ending year
# + month - Ending month
# + months - Window size in months (0 = all time)
# + return - Employee spending rows if the query succeeds, otherwise an error
public function queryCCCategoryEmployees(string category, int year, int month, int months)
        returns CCEmployeeSpendingRow[]|error {
    stream<CCEmployeeSpendingRow, sql:Error?> resultStream =
        expenseDbClient->query(getCCCategoryEmployeesQuery(category, year, month, months), CCEmployeeSpendingRow);
    return check from CCEmployeeSpendingRow row in resultStream
        select row;
}

public function queryCCEmployeeSpending(int year, int month, int months)
        returns CCEmployeeSpendingRow[]|error {
    stream<CCEmployeeSpendingRow, sql:Error?> resultStream =
        expenseDbClient->query(getCCEmployeeSpendingQuery(year, month, months), CCEmployeeSpendingRow);
    return check from CCEmployeeSpendingRow row in resultStream
        select row;
}

# Query an employee's CC spend broken down by engagement category.
#
# + email - Employee email to filter on
# + year - Ending year
# + month - Ending month
# + months - Window size in months (0 = all time)
# + return - Category rows if the query succeeds, otherwise an error
public function queryCCEmployeeCategoryBreakdown(string email, int year, int month, int months)
        returns CCEmployeeCategoryRow[]|error {
    stream<CCEmployeeCategoryRow, sql:Error?> resultStream =
        expenseDbClient->query(
            getCCEmployeeCategoryBreakdownQuery(email, year, month, months), CCEmployeeCategoryRow
        );
    return check from CCEmployeeCategoryRow row in resultStream
        select row;
}

# Query individual CC transactions for an employee within a derived engagement category.
#
# + email - Employee email to filter on
# + category - Derived category name (e.g. "Sales", "Infrastructure")
# + year - Ending year
# + month - Ending month
# + months - Window size in months (0 = all time)
# + return - Transaction rows if the query succeeds, otherwise an error
public function queryCCEmployeeCategoryTransactions(string email, string category,
        int year, int month, int months) returns CCEmployeeCategoryTransactionRow[]|error {
    stream<CCEmployeeCategoryTransactionRow, sql:Error?> resultStream =
        expenseDbClient->query(
            getCCEmployeeCategoryTransactionsQuery(email, category, year, month, months),
            CCEmployeeCategoryTransactionRow
        );
    return check from CCEmployeeCategoryTransactionRow row in resultStream
        select row;
}
