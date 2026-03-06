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

import { Box, Skeleton, Typography } from "@wso2/oxygen-ui";
import { TriangleAlert } from "@wso2/oxygen-ui-icons-react";

type UnderDevelopmentProps = {
  isLoading?: boolean;
};

export default function UnderDevelopment({ isLoading = false }: UnderDevelopmentProps) {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 150px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 420 }}>
        {isLoading ? (
          <>
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 1.5 }} />
            <Skeleton width="60%" height={20} sx={{ mx: "auto" }} />
          </>
        ) : (
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              transition: "box-shadow 0.25s ease, transform 0.25s ease",
              "&:hover": {
                boxShadow: 4,
                transform: "translateY(-2px)",
              },
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "#fff8e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TriangleAlert size={28} color="#f57c00" />
            </Box>

            {/* Title */}
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: "text.primary" }}>
              Under Development
            </Typography>

            {/* Message */}
            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              This page is currently under development.
              <br />
              Please check back soon!
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
