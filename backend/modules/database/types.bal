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

# Represents the configuration required to connect to a database.
#
# + user - The username for the database connection.
# + password - The password for the database user.
# + database - The name of the database to connect to.
# + host - The hostname or IP address of the database server.
# + port - The port number on which the database server is listening (default is 3306).
# + connectionPool - The SQL connection pool configuration.
public type DatabaseConfig record {|
    string user;
    string password;
    string database;
    string host;
    int port = 3306;
    sql:ConnectionPool connectionPool = {};
|};

public type AmountRow record {|
    decimal total;
|};

public type CountRow record {|
    int count;
|};

public type EmployeeTotalRow record {|
    string employeeEmail;
    decimal totalAmount;
|};

public type BucketRow record {|
    string range;
    int count;
|};

public type ClaimBucket record {|
    string range;
    int count;
|};

public type OpdClaimSummaryResponse record {|
    decimal lastYearClaimAmount;
    decimal currentMonthClaimAmount;
    int previousYearClaimCount;
    int gracePeriodClaims;
    int unclaimedEmployees;
    int fullyClaimedEmployees;
    ClaimBucket[] activeClaimsChart;
|};

public type ErrorResponse record {|
    string message;
|};

public type HttpInternalServerError record {|
    *http:InternalServerError;
    ErrorResponse body;
|};
