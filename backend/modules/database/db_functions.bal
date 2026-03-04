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

import ballerina/log;

# Get employee details by email
# + email - Employee email
# + return - Employee record or error
public function getEmployee(string email) returns EmployeeRecord|error {
    EmployeeRecord|error result = getEmployeeByEmail(email);
    if result is error {
        log:printError("Error fetching employee", 'error = result, email = email);
        return result;
    }
    return result;
}

# Get all categories
# + return - Array of expense categories or error
public function getCategories() returns ExpenseCategoryRecord[]|error {
    ExpenseCategoryRecord[]|error result = getAllExpenseCategories();
    if result is error {
        log:printError("Error fetching categories", 'error = result);
        return result;
    }
    return result;
}
