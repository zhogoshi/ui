"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { Spinner } from "./spinner";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1.5 font-medium whitespace-nowrap select-none transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--motion-duration)] ease-[var(--motion-ease)] focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:bg-accent-hover",
        secondary:
          "border-border bg-bg-elevated text-fg hover:border-border-strong hover:bg-bg-subtle border",
        ghost: "text-fg-muted hover:bg-bg-subtle hover:text-fg",
        danger: "bg-danger text-[oklch(99%_0_0)] hover:opacity-90",
        outline: "border-border-strong text-fg hover:bg-bg-subtle border bg-transparent",
        link: "text-accent h-auto px-0 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-7 rounded-[var(--radius-sm)] px-2.5 text-xs",
        md: "rounded-[var(--radius-md)] px-3.5 text-sm [height:var(--row-h)]",
        lg: "h-10 rounded-[var(--radius-md)] px-5 text-sm",
        icon: "size-8 rounded-[var(--radius-md)]",
        "icon-sm": "size-7 rounded-[var(--radius-sm)]",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps
  extends ComponentProps<typeof BaseButton>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({ className, variant, size, loading, disabled, render, children, ...props }: ButtonProps) {
  return (
    <BaseButton
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
      render={render}
      nativeButton={render ? false : true}
    >
      <span className="grid place-items-center">
        <span aria-hidden={loading || undefined} className={loading ? "invisible col-start-1 row-start-1" : "col-start-1 row-start-1"}>
          {children}
        </span>
        {loading ? <Spinner size="sm" className="col-start-1 row-start-1" /> : null}
      </span>
    </BaseButton>
  );
}
