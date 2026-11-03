"use client";

import {
  Alert01Icon,
  ArrowDown01Icon,
  ArrowUp02Icon,
  Attachment01Icon,
  Cancel01Icon,
  File01Icon,
  FlashIcon,
  StopCircleIcon,
  Tick02Icon,
  Upload04Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "../lib/cn";
import type { AppIcon } from "./icon";
import { Icon } from "./icon";
import { Image, ImageGallery, ImageViewer, type ViewerImage } from "./image-viewer";
import { Button } from "./button";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "./collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { Separator } from "./separator";
import { Spinner } from "./spinner";

const workingText =
  "animate-[shimmer_1.8s_linear_infinite] bg-[linear-gradient(90deg,var(--fg-muted)_20%,var(--fg)_50%,var(--fg-muted)_80%)] bg-[length:200%_100%] bg-clip-text text-transparent";

function ChatCaret() {
  return (
    <span
      aria-hidden
      className="bg-fg animate-[chat-caret_1.1s_var(--motion-ease)_infinite] ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] rounded-full"
    />
  );
}

export function ChatMessage({
  role,
  streaming = false,
  attachments,
  actions,
  className,
  children,
}: {
  role: "user" | "assistant";
  streaming?: boolean;
  attachments?: ViewerImage[];
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const [viewing, setViewing] = useState(false);
  const [viewIndex, setViewIndex] = useState(0);

  return (
    <div className={cn("group/chat flex w-full min-w-0 flex-col", role === "user" && "items-end", className)}>
      {attachments?.length ? (
        <div
          className={cn(
            "mb-2 flex w-full max-w-[85%] flex-wrap gap-1.5",
            role === "user" ? "justify-end" : "justify-start",
          )}
        >
          {attachments.map((image, at) => (
            <button
              key={`${image.src}-${at}`}
              type="button"
              aria-label={`Open ${image.alt ?? "attachment"}`}
              className="group/attachment border-border bg-bg-subtle focus-visible:ring-ring size-16 cursor-zoom-in overflow-hidden rounded-[var(--radius-sm)] border outline-none focus-visible:ring-2"
              onClick={() => {
                setViewIndex(at);
                setViewing(true);
              }}
            >
              <img
                src={image.src}
                alt={image.alt ?? ""}
                loading="lazy"
                draggable={false}
                className="size-full object-cover transition-transform duration-[var(--motion-duration)] ease-[var(--motion-ease)] group-hover/attachment:scale-[1.05]"
              />
            </button>
          ))}
        </div>
      ) : null}
      {role === "user" ? (
        <div className="hogoshi-selectable bg-bg-subtle max-w-[85%] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm leading-relaxed">
          {children}
          {streaming ? <ChatCaret /> : null}
        </div>
      ) : (
        <div className="hogoshi-selectable text-fg w-full min-w-0 text-sm leading-relaxed">
          {children}
          {streaming ? <ChatCaret /> : null}
        </div>
      )}
      {actions}
      {attachments?.length ? (
        <ImageViewer
          images={attachments}
          index={viewIndex}
          open={viewing}
          onOpenChange={setViewing}
          onIndexChange={setViewIndex}
        />
      ) : null}
    </div>
  );
}

export function ChatActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 opacity-0 transition-opacity duration-[var(--motion-duration)] ease-[var(--motion-ease)] focus-within:opacity-100 group-hover/chat:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

export function ChatThinking({
  status,
  state = "working",
  reasoning,
  defaultOpen = false,
  className,
}: {
  status: ReactNode;
  state?: "working" | "attention";
  reasoning?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const attention = state === "attention";
  const label = (
    <span className={cn("text-xs font-medium", attention ? "text-warning" : workingText)}>{status}</span>
  );

  if (!reasoning) {
    return (
      <div className={cn("flex min-w-0 items-center gap-2", className)}>
        {attention ? (
          <Icon
            icon={Alert01Icon}
            variant="stroke"
            size={14}
            className="text-warning animate-[loader-pulse_calc(var(--motion-duration)*2)_var(--motion-ease)_infinite]"
          />
        ) : null}
        {label}
      </div>
    );
  }

  return (
    <Collapsible defaultOpen={defaultOpen} className={cn("w-full min-w-0", className)}>
      <CollapsibleTrigger className="group/thinking min-w-0 gap-2 py-0.5">
        <Icon
          icon={ArrowDown01Icon}
          variant="stroke"
          size={12}
          className="text-fg-subtle shrink-0 transition-transform duration-[var(--motion-duration)] ease-[var(--motion-ease)] group-data-[panel-open]/thinking:rotate-180"
        />
        <span className="truncate">{label}</span>
      </CollapsibleTrigger>
      <CollapsiblePanel className="hogoshi-selectable text-fg-muted min-w-0 py-1 pl-5 text-xs leading-relaxed">
        {reasoning}
      </CollapsiblePanel>
    </Collapsible>
  );
}

export type ChatToolStatus = "running" | "success" | "error" | "attention";

function ToolStatusIcon({ status }: { status: ChatToolStatus }) {
  if (status === "running") return <Spinner size="sm" className="text-fg-muted shrink-0" />;
  if (status === "success")
    return <Icon icon={Tick02Icon} variant="stroke" size={16} className="text-success shrink-0" />;
  if (status === "error")
    return <Icon icon={Cancel01Icon} variant="stroke" size={16} className="text-danger shrink-0" />;
  return (
    <Icon
      icon={Alert01Icon}
      variant="stroke"
      size={16}
      className="text-warning animate-[loader-pulse_calc(var(--motion-duration)*2)_var(--motion-ease)_infinite] shrink-0"
    />
  );
}

export function ChatToolCall({
  status,
  label,
  meta,
  defaultOpen = false,
  className,
  children,
}: {
  status: ChatToolStatus;
  label: ReactNode;
  meta?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  if (!children) {
    return (
      <div className={cn("flex min-w-0 items-center gap-2", className)}>
        <ToolStatusIcon status={status} />
        <span className="text-fg truncate text-sm">{label}</span>
        {meta ? <span className="text-fg-subtle min-w-0 truncate text-xs">{meta}</span> : null}
      </div>
    );
  }

  return (
    <Collapsible defaultOpen={defaultOpen} className={cn("w-full min-w-0", className)}>
      <CollapsibleTrigger className="group/tool min-w-0 gap-2 py-0.5">
        <ToolStatusIcon status={status} />
        <span className="text-fg truncate text-sm">{label}</span>
        {meta ? <span className="text-fg-subtle min-w-0 truncate text-xs">{meta}</span> : null}
        <Icon
          icon={ArrowDown01Icon}
          variant="stroke"
          size={12}
          className="text-fg-subtle ml-auto shrink-0 transition-transform duration-[var(--motion-duration)] ease-[var(--motion-ease)] group-data-[panel-open]/tool:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsiblePanel className="hogoshi-selectable my-1 ml-[7px] min-w-0 border-border border-l py-1 pr-1 pl-3.5">
        {children}
      </CollapsiblePanel>
    </Collapsible>
  );
}

type DiffKind = "file" | "hunk" | "add" | "del" | "ctx";

const diffLineClass: Record<DiffKind, string> = {
  file: "text-fg-subtle",
  hunk: "text-accent bg-accent-muted/40",
  add: "text-success bg-success/10",
  del: "text-danger bg-danger/10",
  ctx: "text-fg-muted",
};

function diffKind(line: string): DiffKind {
  if (line.startsWith("diff --git") || line.startsWith("+++") || line.startsWith("---")) return "file";
  if (line.startsWith("@@")) return "hunk";
  if (line.startsWith("+")) return "add";
  if (line.startsWith("-")) return "del";
  return "ctx";
}

export function ChatDiff({ diff, className, ...props }: { diff: string } & ComponentProps<"div">) {
  const lines = diff.replace(/\n$/, "").split("\n");
  return (
    <div
      className={cn(
        "border-border bg-bg-subtle max-h-72 min-w-0 w-full overflow-auto rounded-[var(--radius-md)] border font-mono text-xs",
        className,
      )}
      {...props}
    >
      {lines.map((line, index) => (
        <div key={index} className={cn("px-3 py-px whitespace-pre", diffLineClass[diffKind(line)])}>
          {line || " "}
        </div>
      ))}
    </div>
  );
}

export interface ChatContextItem {
  id: string;
  label: string;
  src?: string;
  icon?: AppIcon;
}

export interface ChatModelOption {
  id: string;
  label: string;
  hint?: string;
}

function ContextChip({ item, onRemove }: { item: ChatContextItem; onRemove?: () => void }) {
  return (
    <span className="border-border bg-bg-subtle text-fg inline-flex h-7 max-w-[16rem] min-w-0 items-center gap-1.5 rounded-full border py-1 pr-1 pl-2.5">
      {item.src ? (
        <img src={item.src} alt="" draggable={false} className="size-4 shrink-0 rounded-full object-cover" />
      ) : (
        <Icon icon={item.icon ?? File01Icon} variant="stroke" size={12} className="text-fg-muted shrink-0" />
      )}
      <span className="min-w-0 truncate text-xs">{item.label}</span>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${item.label}`}
          onClick={onRemove}
          className="text-fg-muted hover:text-fg focus-visible:ring-ring inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2"
        >
          <Icon icon={Cancel01Icon} variant="stroke" size={12} />
        </button>
      ) : null}
    </span>
  );
}

function ModelMenu({
  model,
  models,
  onSelect,
}: {
  model: ChatModelOption;
  models: ChatModelOption[];
  onSelect?: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="sm" variant="ghost" aria-label="Select model" className="text-fg-muted h-7 px-1.5" />
        }
      >
        <span className="inline-flex items-center gap-1.5">
          <Icon icon={FlashIcon} variant="stroke" size={14} className="text-fg-subtle shrink-0" />
          <span className="max-w-40 truncate text-xs">{model.label}</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {models.map((option) => (
          <DropdownMenuItem key={option.id} onClick={() => onSelect?.(option.id)}>
            {option.id === model.id ? (
              <Icon icon={Tick02Icon} variant="stroke" size={16} className="text-accent shrink-0" />
            ) : (
              <span aria-hidden className="size-4 shrink-0" />
            )}
            <span className="truncate">{option.label}</span>
            {option.hint ? <span className="text-fg-subtle ml-auto text-xs">{option.hint}</span> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ChatAttach({
  items = [],
  onInsert,
  onUpload,
  accept,
  multiple = true,
  className,
}: {
  items?: ChatSuggestItem[];
  onInsert?: (id: string) => void;
  onUpload?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = "";
          if (files.length) onUpload?.(files);
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" aria-label="Attach" className={className} />}>
          <Icon icon={Attachment01Icon} variant="stroke" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {items.length ? (
            <>
              <p className="text-fg-subtle px-2 py-1.5 text-[11px] font-medium tracking-wider uppercase">Project files</p>
              <div className="max-h-60 overflow-y-auto overscroll-contain">
                {items.map((item) => (
                  <DropdownMenuItem key={item.id} onClick={() => onInsert?.(item.id)}>
                    <Icon icon={item.icon ?? File01Icon} variant="stroke" size={16} className="text-fg-muted shrink-0" />
                    <span className="min-w-0 truncate">{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <Separator className="my-1" />
            </>
          ) : null}
          <DropdownMenuItem onClick={() => input.current?.click()}>
            <Icon icon={Upload04Icon} variant="stroke" size={16} className="text-fg-muted shrink-0" />
            Upload from computer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function ChatComposer({
  value,
  onValueChange,
  onSubmit,
  onStop,
  onKeyDown,
  busy = false,
  placeholder,
  disabled,
  context,
  onRemoveContext,
  model,
  models,
  onModelChange,
  actions,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit?: () => void;
  onStop?: () => void;
  onKeyDown?: ComponentProps<"textarea">["onKeyDown"];
  busy?: boolean;
  placeholder?: string;
  disabled?: boolean;
  context?: ChatContextItem[];
  onRemoveContext?: (id: string) => void;
  model?: ChatModelOption;
  models?: ChatModelOption[];
  onModelChange?: (id: string) => void;
  actions?: ReactNode;
  className?: string;
}) {
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 192)}px`;
  }, [value]);

  return (
    <div
      className={cn(
        "border-border bg-bg-elevated focus-within:ring-ring focus-within:border-accent rounded-[var(--radius-lg)] border transition-[border-color,box-shadow] duration-[var(--motion-duration)] ease-[var(--motion-ease)] focus-within:ring-2",
        className,
      )}
    >
      {context?.length ? (
        <div className="flex flex-wrap gap-1.5 px-2.5 pt-2.5">
          {context.map((item) => (
            <ContextChip
              key={item.id}
              item={item}
              onRemove={onRemoveContext ? () => onRemoveContext(item.id) : undefined}
            />
          ))}
        </div>
      ) : null}
      <textarea
        ref={textarea}
        rows={1}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "Enter" && !event.shiftKey && !busy && !disabled) {
            event.preventDefault();
            onSubmit?.();
          }
        }}
        className={cn(
          "placeholder:text-fg-subtle max-h-48 w-full resize-none bg-transparent px-3.5 pb-2 text-sm leading-relaxed outline-none disabled:cursor-not-allowed disabled:opacity-50",
          context?.length ? "pt-2.5" : "pt-3",
        )}
      />
      <div className="flex items-center justify-between gap-2 px-2 pb-2">
        <div className="flex min-w-0 items-center gap-0.5">
          {model && models?.length ? <ModelMenu model={model} models={models} onSelect={onModelChange} /> : null}
          {actions}
        </div>
        {busy ? (
          onStop ? (
            <Button size="icon-sm" variant="ghost" aria-label="Stop" onClick={onStop}>
              <Icon icon={StopCircleIcon} variant="stroke" />
            </Button>
          ) : null
        ) : (
          <Button
            size="icon-sm"
            variant="primary"
            aria-label="Send"
            disabled={disabled || !value.trim()}
            onClick={() => onSubmit?.()}
          >
            <Icon icon={ArrowUp02Icon} variant="stroke" />
          </Button>
        )}
      </div>
    </div>
  );
}

