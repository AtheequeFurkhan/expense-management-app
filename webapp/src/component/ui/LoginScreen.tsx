/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  Box,
  ColorSchemeToggle,
  Grid,
  Paper,
  Stack,
  Typography,
  useColorScheme,
} from "@wso2/oxygen-ui";
import { CopyPlus, Landmark, Scale, ShieldPlus } from "lucide-react";

import { type JSX } from "react";

import EmaIllustration from "@assets/images/EMA.png";
import LogoLight from "@assets/images/WSO2-Logo-Black.png";
import LogoDark from "@assets/images/WSO2-Logo-White.png";

import LoginBox from "../common/LoginBox";

export default function LoginPage(): JSX.Element {
  const { colorScheme } = useColorScheme();
  const logoSrc = colorScheme === "dark" ? LogoDark : LogoLight;
  const sloganListItems: {
    icon: JSX.Element;
    title: string;
  }[] = [
    {
      icon: <Landmark size={20} />,
      title: "Real-Time Claim Visibility",
    },
    {
      icon: <ShieldPlus size={22} />,
      title: "Accurate Finance Review Workflows",
    },
    {
      icon: <CopyPlus size={22} />,
      title: "Policy-Aligned Expense Oversight",
    },
    {
      icon: <Scale size={22} />,
      title: "Faster Reimbursement Decisions",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          height: 88,
          px: { xs: 3, md: 5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box component="img" src={logoSrc} alt="WSO2 Logo" sx={{ height: 28, width: "auto" }} />
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>Expense Management Portal</Typography>
        </Box>
        <ColorSchemeToggle />
      </Box>

      <Grid
        container
        sx={{
          flex: 1,
          p: { xs: 2, md: 2.5 },
        }}
      >
        <Grid
          size={{ xs: 12, md: 8.2 }}
          sx={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "flex-start",
            p: { xs: 3, md: 6 },
            position: "relative",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: { xs: 3, md: "24px 0 0 24px" },
            bgcolor: "background.paper",
            background:
              "radial-gradient(circle at 20% 30%, rgba(96, 120, 255, 0.12), transparent 28%), radial-gradient(circle at 68% 24%, rgba(255, 148, 54, 0.16), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,249,252,0.98) 100%)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0.18,
              backgroundImage:
                "radial-gradient(circle at 10% 15%, #6a6f7d 0 2px, transparent 3px), radial-gradient(circle at 45% 10%, #6a6f7d 0 2px, transparent 3px), radial-gradient(circle at 72% 22%, #6a6f7d 0 2px, transparent 3px), radial-gradient(circle at 82% 56%, #6a6f7d 0 2px, transparent 3px)",
              pointerEvents: "none",
            }}
          />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Stack
              direction="column"
              alignItems="start"
              gap={2}
              maxWidth={700}
              display={{ xs: "none", md: "flex" }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 0,
                  mt: 8,
                  maxWidth: 640,
                  letterSpacing: "-0.02em",
                  fontSize: { md: 14, lg: 20 },
                  lineHeight: 1.15,
                }}
              >
                Welcome to the WSO2 Expense Management Dashaboard
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontSize: 15, maxWidth: 560, mt: -1 }}
              >
                Manage claims, track employee submissions, and review finance operations in one
                place.
              </Typography>
              <Stack sx={{ gap: 3, mt: 2 }}>
                {sloganListItems.map((item) => (
                  <Stack key={item.title} direction="row" sx={{ gap: 2.5, alignItems: "center" }}>
                    <Box sx={{ color: "text.secondary", display: "flex", alignItems: "center" }}>
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 15, color: "text.primary" }}>
                      {item.title}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Box>
          <Box
            component="img"
            src={EmaIllustration}
            alt="Expense Management Illustration"
            sx={{
              position: "absolute",
              bottom: { md: -16, lg: -24 },
              right: { md: -60, lg: -100 },
              width: { md: 400, lg: 560 },
              maxWidth: "52%",
              display: { xs: "none", md: "block" },
              opacity: 0.96,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3.8 }}>
          <Paper
            sx={{
              display: "flex",
              p: { xs: 3, md: 5 },
              width: "100%",
              height: "100%",
              flexDirection: "column",
              position: "relative",
              textAlign: "left",
              border: "1px solid",
              borderColor: "divider",
              borderLeft: { md: "none" },
              borderRadius: { xs: 3, md: "0 24px 24px 0" },
              boxShadow: "none",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 520,
                margin: "auto",
              }}
            >
              <LoginBox />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
