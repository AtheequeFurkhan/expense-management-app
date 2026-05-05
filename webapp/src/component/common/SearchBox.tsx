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
import { Box } from "@wso2/oxygen-ui";
import { Search } from "lucide-react";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBox({ value, onChange, placeholder = "Search..." }: SearchBoxProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 0.8,
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
        mb: 1.5,
      }}
    >
      <Search size={16} style={{ color: "var(--mui-palette-text-disabled, #888)", flexShrink: 0 }} />
      <Box
        component="input"
        type="text"
        role="searchbox"
        aria-label={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        sx={{
          flex: 1,
          border: "none",
          outline: "none",
          bgcolor: "transparent",
          fontSize: 13,
          color: "text.primary",
          "::placeholder": { color: "text.disabled" },
        }}
      />
    </Box>
  );
}
