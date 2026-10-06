"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Tick02Icon } from "@hugeicons-pro/core-solid-rounded";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { Icon } from "./icon";

export function Checkbox({ className, ...props }: ComponentProps<typeof BaseCheckbox.Root>) {
  return (
    <BaseCheckbox.Root
      className={cn(
        "border-border bg-bg-elevated text-accent-fg hover:border-border-strong flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[min(4px,var(--radius-sm))] border transition-colors duration-[var(--motion-duration)] outline-none",
        "focus-visible:ring-ring focus-visible:ring-2",
        "data-[checked]:border-accent data-[checked]:bg-accent data-[checked]:hover:bg-accent-hover",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:border-border",
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Indicator className="flex scale-100 items-center justify-center transition-transform duration-[var(--motion-duration)] data-[ending-style]:scale-0 data-[starting-style]:scale-0">
        <Icon icon={Tick02Icon} size={12} />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}
