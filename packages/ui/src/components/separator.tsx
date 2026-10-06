"use client";

import { Separator as BaseSeparator } from "@base-ui/react/separator";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

export function Separator({ className, ...props }: ComponentProps<typeof BaseSeparator>) {
  return (
    <BaseSeparator
      className={cn("bg-border h-px w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px", className)}
      {...props}
    />
  );
}
