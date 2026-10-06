import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-bg-muted relative overflow-hidden rounded-[var(--radius-md)] before:absolute before:inset-0 before:animate-[shimmer_1.4s_linear_infinite] before:bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--fg)_14%,transparent),transparent)] before:bg-[length:200%_100%] before:content-[''] motion-reduce:before:animate-none",
        className,
      )}
      {...props}
    />
  );
}
