import ballerina/http;
import ballerina/io;
import ballerina/lang.'float as floats;
import ballerina/lang.'string as strings;

public function getActiveEmployees() returns HREmployee[]|error {
    string accessToken = check getAccessToken();

    json graphqlPayload = {
        query: "query { employees(filter:{location:\"Sri Lanka\"}, limit:1000, offset:0) { workEmail firstName lastName location } }"
    };

    http:Request request = new;
    request.setHeader("Content-Type", "application/json");
    request.setHeader("Authorization", string `Bearer ${accessToken}`);
    request.setJsonPayload(graphqlPayload);

    http:Response response = check hrClient->post(HR_GRAPHQL_PATH, request);
    json payload = check response.getJsonPayload();

    return parseHREmployees(payload);
}

public function searchOpdClaims(int startYear, int endYear) returns OpdClaim[]|error {
    io:println("========== searchOpdClaims START ==========");
    io:println(string `Input startYear: ${startYear}, endYear: ${endYear}`);

    string accessToken = check getAccessToken();
    io:println("Access token fetched successfully.");
    io:println(string `Access token length: ${accessToken.length()}`);

    OpdClaim[] allClaims = [];
    int offset = 0;

    while true {
        io:println("------------------------------------------");
        io:println(string `Starting loop with offset: ${offset}`);

        json requestPayload = {
            startYear: startYear,
            endYear: endYear,
            'limit: DEFAULT_PAGE_SIZE,
            offset: offset
        };

        io:println("Request payload:");
        io:println(requestPayload.toJsonString());

        http:Request request = new;
        request.setHeader("Content-Type", "application/json");
        request.setHeader("Authorization", string `Bearer ${accessToken}`);
        request.setJsonPayload(requestPayload);

        io:println("HTTP request prepared.");
        io:println(string `POST path: ${OPD_SEARCH_CLAIMS_PATH}`);

        http:Response response = check opdClient->post(OPD_SEARCH_CLAIMS_PATH, request);
        io:println("HTTP response received.");

        int statusCode = response.statusCode;
        io:println(string `Response status code: ${statusCode}`);

        string contentType = response.getContentType();
        io:println(string `Response content type: ${contentType}`);

        if statusCode >= 400 {
            io:println("Response status indicates error. Attempting to read text payload.");
            string errorText = check response.getTextPayload();
            io:println("Error text payload:");
            io:println(errorText);
            return error(string `Failed to fetch OPD claims: ${errorText}`);
        }

        if !strings:includes(contentType, "application/json") {
            io:println("Response is not JSON. Attempting to read text payload.");
            string responseText = check response.getTextPayload();
            io:println("Non-JSON response text:");
            io:println(responseText);
            return error(string `Expected JSON from OPD claims service, but received: ${responseText}`);
        }

        io:println("Attempting to parse JSON payload.");
        json responsePayload = check response.getJsonPayload();

        io:println("Parsed JSON payload successfully.");
        io:println("OPD RAW RESPONSE:");
        io:println(responsePayload.toJsonString());

        if responsePayload is map<json> {
            json? message = responsePayload["message"];
            if message is string {
                io:println("Response contains message field interpreted as error:");
                io:println(message);
                return error(string `Failed to fetch OPD claims: ${message}`);
            }
        }

        io:println("Attempting to parse OPD claims array.");
        OpdClaim[] pageClaims = check parseOpdClaims(responsePayload);

        io:println(string `Parsed pageClaims count: ${pageClaims.length()}`);
        allClaims.push(...pageClaims);
        io:println(string `Accumulated allClaims count: ${allClaims.length()}`);

        if pageClaims.length() < DEFAULT_PAGE_SIZE {
            io:println("Last page reached. Exiting loop.");
            break;
        }

        offset += DEFAULT_PAGE_SIZE;
        io:println(string `Moving to next offset: ${offset}`);
    }

    io:println(string `searchOpdClaims completed successfully. Total claims: ${allClaims.length()}`);
    io:println("========== searchOpdClaims END ==========");

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
            status: status ?: "UNKNOWN",
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
