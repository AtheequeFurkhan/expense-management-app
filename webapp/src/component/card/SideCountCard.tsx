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
  color: string;
  subtitle?: string;
  type?: "claimed" | "unclaimed";
}

export default function SideCountCard({
  title,
  value,
  color,
  subtitle = "Employees",
  type,
}: SideCountCardProps) {
  const dotColor = type === "unclaimed" ? "#2e7d32" : type === "claimed" ? "#c62828" : color;
  const dotBg = type === "unclaimed" ? "#e8f5e9" : type === "claimed" ? "#ffebee" : `${color}18`;

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
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          backgroundColor: dotColor,
          borderRadius: "1px 1px 0 0",
        },
      }}
    >
      {/* Icon bg circle */}
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          backgroundColor: dotBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundColor: dotColor,
            opacity: 0.85,
          }}
        />
      </Box>

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
          color: dotColor,
          fontWeight: 700,
          fontSize: 48,
          lineHeight: 1.1,
          my: 0.5,
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          fontSize: 12,
          color: "text.disabled",
          mt: 0.5,
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}
