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

# Derive a human-readable display name from an email address.
#
# + email - Email address to derive a name from
# + return - Capitalized name derived from the email prefix
isolated function deriveDisplayName(string email) returns string {
    string prefix = email;
    int? atIndex = email.indexOf("@");
    if atIndex is int {
        prefix = email.substring(0, atIndex);
    }

    string[] parts = [];
    string current = "";
    foreach string:Char ch in prefix {
        if ch == "." || ch == "_" || ch == "-" {
            if current.length() > 0 {
                parts.push(current);
            }
            current = "";
        } else {
            current = current + ch;
        }
    }
    if current.length() > 0 {
        parts.push(current);
    }

    string result = "";
    foreach int i in 0 ..< parts.length() {
        if i > 0 {
            result = result + " ";
        }
        result = result + capitalizeWord(parts[i]);
    }
    return result;
}

# Capitalize the first letter of a word.
#
# + word - Word to capitalize
# + return - Capitalized word
isolated function capitalizeWord(string word) returns string {
    if word.length() == 0 {
        return word;
    }
    string first = word.substring(0, 1).toUpperAscii();
    if word.length() == 1 {
        return first;
    }
    return first + word.substring(1);
}

# Extract the main expense category from a composite expense type label.
#
# + expenseType - Full expense type label (e.g. "Foreign Travel - Accommodation")
# + return - Part before the first separator, or the full string if no separator is found
isolated function getMainCategory(string expenseType) returns string {
    foreach string sep in [" - ", " \u{2013} ", " \u{2014} "] {
        int? idx = expenseType.indexOf(sep);
        if idx is int {
            return expenseType.substring(0, idx);
        }
    }
    return expenseType;
}


# Split a comma-separated email field into individual trimmed email addresses.
# Handles the case where lead_email stores multiple approvers as "a@x.com,b@x.com".
#
# + emailField - Raw email field value, possibly comma-separated
# + return - Array of individual trimmed email addresses, excluding empty strings
isolated function splitEmails(string emailField) returns string[] {
    string[] emails = [];
    foreach string part in re`,`.split(emailField) {
        string trimmed = part.trim();
        if trimmed.length() > 0 {
            emails.push(trimmed);
        }
    }
    return emails;
}
