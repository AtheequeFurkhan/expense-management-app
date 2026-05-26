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
import ballerina/sql;

# Retrieve all application settings stored in the database.
#
# + return - Map of setting keys to their string values, or an error
public function getAppSettings() returns map<string>|error {
    stream<AppSettingRow, sql:Error?> resultStream = expenseDbClient->query(
        `SELECT setting_key AS settingKey, setting_value AS settingValue FROM app_settings`,
        AppSettingRow
    );
    AppSettingRow[] rows = check from AppSettingRow row in resultStream select row;

    map<string> settings = {};
    foreach AppSettingRow row in rows {
        settings[row.settingKey] = row.settingValue;
    }
    return settings;
}

# Insert or update a single application setting.
#
# + key - Setting identifier
# + value - Setting value as a string
# + updatedBy - Email of the administrator making the change
# + return - Error if the operation fails
public function upsertAppSetting(string key, string value, string updatedBy) returns error? {
    _ = check expenseDbClient->execute(
        `INSERT INTO app_settings (setting_key, setting_value, updated_by)
         VALUES (${key}, ${value}, ${updatedBy})
         ON DUPLICATE KEY UPDATE setting_value = ${value}, updated_by = ${updatedBy}`
    );
}
