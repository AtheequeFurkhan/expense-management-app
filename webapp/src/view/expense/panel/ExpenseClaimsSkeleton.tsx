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

export default function ExpenseClaimsSkeleton() {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "background.default",
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Filter button skeleton */}
      <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1, mb: 2 }} />

      {/* 3 stat cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={130}
            sx={{ borderRadius: 1 }}
            animation="wave"
          />
        ))}
      </Box>

      {/* Row 2: Two chart cards side by side */}
      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 1 }} animation="wave" />
        <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 1 }} animation="wave" />
      </Box>

      {/* Row 3: Full-width chart card */}
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} animation="wave" />
      </Box>

      {/* Row 4: Two chart cards side by side */}
      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 1 }} animation="wave" />
        <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 1 }} animation="wave" />
      </Box>
    </Box>
  );
}
