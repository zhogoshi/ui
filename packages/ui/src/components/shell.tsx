"use client";

import { Search01Icon } from "@hugeicons-pro/core-stroke-rounded";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";
import { Button } from "./button";
import { Icon } from "./icon";
import { Kbd } from "./kbd";
import { Logo } from "./logo";
import { Sheet, SheetContent, SheetTitle } from "./sheet";
import { SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger, sidebarLabel, useSidebar } from "./sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export const shellGlass = "border-border bg-bg-elevated/70 hover:bg-bg-elevated border backdrop-blur-xl";

const focusRing = "rounded-[var(--radius-sm)] outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AppShell({
  sidebar,
  topBar,
  bottomBar,
  defaultCollapsed,
  className,
  contentClassName,
  children,
}: {
  sidebar?: ReactNode;
  topBar?: ReactNode;
  bottomBar?: ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <SidebarProvider defaultCollapsed={defaultCollapsed}>
      <div data-app-shell className={cn("bg-bg fixed inset-0 flex h-app overflow-hidden", className)}>
        {sidebar}
        <SidebarInset className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {topBar}
          <div
            data-scroll-root
            className={cn(
              "min-h-0 flex-1 touch-pan-y overflow-x-hidden overflow-y-scroll overscroll-y-contain pb-[var(--safe-bottom)]",
              topBar && "pt-[var(--topbar-space)]",
              bottomBar && "pb-[var(--bottombar-space)] md:pb-[var(--safe-bottom)]",
              contentClassName,
            )}
          >
            {children}
          </div>
        </SidebarInset>
      </div>
      {bottomBar}
    </SidebarProvider>
  );
}

export function ShellBrand({ href, label, className, ...props }: Omit<ComponentProps<"a">, "children"> & { label: string }) {
  const { collapsed } = useSidebar();
  return (
    <SidebarHeader className={cn("group/header relative overflow-hidden px-2", className)}>
      <a
        href={href}
        aria-label={label}
        className={cn(
          "flex min-w-0 items-center gap-2 px-1 whitespace-nowrap",
          focusRing,
          collapsed &&
            "group-hover/header:pointer-events-none group-hover/header:opacity-0 [@media(hover:none)]:pointer-events-none [@media(hover:none)]:opacity-0",
        )}
        {...props}
      >
        <Logo size="sm" className="shrink-0" />
        <span className={cn("text-sm font-semibold tracking-tight", sidebarLabel, collapsed && "opacity-0")}>{label}</span>
      </a>
      <SidebarTrigger
        className={
          collapsed
            ? "pointer-events-none absolute top-3 left-3 opacity-0 transition-opacity group-hover/header:pointer-events-auto group-hover/header:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100"
            : "shrink-0"
        }
      />
    </SidebarHeader>
  );
}

export function ShellLogo({ href, label, className, children, ...props }: ComponentProps<"a"> & { label: string }) {
  return (
    <a href={href} aria-label={label} className={cn("flex shrink-0 items-center gap-2", focusRing, className)} {...props}>
      <Logo size="sm" />
      {children}
    </a>
  );
}

export function ShellTitle({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p className={cn("pointer-events-none absolute top-1/2 left-1/2 max-w-[70%] -translate-x-1/2 -translate-y-1/2", className)}>
      <span
        aria-hidden
        className="absolute top-1/2 left-1/2 -z-10 h-[2.4em] w-[260%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,var(--bg)_0%,color-mix(in_oklch,var(--bg)_82%,transparent)_36%,transparent_70%)]"
      />
      <span className="relative block truncate text-sm font-semibold">{children}</span>
    </p>
  );
}

export function ShellAction({ className, ...props }: ComponentProps<typeof Button>) {
  return <Button variant="secondary" size="icon" className={cn(shellGlass, "rounded-full", className)} {...props} />;
}

export function ShellSearch({
  onOpen,
  shortcut = "⌘K",
  label = "Search",
  className,
}: {
  onOpen: () => void;
  shortcut?: string;
  label?: string;
  className?: string;
}) {
  const { collapsed } = useSidebar();
  const fade = cn(sidebarLabel, collapsed && "opacity-0");
  const button = (
    <Button
      variant="outline"
      aria-label={label}
      className={cn(shellGlass, "w-full justify-between overflow-hidden px-3 font-normal whitespace-nowrap [&>span]:w-full [&>span>span]:w-full", className)}
      onClick={onOpen}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <Icon icon={Search01Icon} variant="stroke" size={16} className="shrink-0" />
          <span className={fade}>{label}</span>
        </span>
        <Kbd className={cn("shrink-0", fade)}>{shortcut}</Kbd>
      </span>
    </Button>
  );
  return (
    <div className="shrink-0 px-2 pb-2">
      <Tooltip disabled={!collapsed}>
        <TooltipTrigger render={button} />
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function ShellMenu({
  open,
  onOpenChange,
  brand,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: ReactNode;
  children: ReactNode;
}) {
  return (
    <Sheet side="left" open={open} onOpenChange={onOpenChange}>
      <SheetContent className="right-auto px-2">
        <SheetTitle className="px-3 pt-1 text-sm font-semibold">{brand}</SheetTitle>
        <SidebarProvider>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </SidebarProvider>
      </SheetContent>
    </Sheet>
  );
}
