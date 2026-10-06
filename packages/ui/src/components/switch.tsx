"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

export function Switch({ className, ...props }: ComponentProps<typeof BaseSwitch.Root>) {
  return (
    <BaseSwitch.Root
      className={cn(
        "bg-bg-muted hover:bg-bg-subtle inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-[background-color,transform] duration-[var(--motion-duration)] outline-none",
        "focus-visible:ring-ring focus-visible:ring-2",
        "data-[checked]:bg-accent data-[checked]:hover:bg-accent-hover",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:bg-bg-muted",
        className,
      )}
      {...props}
    >
      <BaseSwitch.Thumb className="bg-bg-elevated size-4 translate-x-0 rounded-full shadow-[var(--shadow-sm)] transition-transform duration-[var(--motion-duration)] ease-[var(--motion-ease)] data-[checked]:translate-x-4" />
    </BaseSwitch.Root>
  );
}
