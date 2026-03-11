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
// specific language govern
import ballerina/http;
import ballerina/io;
import ballerina/lang.'float as floats;

public function getActiveEmployees() returns HREmployee[]|error {
    json graphqlPayload = {
        query: "query { employees(limit: 1000, offset: 0) { workEmail firstName lastName } }"
    };

    http:Request request = new;
    request.setJsonPayload(graphqlPayload);

    http:Response response = check hrClient->post(HR_GRAPHQL_PATH, request);
    json payload = check response.getJsonPayload();

    io:println("HR RESPONSE:");
    io:println(payload.toJsonString());

    return parseHREmployees(payload);
}

public function searchOpdClaims(int startYear, int endYear) returns OpdClaim[]|error {
    OpdClaim[] allClaims = [];
    int offset = 0;

    while true {
        json requestPayload = {
            startYear: startYear,
            endYear: endYear,
            'limit: DEFAULT_PAGE_SIZE,
            offset: offset
        };

        http:Request request = new;
        request.setHeader("Content-Type", "application/json");
        request.setHeader("X-JWT-Assertion", getOpdServiceBearerToken());
        request.setJsonPayload(requestPayload);

        http:Response response = check opdClient->post(OPD_SEARCH_CLAIMS_PATH, request);
        json responsePayload = check response.getJsonPayload();

        io:println("OPD RAW RESPONSE:");
        io:println(responsePayload.toJsonString());

        OpdClaim[] pageClaims = check parseOpdClaims(responsePayload);
        allClaims.push(...pageClaims);

        if pageClaims.length() < DEFAULT_PAGE_SIZE {
            break;
        }

        offset += DEFAULT_PAGE_SIZE;
    }

    return allClaims;
}

function parseHREmployees(json payload) returns HREmployee[]|error {
    if payload is map<json> {
        json? errorsNode = payload["errors"];
        if errorsNode is json[] && errorsNode.length() > 0 {
            return error(errorsNode.toJsonString());
        }

        json? dataNode = payload["data"];
        if dataNode is map<json> {
            json? employeesNode = dataNode["employees"];
            if employeesNode is json[] {
                HREmployee[] employees = [];
                foreach json item in employeesNode {
                    employees.push(check parseHREmployee(item));
                }
                return employees;
            }
        }
    }

    return [];
}

function parseHREmployee(json item) returns HREmployee|error {
    if item is map<json> {
        string email = check getRequiredString(item, "workEmail");
        return {
            email: email,
            firstName: getOptionalString(item, "firstName"),
            lastName: getOptionalString(item, "lastName"),
            department: getOptionalString(item, "department"),
            company: getOptionalString(item, "company"),
            location: getOptionalString(item, "location"),
            status: getOptionalString(item, "status")
        };
    }

    return error("Invalid HR employee payload.");
}

function parseOpdClaims(json payload) returns OpdClaim[]|error {
    if payload is map<json> {
        json? bodyNode = payload["body"];
        if bodyNode is json[] {
            OpdClaim[] claims = [];
            foreach json item in bodyNode {
                claims.push(check parseOpdClaim(item));
            }
            return claims;
        }
    } else if payload is json[] {
        OpdClaim[] claims = [];
        foreach json item in payload {
            claims.push(check parseOpdClaim(item));
        }
        return claims;
    }

    return [];
}

function parseOpdClaim(json item) returns OpdClaim|error {
    if item is map<json> {
        string id = getOptionalString(item, "id") ?: "";
        string employeeEmail = getOptionalString(item, "employeeEmail") ?: "";
        string createdDate = getOptionalString(item, "createdDate")
            ?: getOptionalString(item, "submittedDate")
            ?: getOptionalString(item, "date")
            ?: "";

        string? status = getOptionalString(item, "status");
        json? statusDetailNode = item["statusDetail"];
        if status is () && statusDetailNode is map<json> {
            status = getOptionalString(statusDetailNode, "status");
        }

        boolean isGracePeriod = getOptionalBoolean(item, "isGracePeriod")
            ?: getOptionalBoolean(item, "lastYearClaim")
            ?: getOptionalBoolean(item, "isLastYearClaim")
            ?: false;

        decimal amount = check resolveClaimAmount(item);

        return {
            id: id,
            employeeEmail: employeeEmail,
            amount: amount,
            createdDate: createdDate,
            status: status,
            isGracePeriod: isGracePeriod
        };
    }

    return error("Invalid OPD claim payload.");
}

function resolveClaimAmount(map<json> claim) returns decimal|error {
    decimal? directAmount = getOptionalDecimal(claim, "amount");
    if directAmount is decimal {
        return directAmount;
    }

    decimal? totalAmount = getOptionalDecimal(claim, "totalAmount");
    if totalAmount is decimal {
        return totalAmount;
    }

    json? transactionsNode = claim["transactions"];
    if transactionsNode is json[] {
        decimal total = 0.0d;
        foreach json tx in transactionsNode {
            if tx is map<json> {
                decimal? txAmount = getOptionalDecimal(tx, "amount");
                if txAmount is decimal {
                    total += txAmount;
                }
            }
        }
        return total;
    }

    return 0.0d;
}

function getRequiredString(map<json> data, string key) returns string|error {
    json? value = data[key];
    if value is string {
        return value;
    }

    return error(string `Missing required string field: ${key}`);
}

function getOptionalString(map<json> data, string key) returns string? {
    json? value = data[key];
    if value is string {
        return value;
    }

    return ();
}

function getOptionalBoolean(map<json> data, string key) returns boolean? {
    json? value = data[key];
    if value is boolean {
        return value;
    }

    return ();
}

function getOptionalDecimal(map<json> data, string key) returns decimal? {
    json? value = data[key];

    if value is decimal {
        return value;
    }

    if value is int {
        return <decimal>value;
    }

    if value is float {
        return <decimal>value;
    }

    if value is string {
        float|error parsed = floats:fromString(value);
        if parsed is float {
            return <decimal>parsed;
        }
    }

    return ();
}

