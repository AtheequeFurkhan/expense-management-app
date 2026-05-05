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
import { Box, Typography } from "@wso2/oxygen-ui";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationBar({ page, totalPages, onPageChange }: PaginationBarProps) {
  const btnSx = (disabled: boolean) => ({
    px: 1.5,
    py: 0.5,
    borderRadius: 1,
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.4 : 1,
    fontSize: 12,
    fontWeight: 600,
    color: "text.primary",
    "&:hover:not(:disabled)": { bgcolor: "action.hover" },
  });

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mt: 1.5,
        px: 0.5,
      }}
    >
      <Box
        component="button"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        sx={btnSx(page === 0)}
      >
        ← Prev
      </Box>
      <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
        {page + 1} / {Math.max(totalPages, 1)}
      </Typography>
      <Box
        component="button"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        sx={btnSx(page >= totalPages - 1)}
      >
        Next →
      </Box>
    </Box>
  );
}
