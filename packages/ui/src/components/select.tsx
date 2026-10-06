"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import { ArrowDown01Icon } from "@hugeicons-pro/core-stroke-rounded";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";
import { Icon } from "./icon";
import { Glide } from "./glide";
import { HIGHLIGHTED, popupClass, popupItemClass, useAnchoredPopup } from "./popup";

export const Select = BaseSelect.Root;

export function SelectTrigger({ className, children, ...props }: ComponentProps<typeof BaseSelect.Trigger>) {
  return (
    <BaseSelect.Trigger
      className={cn(
        "border-border bg-bg-elevated text-fg hover:border-border-strong focus-visible:border-accent focus-visible:ring-ring flex w-full cursor-pointer items-center justify-between rounded-[var(--radius-md)] border px-3 text-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 [height:var(--row-h)]",
        className,
      )}
      {...props}
    >
      {children}
      <BaseSelect.Icon className="text-fg-muted">
        <Icon icon={ArrowDown01Icon} variant="stroke" size={16} />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export const SelectValue = BaseSelect.Value;

export function SelectContent({ className, children, ...props }: ComponentProps<typeof BaseSelect.Popup>) {
  const { popupClassName: _popupClassName, ...anchor } = useAnchoredPopup();
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner className="z-[var(--z-popover)]" {...anchor}>
        <BaseSelect.Popup className={cn(popupClass, "w-[var(--anchor-width)] min-w-[var(--anchor-width)]", className)} {...props}>
          <Glide selector={HIGHLIGHTED} />
          <BaseSelect.List>{children}</BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export function SelectItem({ className, children, ...props }: ComponentProps<typeof BaseSelect.Item>) {
  return (
    <BaseSelect.Item className={cn(popupItemClass, className)} {...props}>
      <BaseSelect.ItemText>{children as ReactNode}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}
