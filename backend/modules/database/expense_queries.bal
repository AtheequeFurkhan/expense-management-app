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

# Build the date-range WHERE clause fragment used by all expense claim queries.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + return - Parameterized SQL fragment for the date range filter
isolated function getExpenseDateRangeClause(int year, int month, int months)
    returns sql:ParameterizedQuery {
    // months=0 means "All Time" — skip date filtering
    if months <= 0 {
        return `1=1`;
    }
    return `ec.txn_date >= DATE_SUB(
            STR_TO_DATE(CONCAT(${year}, '-', LPAD(${month}, 2, '0'), '-01'), '%Y-%m-%d'),
            INTERVAL ${months - 1} MONTH
        )
        AND ec.txn_date < DATE_ADD(
            STR_TO_DATE(CONCAT(${year}, '-', LPAD(${month}, 2, '0'), '-01'), '%Y-%m-%d'),
            INTERVAL 1 MONTH
        )`;
}

# Build the query for total reimbursement amount within a date range.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + businessUnit - Optional business unit filter
# + return - Parameterized SQL query
isolated function getExpenseTotalAmountQuery(int year, int month, int months,
        string? businessUnit = ()) returns sql:ParameterizedQuery {

    sql:ParameterizedQuery baseQuery = `
        SELECT COALESCE(SUM(CAST(ec.reimbursement_amount AS DECIMAL(10,2))), 0) AS total
        FROM expense_claims ec
        WHERE `;

    sql:ParameterizedQuery dateClause = getExpenseDateRangeClause(year, month, months);
    sql:ParameterizedQuery query = sql:queryConcat(baseQuery, dateClause);

    if businessUnit is string {
        query = sql:queryConcat(query, ` AND ec.business_unit = ${businessUnit}`);
    }

    return query;
}

# Build the query for total claim count within a date range.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + businessUnit - Optional business unit filter
# + return - Parameterized SQL query
isolated function getExpenseClaimCountQuery(int year, int month, int months,
        string? businessUnit = ()) returns sql:ParameterizedQuery {

    sql:ParameterizedQuery baseQuery = `
        SELECT COUNT(*) AS count
        FROM expense_claims ec
        WHERE `;

    sql:ParameterizedQuery dateClause = getExpenseDateRangeClause(year, month, months);
    sql:ParameterizedQuery query = sql:queryConcat(baseQuery, dateClause);

    if businessUnit is string {
        query = sql:queryConcat(query, ` AND ec.business_unit = ${businessUnit}`);
    }

    return query;
}

# Build the query for average reimbursement amount within a date range.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + businessUnit - Optional business unit filter
# + return - Parameterized SQL query
isolated function getExpenseAvgAmountQuery(int year, int month, int months,
        string? businessUnit = ()) returns sql:ParameterizedQuery {

    sql:ParameterizedQuery baseQuery = `
        SELECT COALESCE(AVG(CAST(ec.reimbursement_amount AS DECIMAL(10,2))), 0) AS avg
        FROM expense_claims ec
        WHERE `;

    sql:ParameterizedQuery dateClause = getExpenseDateRangeClause(year, month, months);
    sql:ParameterizedQuery query = sql:queryConcat(baseQuery, dateClause);

    if businessUnit is string {
        query = sql:queryConcat(query, ` AND ec.business_unit = ${businessUnit}`);
    }

    return query;
}

# Build the query for claim count filtered by a specific status.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + status - Status value to filter on
# + businessUnit - Optional business unit filter
# + return - Parameterized SQL query
isolated function getExpenseCountByStatusQuery(int year, int month, int months,
        string status, string? businessUnit = ()) returns sql:ParameterizedQuery {

    sql:ParameterizedQuery baseQuery = `
        SELECT COUNT(*) AS count
        FROM expense_claims ec
        WHERE `;

    sql:ParameterizedQuery dateClause = getExpenseDateRangeClause(year, month, months);
    sql:ParameterizedQuery query = sql:queryConcat(baseQuery, dateClause);
    query = sql:queryConcat(query, ` AND ec.status = ${status}`);

    if businessUnit is string {
        query = sql:queryConcat(query, ` AND ec.business_unit = ${businessUnit}`);
    }

    return query;
}

