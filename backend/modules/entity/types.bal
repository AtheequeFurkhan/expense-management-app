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

public type HREmployee record {|
    string email;
    string? firstName;
    string? lastName;
    string? department;
    string? company;
    string? location;
    string? status;
|};

public type OpdTransaction record {|
    decimal amount;
|};

public type OpdClaim record {|
    string id;
    string employeeEmail;
    decimal amount;
    string createdDate;
    string? status;
    boolean isGracePeriod;
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

