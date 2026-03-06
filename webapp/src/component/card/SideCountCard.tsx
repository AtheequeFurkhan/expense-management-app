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

interface SideCountCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

export default function SideCountCard({
  title,
  value,
  subtitle = "Employees",
}: SideCountCardProps) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        flex: 1,
      }}
    >
      <Typography
        sx={{
          letterSpacing: 1,
          color: "text.disabled",
          fontWeight: 700,
          fontSize: 11,
          textTransform: "uppercase",
          mb: 0.5,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: "text.primary",
          fontWeight: 700,
          fontSize: 55,
          lineHeight: 1.1,
          my: 0.5,
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: "text.secondary",
          mt: 0.5,
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}
