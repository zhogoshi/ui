"use client";

import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { Cancel01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { createContext, useContext, type ComponentProps } from "react";
import { cn } from "../lib/cn";
import { Icon } from "./icon";

export const SheetTrigger = BaseDrawer.Trigger;
export const SheetClose = BaseDrawer.Close;
export const SheetTitle = BaseDrawer.Title;
export const SheetDescription = BaseDrawer.Description;

export type SheetSide = "top" | "right" | "bottom" | "left";

const SideContext = createContext<SheetSide>("right");

const direction = { top: "up", right: "right", bottom: "down", left: "left" } as const;

const edge = {
  top: "top-[var(--topbar-offset)]",
  right: "right-[var(--edge-right)]",
  bottom: "bottom-[var(--bottombar-offset)]",
  left: "left-[var(--edge-left)]",
};

const frame = {
  right: `${edge.top} ${edge.bottom} ${edge.right} w-[min(20rem,calc(100vw-1.5rem))]`,
  left: `${edge.top} ${edge.bottom} ${edge.left} w-[min(20rem,calc(100vw-1.5rem))]`,
  bottom: `${edge.left} ${edge.right} ${edge.bottom} max-h-[min(90dvh,calc(100dvh-max(0.75rem,var(--safe-top))-max(0.75rem,var(--safe-bottom))))] md:max-h-[min(32rem,70dvh)]`,
  top: `${edge.left} ${edge.right} ${edge.top} max-h-[min(90dvh,calc(100dvh-max(0.75rem,var(--safe-top))-max(0.75rem,var(--safe-bottom))))] md:max-h-[min(32rem,70dvh)]`,
} as const;

const motion = {
  right:
    "translate-x-(--drawer-swipe-movement-x) data-[starting-style]:translate-x-[calc(100%+1rem+var(--safe-right))] data-[ending-style]:translate-x-[calc(100%+1rem+var(--safe-right))]",
  left: "translate-x-(--drawer-swipe-movement-x) data-[starting-style]:-translate-x-[calc(100%+1rem+var(--safe-left))] data-[ending-style]:-translate-x-[calc(100%+1rem+var(--safe-left))]",
  bottom:
    "translate-y-(--drawer-swipe-movement-y) data-[starting-style]:translate-y-[calc(100%+1rem+var(--safe-bottom))] data-[ending-style]:translate-y-[calc(100%+1rem+var(--safe-bottom))]",
  top: "translate-y-(--drawer-swipe-movement-y) data-[starting-style]:-translate-y-[calc(100%+1rem+var(--safe-top))] data-[ending-style]:-translate-y-[calc(100%+1rem+var(--safe-top))]",
} as const;

const thumb = {
  right: "top-1/2 left-2 h-[18%] min-h-12 w-1.5 -translate-y-1/2",
  left: "top-1/2 right-2 h-[18%] min-h-12 w-1.5 -translate-y-1/2",
  bottom: "top-2 left-1/2 h-1.5 w-[18%] min-w-12 -translate-x-1/2",
  top: "bottom-2 left-1/2 h-1.5 w-[18%] min-w-12 -translate-x-1/2",
} as const;

const room = { right: "pl-4 md:pl-7", left: "pr-4 md:pr-7", bottom: "pt-4 md:pt-7", top: "pb-4 md:pb-7" } as const;

const transition =
  "transition-[translate,opacity] duration-[var(--motion-duration)] ease-[var(--motion-ease)] data-[swiping]:duration-0 motion-reduce:transition-none";

export function Sheet({ side = "right", ...props }: ComponentProps<typeof BaseDrawer.Root> & { side?: SheetSide }) {
  return (
    <SideContext.Provider value={side}>
      <BaseDrawer.Root swipeDirection={direction[side]} {...props} />
    </SideContext.Provider>
  );
}

export function SheetContent({ className, children, ...props }: ComponentProps<typeof BaseDrawer.Popup>) {
  const side = useContext(SideContext);
  return (
    <BaseDrawer.Portal>
      <BaseDrawer.Backdrop
        className={cn(
          "fixed inset-0 z-[var(--z-overlay)] bg-transparent opacity-[calc(1-var(--drawer-swipe-progress,0))] backdrop-blur-2xl transition-[opacity,backdrop-filter] duration-[calc(var(--motion-duration)*2.2)] ease-[var(--motion-ease)] data-[ending-style]:opacity-0 data-[ending-style]:backdrop-blur-[0px] data-[starting-style]:opacity-0 data-[starting-style]:backdrop-blur-[0px]",
        )}
      />
      <BaseDrawer.Viewport className="fixed inset-0 z-[var(--z-modal)]">
        <BaseDrawer.Popup
          className={cn(
            "border-border bg-bg-elevated/70 fixed flex touch-auto flex-col overflow-hidden rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-lg)] backdrop-blur-xl outline-none data-[swiping]:select-none",
            frame[side],
            room[side],
            motion[side],
            transition,
            className,
          )}
          {...props}
        >
          <span aria-hidden className={cn("bg-border-strong pointer-events-none absolute hidden rounded-full md:block", thumb[side])} />
          <BaseDrawer.Content className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain">
            {children}
          </BaseDrawer.Content>
          <BaseDrawer.Close className="text-fg-subtle hover:bg-bg-subtle hover:text-fg absolute top-3 right-3 z-[1] inline-flex size-7 cursor-pointer items-center justify-center rounded-[var(--radius-sm)]">
            <Icon icon={Cancel01Icon} variant="stroke" size={16} />
            <span className="sr-only">Close</span>
          </BaseDrawer.Close>
        </BaseDrawer.Popup>
      </BaseDrawer.Viewport>
    </BaseDrawer.Portal>
  );
}
