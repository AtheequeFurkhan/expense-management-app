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

configurable string hrServiceBaseUrl = "http://localhost:9094";
configurable string opdServiceBaseUrl = "http://localhost:9090";

configurable string hrServiceBearerToken = "";
configurable string opdServiceBearerToken = "";

configurable decimal annualClaimLimit = 40000.0d;

public final http:Client hrClient = checkpanic new (hrServiceBaseUrl);
public final http:Client opdClient = checkpanic new (opdServiceBaseUrl);

public function getHrServiceBearerToken() returns string {
    return hrServiceBearerToken;
}

public function getOpdServiceBearerToken() returns string {
    return opdServiceBearerToken;
}

public function getAnnualClaimLimit() returns decimal {
    return annualClaimLimit;
}

