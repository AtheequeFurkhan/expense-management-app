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
import ballerina/io;

public type ChoreoOAuthConfig record {|
    string clientId;
    string clientSecret;
    string tokenUrl;
|};

type TokenResponse record {|
    string access_token;
    string token_type?;
    int expires_in?;
|};

configurable string hrServiceBaseUrl = ?;
configurable string opdServiceBaseUrl = ?;
configurable ChoreoOAuthConfig oauthConfig = ?;
configurable decimal annualClaimLimit = 40000.0d;

public final http:Client hrClient = checkpanic new (hrServiceBaseUrl);
public final http:Client opdClient = checkpanic new (opdServiceBaseUrl);

public function getAnnualClaimLimit() returns decimal {
    return annualClaimLimit;
}

public function getAccessToken() returns string|error {
    io:println("========== getAccessToken START ==========");
    io:println(string `Token URL: ${oauthConfig.tokenUrl}`);
    io:println(string `Client ID length: ${oauthConfig.clientId.length()}`);
    io:println(string `Client Secret length: ${oauthConfig.clientSecret.length()}`);

    http:Client tokenClient = check new (oauthConfig.tokenUrl);
    io:println("Token client created.");

    http:Request request = new;
    request.setHeader("Content-Type", "application/x-www-form-urlencoded");
    request.setPayload(string `grant_type=client_credentials&client_id=${oauthConfig.clientId}&client_secret=${oauthConfig.clientSecret}`);

    io:println("Token request prepared.");

    http:Response response = check tokenClient->post("", request);
    io:println("Token response received.");
    io:println(string `Token response status code: ${response.statusCode}`);
    io:println(string `Token response content type: ${response.getContentType()}`);

    if response.statusCode >= 400 {
        string errorText = check response.getTextPayload();
        io:println("Token error response:");
        io:println(errorText);
        return error(string `Token request failed: ${errorText}`);
    }

    json payload = check response.getJsonPayload();
    io:println("Token JSON payload:");
    io:println(payload.toJsonString());

    TokenResponse tokenResponse = check payload.cloneWithType();
    io:println("Access token extracted successfully.");
    io:println("========== getAccessToken END ==========");

    return tokenResponse.access_token;
}
