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
import expense_management.authorization;
import expense_management.database;
import expense_management.entity;

import ballerina/cache;
import ballerina/http;
import ballerina/log;
import ballerina/time;

public configurable AppConfig appConfig = ?;
configurable decimal annualClaimLimit = ?;
configurable decimal claimRangeStep = ?;
configurable int lastYearClaimGracePeriodInDays = ?;

final cache:Cache cache = new ({
    capacity: CACHE_CAPACITY,
    defaultMaxAge: CACHE_DEFAULT_MAX_AGE,
    cleanupInterval: CACHE_CLEANUP_INTERVAL
});

isolated function extractUserInfo(http:RequestContext ctx) returns authorization:CustomJwtPayload|http:BadRequest {
    authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
    if userInfo is error {
        return <http:BadRequest>{body: {message: "User information header not found!"}};
    }
    return userInfo;
}

isolated function resolveEffectiveDate(int? year, int? month) returns [int, int]|HttpInternalServerError {
    time:Civil|error civilTime = time:utcToCivil(time:utcNow());
    if civilTime is error {
        log:printError("Failed to resolve current date.", civilTime);
        return <HttpInternalServerError>{body: {message: "Failed to resolve the current date."}};
    }
    return [year ?: civilTime.year, month ?: civilTime.month];
}

isolated function normalizeBusinessUnit(string? businessUnit) returns string? {
    if businessUnit is string &&
            (businessUnit.trim().length() == 0 || businessUnit == "All Business Units") {
        return ();
    }
    return businessUnit;
}

isolated function fetchNameMap(string[] emails) returns map<string> {
    map<string>|error hrNames = entity:fetchEmployeeNameMap(emails);
    return hrNames is map<string> ? hrNames : {};
}

service class ErrorInterceptor {
    *http:ResponseErrorInterceptor;

    # Convert payload binding failures into client-friendly bad request responses.
    #
    # + err - Response error raised while handling the request
    # + ctx - Request context for the current request
    # + return - Bad request response for payload binding failures, otherwise the original error
    remote function interceptResponseError(error err, http:RequestContext ctx) returns http:BadRequest|error {
        if err is http:PayloadBindingError {
            string customError = "Payload binding failed!";
            log:printError(customError, err);
            return {
                body: {
                    message: customError
                }
            };
        }
        return err;
    }
}

