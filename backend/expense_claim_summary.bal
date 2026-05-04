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
import expense_management.database;

# Calculate the trend percentage between a current and previous value.
#
# + current - Current period value
# + previous - Previous period value
# + return - Percentage change rounded to one decimal place
isolated function calculateTrend(decimal current, decimal previous) returns decimal {
    if previous == 0.0d {
        return current > 0.0d ? 100.0d : 0.0d;
    }
    decimal change = ((current - previous) / previous) * 100.0d;
    // Round to 1 decimal
    return <decimal>(<int>(change * 10.0d)) / 10.0d;
}

# Map an expense type name to one of the standard high-level categories.
#
# + expenseType - Raw expense type label from the database
# + return - One of the 9 standard category names
isolated function mapExpenseCategory(string expenseType) returns string {
    string et = expenseType.trim();
    string lower = et.toLowerAscii();

    if lower.startsWith("foreign travel") || lower.startsWith("local travel") ||
            lower.startsWith("domestic air ticket") || lower.startsWith("foreign/local travel") ||
            lower.startsWith("contingency travel") ||
            lower == "car mileage" || lower == "sales boot camp" ||
            lower == "sales meeting expenses" {
        return "Travel";
    }

    if lower.startsWith("cos-") || lower.startsWith("clo-") ||
            lower.startsWith("rnd-aws") || lower.startsWith("rnd-gcp") ||
            lower.startsWith("rnd-aiven") ||
            lower.startsWith("ms ea -") || lower.startsWith("ms premier support") ||
            lower.startsWith("ballerina-central google cloud") ||
            lower.startsWith("annual support renewal") {
        return "Cloud Infrastructure";
    }
    if lower == "aiven" || lower == "cloud hosting" || lower == "identity cloud hosting" ||
            lower == "dr site" || lower == "hosting" || lower == "wallarm node" ||
            lower == "cdn for wso2" || lower == "admin+aws+iam@wso2.com" ||
            lower == "secondary internet link for lk" {
        return "Cloud Infrastructure";
    }

    if lower.startsWith("analyst relations") || lower.startsWith("content-") ||
            lower.startsWith("developer marketing") || lower.startsWith("events travel") ||
            lower.startsWith("events-") || lower.startsWith("industry partnerships") ||
            lower.startsWith("marketing giveaways") || lower.startsWith("marketing events") ||
            lower.startsWith("mkt-bal") || lower.startsWith("operations -") ||
            lower.startsWith("promotions-") || lower.startsWith("public relations") ||
            lower.startsWith("rockstar promotion") || lower.startsWith("shipping") ||
            lower.startsWith("tools-") {
        return "Marketing & Events";
    }
    if lower == "channel marketing" || lower == "digi ops other" ||
            lower == "giveaways control a/c" || lower == "wso2 con - other expenses" {
        return "Marketing & Events";
    }

    // ── Phone & Communication ─────────────────────────────────────────
    if lower.startsWith("call/internet charges") || lower.startsWith("phone/internet") ||
            lower.startsWith("alerts systems") {
        return "Phone & Communication";
    }

    // ── Office & Facilities ───────────────────────────────────────────
    if lower.startsWith("no allocation") || lower.startsWith("fixed assets-") ||
            lower.startsWith("pre payments") {
        return "Office & Facilities";
    }
    if lower == "electricity" || lower == "maintenance" || lower == "office supplies" ||
            lower == "postage and courier charges" || lower == "printing & stationery" ||
            lower == "rent" || lower == "telephone & fax" || lower == "water" {
        return "Office & Facilities";
    }

    if lower.startsWith("professional fees") {
        return "Professional Services";
    }
    if lower == "entertainment" || lower == "membership fees" {
        return "Professional Services";
    }

    if lower == "bank charges" || lower == "due from employee" || lower == "other" ||
            lower == "qbr meetings" || lower == "rbr meetings" {
        return "Finance & Admin";
    }

    if lower.startsWith("meal allowances") || lower.startsWith("staff medical") {
        return "HR & People";
    }
    if lower == "recruitment fees" || lower == "sports & leisure activities" ||
            lower == "staff welfare" || lower == "training & learning expenses" ||
            lower == "wfh internet allowance/ mobile reimbursement" {
        return "HR & People";
    }

    if lower.startsWith("rnd-") || lower.startsWith("sa-") ||
            lower.startsWith("docker") || lower.startsWith("software support expenses") ||
            lower == "fixed assets : software" || lower == "iam ecosystem integrations" {
        return "Software & Licenses";
    }
    string[] softwareExact = [
        "adobe creative cloud", "algolia", "antivirus", "asana", "bitwarden",
        "burp suite", "carta", "concur", "contract management tool",
        "cs - license subscription", "demandbase", "discord", "docker desktop",
        "docker-dvp", "docusign", "domain/ssl certs renewal", "drift",
        "fortianalyzer", "github", "github - choreo", "gmail backup", "google apps",
        "hotjar", "infra security", "insided (developer community platform)", "intercom",
        "iso 27001 compliance cost", "iso 27018 compliance cost",
        "license & support renewal", "lucidchart", "mdm solution", "mindstamp",
        "mongodb", "moz+ahrefs", "muckrack", "netsuite", "office 365",
        "onetrust cockypro", "pager duty", "passage technology  - rollup helper",
        "people hr", "pingdom", "qase tool", "salesforce data backup tool",
        "salesforce inc", "salesforce, inc - pardot", "sanction screening tools",
        "sparktoro", "sprout social", "tableau", "thinkific (t&c platform)", "twilio",
        "virtual events platforms (hopin, sessionize, livestorm)", "vyond - goanimate",
        "winzip + ideals", "wistia", "zerobounce", "zoom"
    ];
    foreach string s in softwareExact {
        if lower == s {
            return "Software & Licenses";
        }
    }

    return et;
}

