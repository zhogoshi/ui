"use client";

import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

const scrollbarClass =
  "flex touch-none p-px opacity-0 transition-opacity duration-[var(--motion-duration)] ease-[var(--motion-ease)] data-[scrolling]:opacity-100";

export function ScrollArea({
  className,
  children,
  contentClassName,
  hideScrollbar = false,
  ...props
}: ComponentProps<typeof BaseScrollArea.Root> & { contentClassName?: string; hideScrollbar?: boolean }) {
  return (
    <BaseScrollArea.Root className={cn("relative overflow-hidden", className)} {...props}>
      <BaseScrollArea.Viewport className="size-full overscroll-contain rounded-[inherit]">
        <BaseScrollArea.Content className={contentClassName}>{children}</BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      {hideScrollbar ? null : (
        <>
          <BaseScrollArea.Scrollbar orientation="vertical" className={cn(scrollbarClass, "w-[var(--scrollbar-size)]")}>
            <BaseScrollArea.Thumb className="bg-[var(--scrollbar-thumb)] flex-1 rounded-full" />
          </BaseScrollArea.Scrollbar>
          <BaseScrollArea.Scrollbar
            orientation="horizontal"
            className={cn(scrollbarClass, "h-[var(--scrollbar-size)] flex-col")}
          >
            <BaseScrollArea.Thumb className="bg-[var(--scrollbar-thumb)] flex-1 rounded-full" />
          </BaseScrollArea.Scrollbar>
        </>
      )}
      <BaseScrollArea.Corner />
    </BaseScrollArea.Root>
  );
}
