"use client";

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

export function Avatar({ className, ...props }: ComponentProps<typeof BaseAvatar.Root>) {
  return (
    <BaseAvatar.Root
      className={cn(
        "bg-bg-muted relative inline-flex size-8 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export function AvatarImage({ className, ...props }: ComponentProps<typeof BaseAvatar.Image>) {
  return <BaseAvatar.Image className={cn("size-full object-cover", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: ComponentProps<typeof BaseAvatar.Fallback>) {
  return (
    <BaseAvatar.Fallback
      className={cn("text-fg-muted flex size-full items-center justify-center text-xs font-medium", className)}
      {...props}
    />
  );
}
