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

isolated function getLastYearClaimAmountQuery(int year) returns sql:ParameterizedQuery => `
    SELECT COALESCE(SUM(CAST(t.txn_amount AS DECIMAL(10,2))), 0) AS total
    FROM opd_claim_transaction t
    INNER JOIN opd_claim c
        ON c.id = t.claim_id
    WHERE YEAR(c.added_date) = ${year - 1}
      AND c.status IN ('0', '2', '3')
`;

isolated function getCurrentMonthClaimAmountQuery(int year, int month) returns sql:ParameterizedQuery => `
    SELECT COALESCE(SUM(CAST(t.txn_amount AS DECIMAL(10,2))), 0) AS total
    FROM opd_claim_transaction t
    INNER JOIN opd_claim c
        ON c.id = t.claim_id
    WHERE YEAR(c.added_date) = ${year}
      AND MONTH(c.added_date) = ${month}
      AND c.status IN ('0', '2', '3')
`;

isolated function getPreviousYearClaimCountQuery(int year) returns sql:ParameterizedQuery => `
    SELECT COUNT(DISTINCT c.id) AS count
    FROM opd_claim c
    WHERE YEAR(c.added_date) = ${year - 1}
      AND c.status IN ('0', '2', '3')
`;

isolated function getTotalSriLankaEmployeesQuery() returns sql:ParameterizedQuery => `
    SELECT COUNT(*) AS count
    FROM hris_company
    WHERE employee_location = 'Sri Lanka'
      AND employee_status = 'Active'
      AND employee_work_email IS NOT NULL
      AND employee_work_email <> ''
`;

isolated function getSriLankaEmployeesWithClaimsForYearQuery(int year) returns sql:ParameterizedQuery => `
    SELECT COUNT(DISTINCT h.employee_work_email) AS count
    FROM hris_company h
    INNER JOIN opd_claim c
        ON h.employee_work_email = c.employee_email
    WHERE h.employee_location = 'Sri Lanka'
      AND h.employee_status = 'Active'
      AND YEAR(c.added_date) = ${year}
      AND c.status IN ('0', '2', '3')
`;

isolated function getEmployeeTotalsForYearQuery(int year) returns sql:ParameterizedQuery => `
    SELECT c.employee_email AS employeeEmail,
           COALESCE(SUM(CAST(t.txn_amount AS DECIMAL(10,2))), 0) AS totalAmount
    FROM opd_claim_transaction t
    INNER JOIN opd_claim c
        ON c.id = t.claim_id
    INNER JOIN hris_company h
        ON h.employee_work_email = c.employee_email
    WHERE h.employee_location = 'Sri Lanka'
      AND h.employee_status = 'Active'
      AND YEAR(c.added_date) = ${year}
      AND c.status IN ('0', '2', '3')
    GROUP BY c.employee_email
`;

isolated function getActiveClaimsBucketQuery(int year, int month) returns sql:ParameterizedQuery => `
    SELECT
        CASE
            WHEN t.txn_amount < 5000 THEN '0-5K'
            WHEN t.txn_amount < 10000 THEN '5K-10K'
            WHEN t.txn_amount < 15000 THEN '10K-15K'
            WHEN t.txn_amount < 20000 THEN '15K-20K'
            WHEN t.txn_amount < 25000 THEN '20K-25K'
            WHEN t.txn_amount < 30000 THEN '25K-30K'
            WHEN t.txn_amount < 35000 THEN '30K-35K'
            ELSE '35K-40K'
        END AS range,
        COUNT(*) AS count
    FROM opd_claim_transaction t
    INNER JOIN opd_claim c
        ON c.id = t.claim_id
    INNER JOIN hris_company h
        ON h.employee_work_email = c.employee_email
    WHERE h.employee_location = 'Sri Lanka'
      AND h.employee_status = 'Active'
      AND YEAR(c.added_date) = ${year}
      AND MONTH(c.added_date) = ${month}
      AND c.status IN ('0', '2', '3')
    GROUP BY range
`;
