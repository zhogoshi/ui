"use client";

import { Command as CommandPrimitive } from "cmdk";
import { useState, type ComponentProps } from "react";
import { cn } from "../lib/cn";
import { Glide } from "./glide";
import { SearchChrome, searchControlClass } from "./input";
import { Kbd } from "./kbd";

export function Command({ className, ...props }: ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn("text-fg flex h-full min-h-0 w-full flex-col overflow-hidden bg-transparent", className)}
      {...props}
    />
  );
}

export function CommandDialog({
  className,
  children,
  ...props
}: ComponentProps<typeof CommandPrimitive.Dialog>) {
  return (
    <CommandPrimitive.Dialog
      overlayClassName="hogoshi-command-overlay fixed inset-0 z-[var(--z-overlay)] bg-transparent backdrop-blur-2xl"
      contentClassName="hogoshi-command border-border bg-bg-elevated/70 fixed top-[max(12vh,calc(var(--safe-top)+0.75rem))] left-1/2 z-[var(--z-modal)] flex max-h-[min(32rem,calc(100dvh-max(0.75rem,var(--safe-top))-max(0.75rem,var(--safe-bottom))-2rem))] w-[min(36rem,calc(100vw-max(1rem,var(--safe-left))-max(1rem,var(--safe-right))))] max-w-xl flex-col overflow-hidden rounded-[var(--radius-lg)] border shadow-[var(--shadow-lg)] backdrop-blur-xl outline-none"
      className={cn("flex flex-col", className)}
      {...props}
    >
      {children}
    </CommandPrimitive.Dialog>
  );
}

export function CommandInput({ className, value, onValueChange, ...props }: ComponentProps<typeof CommandPrimitive.Input>) {
  const [query, setQuery] = useState(value ?? "");
  const shown = value !== undefined ? value : query;
  const change = (next: string) => {
    setQuery(next);
    onValueChange?.(next);
  };
  return (
    <div className="border-border border-b px-2 py-2">
      <SearchChrome value={shown} onClear={() => change("")}>
        <CommandPrimitive.Input
          {...props}
          value={shown}
          onValueChange={change}
          className={cn(
            searchControlClass,
            "border-0 bg-transparent shadow-none hover:border-transparent focus-visible:border-transparent focus-visible:ring-0",
            className,
          )}
        />
      </SearchChrome>
    </div>
  );
}

export function CommandList({ className, children, ...props }: ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn(
        "relative max-h-[min(24rem,calc(100dvh-14rem))] touch-pan-y overflow-y-auto overscroll-contain p-1",
        className,
      )}
      onTouchMove={(event) => event.stopPropagation()}
      {...props}
    >
      <Glide selector="[cmdk-item][data-selected=true]" />
      {children}
    </CommandPrimitive.List>
  );
}

export function CommandEmpty({ className, ...props }: ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className={cn("text-fg-muted py-6 text-center text-sm", className)} {...props} />;
}

export function CommandGroup({ className, ...props }: ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "text-fg p-1 [&_[cmdk-group-heading]]:text-fg-subtle [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function CommandItem({ className, ...props }: ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function CommandShortcut({ className, children, ...props }: ComponentProps<"span">) {
  return (
    <span className={cn("text-fg-muted ml-auto text-xs", className)} {...props}>
      <Kbd>{children}</Kbd>
    </span>
  );
}
