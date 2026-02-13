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
import { Wrench } from "@wso2/oxygen-ui-icons-react";

function Maintenance() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        textAlign: "center",
      }}
    >
      <Wrench size={64} style={{ marginBottom: 16, opacity: 0.6 }} />
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Under Maintenance
      </Typography>
      <Typography variant="body1" color="text.secondary">
        We are currently performing maintenance. Please check back later.
      </Typography>
    </Box>
  );
}

export default Maintenance;