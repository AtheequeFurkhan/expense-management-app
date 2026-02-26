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

import maintenanceGif from "@assets/images/maintenance.gif";

export default function UnderDevelopment() {
  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        gap: 2,
      }}
    >
      <img src={maintenanceGif} alt="Under Development" style={{ width: 180, marginBottom: 24 }} />
      <Typography variant="h4" color="text.secondary">
        🚧 Under Development 🚧
      </Typography>
      <Typography color="text.secondary">
        This page is currently under development. Please check back soon!
      </Typography>
    </Box>
  );
}