# Build the expense claims summary used by the dashboard.
#
# + year - Ending year of the reporting range
# + month - Ending month of the reporting range
# + months - Number of months included in the reporting range
# + businessUnit - Optional business unit filter
# + return - Expense claim summary response if all queries succeed, otherwise an error
public function getExpenseClaimSummary(int year, int month, int months,
        string? businessUnit = ()) returns ExpenseClaimSummaryResponse|error {

    // Current period data
    decimal totalClaimAmount = check database:queryExpenseTotalAmount(year, month, months, businessUnit);
    int totalClaimCount = check database:queryExpenseClaimCount(year, month, months, businessUnit);
    decimal avgClaimAmount = check database:queryExpenseAvgAmount(year, month, months, businessUnit);

    // Status counts (numeric codes: -1=Rejected, 0=Draft, 1=Submitted, 2=Lead Approved, 3=Finance Approved)
    int pendingClaims = check database:queryExpenseCountByStatuses(year, month, months, ["0", "1"], businessUnit);
    int approvedClaims = check database:queryExpenseCountByStatuses(year, month, months, ["2", "3"], businessUnit);
    int rejectedClaims = check database:queryExpenseCountByStatuses(year, month, months, ["-1"], businessUnit);

    // Chart data
    database:BuExpenseRow[] buExpenseRows = check database:queryExpenseByBu(year, month, months);
    database:ClaimStatusRow[] claimStatusRows = check database:queryExpenseClaimsByStatus(year, month, months, businessUnit);
    database:TopSpendingEmployeeRow[] topEmployeeRows = check database:queryTopSpendingEmployees(year, month, months, 7, businessUnit);
    database:LeadApprovalFrequencyRow[] leadApprovalFrequencyRows = check database:queryLeadApprovalFrequency(
        year,
        month,
        months,
        businessUnit
    );
    database:TopApprovingLeadRow[] topLeadRows = check database:queryTopApprovingLeads(year, month, months, 7, businessUnit);
    database:RecurringExpenseTypeRow[] recurringRows = check database:queryRecurringExpenseTypes(year, month, months, 500, businessUnit);

    // Previous period data for trend calculation (skip for All Time where months=0)
    decimal prevTotalAmount = 0;
    int prevTotalCount = 0;
    decimal prevAvgAmount = 0;
    int prevApproved = 0;

    if months > 0 {
        int prevMonth = month - months;
        int prevYear = year;
        if prevMonth <= 0 {
            prevMonth = prevMonth + 12;
            prevYear = prevYear - 1;
        }

        prevTotalAmount = check database:queryExpenseTotalAmount(prevYear, prevMonth, months, businessUnit);
        prevTotalCount = check database:queryExpenseClaimCount(prevYear, prevMonth, months, businessUnit);
        prevAvgAmount = check database:queryExpenseAvgAmount(prevYear, prevMonth, months, businessUnit);
        prevApproved = check database:queryExpenseCountByStatuses(prevYear, prevMonth, months, ["2", "3"], businessUnit);
    }

    // Transform rows into response types
    BuExpenseItem[] buExpenses = from database:BuExpenseRow row in buExpenseRows
        select {
            label: row.businessUnit,
            value: row.total
        };

    ActiveClaimStatItem[] activeClaimStats = from database:ClaimStatusRow row in claimStatusRows
        select {
            label: row.status,
            value: row.count
        };

    TopEmployeeItem[] topSpendingEmployees = from database:TopSpendingEmployeeRow row in topEmployeeRows
        select {
            name: deriveDisplayName(row.employeeEmail),
            email: row.employeeEmail,
            bu: "",
            amount: row.total
        };

    LeadApprovalFrequencyItem[] leadApprovalFrequency = from database:LeadApprovalFrequencyRow row in leadApprovalFrequencyRows
        select {
            label: row.label,
            value: row.count
        };

    TopLeadItem[] topApprovingLeads = from database:TopApprovingLeadRow row in topLeadRows
        select {
            name: deriveDisplayName(row.leadEmail),
            email: row.leadEmail,
            bu: row.businessUnit,
            count: row.count
        };

    ExpenseTypeItem[] recurringExpenseTypes = [];
    foreach database:RecurringExpenseTypeRow row in recurringRows {
        recurringExpenseTypes.push({
            name: row.expenseType,
            category: mapExpenseCategory(row.expenseType),
            amount: row.total
        });
    }

    return {
        totalClaimAmount: totalClaimAmount,
        totalClaimCount: totalClaimCount,
        pendingClaims: pendingClaims,
        approvedClaims: approvedClaims,
        rejectedClaims: rejectedClaims,
        avgClaimAmount: avgClaimAmount,
        buExpenses: buExpenses,
        activeClaimStats: activeClaimStats,
        topSpendingEmployees: topSpendingEmployees,
        leadApprovalFrequency: leadApprovalFrequency,
        topApprovingLeads: topApprovingLeads,
        recurringExpenseTypes: recurringExpenseTypes,
        trendTotalAmount: calculateTrend(totalClaimAmount, prevTotalAmount),
        trendTotalCount: calculateTrend(<decimal>totalClaimCount, <decimal>prevTotalCount),
        trendApproved: calculateTrend(<decimal>approvedClaims, <decimal>prevApproved),
        trendAvgAmount: calculateTrend(avgClaimAmount, prevAvgAmount)
    };
}
