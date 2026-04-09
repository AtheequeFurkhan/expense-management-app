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

# OPD claim status codes stored in the database.
public enum OpdClaimStatus {
    OPD_CLAIM_STATUS_DELETED = "-1",
    OPD_CLAIM_STATUS_PENDING_APPROVAL = "0",
    OPD_CLAIM_STATUS_REJECTED = "1",
    OPD_CLAIM_STATUS_APPROVED = "3"
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

// ---------------------------------------------------------------------------
// Expense Claims types
// ---------------------------------------------------------------------------

# Query result for expense claim aggregated amount.
public type ExpenseAmountRow record {|
    # Aggregated total amount returned by the query.
    decimal total;
|};

# Query result for expense claim aggregated count.
public type ExpenseCountRow record {|
    # Aggregated count returned by the query.
    int count;
|};

# Query result for expense claim average amount.
public type ExpenseAvgRow record {|
    # Average amount returned by the query.
    decimal avg;
|};

# Query result for expense amount grouped by business unit.
public type BuExpenseRow record {|
    # Business unit label.
    string businessUnit;
    # Total reimbursement amount for the business unit.
    decimal total;
|};

# Query result for claim count grouped by status.
public type ClaimStatusRow record {|
    # Claim status label.
    string status;
    # Number of claims with this status.
    int count;
|};

# Query result for top spending employees.
public type TopSpendingEmployeeRow record {|
    # Employee email.
    string employeeEmail;
    # Business unit associated with the employee's claims.
    string businessUnit;
    # Total reimbursement amount.
    decimal total;
|};

# Query result for top approving leads.
public type TopApprovingLeadRow record {|
    # Lead email.
    string leadEmail;
    # Business unit associated with the lead's approved claims.
    string businessUnit;
    # Number of claims approved by the lead.
    int count;
|};

# Query result for lead-approved claim frequency over time.
public type LeadApprovalFrequencyRow record {|
    # Display label for the approval window.
    string label;
    # Calendar year for sorting.
    int year;
    # Calendar month for sorting.
    int month;
    # Number of lead-approved claims in the window.
    int count;
|};

# Query result for recurring expense types.
public type RecurringExpenseTypeRow record {|
    # Expense type name.
    string expenseType;
    # Total reimbursement amount for the expense type.
    decimal total;
|};
