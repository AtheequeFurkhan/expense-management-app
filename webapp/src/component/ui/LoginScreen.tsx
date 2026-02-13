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
import { Box, Button, Card, CardContent, Typography, useTheme } from "@wso2/oxygen-ui";
import { LogIn } from "@wso2/oxygen-ui-icons-react";
import { useAuthContext } from "@asgardeo/auth-react";

function LoginScreen() {
  const theme = useTheme();
  const { signIn } = useAuthContext();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Welcome
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to continue
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<LogIn size={20} />}
            onClick={() => signIn()}
            fullWidth
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginScreen;