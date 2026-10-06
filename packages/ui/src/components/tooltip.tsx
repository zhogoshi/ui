"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";
import { PopupArrow, popupMotion } from "./popup";

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <BaseTooltip.Provider delay={200}>{children}</BaseTooltip.Provider>;
}

export const Tooltip = BaseTooltip.Root;

export function TooltipTrigger({ className, ...props }: ComponentProps<typeof BaseTooltip.Trigger>) {
  return <BaseTooltip.Trigger className={className} {...props} />;
}

export function TooltipContent({
  className,
  children,
  side = "top",
  align = "center",
  ...props
}: ComponentProps<typeof BaseTooltip.Popup> &
  Pick<ComponentProps<typeof BaseTooltip.Positioner>, "side" | "align">) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner side={side} align={align} sideOffset={8} className="z-[var(--z-popover)]">
        <BaseTooltip.Popup
          className={cn(
            "bg-fg text-bg w-max max-w-64 rounded-[var(--radius-sm)] px-2 py-1 text-xs whitespace-nowrap shadow-[var(--shadow-sm)]",
            popupMotion,
            className,
          )}
          {...props}
        >
          {children}
          <PopupArrow arrow={BaseTooltip.Arrow} inverted />
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
