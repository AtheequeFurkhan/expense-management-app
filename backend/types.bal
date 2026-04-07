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

# Represents the response structure for retrieving user information.
public type UserInfoResponse record {|
    # Id of the employee
    string employeeId;
    # Email of the employee
    string workEmail;
    # First name of the employee
    string firstName;
    # Last name of the employee
    string lastName;
    # Job role
    string jobRole;
    # Thumbnail of the employee
    string? employeeThumbnail;
    # User privileges
    int[] privileges;
|};

# Application configuration returned to the frontend
public type AppConfig record {|
    # Annual OPD claim limit per employee
    decimal claimLimit;

    # Allowed employee locations for claim submissions
    string[] submissionsAllowedLocations;
|};

# Claim distribution bucket used by OPD summary responses.
public type OpdClaimBucket record {|
    # Amount range label represented by the bucket.
    string range;
    # Number of employees falling within the range.
    int count;
|};

# HTTP response returned by the OPD claim summary endpoint.
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
    OpdClaimBucket[] activeClaimsChart;
|};

// ---------------------------------------------------------------------------
// Expense Claims response types
// ---------------------------------------------------------------------------

# Business unit expense item in the summary response.
public type BuExpenseItem record {|
    # Business unit label.
    string label;
    # Total reimbursement amount.
    decimal value;
|};

# Active claim stats item in the summary response.
public type ActiveClaimStatItem record {|
    # Claim status label.
    string label;
    # Number of claims with this status.
    int value;
|};

# Top spending employee item in the summary response.
public type TopEmployeeItem record {|
    # Display name derived from employee email.
    string name;
    # Employee email.
    string email;
    # Business unit.
    string bu;
    # Total reimbursement amount.
    decimal amount;
|};

# Top approving lead item in the summary response.
public type TopLeadItem record {|
    # Display name derived from lead email.
    string name;
    # Lead email.
    string email;
    # Business unit.
    string bu;
    # Number of approved claims.
    int count;
|};

# Recurring expense type item in the summary response.
public type ExpenseTypeItem record {|
    # Expense type name.
    string name;
    # Total reimbursement amount.
    decimal amount;
|};

# HTTP response returned by the expense claims summary endpoint.
public type ExpenseClaimSummaryResponse record {|
    # Total reimbursement amount for the selected period.
    decimal totalClaimAmount;
    # Total number of claims in the selected period.
    int totalClaimCount;
    # Number of pending claims.
    int pendingClaims;
    # Number of approved claims.
    int approvedClaims;
    # Number of rejected claims.
    int rejectedClaims;
    # Average reimbursement amount per claim.
    decimal avgClaimAmount;
    # Expense amounts grouped by business unit.
    BuExpenseItem[] buExpenses;
    # Claim counts grouped by status.
    ActiveClaimStatItem[] activeClaimStats;
    # Top spending employees.
    TopEmployeeItem[] topSpendingEmployees;
    # Top approving leads.
    TopLeadItem[] topApprovingLeads;
    # Top recurring expense types by total amount.
    ExpenseTypeItem[] recurringExpenseTypes;
    # Trend percentage for total claim amount vs previous period.
    decimal trendTotalAmount;
    # Trend percentage for total claim count vs previous period.
    decimal trendTotalCount;
    # Trend percentage for approved claims vs previous period.
    decimal trendApproved;
    # Trend percentage for average claim amount vs previous period.
    decimal trendAvgAmount;
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