@display {
    label: "Expense Management Dashboard",
    id: "finance/expense-management-dashboard"
}
service http:InterceptableService / on new http:Listener(9090) {

    # Create the interceptors applied to all service requests.
    #
    # + return - Ordered list of service interceptors
    public function createInterceptors() returns http:Interceptor[] =>
        [new authorization:JwtInterceptor(), new ErrorInterceptor()];

    # Get frontend application configuration.
    #
    # + return - Application configuration used by the frontend
    resource function get app\-config() returns AppConfig => appConfig;

    # Get user information and privileges for the authenticated user.
    #
    # + ctx - Request context containing authenticated user information
    # + return - User information response if successful, otherwise an internal server error
    resource function get user\-info(http:RequestContext ctx) returns UserInfoResponse|http:InternalServerError {
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            return <http:InternalServerError>{
                body: {
                    message: "User information header not found!"
                }
            };
        }

        if cache.hasKey(userInfo.email) {
            UserInfoResponse|error cachedUserInfo = cache.get(userInfo.email).ensureType();
            if cachedUserInfo is UserInfoResponse {
                return cachedUserInfo;
            }
        }

        entity:Employee|error loggedInUser = entity:fetchEmployeesBasicInfo(userInfo.email);
        if loggedInUser is error {
            string customError = "Error occurred while retrieving user data.";
            log:printError(customError, loggedInUser);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        int[] privileges = [];
        if authorization:checkPermissions([authorization:authorizedRoles.employeeRole], userInfo.groups) {
            privileges.push(authorization:EMPLOYEE_ROLE_PRIVILEGE);
        }
        if authorization:checkPermissions([authorization:authorizedRoles.financeAdminRole], userInfo.groups) {
            privileges.push(authorization:FINANCE_ADMIN_PRIVILEGE);
        }

        UserInfoResponse userInfoResponse = {
            workEmail: userInfo.email,
            firstName: loggedInUser.firstName,
            lastName: loggedInUser.lastName,
            employeeThumbnail: loggedInUser.employeeThumbnail,
            privileges
        };

        error? cacheError = cache.put(userInfo.email, userInfoResponse);
        if cacheError is error {
            log:printError("An error occurred while writing user info to the cache", cacheError);
        }
        return userInfoResponse;
    }

    # Get the OPD claim summary for the requested reporting period.
    #
    # + ctx - Request context containing authenticated user information
    # + year - Optional reporting year
    # + month - Optional reporting month
    # + months - Number of months included in the reporting window
    # + return - OPD claim summary if successful, otherwise an HTTP error response
    resource function get opd\-claims(http:RequestContext ctx, int? year = (), int? month = (), int months = 1)
        returns OpdClaimSummaryResponse|http:BadRequest|HttpInternalServerError {

        authorization:CustomJwtPayload|http:BadRequest authResult = extractUserInfo(ctx);
        if authResult is http:BadRequest {
            return authResult;
        }

        if year is int && year <= 0 {
            return <http:BadRequest>{body: {message: "Invalid year. Expected a positive value."}};
        }

        if month is int && (month < 1 || month > 12) {
            return <http:BadRequest>{body: {message: "Invalid month. Expected a value between 1 and 12."}};
        }

        [int, int]|HttpInternalServerError dateResult = resolveEffectiveDate(year, month);
        if dateResult is HttpInternalServerError {
            return dateResult;
        }
        int effectiveYear = dateResult[0];
        int effectiveMonth = dateResult[1];

        OpdClaimSummaryResponse|error summary = getOpdClaimSummary(
                effectiveYear,
                effectiveMonth,
                months
        );
        if summary is error {
            string customError = "Failed to build OPD claim summary.";
            log:printError(customError, summary);
            return <HttpInternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        return summary;
    }

    # Get the expense claims summary for the requested reporting period.
    #
    # + ctx - Request context containing authenticated user information
    # + year - Optional reporting year (defaults to current year)
    # + month - Optional reporting month (defaults to current month)
    # + months - Number of months included in the reporting window
    # + businessUnit - Optional business unit filter
    # + return - Expense claim summary if successful, otherwise an HTTP error response
    resource function get expense\-claims(http:RequestContext ctx, int? year = (), int? month = (),
            int months = 1, string? businessUnit = ())
        returns ExpenseClaimSummaryResponse|http:BadRequest|HttpInternalServerError {

        authorization:CustomJwtPayload|http:BadRequest authResult = extractUserInfo(ctx);
        if authResult is http:BadRequest {
            return authResult;
        }

        if year is int && year <= 0 {
            return <http:BadRequest>{body: {message: "Invalid year. Expected a positive value."}};
        }

        if month is int && (month < 1 || month > 12) {
            return <http:BadRequest>{body: {message: "Invalid month. Expected a value between 1 and 12."}};
        }

        [int, int]|HttpInternalServerError dateResult = resolveEffectiveDate(year, month);
        if dateResult is HttpInternalServerError {
            return dateResult;
        }
        int effectiveYear = dateResult[0];
        int effectiveMonth = dateResult[1];

        string? effectiveBusinessUnit = normalizeBusinessUnit(businessUnit);

        ExpenseClaimSummaryResponse|error summary = getExpenseClaimSummary(
                effectiveYear,
                effectiveMonth,
                months,
                effectiveBusinessUnit
        );
        if summary is error {
            string customError = "Failed to build expense claim summary.";
            log:printError(customError, summary);
            return <HttpInternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        return summary;
    }

    # Get all employees ranked by total spending for the requested reporting period.
    #
    # + ctx - Request context containing authenticated user information
    # + year - Optional reporting year (defaults to current year)
    # + month - Optional reporting month (defaults to current month)
    # + months - Number of months included in the reporting window
    # + businessUnit - Optional business unit filter
    # + return - Employee spending list if successful, otherwise an HTTP error response
    resource function get employee\-spending(http:RequestContext ctx, int? year = (), int? month = (),
            int months = 1, string? businessUnit = ())
        returns EmployeeSpendingItem[]|http:BadRequest|HttpInternalServerError {

        authorization:CustomJwtPayload|http:BadRequest authResult = extractUserInfo(ctx);
        if authResult is http:BadRequest {
            return authResult;
        }

        [int, int]|HttpInternalServerError dateResult = resolveEffectiveDate(year, month);
        if dateResult is HttpInternalServerError {
            return dateResult;
        }
        int effectiveYear = dateResult[0];
        int effectiveMonth = dateResult[1];

        string? effectiveBusinessUnit = normalizeBusinessUnit(businessUnit);

        database:AllSpendingEmployeeRow[]|error rows = database:queryAllSpendingEmployees(
                effectiveYear, effectiveMonth, months, effectiveBusinessUnit
        );
        if rows is error {
            string customError = "Failed to fetch employee spending data.";
            log:printError(customError, rows);
            return <HttpInternalServerError>{body: {message: customError}};
        }

        string[] employeeEmails = from database:AllSpendingEmployeeRow row in rows select row.employeeEmail;
        map<string> nameMap = fetchNameMap(employeeEmails);

        return from database:AllSpendingEmployeeRow row in rows
            select {
                name: nameMap[row.employeeEmail.toLowerAscii()] ?: deriveDisplayName(row.employeeEmail),
                email: row.employeeEmail,
                totalAmount: row.total,
                claimCount: row.claimCount
            };
    }

    # Get the expense category breakdown for a specific employee.
    #
    # + ctx - Request context containing authenticated user information
    # + email - Employee email address
    # + year - Optional reporting year (defaults to current year)
    # + month - Optional reporting month (defaults to current month)
    # + months - Number of months included in the reporting window
    # + statusFilter - Optional status group filter: "Approved" or "Pending"
    # + return - Employee spending breakdown if successful, otherwise an HTTP error response
    resource function get employee\-spending\-breakdown(http:RequestContext ctx, string email,
            int? year = (), int? month = (), int months = 1, string? statusFilter = ())
        returns EmployeeSpendingBreakdownResponse|http:BadRequest|HttpInternalServerError {

        authorization:CustomJwtPayload|http:BadRequest authResult = extractUserInfo(ctx);
        if authResult is http:BadRequest {
            return authResult;
        }

        if email.trim().length() == 0 {
            return <http:BadRequest>{body: {message: "Employee email is required."}};
        }

        [int, int]|HttpInternalServerError dateResult = resolveEffectiveDate(year, month);
        if dateResult is HttpInternalServerError {
            return dateResult;
        }
        int effectiveYear = dateResult[0];
        int effectiveMonth = dateResult[1];
        string? effectiveStatusFilter = (statusFilter is string && statusFilter.trim().length() == 0) ? () : statusFilter;

        database:EmployeeCategoryRow[]|error catRows = database:queryEmployeeCategoryBreakdown(
                email, effectiveYear, effectiveMonth, months, effectiveStatusFilter
        );
        if catRows is error {
            string customError = "Failed to fetch employee category breakdown.";
            log:printError(customError, catRows);
            return <HttpInternalServerError>{body: {message: customError}};
        }

        decimal grandTotal = 0.0d;
        int totalClaims = 0;
        foreach database:EmployeeCategoryRow r in catRows {
            grandTotal = grandTotal + r.total;
            totalClaims = totalClaims + r.claimCount;
        }

        EmployeeCategoryItem[] categories = from database:EmployeeCategoryRow row in catRows
            select {
                category: row.category,
                total: row.total,
                claimCount: row.claimCount,
                percentage: grandTotal > 0.0d ? (row.total / grandTotal) * 100.0d : 0.0d
            };

        string empName = deriveDisplayName(email);
        entity:Employee|error empEmployee = entity:fetchEmployeesBasicInfo(email);
        if empEmployee is entity:Employee {
            empName = empEmployee.firstName + " " + empEmployee.lastName;
        }

        return {
            name: empName,
            email: email,
            totalAmount: grandTotal,
            claimCount: totalClaims,
            categories: categories
        };
    }

    # Get individual transactions for a specific employee within an expense category.
    #
    # + ctx - Request context containing authenticated user information
    # + email - Employee email address
    # + category - Expense category label
    # + year - Optional reporting year (defaults to current year)
    # + month - Optional reporting month (defaults to current month)
    # + months - Number of months included in the reporting window
    # + statusFilter - Optional status group filter: "Approved" or "Pending"
    # + return - Transaction list if successful, otherwise an HTTP error response
    resource function get employee\-category\-transactions(http:RequestContext ctx, string email,
            string category, int? year = (), int? month = (), int months = 1, string? statusFilter = ())
        returns EmployeeCategoryTransactionItem[]|http:BadRequest|HttpInternalServerError {

        authorization:CustomJwtPayload|http:BadRequest authResult = extractUserInfo(ctx);
        if authResult is http:BadRequest {
            return authResult;
        }

        if email.trim().length() == 0 || category.trim().length() == 0 {
            return <http:BadRequest>{body: {message: "Employee email and category are required."}};
        }

        [int, int]|HttpInternalServerError dateResult = resolveEffectiveDate(year, month);
        if dateResult is HttpInternalServerError {
            return dateResult;
        }
        int effectiveYear = dateResult[0];
        int effectiveMonth = dateResult[1];
        string? effectiveStatusFilter = (statusFilter is string && statusFilter.trim().length() == 0) ? () : statusFilter;

        database:EmployeeCategoryTransactionRow[]|error txnRows = database:queryEmployeeCategoryTransactions(
                email, category, effectiveYear, effectiveMonth, months, effectiveStatusFilter
        );
        if txnRows is error {
            string customError = "Failed to fetch employee category transactions.";
            log:printError(customError, txnRows);
            return <HttpInternalServerError>{body: {message: customError}};
        }

        return from database:EmployeeCategoryTransactionRow row in txnRows
            select {
                description: row.description,
                txnDate: row.txnDate,
                amount: row.amount,
                status: row.status
            };
    }

    # Get the lead approval frequency list for the requested reporting period.
    #
    # + ctx - Request context containing authenticated user information
    # + year - Optional reporting year (defaults to current year)
    # + month - Optional reporting month (defaults to current month)
    # + months - Number of months included in the reporting window
    # + businessUnit - Optional business unit filter
    # + return - Lead frequency list if successful, otherwise an HTTP error response
    resource function get lead\-approval\-frequency(http:RequestContext ctx, int? year = (), int? month = (),
            int months = 1, string? businessUnit = ())
        returns LeadFrequencyItemResponse[]|http:BadRequest|HttpInternalServerError {

        authorization:CustomJwtPayload|http:BadRequest authResult = extractUserInfo(ctx);
        if authResult is http:BadRequest {
            return authResult;
        }

        [int, int]|HttpInternalServerError dateResult = resolveEffectiveDate(year, month);
        if dateResult is HttpInternalServerError {
            return dateResult;
        }
        int effectiveYear = dateResult[0];
        int effectiveMonth = dateResult[1];

        string? effectiveBusinessUnit = normalizeBusinessUnit(businessUnit);

        database:LeadFrequencyRow[]|error rows = database:queryLeadFrequencyList(
                effectiveYear, effectiveMonth, months, effectiveBusinessUnit
        );
        if rows is error {
            string customError = "Failed to fetch lead approval frequency list.";
            log:printError(customError, rows);
            return <HttpInternalServerError>{body: {message: customError}};
        }

        string[] leadEmails = from database:LeadFrequencyRow row in rows select row.leadEmail;
        map<string> nameMap = fetchNameMap(leadEmails);

        LeadFrequencyItemResponse[] result = [];
        foreach database:LeadFrequencyRow row in rows {
            string lowerEmail = row.leadEmail.toLowerAscii();
            string leadName = nameMap[lowerEmail] ?: deriveDisplayName(row.leadEmail);
            decimal avgFreq = row.daySpan > 0 ? <decimal>row.totalApproved / <decimal>row.daySpan : 0.0d;
            result.push({
                name: leadName,
                email: row.leadEmail,
                bu: "",
                totalApproved: row.totalApproved,
                avgFrequencyPerDay: avgFreq,
                avgResponseDays: row.avgResponseDays,
                firstApprovedDate: row.firstApprovedDate,
                lastApprovedDate: row.lastApprovedDate
            });
        }
        return result;
    }

    # Get the approval detail for a specific lead.
    #
    # + ctx - Request context containing authenticated user information
    # + email - Lead email address
    # + year - Optional reporting year (defaults to current year)
    # + month - Optional reporting month (defaults to current month)
    # + months - Number of months included in the reporting window
    # + return - Lead approval detail if successful, otherwise an HTTP error response
    resource function get lead\-approval\-detail(http:RequestContext ctx, string email,
            int? year = (), int? month = (), int months = 1)
        returns LeadApprovalDetailResponse|http:BadRequest|HttpInternalServerError {

        authorization:CustomJwtPayload|http:BadRequest authResult = extractUserInfo(ctx);
        if authResult is http:BadRequest {
            return authResult;
        }

        if email.trim().length() == 0 {
            return <http:BadRequest>{body: {message: "Lead email is required."}};
        }

        [int, int]|HttpInternalServerError dateResult = resolveEffectiveDate(year, month);
        if dateResult is HttpInternalServerError {
            return dateResult;
        }
        int effectiveYear = dateResult[0];
        int effectiveMonth = dateResult[1];

        database:LeadApprovalDetailRow[]|error rows = database:queryLeadApprovalDetail(
                email, effectiveYear, effectiveMonth, months
        );
        if rows is error {
            string customError = "Failed to fetch lead approval detail.";
            log:printError(customError, rows);
            return <HttpInternalServerError>{body: {message: customError}};
        }

        string[] allEmails = splitEmails(email);
        foreach database:LeadApprovalDetailRow detailRow in rows {
            foreach string e in splitEmails(detailRow.employeeEmail) {
                allEmails.push(e);
            }
        }
        map<string> nameMap = fetchNameMap(allEmails);

        string lowerLeadEmail = email.toLowerAscii();
        string leadName = nameMap[lowerLeadEmail] ?: deriveDisplayName(email);

        map<LeadClaimTypeBreakdownItem> breakdownMap = {};
        string firstDate = "";
        string lastDate = "";

        foreach database:LeadApprovalDetailRow row in rows {
            string mainCat = getMainCategory(row.expenseType);
            LeadClaimTypeBreakdownItem? existing = breakdownMap[mainCat];
            if existing is LeadClaimTypeBreakdownItem {
                breakdownMap[mainCat] = {
                    'type: existing.'type,
                    count: existing.count + 1,
                    totalAmount: existing.totalAmount + row.amount
                };
            } else {
                breakdownMap[mainCat] = {'type: mainCat, count: 1, totalAmount: row.amount};
            }

            string rowApprovedDate = row.approvedDate ?: "";
            if rowApprovedDate != "" {
                if firstDate == "" || rowApprovedDate < firstDate {
                    firstDate = rowApprovedDate;
                }
                if lastDate == "" || rowApprovedDate > lastDate {
                    lastDate = rowApprovedDate;
                }
            }
        }

        LeadClaimTypeBreakdownItem[] claimTypeBreakdown = breakdownMap.toArray();

        LeadApprovedClaimItem[] claims = [];
        foreach database:LeadApprovalDetailRow row in rows {
            string mainCat = getMainCategory(row.expenseType);
            string lowerEmpEmail = row.employeeEmail.toLowerAscii();
            claims.push({
                claimId: row.claimId,
                employeeName: nameMap[lowerEmpEmail] ?: deriveDisplayName(row.employeeEmail),
                claimType: mainCat,
                amount: row.amount,
                category: mainCat,
                submittedDate: row.submittedDate,
                approvedDate: row.approvedDate,
                status: row.status
            });
        }

        return {
            name: leadName,
            email: email,
            totalApproved: rows.length(),
            avgFrequencyPerDay: 0.0d,
            firstApprovedDate: firstDate == "" ? () : firstDate,
            lastApprovedDate: lastDate == "" ? () : lastDate,
            claimTypeBreakdown: claimTypeBreakdown,
            claims: claims
        };
    }

    # Get the health status of the service and its database dependency.
    #
    # + return - Health status response for the service
    resource function get health() returns json {
        string? dbError = database:getDatabaseHealth();
        string status = dbError is () ? "ok" : "degraded";

        return {
            status: status,
            database: {
                healthy: dbError is (),
                message: dbError
            }
        };
    }
}
