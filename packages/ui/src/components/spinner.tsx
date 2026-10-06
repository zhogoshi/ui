import { LoaderPinwheelIcon } from "@hugeicons-pro/core-stroke-rounded";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { Icon } from "./icon";

const sizes = { sm: 14, md: 16, lg: 20 } as const;

export function Spinner({
  className,
  size = "md",
  ...props
}: ComponentProps<"span"> & { size?: keyof typeof sizes }) {
  return (
    <span role="status" aria-label="Loading" className={cn("inline-flex", className)} {...props}>
      <Icon icon={LoaderPinwheelIcon} variant="stroke" size={sizes[size]} className="animate-spin" />
    </span>
  );
}