# Build the query for expense amounts grouped by business unit.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + return - Parameterized SQL query
isolated function getExpenseByBuQuery(int year, int month, int months)
    returns sql:ParameterizedQuery {

    sql:ParameterizedQuery baseQuery = `
        SELECT COALESCE(ec.business_unit, 'Unknown') AS businessUnit,
               COALESCE(SUM(CAST(ec.reimbursement_amount AS DECIMAL(10,2))), 0) AS total
        FROM expense_claims ec
        WHERE `;

    sql:ParameterizedQuery dateClause = getExpenseDateRangeClause(year, month, months);

    return sql:queryConcat(
        sql:queryConcat(baseQuery, dateClause),
        ` AND ec.business_unit IS NOT NULL
          AND ec.business_unit <> ''
          GROUP BY ec.business_unit
          ORDER BY total DESC`
    );
}

# Build the query for claim count matching any of the given status codes.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + statuses - One or more status codes to match
# + businessUnit - Optional business unit filter
# + return - Parameterized SQL query
isolated function getExpenseCountByStatusesQuery(int year, int month, int months,
        string[] statuses, string? businessUnit = ()) returns sql:ParameterizedQuery {

    sql:ParameterizedQuery baseQuery = `
        SELECT COUNT(*) AS count
        FROM expense_claims ec
        WHERE `;

    sql:ParameterizedQuery dateClause = getExpenseDateRangeClause(year, month, months);
    sql:ParameterizedQuery query = sql:queryConcat(baseQuery, dateClause);

    // Build IN clause: AND ec.status IN (val1, val2, ...)
    query = sql:queryConcat(query, ` AND ec.status IN (`);
    foreach int i in 0 ..< statuses.length() {
        if i > 0 {
            query = sql:queryConcat(query, `, `);
        }
        query = sql:queryConcat(query, `${statuses[i]}`);
    }
    query = sql:queryConcat(query, `)`);

    if businessUnit is string {
        query = sql:queryConcat(query, ` AND ec.business_unit = ${businessUnit}`);
    }

    return query;
}

# Build the query for claim counts grouped by status with readable labels.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + businessUnit - Optional business unit filter
# + return - Parameterized SQL query
isolated function getExpenseClaimsByStatusQuery(int year, int month, int months,
        string? businessUnit = ()) returns sql:ParameterizedQuery {

    sql:ParameterizedQuery baseQuery = `
        SELECT CASE ec.status
                 WHEN '-1' THEN 'Rejected'
                 WHEN '0' THEN 'Draft'
                 WHEN '1' THEN 'Submitted'
                 WHEN '2' THEN 'Lead Approved'
                 WHEN '3' THEN 'Finance Approved'
                 ELSE CONCAT('Status ', ec.status)
               END AS status,
               COUNT(*) AS count
        FROM expense_claims ec
        WHERE `;

    sql:ParameterizedQuery dateClause = getExpenseDateRangeClause(year, month, months);
    sql:ParameterizedQuery query = sql:queryConcat(baseQuery, dateClause);

    if businessUnit is string {
        query = sql:queryConcat(query, ` AND ec.business_unit = ${businessUnit}`);
    }

    return sql:queryConcat(query,
        ` AND ec.status IS NOT NULL
          AND ec.status <> ''
          GROUP BY ec.status
          ORDER BY count DESC`
    );
}

# Build the query for lead-approved claim frequency grouped by month.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + businessUnit - Optional business unit filter
# + return - Parameterized SQL query
isolated function getLeadApprovalFrequencyQuery(int year, int month, int months,
        string? businessUnit = ()) returns sql:ParameterizedQuery {

    sql:ParameterizedQuery baseQuery = `
        SELECT DATE_FORMAT(ec.txn_date, '%b %Y') AS label,
               YEAR(ec.txn_date) AS year,
               MONTH(ec.txn_date) AS month,
               COUNT(*) AS count
        FROM expense_claims ec
        WHERE `;

    sql:ParameterizedQuery dateClause = getExpenseDateRangeClause(year, month, months);
    sql:ParameterizedQuery query = sql:queryConcat(baseQuery, dateClause);
    query = sql:queryConcat(query, ` AND ec.status = '2'`);

    if businessUnit is string {
        query = sql:queryConcat(query, ` AND ec.business_unit = ${businessUnit}`);
    }

    return sql:queryConcat(query,
        ` GROUP BY DATE_FORMAT(ec.txn_date, '%b %Y'), YEAR(ec.txn_date), MONTH(ec.txn_date)
          ORDER BY YEAR(ec.txn_date), MONTH(ec.txn_date)`
    );
}

