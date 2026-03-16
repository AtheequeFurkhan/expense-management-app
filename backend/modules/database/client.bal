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

configurable DatabaseConfig databaseConfig = ?;
configurable decimal connectTimeout = 10.0;
configurable decimal annualClaimLimit = 40000.0;

mysql:Options databaseClientOptions = {
    ssl: {
        mode: mysql:SSL_REQUIRED
    },
    connectTimeout: connectTimeout
};

function initSampleDbClient() returns mysql:Client|error => new (
    host = databaseConfig.host,
    port = databaseConfig.port,
    user = databaseConfig.user,
    password = databaseConfig.password,
    database = databaseConfig.database,
    connectionPool = databaseConfig.connectionPool,
    options = databaseClientOptions
);

public final mysql:Client databaseClient = checkpanic initSampleDbClient();

public isolated function getAnnualClaimLimit() returns decimal {
    return annualClaimLimit;
}
