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

# Build the query for aggregated spend stats used to compute summary metrics and trends.
# CAST applied because txn_amount is DOUBLE in MySQL and Ballerina requires decimal.
#
# + return - Parameterized SQL query
isolated function getCCSpendStatsQuery() returns sql:ParameterizedQuery =>
    `SELECT
         CAST(COALESCE(SUM(CASE WHEN YEAR(t.txn_date) = YEAR(NOW())     THEN t.txn_amount ELSE 0 END), 0) AS DECIMAL(15,2)) AS currentYearSpend,
         CAST(COALESCE(SUM(CASE WHEN YEAR(t.txn_date) = YEAR(NOW()) - 1 THEN t.txn_amount ELSE 0 END), 0) AS DECIMAL(15,2)) AS prevYearSpend,
         CAST(COALESCE(AVG(CASE WHEN DATE_FORMAT(t.txn_date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
                                THEN t.txn_amount END), 0) AS DECIMAL(15,2)) AS currentMonthAvg,
         CAST(COALESCE(AVG(CASE WHEN DATE_FORMAT(t.txn_date, '%Y-%m') = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m')
                                THEN t.txn_amount END), 0) AS DECIMAL(15,2)) AS prevMonthAvg
     FROM cc_txn t`;

# Build the query for the count of active corporate cards.
#
# + return - Parameterized SQL query
isolated function getCCActiveCountQuery() returns sql:ParameterizedQuery =>
    `SELECT CAST(COUNT(*) AS SIGNED) AS activeCount FROM credit_card WHERE status = 'Active'`;

# Build the query for the highest-spending card (by sum of transactions).
#
# + return - Parameterized SQL query
isolated function getCCHighestSpendQuery() returns sql:ParameterizedQuery =>
    `SELECT
         c.employee_email AS holderName,
         CAST(COALESCE(SUM(t.txn_amount), 0) AS DECIMAL(15,2)) AS usedAmount
     FROM credit_card c
     LEFT JOIN cc_txn t ON c.cc_number = t.cc_number
     GROUP BY c.cc_number, c.employee_email
     ORDER BY usedAmount DESC
     LIMIT 1`;

# Build the query for spend and transaction count grouped by engagement code category.
# Groups known prefixes (SAL, MKT, CLO, CS, RND, INF, ADM) and labels the rest "Other".
#
# + return - Parameterized SQL query
isolated function getCCCardTypeAnalysisQuery() returns sql:ParameterizedQuery =>
    `SELECT
         CASE
             WHEN t.engagement_code LIKE 'SAL-%' THEN 'Sales'
             WHEN t.engagement_code LIKE 'MKT-%' THEN 'Marketing'
             WHEN t.engagement_code LIKE 'CLO-%' THEN 'Cloud Infrastructure'
             WHEN t.engagement_code LIKE 'CS-%'  THEN 'Customer Success'
             WHEN t.engagement_code LIKE 'RND-%' THEN 'R&D'
             WHEN t.engagement_code LIKE 'INF-%' THEN 'Infrastructure'
             WHEN t.engagement_code LIKE 'ADM-%' THEN 'Administration'
             ELSE 'Other'
         END AS cardType,
         CAST(COALESCE(SUM(t.txn_amount), 0) AS DECIMAL(15,2)) AS totalSpend,
         CAST(COUNT(*) AS SIGNED) AS txnCount
     FROM cc_txn t
     WHERE t.engagement_code IS NOT NULL
     GROUP BY cardType
     ORDER BY totalSpend DESC`;

