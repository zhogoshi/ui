"use client";

import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { ClipboardIcon, Copy01Icon, ScissorIcon, TextIcon } from "@hugeicons-pro/core-stroke-rounded";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";
import type { AppIcon } from "./icon";
import { Icon } from "./icon";
import { Glide } from "./glide";
import { HIGHLIGHTED, popupClass, popupItemClass } from "./popup";
import { Separator } from "./separator";

export interface ContextMenuEntry {
  id: string;
  label: string;
  icon?: AppIcon;
  onSelect?: () => void;
  destructive?: boolean;
  items?: ContextMenuEntry[];
}

function selectionText() {
  return window.getSelection()?.toString() ?? "";
}

function cutSelection() {
  const text = selectionText();
  if (text) void navigator.clipboard.writeText(text);
  document.execCommand("delete");
}

function copySelection() {
  const text = selectionText();
  if (text) void navigator.clipboard.writeText(text);
}

async function pasteSelection() {
  const text = await navigator.clipboard.readText();
  const active = document.activeElement;
  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
    const start = active.selectionStart ?? active.value.length;
    const end = active.selectionEnd ?? start;
    active.setRangeText(text, start, end, "end");
    active.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }
  document.execCommand("insertText", false, text);
}

function selectAll() {
  const active = document.activeElement;
  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
    active.select();
    return;
  }
  const selection = window.getSelection();
  const node = selection?.anchorNode?.parentElement;
  if (!node || !selection) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
}

function editEntries(): ContextMenuEntry[] {
  return [
    {
      id: "edit",
      label: "Edit",
      items: [
        { id: "cut", label: "Cut", icon: ScissorIcon, onSelect: cutSelection },
        { id: "copy", label: "Copy", icon: Copy01Icon, onSelect: copySelection },
        { id: "paste", label: "Paste", icon: ClipboardIcon, onSelect: () => void pasteSelection() },
        { id: "select-all", label: "Select all", icon: TextIcon, onSelect: selectAll },
      ],
    },
  ];
}

export const ContextMenuRoot = BaseContextMenu.Root;
export const ContextMenuTrigger = BaseContextMenu.Trigger;

export function ContextMenuContent({ className, children, ...props }: ComponentProps<typeof BaseContextMenu.Popup>) {
  return (
    <BaseContextMenu.Portal>
      <BaseContextMenu.Positioner className="z-[var(--z-popover)]">
        <BaseContextMenu.Popup className={cn(popupClass, className)} {...props}>
          <Glide selector={HIGHLIGHTED} />
          <EntryList items={editEntries()} />
          {children ? (
            <>
              <Separator className="my-1" />
              {children}
            </>
          ) : null}
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  );
}

export function ContextMenuItem({ className, ...props }: ComponentProps<typeof BaseContextMenu.Item>) {
  return <BaseContextMenu.Item className={cn(popupItemClass, className)} {...props} />;
}

function EntryList({ items }: { items: ContextMenuEntry[] }) {
  return items.map((item, index) =>
    item.items ? (
      <div key={item.id} className={index > 0 ? "border-border mt-1 border-t pt-1" : undefined}>
        <p className="text-fg-subtle px-2 py-1 text-[11px] font-medium tracking-wider uppercase">{item.label}</p>
        <EntryList items={item.items} />
      </div>
    ) : (
      <ContextMenuItem
        key={item.id}
        className={item.destructive ? "text-danger data-[highlighted]:text-danger" : undefined}
        onClick={item.onSelect}
      >
        {item.icon ? <Icon icon={item.icon} variant="stroke" size={16} /> : null}
        {item.label}
      </ContextMenuItem>
    ),
  );
}

export function ContextMenuViewport({ children }: { children: ReactNode }) {
  return (
    <BaseContextMenu.Root>
      <ContextMenuTrigger className="block min-h-svh">{children}</ContextMenuTrigger>
      <ContextMenuContent />
    </BaseContextMenu.Root>
  );
}

export function ContextMenu({
  items,
  children,
  ...props
}: ComponentProps<typeof BaseContextMenu.Root> & { items?: ContextMenuEntry[]; children?: ReactNode }) {
  return (
    <BaseContextMenu.Root {...props}>
      {items ? <ContextMenuTrigger>{children}</ContextMenuTrigger> : children}
      {items ? (
        <ContextMenuContent>
          <EntryList items={items} />
        </ContextMenuContent>
      ) : null}
    </BaseContextMenu.Root>
  );
}
