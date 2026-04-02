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

import { Alert, Box, Button, Typography } from "@wso2/oxygen-ui";
import { Bell, Megaphone, Palette } from "lucide-react";
import { FormControlLabel, MenuItem, Switch, TextField } from "@mui/material";

import { useState } from "react";

type SettingsForm = {
  themeMode: string;
  fontScale: string;
  compactNavigation: boolean;
  reduceMotion: boolean;
  sendLeadAnnouncements: boolean;
  announcementChannel: string;
  announcementMessage: string;
  emailNotifications: boolean;
  weeklyDigest: boolean;
};

const INITIAL_FORM: SettingsForm = {
  themeMode: "system",
  fontScale: "100",
  compactNavigation: false,
  reduceMotion: false,
  sendLeadAnnouncements: true,
  announcementChannel: "email",
  announcementMessage: "Heads up: OPD review timelines have been refreshed for this week.",
  emailNotifications: true,
  weeklyDigest: true,
};

const cardStyles = {
  p: 2.5,
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
};

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={cardStyles}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 1,
            bgcolor: "#fff4e5",
            color: "#f57c00",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary" }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.4, maxWidth: 640 }}>
            {description}
          </Typography>
        </Box>
      </Box>
      {children}
    </Box>
  );
}

function SettingField({
  label,
  helperText,
  children,
}: {
  label: string;
  helperText: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>{label}</Typography>
      {children}
      <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{helperText}</Typography>
    </Box>
  );
}

export default function UserSettings() {
  const [form, setForm] = useState<SettingsForm>(INITIAL_FORM);
  const [isDirty, setIsDirty] = useState(false);
  const [showSavedBanner, setShowSavedBanner] = useState(false);

  const handleTextChange =
    (field: keyof SettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsDirty(true);
      setShowSavedBanner(false);
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleToggleChange =
    (field: keyof SettingsForm) => (_event: React.SyntheticEvent, checked: boolean) => {
      setIsDirty(true);
      setShowSavedBanner(false);
      setForm((prev) => ({ ...prev, [field]: checked }));
    };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setIsDirty(false);
    setShowSavedBanner(false);
  };

  const handleSaveDraft = () => {
    setIsDirty(false);
    setShowSavedBanner(true);
  };

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2 },
        py: 2,
        bgcolor: "transparent",
        minHeight: "100%",
        width: "100%",
        maxWidth: 1180,
        mx: "auto",
        boxSizing: "border-box",
      }}
    >
      {showSavedBanner && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Draft settings saved locally. We can wire persistence once the backend contract is ready.
        </Alert>
      )}

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <SettingsSection
          icon={<Palette size={20} />}
          title="Appearance"
          description="Simple user-facing controls for how the app feels day to day."
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            <SettingField
              label="Theme"
              helperText="Choose how the app should look by default."
            >
              <TextField
                select
                fullWidth
                value={form.themeMode}
                onChange={handleTextChange("themeMode")}
                size="small"
              >
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </TextField>
            </SettingField>

            <SettingField
              label="Font Size"
              helperText="A lightweight first pass for accessibility before a richer typography system."
            >
              <TextField
                select
                fullWidth
                value={form.fontScale}
                onChange={handleTextChange("fontScale")}
                size="small"
              >
                <MenuItem value="90">Small</MenuItem>
                <MenuItem value="100">Default</MenuItem>
                <MenuItem value="110">Large</MenuItem>
                <MenuItem value="120">Extra Large</MenuItem>
              </TextField>
            </SettingField>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              gap: 1,
              mt: 2,
            }}
          >
            <FormControlLabel
              control={
                <Switch checked={form.compactNavigation} onChange={handleToggleChange("compactNavigation")} />
              }
              label="Compact navigation"
            />
            <FormControlLabel
              control={<Switch checked={form.reduceMotion} onChange={handleToggleChange("reduceMotion")} />}
              label="Reduce motion"
            />
          </Box>
        </SettingsSection>

        <SettingsSection
          icon={<Megaphone size={20} />}
          title="Lead Announcements"
          description="Prepare simple internal communication controls for finance leads and reviewers."
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            <SettingField
              label="Delivery Channel"
              helperText="Decide how lead-facing notices should be distributed."
            >
              <TextField
                select
                fullWidth
                value={form.announcementChannel}
                onChange={handleTextChange("announcementChannel")}
                size="small"
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="banner">In-app banner</MenuItem>
                <MenuItem value="both">Email + in-app banner</MenuItem>
              </TextField>
            </SettingField>

            <SettingField
              label="Lead Broadcasts"
              helperText="Turn lead announcements on or off without changing policy data."
            >
              <Box sx={{ pt: 0.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.sendLeadAnnouncements}
                      onChange={handleToggleChange("sendLeadAnnouncements")}
                    />
                  }
                  label="Send announcements to leads"
                />
              </Box>
            </SettingField>
          </Box>

          <Box sx={{ mt: 2 }}>
            <SettingField
              label="Announcement Message"
              helperText="A draft content area for the backend message template we can add later."
            >
              <TextField
                fullWidth
                multiline
                minRows={4}
                value={form.announcementMessage}
                onChange={handleTextChange("announcementMessage")}
                size="small"
              />
            </SettingField>
          </Box>
        </SettingsSection>

        <SettingsSection
          icon={<Bell size={20} />}
          title="Notifications"
          description="Basic notification preferences that make sense for this app."
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              gap: 1,
            }}
          >
            <FormControlLabel
              control={
                <Switch checked={form.emailNotifications} onChange={handleToggleChange("emailNotifications")} />
              }
              label="Email notifications"
            />
            <FormControlLabel
              control={<Switch checked={form.weeklyDigest} onChange={handleToggleChange("weeklyDigest")} />}
              label="Weekly digest"
            />
          </Box>
        </SettingsSection>

        <Box
          sx={{
            ...cardStyles,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "text.primary", mb: 0.5 }}>
              Actions
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              Save the current draft locally or reset the form back to its default values.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", width: { xs: "100%", md: "auto" } }}>
            <Button variant="outlined" onClick={handleReset} sx={{ minWidth: 120 }}>
              Reset
            </Button>
            <Button variant="contained" onClick={handleSaveDraft} sx={{ minWidth: 140 }}>
              {isDirty ? "Save Changes" : "Save Draft"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
