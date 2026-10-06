"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Cancel01Icon } from "@hugeicons-pro/core-stroke-rounded";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { Icon } from "./icon";
import { backdropMotion, popupMotion } from "./popup";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;
export const DialogTitle = BaseDialog.Title;
export const DialogDescription = BaseDialog.Description;

export function DialogContent({ className, children, ...props }: ComponentProps<typeof BaseDialog.Popup>) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={cn("fixed inset-0 z-[var(--z-overlay)] bg-transparent", backdropMotion)} />
      <BaseDialog.Popup
        className={cn(
          "border-border bg-bg-elevated/70 fixed top-1/2 left-1/2 z-[var(--z-modal)] grid w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl outline-none",
          popupMotion,
          className,
        )}
        {...props}
      >
        {children}
        <BaseDialog.Close className="text-fg-subtle hover:bg-bg-subtle hover:text-fg focus-visible:ring-ring absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)] focus-visible:ring-2 focus-visible:outline-none">
          <Icon icon={Cancel01Icon} variant="stroke" size={16} />
          <span className="sr-only">Close</span>
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
