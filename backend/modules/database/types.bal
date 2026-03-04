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

# Database configuration
public type DatabaseConfig record {|
    # Database host
    string host;
    # Database port
    int port;
    # Database user
    string user;
    # Database password
    string password;
    # Database name
    string database;
|};

# Employee record from database
public type EmployeeRecord record {|
    # Employee ID
    int id;
    # Email address
    string email;
    # Employee ID string
    string employee_id;
    # First name
    string first_name;
    # Last name
    string last_name;
    # Department ID
    int? department_id;
    # Designation
    string? designation;
    # Employee level
    string? employee_level;
    # Manager email
    string? manager_email;
    # Is active flag
    boolean is_active;
|};

# Expense category record from database
public type ExpenseCategoryRecord record {|
    # Category ID
    int id;
    # Category name
    string name;
    # Category code
    string code;
    # Description
    string? description;
    # GL code
    string? gl_code;
    # Yearly limit
    decimal yearly_limit;
    # Category type
    string category_type;
|};

# Policy limit record
public type DbPolicyLimit record {|
    # ID
    int id;
    # Category ID
    int category_id;
    # Employee level
    string employee_level;
    # Max single claim amount
    decimal max_single_claim;
    # Yearly limit amount
    decimal yearly_limit;
    # Requires receipt above amount
    decimal requires_receipt_above;
|};

# Claim approval record
public type DbClaimApproval record {|
    # ID
    int id;
    # Claim ID
    int claim_id;
    # Approver email
    string approver_email;
    # Approval level
    int approval_level;
    # Status
    string status;
    # Comments
    string? comments;
    # Acted at timestamp
    string? acted_at;
    # Created at timestamp
    string created_at;
|};

# OPD claim record
public type DbOpdClaim record {|
    # ID
    int id;
    # Claim ID
    int claim_id;
    # Patient name
    string patient_name;
    # Relationship
    string relationship;
    # Hospital name
    string? hospital_name;
    # Doctor name
    string? doctor_name;
    # Diagnosis
    string? diagnosis;
|};

# Claim usage summary
public type DbClaimUsage record {|
    # Total used amount
    decimal total_used;
|};

