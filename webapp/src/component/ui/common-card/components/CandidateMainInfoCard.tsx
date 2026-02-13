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
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
} from "@wso2/oxygen-ui";
import { Mail, Phone } from "@wso2/oxygen-ui-icons-react";

interface CandidateMainInfoCardProps {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  avatarUrl?: string;
}

function CandidateMainInfoCard({
  name,
  email,
  phone,
  department,
  position,
  avatarUrl,
}: CandidateMainInfoCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar src={avatarUrl} sx={{ width: 64, height: 64 }}>
            {name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {name}
            </Typography>
            {position && (
              <Typography variant="body2" color="text.secondary">
                {position}
              </Typography>
            )}
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Mail size={16} />
              <Typography variant="body2">{email}</Typography>
            </Box>
          </Grid>
          {phone && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone size={16} />
                <Typography variant="body2">{phone}</Typography>
              </Box>
            </Grid>
          )}
          {department && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Department
              </Typography>
              <Typography variant="body2">{department}</Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default CandidateMainInfoCard;