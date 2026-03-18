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
    WHERE YEAR(c.added_date) = ${year}
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

isolated function getActiveSriLankaEmployeeEmailsQuery() returns sql:ParameterizedQuery => `
    SELECT employee_work_email AS employeeEmail
    FROM hris_employee
    WHERE employee_location = 'Sri Lanka'
      AND employee_status = 'Active'
      AND employee_work_email IS NOT NULL
      AND employee_work_email <> ''
`;

isolated function getClaimEmployeeEmailsForYearQuery(int year) returns sql:ParameterizedQuery => `
    SELECT DISTINCT employee_email AS employeeEmail
    FROM opd_claim
    WHERE YEAR(added_date) = ${year}
      AND status IN ('0', '2', '3')
      AND employee_email IS NOT NULL
      AND employee_email <> ''
`;

isolated function getEmployeeTotalsForYearQuery(int year) returns sql:ParameterizedQuery => `
    SELECT c.employee_email AS employeeEmail,
           COALESCE(SUM(CAST(t.txn_amount AS DECIMAL(10,2))), 0) AS totalAmount
    FROM opd_claim_transaction t
    INNER JOIN opd_claim c
        ON c.id = t.claim_id
    WHERE YEAR(c.added_date) = ${year}
      AND c.status IN ('0', '2', '3')
      AND c.employee_email IS NOT NULL
      AND c.employee_email <> ''
    GROUP BY c.employee_email
`;

isolated function getMonthlyClaimTransactionsQuery(int year, int month) returns sql:ParameterizedQuery => `
    SELECT c.employee_email AS employeeEmail,
           CAST(t.txn_amount AS DECIMAL(10,2)) AS amount
    FROM opd_claim_transaction t
    INNER JOIN opd_claim c
        ON c.id = t.claim_id
    WHERE YEAR(c.added_date) = ${year}
      AND MONTH(c.added_date) = ${month}
      AND c.status IN ('0', '2', '3')
      AND c.employee_email IS NOT NULL
      AND c.employee_email <> ''
`;
