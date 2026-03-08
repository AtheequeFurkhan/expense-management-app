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

import expense_management.database as _;
import expense_management.entity;

import ballerina/http;
import ballerina/log;

configurable int port = 9090;
configurable string[] allowedUserRoles = ["wso2-everyone", "wso2-interns"];

service / on new http:Listener(port) {
    resource function get debugupstream() returns json {
        json|error appData = entity:opdClaimsClient->get("/app-data");
        json|error employees = entity:opdClaimsClient->get("/employees");

        return {
            appDataReachable: appData is json,
            appDataError: appData is error ? appData.message() : null,
            employeesReachable: employees is json,
            employeesError: employees is error ? employees.message() : null
        };
    }

    resource function get health() returns map<string> {
        return {
            status: "ok"
        };
    }

    # Fetch the app data required for initialization.
    # Proxies to the upstream OPD Claims Backend GET /app-data
    #
    # + year - Year filter
    # + month - Month filter
    # + return - JSON response from upstream or error
    resource function get app\-data(string year = "2026", string month = "current") returns json|http:InternalServerError {
        log:printInfo(string `GET /app-data year=${year}, month=${month}`);
        json|error response = entity:opdClaimsClient->get(string `/app-data?year=${year}&month=${month}`);
        if response is error {
            log:printError("Error fetching app-data from upstream", response);
            return <http:InternalServerError>{
                body: {
                    message: "Error occurred while fetching app data",
                    code: "APP_DATA_ERROR"
                }
            };
        }
        return response;
    }

    # Fetch user information.
    # Proxies to the upstream OPD Claims Backend GET /user-info
    #
    # + req - HTTP request (reads x-user-email header)
    # + return - JSON response from upstream or error
    resource function get user\-info(http:Request req) returns json|http:Unauthorized|http:InternalServerError {
        string|error userEmail = req.getHeader("x-user-email");
        if userEmail is error {
            log:printError("Missing x-user-email header");
            return http:UNAUTHORIZED;
        }

        log:printInfo(string `GET /user-info for ${userEmail}`);

        map<string|string[]> headers = {
            "x-user-email": userEmail
        };

        json|error response = entity:opdClaimsClient->get("/user-info", headers);
        if response is error {
            log:printError("Error fetching user-info from upstream", response);
            return <http:InternalServerError>{
                body: {
                    message: string `Error occurred while retrieving user data: ${userEmail}`,
                    code: "USER_INFO_ERROR"
                }
            };
        }
        return response;
    }

    # Search/filter OPD claims (read-only).
    # Proxies to the upstream OPD Claims Backend POST /search-claims
    #
    # + payload - Search filter parameters
    # + return - JSON response from upstream or error
    resource function post search\-claims(@http:Payload SearchClaimsRequest payload) returns json|http:InternalServerError {
        log:printInfo(string `POST /search-claims`, status = payload.status ?: "ALL", offset = payload.offset);

        // Remap maxResults back to "limit" for the upstream API
        json upstreamPayload = {
            status: payload.status,
            employeeEmail: payload.employeeEmail,
            fromDate: payload.fromDate,
            toDate: payload.toDate,
            year: payload.year,
            month: payload.month,
            "limit": payload.maxResults,
            offset: payload.offset
        };

        json|error response = entity:opdClaimsClient->post("/search-claims", upstreamPayload);
        if response is error {
            log:printError("Error fetching claims from upstream", response);
            return <http:InternalServerError>{
                body: {
                    message: "Error occurred while searching claims",
                    code: "SEARCH_CLAIMS_ERROR"
                }
            };
        }
        return response;
    }

    # Fetch the list of employees.
    # Proxies to the upstream OPD Claims Backend GET /employees
    #
    # + return - JSON response from upstream or error
    resource function get employees() returns json|http:InternalServerError {
        log:printInfo("GET /employees");

        json|error response = entity:opdClaimsClient->get("/employees");
        if response is error {
            log:printError("Error fetching employees from upstream", response);
            return <http:InternalServerError>{
                body: {
                    message: "Error occurred while fetching employees",
                    code: "EMPLOYEES_ERROR"
                }
            };
        }
        return response;
    }
}
