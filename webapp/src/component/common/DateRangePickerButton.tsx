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
import { Box, Button, Typography, Popover, DatePickers } from "@wso2/oxygen-ui";

const { DatePicker } = DatePickers;
import dayjs, { type Dayjs } from "dayjs";
import { CalendarDays } from "lucide-react";

import { useState } from "react";

interface DateRangePickerButtonProps {
  fromDate: Dayjs;
  toDate: Dayjs;
  onFromChange: (d: Dayjs) => void;
  onToChange: (d: Dayjs) => void;
  maxTo?: Dayjs;
}

const fieldSx = {
  "& .MuiInputBase-root": { height: 24, borderRadius: 1 },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
  "& .MuiInputAdornment-root .MuiIconButton-root": { p: "1px" },
  "& .MuiSvgIcon-root": { fontSize: 12 },
  width: 106,
};

const calendarSx = {
  "& .MuiPickersCalendarHeader-label": { fontSize: 11, fontWeight: 600 },
  "& .MuiPickersCalendarHeader-root": { minHeight: 36, pl: 1.5, pr: 0.5 },
  "& .MuiDayCalendar-weekDayLabel": { fontSize: 10, width: 28, height: 24 },
  "& .MuiPickersDay-root": { fontSize: 10, width: 28, height: 28 },
  "& .MuiPickersMonth-monthButton": { fontSize: 11, height: 28 },
  "& .MuiPickersYear-yearButton": { fontSize: 11, height: 28 },
  "& .MuiDateCalendar-root": { width: 240, height: "auto" },
  "& .MuiDayCalendar-slideTransition": { minHeight: 180 },
  "& .MuiPickersArrowSwitcher-button": { p: "2px" },
  "& .MuiPickersArrowSwitcher-spacer": { width: 8 },
  "& .MuiSvgIcon-root": { fontSize: 16 },
};

export default function DateRangePickerButton({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  maxTo,
}: DateRangePickerButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const rangeLabel = `${fromDate.format("DD MMM YYYY")} – ${toDate.format("DD MMM YYYY")}`;

  return (
    <>
      <Button
        type="button"
        aria-label={`Date range: ${rangeLabel}`}
        aria-expanded={open}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          px: 1.5,
          py: 0.6,
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: open ? "primary.main" : "divider",
          color: open ? "primary.main" : "text.secondary",
          bgcolor: open ? "action.selected" : "transparent",
          transition: "all 0.15s ease",
          textTransform: "none",
          minWidth: 0,
          "&:hover": { borderColor: "primary.main", color: "primary.main", bgcolor: open ? "action.selected" : "transparent" },
          whiteSpace: "nowrap",
        }}
      >
        <CalendarDays size={14} />
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "inherit", lineHeight: 1 }}>
          {rangeLabel}
        </Typography>
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        disablePortal={false}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              p: 1.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              overflow: "visible",
            },
          },
        }}
      >
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "text.secondary", mb: 1, textTransform: "uppercase", letterSpacing: 0.6 }}>
          Date range
        </Typography>

        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
            <Typography sx={{ fontSize: 10, color: "text.secondary", fontWeight: 600 }}>From</Typography>
            <DatePicker
              value={fromDate}
              onChange={(val) => {
                const d = dayjs(val as Parameters<typeof dayjs>[0]);
                if (!d.isValid()) return;
                onFromChange(d.isAfter(toDate) ? toDate : d);
              }}
              views={["year", "month", "day"]}
              openTo="day"
              maxDate={toDate}
              slotProps={{
                textField: { size: "small", sx: fieldSx, inputProps: { style: { fontSize: 11, padding: "2px 6px" } } },
                actionBar: { actions: [] },
                popper: { disablePortal: false, sx: { zIndex: 1500 } },
                desktopPaper: { sx: calendarSx },
              }}
            />
          </Box>

          <Typography sx={{ fontSize: 12, color: "text.disabled", pb: 0.5 }}>→</Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
            <Typography sx={{ fontSize: 10, color: "text.secondary", fontWeight: 600 }}>To</Typography>
            <DatePicker
              value={toDate}
              onChange={(val) => {
                const d = dayjs(val as Parameters<typeof dayjs>[0]);
                if (!d.isValid()) return;
                onToChange(d.isBefore(fromDate) ? fromDate : d);
              }}
              views={["year", "month", "day"]}
              openTo="day"
              minDate={fromDate}
              maxDate={maxTo}
              slotProps={{
                textField: { size: "small", sx: fieldSx, inputProps: { style: { fontSize: 11, padding: "2px 6px" } } },
                actionBar: { actions: [] },
                popper: { disablePortal: false, sx: { zIndex: 1500 } },
                desktopPaper: { sx: calendarSx },
              }}
            />
          </Box>
        </Box>
      </Popover>
    </>
  );
}
