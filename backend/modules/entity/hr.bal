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

# Fetch employees basic info from HRIS
# + return - Array of Employee or error
public function fetchEmployeesBasicInfo() returns Employee[]|error {
    string query = string `
        query {
            employees {
                id
                email
                firstName
                lastName
                department
                designation
                employeeLevel
                managerEmail
                isActive
            }
        }
    `;

    GraphQlResponse|error response = hrisClient->execute(query);

    if response is error {
        log:printError("Failed to fetch employees from HRIS", response);
        return response;
    }

    if response.errors is json[] {
        log:printError("GraphQL errors", errors = response.errors);
        return error("GraphQL query failed");
    }

    json? data = response.data;
    if data is () {
        return [];
    }

    EmployeeResponse|error employeeResponse = data.cloneWithType();
    if employeeResponse is error {
        log:printError("Failed to parse employee response", employeeResponse);
        return employeeResponse;
    }

    return employeeResponse.employees;
}

# Fetch single employee by email
# + email - Employee email
# + return - Employee or error
public function fetchEmployeeByEmail(string email) returns Employee|error {
    string query = string `
        query {
            employee(email: "${email}") {
                id
                email
                firstName
                lastName
                department
                designation
                employeeLevel
                managerEmail
                isActive
            }
        }
    `;

    GraphQlResponse|error response = hrisClient->execute(query);

    if response is error {
        log:printError("Failed to fetch employee from HRIS", response);
        return response;
    }

    if response.errors is json[] {
        log:printError("GraphQL errors", errors = response.errors);
        return error("GraphQL query failed");
    }

    json? data = response.data;
    if data is () {
        return error("Employee not found");
    }

    Employee|error employee = (check data.employee).cloneWithType();
    if employee is error {
        log:printError("Failed to parse employee", employee);
        return employee;
    }

    return employee;
}