# Build the query for the top-spending corporate cards (total spend per card).
#
# + limit - Maximum number of cards to return
# + return - Parameterized SQL query
isolated function getCCTopCardsQuery(int 'limit = 5) returns sql:ParameterizedQuery =>
    `SELECT
         c.cc_number       AS cardNumber,
         c.employee_email  AS holderName,
         CAST(COALESCE(SUM(t.txn_amount), 0) AS DECIMAL(15,2)) AS usedAmount,
         CAST(COUNT(t.id) AS SIGNED) AS txnCount
     FROM credit_card c
     LEFT JOIN cc_txn t ON c.cc_number = t.cc_number
     GROUP BY c.cc_number, c.employee_email
     ORDER BY usedAmount DESC
     LIMIT ${'limit}`;

# Build the query for the full corporate card list with total spend per card.
#
# + return - Parameterized SQL query
isolated function getCCCardListQuery() returns sql:ParameterizedQuery =>
    `SELECT
         CAST(c.id AS CHAR)  AS cardId,
         c.cc_number         AS cardNumber,
         c.employee_email    AS holderName,
         CAST(COALESCE(SUM(t.txn_amount), 0) AS DECIMAL(15,2)) AS usedAmount,
         c.cc_provider_code  AS cardType,
         c.status            AS status
     FROM credit_card c
     LEFT JOIN cc_txn t ON c.cc_number = t.cc_number
     GROUP BY c.id, c.cc_number, c.employee_email, c.cc_provider_code, c.status
     ORDER BY usedAmount DESC`;

# Build a date-range WHERE clause for cc_txn queries (alias t).
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + monthRange - Number of months included (0 = all time, no date filter)
# + return - Parameterized SQL fragment
isolated function getCCDateRangeClause(int year, int month, int monthRange) returns sql:ParameterizedQuery {
    if monthRange <= 0 {
        return `1=1`;
    }
    return `t.txn_date >= DATE_SUB(
            STR_TO_DATE(CONCAT(${year}, '-', LPAD(${month}, 2, '0'), '-01'), '%Y-%m-%d'),
            INTERVAL ${monthRange - 1} MONTH
        )
        AND t.txn_date < DATE_ADD(
            STR_TO_DATE(CONCAT(${year}, '-', LPAD(${month}, 2, '0'), '-01'), '%Y-%m-%d'),
            INTERVAL 1 MONTH
        )`;
}

# Append an engagement-code LIKE filter for a derived category name.
# The LIKE patterns are string literals (not user input) so they are safe to inline.
#
# + base - Base parameterized query to extend
# + category - Display category name (e.g. "Sales", "Infrastructure", "Other")
# + return - Query extended with the category filter
isolated function appendCCCategoryFilter(sql:ParameterizedQuery base, string category)
        returns sql:ParameterizedQuery {
    if category == "Sales" {
        return sql:queryConcat(base, ` AND t.engagement_code LIKE 'SAL-%'`);
    } else if category == "Marketing" {
        return sql:queryConcat(base, ` AND t.engagement_code LIKE 'MKT-%'`);
    } else if category == "Cloud Infrastructure" {
        return sql:queryConcat(base, ` AND t.engagement_code LIKE 'CLO-%'`);
    } else if category == "Customer Success" {
        return sql:queryConcat(base, ` AND t.engagement_code LIKE 'CS-%'`);
    } else if category == "R&D" {
        return sql:queryConcat(base, ` AND t.engagement_code LIKE 'RND-%'`);
    } else if category == "Infrastructure" {
        return sql:queryConcat(base, ` AND t.engagement_code LIKE 'INF-%'`);
    } else if category == "Administration" {
        return sql:queryConcat(base, ` AND t.engagement_code LIKE 'ADM-%'`);
    } else {
        return sql:queryConcat(base, ` AND (t.engagement_code IS NULL OR (
            t.engagement_code NOT LIKE 'SAL-%' AND t.engagement_code NOT LIKE 'MKT-%' AND
            t.engagement_code NOT LIKE 'CLO-%' AND t.engagement_code NOT LIKE 'CS-%'  AND
            t.engagement_code NOT LIKE 'RND-%' AND t.engagement_code NOT LIKE 'INF-%' AND
            t.engagement_code NOT LIKE 'ADM-%'))`);
    }
}

# Build the query for employee CC spending list ordered by total spend.
#
# + category - parameter description  
# + year - Ending year  
# + month - Ending month  
# + monthRange - Window size in months (0 = all time)
# + return - Parameterized SQL query
isolated function getCCCategoryEmployeesQuery(string category, int year, int month, int monthRange)
        returns sql:ParameterizedQuery {
    sql:ParameterizedQuery base = `
        SELECT
            t.employee_email AS employeeEmail,
            CAST(COALESCE(SUM(t.txn_amount), 0) AS DECIMAL(15,2)) AS totalAmount,
            CAST(COUNT(*) AS SIGNED) AS txnCount
        FROM cc_txn t
        WHERE t.employee_email IS NOT NULL
          AND `;
    sql:ParameterizedQuery dateClause = getCCDateRangeClause(year, month, monthRange);
    sql:ParameterizedQuery withDate = sql:queryConcat(base, dateClause);
    sql:ParameterizedQuery withCategory = appendCCCategoryFilter(withDate, category);
    return sql:queryConcat(withCategory, `
        GROUP BY t.employee_email
        ORDER BY totalAmount DESC`);
}

isolated function getCCEmployeeSpendingQuery(int year, int month, int monthRange) returns sql:ParameterizedQuery {
    sql:ParameterizedQuery base = `
        SELECT
            t.employee_email AS employeeEmail,
            CAST(COALESCE(SUM(t.txn_amount), 0) AS DECIMAL(15,2)) AS totalAmount,
            CAST(COUNT(*) AS SIGNED) AS txnCount
        FROM cc_txn t
        WHERE t.employee_email IS NOT NULL
          AND `;
    sql:ParameterizedQuery dateClause = getCCDateRangeClause(year, month, monthRange);
    return sql:queryConcat(sql:queryConcat(base, dateClause), `
        GROUP BY t.employee_email
        ORDER BY totalAmount DESC`);
}

# Build the query for an employee's CC spend breakdown by engagement category.
#
# + email - Employee email to filter on
# + year - Ending year
# + month - Ending month
# + monthRange - Window size in months (0 = all time)
# + return - Parameterized SQL query
isolated function getCCEmployeeCategoryBreakdownQuery(string email, int year, int month, int monthRange)
        returns sql:ParameterizedQuery {
    sql:ParameterizedQuery base = `
        SELECT
            CASE
                WHEN t.engagement_code LIKE 'SAL-%' THEN 'Sales'
                WHEN t.engagement_code LIKE 'MKT-%' THEN 'Marketing'
                WHEN t.engagement_code LIKE 'CLO-%' THEN 'Cloud Infrastructure'
                WHEN t.engagement_code LIKE 'CS-%'  THEN 'Customer Success'
                WHEN t.engagement_code LIKE 'RND-%' THEN 'R&D'
                WHEN t.engagement_code LIKE 'INF-%' THEN 'Infrastructure'
                WHEN t.engagement_code LIKE 'ADM-%' THEN 'Administration'
                ELSE 'Other'
            END AS category,
            CAST(COALESCE(SUM(t.txn_amount), 0) AS DECIMAL(15,2)) AS total,
            CAST(COUNT(*) AS SIGNED) AS txnCount
        FROM cc_txn t
        WHERE t.employee_email = ${email}
          AND `;
    sql:ParameterizedQuery dateClause = getCCDateRangeClause(year, month, monthRange);
    return sql:queryConcat(sql:queryConcat(base, dateClause), `
        GROUP BY category
        ORDER BY total DESC`);
}

# Build the query for individual CC transactions for an employee within a category.
#
# + email - Employee email to filter on
# + category - Derived engagement category name
# + year - Ending year
# + month - Ending month
# + monthRange - Window size in months (0 = all time)
# + return - Parameterized SQL query
isolated function getCCEmployeeCategoryTransactionsQuery(string email, string category,
        int year, int month, int monthRange) returns sql:ParameterizedQuery {
    sql:ParameterizedQuery base = `
        SELECT
            TRIM(COALESCE(SUBSTRING(t.txn_reference, 1, 120), t.txn_reference_number, 'Unknown')) AS description,
            DATE_FORMAT(t.txn_date, '%Y-%m-%d') AS txnDate,
            CAST(t.txn_amount AS DECIMAL(15,2)) AS amount,
            COALESCE(t.status, 'unknown') AS status
        FROM cc_txn t
        WHERE t.employee_email = ${email}
          AND `;
    sql:ParameterizedQuery dateClause = getCCDateRangeClause(year, month, monthRange);
    sql:ParameterizedQuery withDate = sql:queryConcat(base, dateClause);
    sql:ParameterizedQuery withCategory = appendCCCategoryFilter(withDate, category);
    return sql:queryConcat(withCategory, ` ORDER BY t.txn_date DESC`);
}