# Build the query for top spending employees by reimbursement amount.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + 'limit - Maximum number of results to return
# + businessUnit - Optional business unit filter
# + return - Parameterized SQL query
isolated function getTopSpendingEmployeesQuery(int year, int month, int months,
        int 'limit = 7, string? businessUnit = ()) returns sql:ParameterizedQuery {

    sql:ParameterizedQuery baseQuery = `
        SELECT ec.employee_email AS employeeEmail,
               COALESCE(ec.business_unit, '') AS businessUnit,
               COALESCE(SUM(CAST(ec.reimbursement_amount AS DECIMAL(10,2))), 0) AS total
        FROM expense_claims ec
        WHERE `;

    sql:ParameterizedQuery dateClause = getExpenseDateRangeClause(year, month, months);
    sql:ParameterizedQuery query = sql:queryConcat(baseQuery, dateClause);

    if businessUnit is string {
        query = sql:queryConcat(query, ` AND ec.business_unit = ${businessUnit}`);
    }

    return sql:queryConcat(query,
        ` AND ec.employee_email IS NOT NULL
          AND ec.employee_email <> ''
          GROUP BY ec.employee_email, ec.business_unit
          ORDER BY total DESC
          LIMIT ${'limit}`
    );
}

# Build the query for top approving leads by number of approved claims.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + 'limit - Maximum number of results to return
# + businessUnit - Optional business unit filter
# + return - Parameterized SQL query
isolated function getTopApprovingLeadsQuery(int year, int month, int months,
        int 'limit = 7, string? businessUnit = ()) returns sql:ParameterizedQuery {

    sql:ParameterizedQuery baseQuery = `
        SELECT ec.lead_email AS leadEmail,
               COALESCE(ec.business_unit, '') AS businessUnit,
               COUNT(*) AS count
        FROM expense_claims ec
        WHERE `;

    sql:ParameterizedQuery dateClause = getExpenseDateRangeClause(year, month, months);
    sql:ParameterizedQuery query = sql:queryConcat(baseQuery, dateClause);
    query = sql:queryConcat(query, ` AND ec.lead_approved_date IS NOT NULL`);

    if businessUnit is string {
        query = sql:queryConcat(query, ` AND ec.business_unit = ${businessUnit}`);
    }

    return sql:queryConcat(query,
        ` AND ec.lead_email IS NOT NULL
          AND ec.lead_email <> ''
          GROUP BY ec.lead_email, ec.business_unit
          ORDER BY count DESC
          LIMIT ${'limit}`
    );
}

# Build the query for top recurring expense types by total amount.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + 'limit - Maximum number of results to return
# + businessUnit - Optional business unit filter
# + return - Parameterized SQL query
isolated function getRecurringExpenseTypesQuery(int year, int month, int months,
        int 'limit = 25, string? businessUnit = ()) returns sql:ParameterizedQuery {

    sql:ParameterizedQuery baseQuery = `
        SELECT et.expense_type AS expenseType,
               COALESCE(SUM(CAST(ec.reimbursement_amount AS DECIMAL(10,2))), 0) AS total
        FROM expense_claims ec
        INNER JOIN expense_type et
            ON et.id = ec.expense_type_id
        WHERE `;

    sql:ParameterizedQuery dateClause = getExpenseDateRangeClause(year, month, months);
    sql:ParameterizedQuery query = sql:queryConcat(baseQuery, dateClause);

    if businessUnit is string {
        query = sql:queryConcat(query, ` AND ec.business_unit = ${businessUnit}`);
    }

    return sql:queryConcat(query,
        ` AND ec.expense_type_id IS NOT NULL
          GROUP BY et.expense_type
          ORDER BY total DESC
          LIMIT ${'limit}`
    );
}
