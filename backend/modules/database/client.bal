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

configurable decimal connectTimeout = ?;
configurable decimal annualClaimLimit = ?;
configurable decimal claimRangeStep = ?;
configurable int lastYearClaimGracePeriodInDays = ?;
configurable DatabaseConfig expenseDatabaseConfig = ?;

# Database health check query result.
#
# + status - field description
type HealthCheckRow record {|
    int status;
|};

mysql:Client? expenseDbClient = ();
boolean expenseDbHealthy = false;
string? expenseDbStatusMessage = ();

# Get the shared expense database client, initializing it lazily when needed.
#
# + return - Cached MySQL DB client if initialization succeeds, otherwise an error
public function getExpenseDbClient() returns mysql:Client|error {
    lock {
        mysql:Client? currentExpenseDbClient = expenseDbClient;
        if currentExpenseDbClient is mysql:Client {
            return currentExpenseDbClient;
        }

        mysql:Options expenseDbOptions = {
            ssl: {
                mode: mysql:SSL_REQUIRED
            },
            connectTimeout: connectTimeout
        };

        mysql:Client|error dbClientOrError = new (
            host = expenseDatabaseConfig.host,
            port = expenseDatabaseConfig.port,
            user = expenseDatabaseConfig.user,
            password = expenseDatabaseConfig.password,
            database = expenseDatabaseConfig.database,
            connectionPool = expenseDatabaseConfig.connectionPool,
            options = expenseDbOptions
        );
        if dbClientOrError is mysql:Client {
            expenseDbClient = dbClientOrError;
            expenseDbHealthy = true;
            expenseDbStatusMessage = ();
            return dbClientOrError;
        }

        expenseDbClient = ();
        expenseDbHealthy = false;
        expenseDbStatusMessage = "Error in connecting to the expense database!";
        return dbClientOrError;
    }
}

# Refresh the cached health status of the expense database.
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

# Get the health status of the expense database dependency.
#
# + return - Health information for the expense database
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

# Check whether the expense database dependency is currently healthy.
#
# + return - `true` if the expense database is healthy, otherwise `false`
public function isDatabaseHealthy() returns boolean {
    lock {
        return expenseDbHealthy;
    }
}

# Get the configured annual claim limit used for OPD summaries.
#
# + return - Annual claim limit
public function getAnnualClaimLimit() returns decimal => annualClaimLimit;

# Get the configured claim range step used for OPD summary charts.
#
# + return - Claim range step
public function getClaimRangeStep() returns decimal => claimRangeStep;

# Get the configured grace period length used for previous-year OPD claims.
#
# + return - Grace period length in days
public function getLastYearClaimGracePeriodInDays() returns int => lastYearClaimGracePeriodInDays;
