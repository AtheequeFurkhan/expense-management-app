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

final cache:Cache cache = new ({
    capacity: 2000,
    defaultMaxAge: 1800.0,
    cleanupInterval: 900.0
});

@display {
    label: "Expense Management App",
    id: "domain/expense-management-app"
}
service class ErrorInterceptor {
    *http:ResponseErrorInterceptor;

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

service http:InterceptableService / on new http:Listener(9090) {

    public function createInterceptors() returns http:Interceptor[] =>
        [new authorization:JwtInterceptor(), new ErrorInterceptor()];

    resource function get app\-config() returns AppConfig => appConfig;

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
            string customError = string `Error occurred while retrieving user data: ${userInfo.email}!`;
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
        if authorization:checkPermissions([authorization:authorizedRoles.headPeopleOperationsRole], userInfo.groups) {
            privileges.push(authorization:HEAD_PEOPLE_OPERATIONS_PRIVILEGE);
        }

        UserInfoResponse userInfoResponse = {...loggedInUser, privileges};

        error? cacheError = cache.put(userInfo.email, userInfoResponse);
        if cacheError is error {
            log:printError("An error occurred while writing user info to the cache", cacheError);
        }
        return userInfoResponse;
    }

    resource function get opd\-claims(http:RequestContext ctx, int? year = (), int? month = (), int months = 1)
        returns database:OpdClaimSummaryResponse|http:Forbidden|http:BadRequest|database:HttpInternalServerError {

        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            return <http:BadRequest>{
                body: {
                    message: "User information header not found!"
                }
            };
        }

        if year is int && year <= 0 {
            return <http:BadRequest>{
                body: {
                    message: "Invalid year. Expected a positive value."
                }
            };
        }

        if month is int && (month < 1 || month > 12) {
            return <http:BadRequest>{
                body: {
                    message: "Invalid month. Expected a value between 1 and 12."
                }
            };
        }

        if months < 1 {
            return <http:BadRequest>{
                body: {
                    message: "Invalid months. Expected a value greater than or equal to 1."
                }
            };
        }

        if !authorization:checkPermissions([
            authorization:authorizedRoles.employeeRole,
            authorization:authorizedRoles.headPeopleOperationsRole
        ], userInfo.groups) {
            return <http:Forbidden>{
                body: {
                    message: "Insufficient privileges!"
                }
            };
        }

        time:Utc utcNow = time:utcNow();
        time:Civil|error civilTime = time:utcToCivil(utcNow);
        if civilTime is error {
            string customError = "Failed to resolve the current date for OPD claim summary defaults.";
            log:printError(customError, civilTime);
            return <database:HttpInternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        int effectiveYear = year ?: civilTime.year;
        int effectiveMonth = month ?: civilTime.month;

        database:OpdClaimSummaryResponse|error summary = database:getOpdClaimSummary(
            effectiveYear,
            effectiveMonth,
            months
        );
        if summary is database:OpdClaimSummaryResponse {
            return summary;
        }

        string customError = "Failed to build OPD claim summary.";
        log:printError(customError, summary);
        return <database:HttpInternalServerError>{
            body: {
                message: customError
            }
        };
    }

    resource function get health() returns json|http:ServiceUnavailable {
        json databaseHealth = database:getDatabaseHealth();
        if database:isDatabaseHealthy() {
            return {
                status: "ok",
                database: databaseHealth
            };
        }

        return <http:ServiceUnavailable>{
            body: {
                status: "degraded",
                database: databaseHealth
            }
        };
    }
}
