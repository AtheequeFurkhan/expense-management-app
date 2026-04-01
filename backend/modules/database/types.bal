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
import ballerina/sql;

# OPD claim status codes stored in the database.
public enum OpdClaimStatus {
    OPD_CLAIM_STATUS_DELETED = "-1",
    OPD_CLAIM_STATUS_PENDING_APPROVAL = "0",
    OPD_CLAIM_STATUS_REJECTED = "1",
    OPD_CLAIM_STATUS_LEAD_APPROVED = "2",
    OPD_CLAIM_STATUS_APPROVED = "3",
    OPD_CLAIM_STATUS_CANCELLED = "5"
}

# Configurable database connection settings.
public type DatabaseConfig record {|
    # Host name or IP address of the database server.
    string host;
    # User name used to connect to the database.
    string user;
    # Password used to connect to the database.
    string password;
    # Name of the target database schema.
    string database;
    # Port used by the database server.
    int port = 3306;
    # Connection pool settings for the database client.
    sql:ConnectionPool connectionPool = {};
|};

# Query result containing a single aggregated decimal total.
public type AmountRow record {|
    # Aggregated total amount returned by the query.
    decimal total;
|};

# Query result containing a single aggregated count.
public type CountRow record {|
    # Aggregated count returned by the query.
    int count;
|};

# Query result containing an employee email.
public type EmployeeEmailRow record {|
    # Employee work email associated with a claim.
    string employeeEmail;
|};

# Query result containing a claim total for an employee.
public type EmployeeTotalRow record {|
    # Employee work email associated with the total.
    string employeeEmail;
    # Total claim amount calculated for the employee.
    decimal totalAmount;
|};

# Claim distribution bucket used by the active claims chart.
public type ClaimBucket record {|
    # Amount range label represented by the bucket.
    string range;
    # Number of employees falling within the range.
    int count;
|};

# Response returned by the OPD claim summary endpoint.
public type OpdClaimSummaryResponse record {|
    # Total claim amount submitted during the selected year.
    decimal lastYearClaimAmount;
    # Total claim amount submitted during the selected month.
    decimal currentMonthClaimAmount;
    # Number of claims submitted during the previous year.
    int previousYearClaimCount;
    # Number of claims submitted within the configured grace period.
    int gracePeriodClaims;
    # Number of employees without claims in the selected period.
    int unclaimedEmployees;
    # Number of employees who reached the annual claim limit.
    int fullyClaimedEmployees;
    # Claim distribution data for the active claims chart.
    ClaimBucket[] activeClaimsChart;
|};

# Standard error payload returned to API clients.
public type ErrorResponse record {|
    # Client-safe error message.
    string message;
|};

# Internal server error response shape for API resources.
public type HttpInternalServerError record {|
    *http:InternalServerError;
    # Error payload returned in the response body.
    ErrorResponse body;
|};
