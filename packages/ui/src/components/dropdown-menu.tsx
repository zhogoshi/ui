"use client";

import { Menu } from "@base-ui/react/menu";
import { ArrowRight01Icon } from "@hugeicons-pro/core-stroke-rounded";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { Glide } from "./glide";
import { Icon } from "./icon";
import { HIGHLIGHTED, popupClass, popupItemClass, useAnchoredPopup } from "./popup";

export const DropdownMenu = Menu.Root;
export const DropdownMenuTrigger = Menu.Trigger;

export function DropdownMenuContent({ className, children, ...props }: ComponentProps<typeof Menu.Popup>) {
  const { popupClassName, ...anchor } = useAnchoredPopup();
  return (
    <Menu.Portal>
      <Menu.Positioner className="z-[var(--z-popover)]" {...anchor}>
        <Menu.Popup className={cn(popupClass, popupClassName, className)} {...props}>
          <Glide selector={HIGHLIGHTED} />
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: ComponentProps<typeof Menu.Item>) {
  return <Menu.Item className={cn(popupItemClass, className)} {...props} />;
}

export const DropdownMenuSub = Menu.SubmenuRoot;

export function DropdownMenuSubTrigger({ className, children, ...props }: ComponentProps<typeof Menu.SubmenuTrigger>) {
  return (
    <Menu.SubmenuTrigger className={cn(popupItemClass, className)} {...props}>
      {children}
      <Icon icon={ArrowRight01Icon} variant="stroke" size={14} className="text-fg-subtle ml-auto" />
    </Menu.SubmenuTrigger>
  );
}

export function DropdownMenuSubContent({ className, children, ...props }: ComponentProps<typeof Menu.Popup>) {
  return (
    <Menu.Portal>
      <Menu.Positioner className="z-[var(--z-popover)]" side="right" align="start" sideOffset={6}>
        <Menu.Popup className={cn(popupClass, className)} {...props}>
          <Glide selector={HIGHLIGHTED} />
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}
