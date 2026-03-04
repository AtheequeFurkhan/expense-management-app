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
import expense_management.entity as _;

import ballerina/http;
import ballerina/log;

configurable int port = 9090;
configurable string[] allowedUserRoles = ["wso2-everyone", "wso2-interns"];

service / on new http:Listener(port) {

    resource function get health() returns map<string> {
        return {
            status: "ok"
        };
    }

    resource function get app\-data(string year = "2026", string month = "current") returns AppData|error {
        log:printInfo(string `GET /app-data year=${year}, month=${month}`);
        return buildAppData(year, month);
    }

    resource function get apps\-data(string year = "2026", string month = "current") returns AppData|error {
        log:printInfo(string `GET /apps-data year=${year}, month=${month}`);
        return buildAppData(year, month);
    }

    resource function get user\-info(http:Request req) returns UserInfo|http:Unauthorized|error {
        string|error userHeader = req.getHeader("x-user-email");
        if userHeader is error {
            return http:UNAUTHORIZED;
        }
        return {
            email: userHeader,
            firstName: "John",
            lastName: "Doe",
            department: "Engineering",
            designation: "Software Engineer",
            roles: allowedUserRoles
        };
    }
}

function buildAppData(string year, string month) returns AppData {
    decimal totalClaimLimit = 150000.00d;
    decimal totalClaimedAmount = month == "current" ? 65210.00d : 73450.00d;
    decimal totalRemaining = totalClaimLimit - totalClaimedAmount;

    ClaimSummary claimSummary = {
        totalClaimLimit,
        totalClaimedAmount,
        totalRemaining
    };

    decimal lastYearClaimedAmount = 81245.00d;
    ClaimSummary lastYearClaimSummary = {
        totalClaimLimit,
        totalClaimedAmount: lastYearClaimedAmount,
        totalRemaining: totalClaimLimit - lastYearClaimedAmount
    };

    OpdClaimDraft draft = {
        transactions: [
            {
                amount: 2500.00d,
                comment: string `Consultation (${year}/${month})`,
                date: "2026-03-01",
                receiptUrl: "https://example.com/receipts/consultation-001"
            },
            {
                amount: 1800.00d,
                comment: "Lab test",
                date: "2026-03-02",
                receiptUrl: "https://example.com/receipts/lab-002"
            }
        ]
    };

    return {
        claimSummary,
        draft,
        lastYearClaimSummary
    };
}

