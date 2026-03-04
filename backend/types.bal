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

# User information record
public type UserInfo record {|
    # User email
    string email;
    # First name
    string firstName;
    # Last name
    string lastName;
    # Department
    string? department;
    # Designation
    string? designation;
    # User roles
    string[] roles;
|};

# Claim summary record
public type ClaimSummary record {|
    # Total claim limit
    decimal totalClaimLimit;
    # Total claimed amount
    decimal totalClaimedAmount;
    # Total remaining amount
    decimal totalRemaining;
|};

# Transaction payload for OPD claim draft
public type TransactionPayload record {|
    # Amount of the transaction
    decimal amount;
    # Comment of the transaction
    string comment;
    # Date of the transaction
    string date;
    # Receipt URL of the transaction
    string receiptUrl;
|};

# Draft for OPD claim
public type OpdClaimDraft record {|
    # List of transactions
    TransactionPayload[] transactions;
|};

# AppData record
public type AppData record {|
    # Current year claim summary
    ClaimSummary claimSummary;
    # OPD claim draft
    OpdClaimDraft draft;
    # Last year claim summary
    ClaimSummary lastYearClaimSummary;
|};

# Error response record
public type ErrorResponse record {|
    # Error message
    string message;
    # Error code
    string code;
|};

