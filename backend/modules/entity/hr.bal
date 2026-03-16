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

# Fetch Employee Data.
#
# + workEmail - WSO2 email address
# + return - Employee | Error
public isolated function fetchEmployeesBasicInfo(string workEmail) returns Employee|error {
    string document = string `
        query employeeQuery ($workEmail: String!) {
            employee(email: $workEmail) {
                employeeId,
                workEmail,
                firstName,
                lastName,
                jobRole,
                employeeThumbnail
            }
        }
    `;

    json requestPayload = {
        query: document,
        variables: {
            workEmail: workEmail
        }
    };

    http:Request request = new;
    request.setJsonPayload(requestPayload);

    http:Response response = check hrClient->post("", request);
    json payload = check response.getJsonPayload();

    if payload is map<json> {
        json? errorsNode = payload["errors"];
        if errorsNode is json[] && errorsNode.length() > 0 {
            return error(errorsNode.toJsonString());
        }
    }

    EmployeeResponse|error parsed = payload.cloneWithType(EmployeeResponse);
    if parsed is error {
        return parsed;
    }

    return parsed.data.employee;
}
