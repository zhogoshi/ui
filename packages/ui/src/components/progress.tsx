import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

export function Progress({
  value = 0,
  max = 100,
  className,
  ...props
}: ComponentProps<"div"> & { value?: number; max?: number }) {
  const ratio = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      className={cn("bg-bg-muted h-2 overflow-hidden rounded-full", className)}
      {...props}
    >
      <div
        className="bg-accent h-full rounded-full transition-[width] duration-[calc(var(--motion-duration)*1.6)] ease-[var(--motion-ease)] motion-reduce:transition-none"
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
