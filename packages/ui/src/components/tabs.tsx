"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

export function Tabs({ className, ...props }: ComponentProps<typeof BaseTabs.Root>) {
  return <BaseTabs.Root className={cn("grid", className)} {...props} />;
}

export function TabsList({ className, children, ...props }: ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={cn(
        "bg-bg-muted relative inline-flex items-center gap-1 rounded-[var(--radius-md)] p-1",
        className,
      )}
      {...props}
    >
      {children}
      <BaseTabs.Indicator className="bg-bg-elevated/70 pointer-events-none absolute top-0 left-0 z-0 h-[var(--active-tab-height)] w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] translate-y-[var(--active-tab-top)] rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] backdrop-blur-md transition-[translate,width,height] duration-[var(--motion-duration)] ease-[var(--motion-ease)] motion-reduce:transition-none" />
    </BaseTabs.List>
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        "text-fg-muted hover:text-fg data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[selected]:text-fg focus-visible:ring-ring relative z-[1] inline-flex h-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof BaseTabs.Panel>) {
  return (
    <BaseTabs.Panel
      className={cn(
        "col-start-1 row-start-2 pt-4 outline-none data-[ending-style]:pointer-events-none data-[ending-style]:animate-[tab-out_calc(var(--motion-duration)*3)_var(--motion-ease)_forwards] data-[starting-style]:animate-[tab-in_calc(var(--motion-duration)*3)_var(--motion-ease)]",
        className,
      )}
      {...props}
    />
  );
}
