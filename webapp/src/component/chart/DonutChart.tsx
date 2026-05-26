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

import { useState } from "react";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  hoveredIndex?: number | null;
  onHoverChange?: (index: number | null) => void;
}

function toCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, R: number, r: number, start: number, end: number): string {
  const safeEnd = end - start >= 360 ? start + 359.9999 : end;
  const large = safeEnd - start > 180 ? 1 : 0;
  const os = toCartesian(cx, cy, R, start);
  const oe = toCartesian(cx, cy, R, safeEnd);
  const ie = toCartesian(cx, cy, r, safeEnd);
  const is_ = toCartesian(cx, cy, r, start);
  return [
    `M ${os.x.toFixed(2)} ${os.y.toFixed(2)}`,
    `A ${R} ${R} 0 ${large} 1 ${oe.x.toFixed(2)} ${oe.y.toFixed(2)}`,
    `L ${ie.x.toFixed(2)} ${ie.y.toFixed(2)}`,
    `A ${r} ${r} 0 ${large} 0 ${is_.x.toFixed(2)} ${is_.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

export default function DonutChart({
  segments,
  size = 180,
  thickness = 40,
  centerLabel,
  centerValue,
  hoveredIndex,
  onHoverChange,
}: DonutChartProps) {
  const [internalHovered, setInternalHovered] = useState<number | null>(null);
  const activeIdx = hoveredIndex !== undefined ? hoveredIndex : internalHovered;

  const cx = size / 2;
  const cy = size / 2;
  const R = cx - 6;
  const r = R - thickness;

  const total = segments.reduce((sum, s) => sum + s.value, 0);

  const slices: Array<DonutSegment & { startAngle: number; endAngle: number; index: number }> = [];
  let currentAngle = 0;
  segments.forEach((seg, i) => {
    const sweep = total > 0 ? (seg.value / total) * 360 : 0;
    slices.push({ ...seg, startAngle: currentAngle, endAngle: currentAngle + sweep, index: i });
    currentAngle += sweep;
  });

  const handleEnter = (idx: number) => {
    setInternalHovered(idx);
    onHoverChange?.(idx);
  };
  const handleLeave = () => {
    setInternalHovered(null);
    onHoverChange?.(null);
  };

  if (total === 0) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: "2px dashed",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography sx={{ fontSize: 11, color: "text.disabled" }}>No data</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        {slices.map((slice) => {
          const isActive = activeIdx === slice.index;
          const mid = (slice.startAngle + slice.endAngle) / 2;
          const midPt = toCartesian(cx, cy, (R + r) / 2, mid);
          const dx = ((midPt.x - cx) / ((R + r) / 2)) * 5;
          const dy = ((midPt.y - cy) / ((R + r) / 2)) * 5;

          return (
            <path
              key={slice.label}
              d={arcPath(cx, cy, R, r, slice.startAngle, slice.endAngle)}
              fill={slice.color}
              opacity={activeIdx !== null && !isActive ? 0.45 : 1}
              transform={isActive ? `translate(${dx.toFixed(2)}, ${dy.toFixed(2)})` : undefined}
              style={{ transition: "opacity 0.18s ease, transform 0.18s ease", cursor: "pointer" }}
              onMouseEnter={() => handleEnter(slice.index)}
              onMouseLeave={handleLeave}
            />
          );
        })}
        {/* hairline gaps between slices */}
        {slices.map((slice) => {
          const o = toCartesian(cx, cy, R, slice.startAngle);
          const i = toCartesian(cx, cy, r, slice.startAngle);
          return (
            <line
              key={`gap-${slice.label}`}
              x1={i.x.toFixed(2)} y1={i.y.toFixed(2)}
              x2={o.x.toFixed(2)} y2={o.y.toFixed(2)}
              stroke="var(--oxygen-palette-background-paper, #fff)"
              strokeWidth={1.5}
              style={{ pointerEvents: "none" }}
            />
          );
        })}
      </svg>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          px: 1,
        }}
      >
        {centerValue && (
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.2,
              textAlign: "center",
              wordBreak: "break-word",
            }}
          >
            {centerValue}
          </Typography>
        )}
        {centerLabel && (
          <Typography sx={{ fontSize: 9, color: "text.disabled", textAlign: "center", mt: 0.3 }}>
            {centerLabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