export interface ChatSuggestItem {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  icon?: AppIcon;
  group?: string;
}

export function ChatSuggest({
  open,
  items,
  activeIndex = 0,
  onActiveIndexChange,
  onSelect,
  emptyLabel = "No results",
  className,
}: {
  open: boolean;
  items: ChatSuggestItem[];
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  onSelect: (item: ChatSuggestItem) => void;
  emptyLabel?: string;
  className?: string;
}) {
  if (!open) return null;

  const groups: { name?: string; items: { item: ChatSuggestItem; index: number }[] }[] = [];
  let flat = 0;
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.name === item.group) {
      last.items.push({ item, index: flat });
    } else {
      groups.push({ name: item.group, items: [{ item, index: flat }] });
    }
    flat += 1;
  }

  return (
    <div
      role="listbox"
      className={cn(
        "border-border bg-bg-elevated/70 animate-[item-in_var(--motion-duration)_var(--motion-ease)] z-[var(--z-popover)] max-h-64 overflow-y-auto overscroll-contain rounded-[var(--radius-md)] border p-1 shadow-[var(--shadow-md)] backdrop-blur-2xl outline-none",
        className,
      )}
    >
      {items.length === 0 ? (
        <p className="text-fg-muted px-2 py-3 text-center text-sm">{emptyLabel}</p>
      ) : (
        groups.map((group, groupIndex) => (
          <div key={group.name ?? groupIndex}>
            {group.name ? (
              <p className="text-fg-subtle px-2 py-1.5 text-[11px] font-medium tracking-wider uppercase">{group.name}</p>
            ) : null}
            {group.items.map(({ item, index }) => (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm outline-none",
                  index === activeIndex ? "bg-bg-subtle text-fg" : "text-fg-muted",
                )}
                onMouseEnter={() => onActiveIndexChange?.(index)}
                onClick={() => onSelect(item)}
              >
                {item.icon ? <Icon icon={item.icon} variant="stroke" size={16} className="text-fg-muted shrink-0" /> : null}
                <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                {item.hint ? <span className="text-fg-subtle shrink-0 text-xs">{item.hint}</span> : null}
              </button>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export function ChatMedia({
  images,
  actions,
  className,
}: {
  images: ViewerImage[];
  actions?: ReactNode;
  className?: string;
}) {
  if (images.length === 0) return null;
  const single = images.length === 1;
  return (
    <div className={cn("group/media relative min-w-0 max-w-lg", className)}>
      {single ? (
        <Image
          src={images[0].src}
          alt={images[0].alt}
          name={images[0].name}
          className="border-border max-h-48 w-auto max-w-full rounded-[var(--radius-md)] border object-cover"
        />
      ) : (
        <ImageGallery images={images} className="min-w-0" />
      )}
      {actions ? (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity duration-[var(--motion-duration)] ease-[var(--motion-ease)] focus-within:opacity-100 group-hover/media:opacity-100">
          {actions}
        </div>
      ) : null}
    </div>
  );
}