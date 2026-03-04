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

# Get employee by email
# + email - Employee email
# + return - Employee record or error
public function getEmployeeByEmail(string email) returns EmployeeRecord|error {
    sql:ParameterizedQuery query = `SELECT id, email, employee_id, first_name, last_name,
        department_id, designation, employee_level, manager_email, is_active
        FROM employee WHERE email = ${email}`;
    return dbClient->queryRow(query);
}

# Get all expense categories
# + return - Array of expense category records or error
public function getAllExpenseCategories() returns ExpenseCategoryRecord[]|error {
    sql:ParameterizedQuery query = `SELECT id, name, code, description, gl_code,
        yearly_limit, category_type FROM expense_category`;
    stream<ExpenseCategoryRecord, sql:Error?> resultStream = dbClient->query(query);
    return from ExpenseCategoryRecord category in resultStream
        select category;
}

# Get OPD category limit
# + return - Yearly limit for OPD or error
public function getOpdCategoryLimit() returns decimal|error {
    sql:ParameterizedQuery query = `SELECT yearly_limit FROM expense_category WHERE code = 'OPD_MED'`;
    record {|decimal yearly_limit;|} result = check dbClient->queryRow(query);
    return result.yearly_limit;
}

# Get total claimed amount for employee in a year
# + employeeEmail - Employee email
# + year - Claim year
# + return - Total claimed amount or error
public function getTotalClaimedAmount(string employeeEmail, string year) returns decimal|error {
    sql:ParameterizedQuery query = `SELECT COALESCE(SUM(amount), 0) as total_used
        FROM expense_claim
        WHERE submitted_by = ${employeeEmail}
        AND YEAR(claim_date) = ${year}
        AND status != 'REJECTED'`;
    DbClaimUsage result = check dbClient->queryRow(query);
    return result.total_used;
}

