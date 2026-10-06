import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "bg-bg-subtle text-fg-muted border-border inline-flex h-5 min-w-5 items-center justify-center rounded-[var(--radius-sm)] border px-1 font-mono text-[10px] font-medium",
        className,
      )}
      {...props}
    />
  );
}
