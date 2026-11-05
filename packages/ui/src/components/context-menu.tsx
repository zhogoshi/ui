"use client";

import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { ClipboardIcon, Copy01Icon, ScissorIcon, TextIcon } from "@hugeicons-pro/core-stroke-rounded";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
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
  disabled?: boolean;
  items?: ContextMenuEntry[];
}

function selectionText() {
  return window.getSelection()?.toString() ?? "";
}

type Field = HTMLInputElement | HTMLTextAreaElement;

type SavedEdit = {
  field: Field | null;
  start: number;
  end: number;
  text: string;
  value: string;
};

const emptyEdit: SavedEdit = { field: null, start: 0, end: 0, text: "", value: "" };
let saved: SavedEdit = emptyEdit;
let expanded: SavedEdit = emptyEdit;
let collapsedAt = 0;
let pasteText = "";
const pasteListeners = new Set<(ready: boolean) => void>();

function isField(node: EventTarget | null): node is Field {
  return node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement;
}

function publishPaste(text: string) {
  pasteText = text;
  pasteListeners.forEach((listener) => listener(Boolean(text)));
}

function rememberField(field: Field, start: number, end: number) {
  const next: SavedEdit = {
    field,
    start,
    end,
    text: field.value.slice(Math.min(start, end), Math.max(start, end)),
    value: field.value,
  };
  saved = next;
  if (start !== end) expanded = next;
  else collapsedAt = performance.now();
}

function captureEditTarget() {
  const active = document.activeElement;
  if (isField(active)) {
    const start = active.selectionStart ?? 0;
    const end = active.selectionEnd ?? 0;
    const clearedByClick =
      start === end &&
      expanded.field === active &&
      expanded.start !== expanded.end &&
      performance.now() - collapsedAt < 300;
    if (clearedByClick) {
      active.setSelectionRange(expanded.start, expanded.end);
      saved = { ...expanded, value: active.value };
    } else {
      rememberField(active, start, end);
    }
  } else {
    const text = selectionText();
    saved = text ? { ...emptyEdit, text } : { ...emptyEdit };
  }
  void navigator.clipboard.readText().then(publishPaste).catch(() => publishPaste(""));
}

if (typeof document !== "undefined") {
  document.addEventListener(
    "selectionchange",
    () => {
      const active = document.activeElement;
      if (!isField(active)) return;
      rememberField(active, active.selectionStart ?? 0, active.selectionEnd ?? 0);
    },
    true,
  );
  document.addEventListener("contextmenu", captureEditTarget, true);
}

function restoreField() {
  const field = saved.field;
  if (!field || !field.isConnected) return null;
  field.focus({ preventScroll: true });
  field.setSelectionRange(saved.start, saved.end);
  return field;
}

function writeField(next: string, cursor: number) {
  const field = restoreField();
  if (!field) return;
  field.setRangeText(next, saved.start, saved.end, "end");
  field.setSelectionRange(cursor, cursor);
  field.dispatchEvent(new Event("input", { bubbles: true }));
}

function cutSelection() {
  if (!saved.text || !saved.field) return;
  void navigator.clipboard.writeText(saved.text);
  writeField("", saved.start);
}

function copySelection() {
  if (!saved.text) return;
  void navigator.clipboard.writeText(saved.text);
  restoreField();
}

async function pasteSelection() {
  let text = pasteText;
  if (!text) {
    try {
      text = await navigator.clipboard.readText();
    } catch {
      return;
    }
  }
  if (!text || !saved.field) return;
  writeField(text, saved.start + text.length);
}

function selectAll() {
  const field = saved.field;
  if (!field || !field.value) return;
  field.focus({ preventScroll: true });
  field.setSelectionRange(0, field.value.length);
}

function editEntries(canPaste: boolean): ContextMenuEntry[] {
  const canEdit = Boolean(saved.text);
  const canSelect = Boolean(saved.field?.value);
  return [
    {
      id: "edit",
      label: "Edit",
      items: [
        { id: "cut", label: "Cut", icon: ScissorIcon, onSelect: cutSelection, disabled: !canEdit || !saved.field },
        { id: "copy", label: "Copy", icon: Copy01Icon, onSelect: copySelection, disabled: !canEdit },
        { id: "paste", label: "Paste", icon: ClipboardIcon, onSelect: () => void pasteSelection(), disabled: !canPaste || !saved.field },
        { id: "select-all", label: "Select all", icon: TextIcon, onSelect: selectAll, disabled: !canSelect },
      ],
    },
  ];
}

export const ContextMenuRoot = BaseContextMenu.Root;
export const ContextMenuTrigger = BaseContextMenu.Trigger;

export function ContextMenuContent({
  edit = true,
  className,
  children,
  ...props
}: ComponentProps<typeof BaseContextMenu.Popup> & { edit?: boolean }) {
  const [canPaste, setCanPaste] = useState(Boolean(pasteText));
  useEffect(() => {
    if (!edit) return;
    const listener = (ready: boolean) => setCanPaste(ready);
    pasteListeners.add(listener);
    setCanPaste(Boolean(pasteText));
    return () => {
      pasteListeners.delete(listener);
    };
  }, [edit]);

  return (
    <BaseContextMenu.Portal>
      <BaseContextMenu.Positioner className="z-[var(--z-popover)]">
        <BaseContextMenu.Popup
          className={cn(popupClass, className)}
          onMouseDown={(event) => event.preventDefault()}
          {...props}
        >
          <Glide selector={HIGHLIGHTED} />
          {edit ? <EntryList items={editEntries(canPaste)} /> : null}
          {children ? (
            <>
              {edit ? <Separator className="my-1" /> : null}
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
        disabled={item.disabled}
        className={item.destructive ? "text-danger data-[highlighted]:text-danger" : undefined}
        onClick={item.disabled ? undefined : item.onSelect}
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
