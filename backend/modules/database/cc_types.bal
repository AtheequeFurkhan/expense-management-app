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

# Aggregated spend statistics for CC summary and trend calculations.
public type CCSpendStatsRow record {|
    # Total spend in the current calendar year
    decimal currentYearSpend;
    # Total spend in the previous calendar year
    decimal prevYearSpend;
    # Average transaction amount in the current month
    decimal currentMonthAvg;
    # Average transaction amount in the previous month
    decimal prevMonthAvg;
|};

# Count of active corporate cards.
public type CCActiveCountRow record {|
    # Number of cards with status = 'Active'
    int activeCount;
|};

# Highest-spending corporate card holder.
public type CCHighestSpendRow record {|
    # Employee email of the top-spending card holder
    string holderName;
    # Total transaction amount for the card
    decimal usedAmount;
|};

# Spend and transaction count grouped by engagement category.
public type CCCardTypeRow record {|
    # Derived category label (e.g. "Sales", "Marketing", "Other")
    string cardType;
    # Total spend amount for the category
    decimal totalSpend;
    # Number of transactions in the category
    int txnCount;
|};

# Top-spending corporate card summary.
public type CCTopCardRow record {|
    # Corporate card number
    string cardNumber;
    # Employee email of the card holder
    string holderName;
    # Total spend amount on the card
    decimal usedAmount;
    # Number of transactions on the card
    int txnCount;
|};

# Full corporate card record with status and total spend.
public type CCCardRow record {|
    # Database ID of the card (cast to string)
    string cardId;
    # Corporate card number
    string cardNumber;
    # Employee email of the card holder
    string holderName;
    # Total spend amount on the card
    decimal usedAmount;
    # Card provider / type code
    string cardType;
    # Card status (e.g. "Active", "Inactive")
    string status;
|};

# Employee CC spending summary for a given date range.
public type CCEmployeeSpendingRow record {|
    # Employee email
    string employeeEmail;
    # Total CC spend amount
    decimal totalAmount;
    # Number of transactions
    int txnCount;
|};

# Employee CC spend breakdown by engagement category.
public type CCEmployeeCategoryRow record {|
    # Derived engagement category label
    string category;
    # Total spend in the category
    decimal total;
    # Number of transactions in the category
    int txnCount;
|};

# Individual CC transaction for an employee within a category.
public type CCEmployeeCategoryTransactionRow record {|
    # Transaction reference or description
    string description;
    # Transaction date formatted as YYYY-MM-DD
    string txnDate;
    # Transaction amount
    decimal amount;
    # Transaction status
    string status;
|};
