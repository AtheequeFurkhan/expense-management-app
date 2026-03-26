import ballerina/log;
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

import ballerinax/mysql;
import ballerinax/mysql.driver as _;

configurable decimal connectTimeout = 10.0;
configurable decimal annualClaimLimit = 40000.0;
configurable DatabaseConfig expenseDatabaseConfig = ?;

mysql:Options expenseDatabaseClientOptions = {
    ssl: {
        mode: mysql:SSL_REQUIRED
    },
    connectTimeout: connectTimeout
};

function initExpenseDbClient() returns mysql:Client|error => new (
    host = expenseDatabaseConfig.host,
    port = expenseDatabaseConfig.port,
    user = expenseDatabaseConfig.user,
    password = expenseDatabaseConfig.password,
    database = expenseDatabaseConfig.database,
    connectionPool = expenseDatabaseConfig.connectionPool,
    options = expenseDatabaseClientOptions
);

mysql:Client? expenseDbClient = ();
boolean expenseDbHealthy = false;
string? expenseDbStatusMessage = ();

function recordExpenseDbInitFailure(error err) {
    string message = err.message();
    if expenseDbStatusMessage is () || expenseDbStatusMessage != message {
        log:printError("Failed to initialize expense database client.", err);
    }
    expenseDbClient = ();
    expenseDbHealthy = false;
    expenseDbStatusMessage = message;
}

public function getExpenseDbClient() returns mysql:Client|error {
    lock {
        mysql:Client? currentExpenseDbClient = expenseDbClient;
        if currentExpenseDbClient is mysql:Client {
            return currentExpenseDbClient;
        }

        mysql:Client|error dbClientOrError = initExpenseDbClient();
        if dbClientOrError is mysql:Client {
            expenseDbClient = dbClientOrError;
            expenseDbHealthy = true;
            expenseDbStatusMessage = ();
            return dbClientOrError;
        }

        recordExpenseDbInitFailure(dbClientOrError);
        return dbClientOrError;
    }
}

public function getDatabaseHealth() returns json {
    if getExpenseDbClient() is error {
    }

    lock {
        return {
            healthy: expenseDbHealthy,
            dependencies: {
                expenseDb: {
                    healthy: expenseDbHealthy,
                    message: expenseDbStatusMessage
                }
            }
        };
    }
}

public function isDatabaseHealthy() returns boolean {
    lock {
        return expenseDbHealthy;
    }
}

public isolated function getAnnualClaimLimit() returns decimal {
    return annualClaimLimit;
}
