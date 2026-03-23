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
configurable DatabaseConfig hrisDatabaseConfig = ?;

mysql:Options expenseDatabaseClientOptions = {
    ssl: {
        mode: mysql:SSL_REQUIRED
    },
    connectTimeout: connectTimeout
};

mysql:Options hrisDatabaseClientOptions = {
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

function initHrisDbClient() returns mysql:Client|error => new (
    host = hrisDatabaseConfig.host,
    port = hrisDatabaseConfig.port,
    user = hrisDatabaseConfig.user,
    password = hrisDatabaseConfig.password,
    database = hrisDatabaseConfig.database,
    connectionPool = hrisDatabaseConfig.connectionPool,
    options = hrisDatabaseClientOptions
);

mysql:Client? expenseDbClient = ();
mysql:Client? hrisDbClient = ();
boolean expenseDbHealthy = false;
boolean hrisDbHealthy = false;
string? expenseDbStatusMessage = ();
string? hrisDbStatusMessage = ();

function recordExpenseDbInitFailure(error err) {
    string message = err.message();
    if expenseDbStatusMessage is () || expenseDbStatusMessage != message {
        log:printError("Failed to initialize expense database client.", err);
    }
    expenseDbClient = ();
    expenseDbHealthy = false;
    expenseDbStatusMessage = message;
}

function recordHrisDbInitFailure(error err) {
    string message = err.message();
    if hrisDbStatusMessage is () || hrisDbStatusMessage != message {
        log:printError("Failed to initialize HRIS database client.", err);
    }
    hrisDbClient = ();
    hrisDbHealthy = false;
    hrisDbStatusMessage = message;
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

public function getHrisDbClient() returns mysql:Client|error {
    lock {
        mysql:Client? currentHrisDbClient = hrisDbClient;
        if currentHrisDbClient is mysql:Client {
            return currentHrisDbClient;
        }

        mysql:Client|error dbClientOrError = initHrisDbClient();
        if dbClientOrError is mysql:Client {
            hrisDbClient = dbClientOrError;
            hrisDbHealthy = true;
            hrisDbStatusMessage = ();
            return dbClientOrError;
        }

        recordHrisDbInitFailure(dbClientOrError);
        return dbClientOrError;
    }
}

public function getDatabaseHealth() returns json {
    if getExpenseDbClient() is error {
    }
    if getHrisDbClient() is error {
    }

    lock {
        return {
            healthy: expenseDbHealthy && hrisDbHealthy,
            dependencies: {
                expenseDb: {
                    healthy: expenseDbHealthy,
                    message: expenseDbStatusMessage
                },
                hrisDb: {
                    healthy: hrisDbHealthy,
                    message: hrisDbStatusMessage
                }
            }
        };
    }
}

public function isDatabaseHealthy() returns boolean {
    lock {
        return expenseDbHealthy && hrisDbHealthy;
    }
}

public isolated function getAnnualClaimLimit() returns decimal {
    return annualClaimLimit;
}
