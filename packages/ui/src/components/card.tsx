import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("bg-bg-elevated border-border rounded-[var(--radius-lg)] border p-4", className)} {...props} />;
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mb-3 grid gap-1", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("text-sm font-semibold", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-fg-muted text-xs", className)} {...props} />;
}
