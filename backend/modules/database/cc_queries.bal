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

// ─── Simple aggregate queries ─────────────────────────────────────────────────

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
# Date filter is applied on the JOIN so cards with no transactions in range still appear (with 0 spend).
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + monthRange - Number of months included (0 = all time, no date filter)
# + return - Parameterized SQL query
isolated function getCCCardListQuery(int year, int month, int monthRange) returns sql:ParameterizedQuery {
    sql:ParameterizedQuery joinDateClause = monthRange <= 0
        ? ``
        : sql:queryConcat(` AND `, getCCDateRangeClause(year, month, monthRange));
    return sql:queryConcat(
        `SELECT
             CAST(c.id AS CHAR)  AS cardId,
             c.cc_number         AS cardNumber,
             c.employee_email    AS holderName,
             CAST(COALESCE(SUM(t.txn_amount), 0) AS DECIMAL(15,2)) AS usedAmount,
             c.cc_provider_code  AS cardType,
             c.status            AS status
         FROM credit_card c
         LEFT JOIN cc_txn t ON c.cc_number = t.cc_number`,
        joinDateClause,
        ` GROUP BY c.id, c.cc_number, c.employee_email, c.cc_provider_code, c.status
         ORDER BY usedAmount DESC`
    );
}

// ─── Category classification ──────────────────────────────────────────────────

# Return the shared CASE expression that classifies a transaction into an expense type.
# Priority: engagement_code prefix first; merchant-name keyword fallback second.
# To add/remove a merchant keyword, update the relevant WHEN block below.
#
# + return - SQL CASE … END fragment (no trailing alias)
isolated function ccCategoryCase() returns sql:ParameterizedQuery => `
    CASE
        WHEN t.engagement_code LIKE 'SAL-%' THEN 'Sales'
        WHEN t.engagement_code LIKE 'MKT-%' THEN 'Marketing'
        WHEN t.engagement_code LIKE 'CLO-%' THEN 'Cloud Infrastructure'
        WHEN t.engagement_code LIKE 'CS-%'  THEN 'Customer Success'
        WHEN t.engagement_code LIKE 'RND-%' THEN 'R&D'
        WHEN t.engagement_code LIKE 'INF-%' THEN 'Infrastructure'
        WHEN t.engagement_code LIKE 'ADM-%' THEN 'Administration'
        WHEN UPPER(t.txn_reference) LIKE '%AMAZON WEB SERVICE%'
          OR UPPER(t.txn_reference) LIKE '%AWS.AMAZON%'
          OR UPPER(t.txn_reference) LIKE '%CLOUDFLARE%'
          OR UPPER(t.txn_reference) LIKE '%RACKSPACE%'
          OR UPPER(t.txn_reference) LIKE '%DIGITALOCEAN%'
          OR UPPER(t.txn_reference) LIKE '%VULTR%'
          OR UPPER(t.txn_reference) LIKE '%AIVEN%'
          OR UPPER(t.txn_reference) LIKE '%GOOGLE CLOUD%'
             THEN 'Cloud Services'
        WHEN UPPER(t.txn_reference) LIKE '%GITHUB%'
          OR UPPER(t.txn_reference) LIKE '%ADOBE%'
          OR UPPER(t.txn_reference) LIKE '%SALESFORCE%'
          OR UPPER(t.txn_reference) LIKE '%ATLASSIAN%'
          OR UPPER(t.txn_reference) LIKE '%FIGMA%'
          OR UPPER(t.txn_reference) LIKE '%ASANA%'
          OR UPPER(t.txn_reference) LIKE '%DOCUSIG%'
          OR UPPER(t.txn_reference) LIKE '%TABLEAU%'
          OR UPPER(t.txn_reference) LIKE '%BITWARDEN%'
          OR UPPER(t.txn_reference) LIKE '%MONGODB%'
          OR UPPER(t.txn_reference) LIKE '%PAGERDUTY%'
          OR UPPER(t.txn_reference) LIKE '%PAGER DUTY%'
          OR UPPER(t.txn_reference) LIKE '%DOCKER%'
          OR UPPER(t.txn_reference) LIKE '%WISTIA%'
          OR UPPER(t.txn_reference) LIKE '%INTERCOM%'
          OR UPPER(t.txn_reference) LIKE '%ALGOLIA%'
          OR UPPER(t.txn_reference) LIKE '%DISCORD%'
          OR UPPER(t.txn_reference) LIKE '%LUCIDCHART%'
          OR UPPER(t.txn_reference) LIKE '%HOTJAR%'
          OR UPPER(t.txn_reference) LIKE '%SOLARWINDS%'
          OR UPPER(t.txn_reference) LIKE '%MICROSOFT%'
          OR UPPER(t.txn_reference) LIKE '%SLACK%'
          OR UPPER(t.txn_reference) LIKE '%ZOOM%'
          OR UPPER(t.txn_reference) LIKE '%THINKIFIC%'
          OR UPPER(t.txn_reference) LIKE '%SPARKTORO%'
          OR UPPER(t.txn_reference) LIKE '%HUBSPOT%'
          OR UPPER(t.txn_reference) LIKE '%NOTION%'
          OR UPPER(t.txn_reference) LIKE '%DROPBOX%'
          OR UPPER(t.txn_reference) LIKE '%PINGDOM%'
          OR UPPER(t.txn_reference) LIKE '%SPROUT SOCIAL%'
          OR UPPER(t.txn_reference) LIKE '%MUCKRACK%'
          OR UPPER(t.txn_reference) LIKE '%DEMANDBASE%'
             THEN 'Software & SaaS'
        WHEN UPPER(t.txn_reference) LIKE '%TWILIO%'
          OR UPPER(t.txn_reference) LIKE '%ATT BILL%'
          OR UPPER(t.txn_reference) LIKE '%AT&T%'
          OR UPPER(t.txn_reference) LIKE '%RINGCENTRAL%'
          OR UPPER(t.txn_reference) LIKE '%VONAGE%'
             THEN 'Communication'
        WHEN UPPER(t.txn_reference) LIKE '%HOTEL%'
          OR UPPER(t.txn_reference) LIKE '%AIRBNB%'
          OR UPPER(t.txn_reference) LIKE '%BOOKING.COM%'
          OR UPPER(t.txn_reference) LIKE '%AGODA%'
          OR UPPER(t.txn_reference) LIKE '%MARRIOTT%'
          OR UPPER(t.txn_reference) LIKE '%HILTON%'
          OR UPPER(t.txn_reference) LIKE '%SHERATON%'
          OR UPPER(t.txn_reference) LIKE '%HYATT%'
          OR UPPER(t.txn_reference) LIKE '%IHG%'
          OR UPPER(t.txn_reference) LIKE '%ACCOR%'
          OR UPPER(t.txn_reference) LIKE '%HOSTEL%'
             THEN 'Accommodation'
        WHEN UPPER(t.txn_reference) LIKE '%UBER%'
          OR UPPER(t.txn_reference) LIKE '%LYFT%'
          OR UPPER(t.txn_reference) LIKE '%TAXICAB%'
          OR UPPER(t.txn_reference) LIKE '%LIMOUSINE%'
          OR UPPER(t.txn_reference) LIKE '%TAXI%'
          OR UPPER(t.txn_reference) LIKE '%EXPEDIA%'
          OR UPPER(t.txn_reference) LIKE '%EMIRATES%'
          OR UPPER(t.txn_reference) LIKE '%UNITED AIR%'
          OR UPPER(t.txn_reference) LIKE '%DELTA AIR%'
          OR UPPER(t.txn_reference) LIKE '%LUFTHANSA%'
          OR UPPER(t.txn_reference) LIKE '%SINGAPORE AIR%'
          OR UPPER(t.txn_reference) LIKE '%MAKEMYTRIP%'
          OR UPPER(t.txn_reference) LIKE '%GOIBIBO%'
          OR UPPER(t.txn_reference) LIKE '%AIR TICKET%'
          OR UPPER(t.txn_reference) LIKE '%AIRLINE%'
          OR UPPER(t.txn_reference) LIKE '%TRAVEL INS%'
          OR UPPER(t.txn_reference) LIKE '%OLA CABS%'
          OR UPPER(t.txn_reference) LIKE '%GRAB%'
          OR UPPER(t.txn_reference) LIKE '%GOJEK%'
             THEN 'Travel'
        ELSE 'Other'
    END`;

