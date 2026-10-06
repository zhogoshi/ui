import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[11px] leading-tight font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-bg-muted text-fg-muted",
        accent: "bg-accent-muted text-accent",
        success: "bg-success/15 text-success",
        warning: "bg-warning/15 text-warning",
        danger: "bg-danger/15 text-danger",
        outline: "border-border text-fg-muted border bg-transparent",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
