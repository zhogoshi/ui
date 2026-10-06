"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { popupClass, useAnchoredPopup } from "./popup";

export const Popover = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;

export function PopoverContent({
  className,
  children,
  container,
  side,
  align,
  ...props
}: ComponentProps<typeof BasePopover.Popup> &
  Pick<ComponentProps<typeof BasePopover.Portal>, "container"> &
  Pick<ComponentProps<typeof BasePopover.Positioner>, "side" | "align">) {
  const { popupClassName: _popupClassName, ...anchor } = useAnchoredPopup();
  return (
    <BasePopover.Portal container={container}>
      <BasePopover.Positioner
        className="z-[var(--z-popover)]"
        {...anchor}
        {...(side && { side })}
        {...(align && { align })}
      >
        <BasePopover.Popup className={cn(popupClass, "p-3", className)} {...props}>
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
