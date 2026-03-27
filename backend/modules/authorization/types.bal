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

# User information extracted from the Asgardeo JWT assertion.
public type CustomJwtPayload record {
    # Work email address of the authenticated user.
    string email;
    # Group or role names assigned to the authenticated user.
    string[] groups;
};

# Application-specific role names used for authorization checks.
public type AppRoles record {|
    # Role granted to employees.
    string employeeRole;
    # Role granted to the head of people operations.
    string headPeopleOperationsRole;
|};

# Employee email details returned by the HR entity response.
#
# + workEmail - Work email address of the employee
public type EmployeeEmail record {|
    string workEmail;
|};

# HR entity payload section containing the employee email list.
type EmployeesData record {|
    # Employee records returned by the HR entity.
    EmployeeEmail[] employees;
|};

# Top-level HR entity response containing employee data.
type EmplyeesResponse record {|
    # Data object returned by the HR entity query.
    EmployeesData data;
|};
