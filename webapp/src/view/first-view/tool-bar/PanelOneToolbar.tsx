// filepath: /Users/atheeque/Desktop/expense-management-app/webapp/src/view/first-view/tool-bar/PanelOneToolbar.tsx
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
import { Box, Button, TextField } from "@wso2/oxygen-ui";
import { Search } from "@wso2/oxygen-ui-icons-react";

interface PanelOneToolbarProps {
  onSearch?: (query: string) => void;
  onAdd?: () => void;
}

function PanelOneToolbar({ onSearch, onAdd }: PanelOneToolbarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
        gap: 2,
      }}
    >
      <TextField
        size="small"
        placeholder="Search..."
        slotProps={{
          input: {
            startAdornment: <Search size={18} style={{ marginRight: 8 }} />,
          },
        }}
        onChange={(e) => onSearch?.(e.target.value)}
      />
      {onAdd && (
        <Button variant="contained" onClick={onAdd}>
          Add New
        </Button>
      )}
    </Box>
  );
}

export default PanelOneToolbar;