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

import ballerina/log;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;

configurable decimal connectTimeout = ?;
configurable decimal annualClaimLimit = ?;
configurable decimal claimRangeStep = ?;
configurable int lastYearClaimGracePeriodInDays = ?;
configurable DatabaseConfig expenseDatabaseConfig = ?;

type HealthCheckRow record {|
    int status;
|};

mysql:Client? expenseDbClient = ();
boolean expenseDbHealthy = false;
string? expenseDbStatusMessage = ();

# Function to create Expense DB connection.
#
# + return - If success returns MySQL DB client or error
public isolated function initializeExpenseDbClient() returns mysql:Client|error {
    mysql:Options expenseDbOptions = {
        ssl: {
            mode: mysql:SSL_REQUIRED
        },
        connectTimeout: connectTimeout
    };

    mysql:Client|error mysqlClient = new (
        host = expenseDatabaseConfig.host,
        port = expenseDatabaseConfig.port,
        user = expenseDatabaseConfig.user,
        password = expenseDatabaseConfig.password,
        database = expenseDatabaseConfig.database,
        connectionPool = expenseDatabaseConfig.connectionPool,
        options = expenseDbOptions
    );

    if mysqlClient is error {
        log:printError("Failed to initialize expense database client.", mysqlClient);
        return error("Error in connecting to the expense database!");
    }

    return mysqlClient;
}

public function getExpenseDbClient() returns mysql:Client|error {
    lock {
        mysql:Client? currentExpenseDbClient = expenseDbClient;
        if currentExpenseDbClient is mysql:Client {
            return currentExpenseDbClient;
        }

        mysql:Client|error dbClientOrError = initializeExpenseDbClient();
        if dbClientOrError is mysql:Client {
            expenseDbClient = dbClientOrError;
            expenseDbHealthy = true;
            expenseDbStatusMessage = ();
            return dbClientOrError;
        }

        expenseDbClient = ();
        expenseDbHealthy = false;
        expenseDbStatusMessage = dbClientOrError.message();
        return dbClientOrError;
    }
}

function refreshExpenseDbHealth() {
    mysql:Client|error dbClientOrError = getExpenseDbClient();
    if dbClientOrError is error {
        lock {
            expenseDbHealthy = false;
            expenseDbStatusMessage = dbClientOrError.message();
        }
        return;
    }

    HealthCheckRow|error healthCheckResult = dbClientOrError->queryRow(`SELECT 1 AS status`, HealthCheckRow);
    lock {
        if healthCheckResult is error {
            expenseDbHealthy = false;
            expenseDbStatusMessage = healthCheckResult.message();
            return;
        }

        expenseDbHealthy = true;
        expenseDbStatusMessage = ();
    }
}

public function getDatabaseHealth() returns json {
    refreshExpenseDbHealth();

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
