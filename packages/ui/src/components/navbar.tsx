"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { NavigationMenu } from "@base-ui/react/navigation-menu";
import { ArrowDown01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { Glide, glideActive } from "./glide";
import type { AppIcon } from "./icon";
import { Icon } from "./icon";

const itemClass =
  "text-fg-muted hover:bg-bg-subtle hover:text-fg relative inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-sm outline-none transition-colors duration-[var(--motion-duration)] focus-visible:ring-2 focus-visible:ring-ring";

const motion = "duration-[calc(var(--motion-duration)*3)] ease-[var(--motion-ease)] motion-reduce:transition-none";

export function TopBar({ contained = false, children, className }: { contained?: boolean; children: ReactNode; className?: string }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const root = document.querySelector("[data-scroll-root]");
    const read = () => {
      const top = root instanceof HTMLElement ? root.scrollTop : window.scrollY;
      setCompact((current) => (current ? top > 8 : top > 24));
    };
    read();
    const target: EventTarget = root instanceof HTMLElement ? root : window;
    target.addEventListener("scroll", read, { passive: true });
    return () => target.removeEventListener("scroll", read);
  }, []);

  return (
    <header className={cn("pointer-events-none inset-x-0 top-0 z-[var(--z-sticky)]", contained ? "absolute" : "fixed", className)}>
      <div
        className={cn(
          "pointer-events-auto relative mx-auto flex h-12 translate-y-[var(--topbar-offset)] items-center border transition-[width,border-radius,background-color,border-color,box-shadow] duration-[calc(var(--motion-duration)*4)] ease-[var(--motion-ease)]",
          compact
            ? "border-border bg-bg-elevated w-[min(40rem,calc(100%-var(--edge-left)-var(--edge-right)))] rounded-full px-2 shadow-[var(--shadow-md)]"
            : "w-full border-transparent bg-transparent pr-[var(--edge-right)] pl-[var(--edge-left)]",
        )}
      >
        <Navbar className="relative h-full w-full bg-transparent px-1 shadow-none backdrop-blur-none">{children}</Navbar>
      </div>
    </header>
  );
}

export function Navbar({ className, children, ...props }: ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "sticky top-0 z-[var(--z-sticky)] h-14 border-0 bg-transparent px-3 shadow-none backdrop-blur-none",
        className,
      )}
      {...props}
    >
      <div className="relative flex h-full min-w-0 items-center gap-1 overflow-x-auto">
        <Glide selector='[aria-current="page"]' className="bg-accent-muted/60" />
        {children}
      </div>
    </header>
  );
}

export function NavbarItem({
  icon,
  active,
  className,
  children,
  render,
  ...props
}: ComponentProps<typeof BaseButton> & { icon?: AppIcon; active?: boolean }) {
  return (
    <BaseButton
      nativeButton={render ? false : true}
      render={render}
      aria-current={active ? "page" : undefined}
      className={cn(itemClass, active && cn("bg-accent-muted text-accent hover:text-accent hover:bg-transparent", glideActive), className)}
      {...props}
    >
      {icon ? <Icon icon={icon} size={16} /> : null}
      {children}
    </BaseButton>
  );
}

export function NavbarMenus({ className, children, ...props }: ComponentProps<typeof NavigationMenu.Root>) {
  return (
    <NavigationMenu.Root className={cn("relative", className)} {...props}>
      <NavigationMenu.List className="flex items-center gap-1">{children}</NavigationMenu.List>
      <NavigationMenu.Portal>
        <NavigationMenu.Positioner
          sideOffset={8}
          collisionPadding={12}
          align="start"
          className={cn(
            "z-[var(--z-popover)] h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] data-[instant]:transition-none",
            motion,
          )}
        >
          <NavigationMenu.Popup
            className={cn(
              "border-border bg-bg-elevated/60 relative h-[var(--popup-height)] w-[var(--popup-width)] origin-[var(--transform-origin)] overflow-hidden rounded-[var(--radius-lg)] border shadow-[var(--shadow-lg)] backdrop-blur-2xl transition-[opacity,width,height] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
              motion,
            )}
          >
            <NavigationMenu.Viewport className="relative size-full overflow-hidden" />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

export function NavbarMenu({
  label,
  icon,
  className,
  children,
}: {
  label: ReactNode;
  icon?: AppIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <NavigationMenu.Item>
      <NavigationMenu.Trigger className={cn(itemClass, "data-[popup-open]:bg-bg-subtle data-[popup-open]:text-fg")}>
        {icon ? <Icon icon={icon} size={16} /> : null}
        {label}
        <NavigationMenu.Icon className="transition-transform duration-[var(--motion-duration)] data-[popup-open]:rotate-180">
          <Icon icon={ArrowDown01Icon} variant="stroke" size={14} />
        </NavigationMenu.Icon>
      </NavigationMenu.Trigger>
      <NavigationMenu.Content
        className={cn(
          "grid w-max max-w-[calc(100vw-1.5rem)] gap-0.5 p-2 transition-[opacity,translate] data-[ending-style]:translate-x-2 data-[ending-style]:opacity-0 data-[starting-style]:-translate-x-2 data-[starting-style]:opacity-0",
          motion,
          className,
        )}
      >
        {children}
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  );
}

export function NavbarMenuLink({
  icon,
  title,
  description,
  className,
  children,
  ...props
}: Omit<ComponentProps<typeof NavigationMenu.Link>, "title"> & { icon?: AppIcon; title?: ReactNode; description?: ReactNode }) {
  return (
    <NavigationMenu.Link
      className={cn(
        "text-fg hover:bg-bg-subtle flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none transition-colors duration-[var(--motion-duration)] focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className="bg-bg-muted text-fg grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)]">
          <Icon icon={icon} size={18} />
        </span>
      ) : null}
      <span className="grid min-w-0 gap-0.5">
        <span className="font-medium">{title ?? children}</span>
        {description ? <span className="text-fg-muted text-xs leading-snug">{description}</span> : null}
      </span>
    </NavigationMenu.Link>
  );
}
