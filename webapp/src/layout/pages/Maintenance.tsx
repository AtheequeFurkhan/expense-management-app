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
import { Alert, Box, Skeleton, Typography } from "@wso2/oxygen-ui";

type UnderDevelopmentProps = {
  isLoading?: boolean;
};

export default function UnderDevelopment({ isLoading = false }: UnderDevelopmentProps) {
  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 520 }}>
        {isLoading ? (
          <Skeleton height={48} />
        ) : (
          <Alert severity="warning" sx={{ width: "100%", textAlign: "center" }}>
            <Typography sx={{ fontSize: 14 }}>
              This page is currently under development. Please check back soon!
            </Typography>
          </Alert>
        )}
      </Box>
    </Box>
  );
}