# Build the query for spend and transaction count grouped by engagement code category.
#
# + return - Parameterized SQL query
isolated function getCCCardTypeAnalysisQuery() returns sql:ParameterizedQuery =>
    sql:queryConcat(
        `SELECT `,
        ccCategoryCase(),
        ` AS cardType,
         CAST(COALESCE(SUM(t.txn_amount), 0) AS DECIMAL(15,2)) AS totalSpend,
         CAST(COUNT(*) AS SIGNED) AS txnCount
     FROM cc_txn t
     GROUP BY cardType
     ORDER BY totalSpend DESC`
    );

# Append a WHERE condition restricting results to a single expense-type category.
# Uses the shared CASE expression so classification logic lives in exactly one place.
#
# + base - Base parameterized query to extend
# + category - Display category name (e.g. "Sales", "Cloud Services", "Other")
# + return - Query extended with the category filter
isolated function appendCCCategoryFilter(sql:ParameterizedQuery base, string category)
        returns sql:ParameterizedQuery =>
    sql:queryConcat(base, ` AND `, ccCategoryCase(), ` = ${category}`);

// ─── Date range helper ────────────────────────────────────────────────────────

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

// ─── Per-employee queries ─────────────────────────────────────────────────────

# Build the query for employee CC spending list ordered by total spend.
#
# + category - Expense type category name
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
    sql:ParameterizedQuery withDate = sql:queryConcat(base, getCCDateRangeClause(year, month, monthRange));
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
    return sql:queryConcat(base, getCCDateRangeClause(year, month, monthRange), `
        GROUP BY t.employee_email
        ORDER BY totalAmount DESC`);
}

# Build the query for an employee's CC spend breakdown by expense type category.
#
# + email - Employee email to filter on
# + year - Ending year
# + month - Ending month
# + monthRange - Window size in months (0 = all time)
# + return - Parameterized SQL query
isolated function getCCEmployeeCategoryBreakdownQuery(string email, int year, int month, int monthRange)
        returns sql:ParameterizedQuery =>
    sql:queryConcat(
        `SELECT `,
        ccCategoryCase(),
        ` AS category,
            CAST(COALESCE(SUM(t.txn_amount), 0) AS DECIMAL(15,2)) AS total,
            CAST(COUNT(*) AS SIGNED) AS txnCount
        FROM cc_txn t
        WHERE t.employee_email = ${email}
          AND `,
        getCCDateRangeClause(year, month, monthRange),
        ` GROUP BY category ORDER BY total DESC`
    );

# Build the query for individual CC transactions for an employee within a category.
#
# + email - Employee email to filter on
# + category - Expense type category name
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
    sql:ParameterizedQuery withDate = sql:queryConcat(base, getCCDateRangeClause(year, month, monthRange));
    sql:ParameterizedQuery withCategory = appendCCCategoryFilter(withDate, category);
    return sql:queryConcat(withCategory, ` ORDER BY t.txn_date DESC`);
}
