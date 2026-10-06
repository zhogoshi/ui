"use client";

import { PreviewCard } from "@base-ui/react/preview-card";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { popupClass } from "./popup";

export const Pophover = PreviewCard.Root;

export function PophoverTrigger({ delay = 150, closeDelay = 200, ...props }: ComponentProps<typeof PreviewCard.Trigger>) {
  return <PreviewCard.Trigger delay={delay} closeDelay={closeDelay} {...props} />;
}

export function PophoverContent({
  className,
  side = "bottom",
  align = "center",
  ...props
}: ComponentProps<typeof PreviewCard.Popup> &
  Pick<ComponentProps<typeof PreviewCard.Positioner>, "side" | "align">) {
  return (
    <PreviewCard.Portal>
      <PreviewCard.Positioner side={side} align={align} sideOffset={6} className="z-[var(--z-popover)]">
        <PreviewCard.Popup className={cn(popupClass, "p-3", className)} {...props} />
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  );
}
