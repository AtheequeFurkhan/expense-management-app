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
import { Box, Skeleton } from "@wso2/oxygen-ui";

function AppSkeleton() {
  return (
    <Box sx={{ p: 2, width: "100%" }}>
      <Skeleton height={40} width="35%" sx={{ mb: 2 }} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gap: 2,
          mb: 2,
        }}
      >
        <Skeleton height={110} sx={{ gridColumn: "span 3" }} />
        <Skeleton height={110} sx={{ gridColumn: "span 3" }} />
        <Skeleton height={110} sx={{ gridColumn: "span 3" }} />
        <Skeleton height={110} sx={{ gridColumn: "span 3" }} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gap: 2,
        }}
      >
        <Skeleton height={260} sx={{ gridColumn: "span 8" }} />
        <Skeleton height={260} sx={{ gridColumn: "span 4" }} />
      </Box>
    </Box>
  );
}

export default AppSkeleton;
