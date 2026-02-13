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
import { Avatar, Box, Card, CardContent, Chip, Typography } from "@wso2/oxygen-ui";

interface CandidateInfoCardProps {
  name: string;
  email: string;
  status?: string;
  avatarUrl?: string;
}

function CandidateInfoCard({ name, email, status, avatarUrl }: CandidateInfoCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={avatarUrl} sx={{ width: 48, height: 48 }}>
            {name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {email}
            </Typography>
          </Box>
          {status && (
            <Chip
              label={status}
              size="small"
              color={status === "Active" ? "success" : "default"}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default CandidateInfoCard;