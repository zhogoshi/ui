import type { IconSvgElement } from "@hugeicons/react";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const CollapseScreenIcon: IconSvgElement = [
  ["path", { d: "M9 5 V9 H5", ...stroke, key: "0" }],
  ["path", { d: "M15 5 V9 H19", ...stroke, key: "1" }],
  ["path", { d: "M9 19 V15 H5", ...stroke, key: "2" }],
  ["path", { d: "M15 19 V15 H19", ...stroke, key: "3" }],
];
