"use client";

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

export const Collapsible = BaseCollapsible.Root;

export function CollapsibleTrigger({ className, ...props }: ComponentProps<typeof BaseCollapsible.Trigger>) {
  return (
    <BaseCollapsible.Trigger
      className={cn(
        "flex w-full cursor-pointer items-center gap-1 rounded-[var(--radius-sm)] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export function CollapsiblePanel({ className, ...props }: ComponentProps<typeof BaseCollapsible.Panel>) {
  return (
    <BaseCollapsible.Panel
      className={cn(
        "h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-[var(--motion-duration)] ease-[var(--motion-ease)] data-[ending-style]:h-0 data-[starting-style]:h-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}
