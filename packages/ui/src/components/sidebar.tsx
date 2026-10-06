"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { SidebarLeftIcon } from "@hugeicons-pro/core-stroke-rounded";
import { createContext, useContext, useEffect, useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "../lib/cn";
import type { AppIcon, IconVariant } from "./icon";
import { Glide, glideActive } from "./glide";
import { Icon } from "./icon";

const ACTIVE = '[aria-current="page"]';
import { ScrollArea } from "./scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarState | null>(null);

export const sidebarLabel =
  "min-w-0 truncate transition-opacity duration-[var(--motion-duration)] ease-[var(--motion-ease)]";

export function useSidebar() {
  const value = useContext(SidebarContext);
  if (!value) throw new Error("useSidebar must be used within SidebarProvider");
  return value;
}

export function SidebarProvider({ children, defaultCollapsed = false }: { children: ReactNode; defaultCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  useEffect(() => setCollapsed(defaultCollapsed), [defaultCollapsed]);
  const value = useMemo(() => ({ collapsed, toggle: () => setCollapsed((current) => !current) }), [collapsed]);
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function Sidebar({ className, ...props }: ComponentProps<"aside">) {
  const { collapsed } = useSidebar();
  return (
    <aside
      data-collapsed={collapsed || undefined}
      className={cn(
        "bg-bg-elevated border-border hidden h-full min-h-0 w-[calc(15rem+var(--safe-left))] shrink-0 flex-col overflow-hidden border-r pt-[var(--safe-top)] pb-[var(--safe-bottom)] pl-[var(--safe-left)] transition-[width] duration-[var(--motion-duration)] ease-[var(--motion-ease)] md:flex",
        collapsed && "w-[calc(3.5rem+var(--safe-left))]",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-center justify-between gap-2 px-3 py-3", className)} {...props} />;
}

export function SidebarNav({
  className,
  indicatorClassName,
  children,
  ...props
}: ComponentProps<"nav"> & { indicatorClassName?: string }) {
  return (
    <nav className={cn("flex min-h-0 flex-1 flex-col px-2 pb-3", className)} {...props}>
      <ScrollArea hideScrollbar className="h-full min-h-0 flex-1" contentClassName="min-w-0! w-full">
        <div className="relative flex flex-col gap-0.5">
          <Glide selector={ACTIVE} className={cn("bg-accent-muted/60", indicatorClassName)} />
          {children}
        </div>
      </ScrollArea>
    </nav>
  );
}

export function SidebarGroup({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-0.5", className)} {...props} />;
}

export function SidebarLabel({ className, ...props }: ComponentProps<"p">) {
  const { collapsed } = useSidebar();
  return (
    <p
      className={cn(
        "text-fg-subtle px-3 pt-3 pb-1 text-[11px] font-medium tracking-wide uppercase",
        collapsed && "sr-only",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mt-auto flex flex-col gap-1 p-2", className)} {...props} />;
}

export function SidebarInset({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("min-w-0 flex-1", className)} {...props} />;
}

export function SidebarTrigger({ className, ...props }: ComponentProps<"button">) {
  const { toggle, collapsed } = useSidebar();
  return (
    <button
      type="button"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "text-fg-muted hover:bg-bg-subtle hover:text-fg inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)]",
        className,
      )}
      onClick={toggle}
      {...props}
    >
      <Icon icon={SidebarLeftIcon} variant="stroke" size={16} />
    </button>
  );
}

export function SidebarItem({
  icon,
  iconVariant = "stroke",
  active,
  className,
  children,
  render,
  ...props
}: ComponentProps<typeof BaseButton> & { icon?: AppIcon; iconVariant?: IconVariant; active?: boolean }) {
  const { collapsed } = useSidebar();
  const item = (
    <BaseButton
      nativeButton={render ? false : true}
      render={render}
      aria-current={active ? "page" : undefined}
      className={cn(
        "text-fg-muted hover:bg-bg-subtle hover:text-fg relative flex h-[calc(var(--row-h)-0.25rem)] w-full cursor-pointer items-center gap-2 overflow-hidden rounded-[var(--radius-sm)] px-3 text-sm whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && cn("bg-accent-muted text-accent hover:text-accent hover:bg-transparent", glideActive),
        className,
      )}
      {...props}
    >
      {icon ? <Icon icon={icon} variant={iconVariant} size={16} className="shrink-0" /> : null}
      <span className={cn(sidebarLabel, collapsed && "opacity-0")}>{children}</span>
    </BaseButton>
  );
  return (
    <Tooltip disabled={!collapsed}>
      <TooltipTrigger render={item} />
      <TooltipContent side="right">{children}</TooltipContent>
    </Tooltip>
  );
}

export function BottomBar({ className, children, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      className={cn(
        "bg-bg-elevated/70 border-border fixed right-[calc(0.75rem+var(--safe-right))] bottom-[calc(0.75rem+var(--safe-bottom))] left-[calc(0.75rem+var(--safe-left))] z-[var(--z-sticky)] rounded-[var(--radius-lg)] border p-1 shadow-[var(--shadow-md)] backdrop-blur-xl md:hidden",
        className,
      )}
      {...props}
    >
      <div className="relative flex items-stretch justify-around">
        <Glide selector={ACTIVE} className="bg-accent-muted/60 rounded-[var(--radius-md)]" />
        {children}
      </div>
    </nav>
  );
}

export function BottomBarItem({
  icon,
  iconVariant = "stroke",
  active,
  className,
  children,
  render,
  ...props
}: ComponentProps<typeof BaseButton> & { icon?: AppIcon; iconVariant?: IconVariant; active?: boolean }) {
  return (
    <BaseButton
      nativeButton={render ? false : true}
      render={render}
      aria-current={active ? "page" : undefined}
      className={cn(
        "text-fg-muted hover:bg-bg-subtle relative flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-[var(--radius-md)] px-2 py-1.5 text-[11px] transition-colors duration-[var(--motion-duration)]",
        active && cn("bg-accent-muted text-accent hover:bg-transparent", glideActive),
        className,
      )}
      {...props}
    >
      {icon ? <Icon icon={icon} variant={iconVariant} size={18} /> : null}
      {children}
    </BaseButton>
  );
}
