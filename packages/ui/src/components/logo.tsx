import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { LOGO_PATH, LOGO_VIEWBOX } from "./logo-mark";

const logoVariants = cva("inline-flex shrink-0 items-center justify-center text-current transition-colors", {
  variants: {
    variant: {
      primary: "bg-accent text-accent-fg",
      secondary: "bg-bg-elevated text-fg border-border border",
      ghost: "bg-transparent text-fg",
      outline: "border-border text-fg border bg-transparent",
    },
    size: {
      sm: "size-8 rounded-[var(--radius-sm)] p-1",
      md: "size-10 rounded-[var(--radius-md)] p-1.5",
      lg: "size-12 rounded-[var(--radius-md)] p-2",
    },
  },
  defaultVariants: { variant: "primary", size: "sm" },
});

export function Logo({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof logoVariants>) {
  return (
    <span className={cn(logoVariants({ variant, size }), className)} {...props}>
      <svg viewBox={LOGO_VIEWBOX} className="size-full" aria-hidden>
        <path fill="currentColor" d={LOGO_PATH} />
      </svg>
    </span>
  );
}
