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
import { useAuthContext } from "@asgardeo/auth-react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  useTheme,
} from "@wso2/oxygen-ui";
import { LogIn } from "@wso2/oxygen-ui-icons-react";

import logoSrc from "@src/assets/images/WSO2-Logo-White.png";

export default function LoginScreen() {
  const theme = useTheme();
  const { signIn } = useAuthContext();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            boxShadow: theme.shadows[8],
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3} alignItems="center">
              {/* Logo */}
              <img src={logoSrc} alt="WSO2 Logo" style={{ height: 32 }} />

              {/* Title */}
              <Stack spacing={1} alignItems="center" textAlign="center">
                <Typography variant="h4" fontWeight="bold">
                  Expense Management Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to your account to continue
                </Typography>
              </Stack>

              {/* Login Button */}
              <Button
                variant="contained"
                size="large"
                startIcon={<LogIn size={20} />}
                onClick={() => signIn()}
                fullWidth
                sx={{ mt: 2 }}
              >
                Sign In with Asgardeo
              </Button>

              {/* Footer */}
              <Typography variant="caption" color="text.secondary" sx={{ pt: 2 }}>
                © 2026 WSO2 LLC. All rights reserved.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
