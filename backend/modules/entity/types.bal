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

import ballerina/http;

# GraphQL retry configuration
public type GraphQlRetryConfig record {|
    # Retry count
    int count = 3;
    # Retry interval in seconds
    decimal interval = 1.0;
|};

# OAuth2 client credentials configuration
public type Oauth2Config record {|
    # Token URL
    string tokenUrl;
    # Client ID
    string clientId;
    # Client secret
    string clientSecret;
|};

# Entity service configuration
public type EntityConfig record {|
    # HRIS entity service endpoint
    string hrisEntityServiceEndpoint;
    # OPD claims service endpoint
    string opdClaimsServiceEndpoint;
    # Client auth configuration
    Oauth2Config clientAuthConfig;
|};

# Employee record from HRIS
public type Employee record {|
    # Employee ID
    string id;
    # Email
    string email;
    # First name
    string firstName;
    # Last name
    string lastName;
    # Department
    string? department;
    # Designation
    string? designation;
    # Employee level
    string? employeeLevel;
    # Manager email
    string? managerEmail;
    # Is active
    boolean isActive;
|};

# Employee response from GraphQL
public type EmployeeResponse record {|
    # Employees list
    Employee[] employees;
|};

# GraphQL response wrapper
public type GraphQlResponse record {|
    # Response data
    json? data;
    # Response errors
    json[]? errors;
|};

# HTTP client configuration
public type HttpClientConfig record {|
    # HTTP client config
    http:ClientConfiguration config;
|};

