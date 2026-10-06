"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import { Add01Icon, Cancel01Icon, MinusSignIcon, Search01Icon, ViewIcon, ViewOffSlashIcon } from "@hugeicons-pro/core-stroke-rounded";
import { useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { Icon } from "./icon";

const fieldClass =
  "bg-bg-elevated text-fg placeholder:text-fg-subtle border-border w-full rounded-[var(--radius-md)] border px-3 text-sm transition-colors duration-[var(--motion-duration)] hover:border-border-strong focus-visible:border-accent focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

export const searchControlClass = cn(
  fieldClass,
  "[height:var(--row-h)] pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
);

export function SearchChrome({
  value,
  disabled,
  onClear,
  children,
}: {
  value: string;
  disabled?: boolean;
  onClear: () => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <Icon
        icon={Search01Icon}
        variant="stroke"
        className="text-fg-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
      />
      {children}
      {value ? (
        <button
          type="button"
          aria-label="Clear"
          disabled={disabled}
          onPointerDown={(event) => event.preventDefault()}
          onClick={onClear}
          className="text-fg-muted hover:text-fg absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center disabled:pointer-events-none disabled:opacity-50"
        >
          <Icon icon={Cancel01Icon} variant="stroke" />
        </button>
      ) : null}
    </div>
  );
}

type InputProps = ComponentProps<typeof BaseInput>;

function bound(value: InputProps["min"]) {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function NumberInput({ className, min, max, step, disabled, value, defaultValue, onChange, ...props }: InputProps) {
  const [current, setCurrent] = useState(String(defaultValue ?? value ?? ""));
  const minBound = bound(min);
  const maxBound = bound(max);
  const stepValue = bound(step) ?? 1;
  const shown = value !== undefined ? String(value) : current;
  const numeric = shown === "" ? 0 : Number(shown);

  const commit = (next: number) => {
    const text = String(next);
    setCurrent(text);
    onChange?.({ target: { value: text } } as never);
  };

  const nudge = (direction: 1 | -1) => {
    if (disabled || Number.isNaN(numeric)) return;
    let next = (shown === "" ? 0 : numeric) + direction * stepValue;
    if (minBound !== undefined) next = Math.max(minBound, next);
    if (maxBound !== undefined) next = Math.min(maxBound, next);
    commit(next);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button type="button" aria-label="Decrease" disabled={disabled} onClick={() => nudge(-1)} className="border-border bg-bg-elevated text-fg hover:bg-bg-subtle inline-flex size-9 items-center justify-center rounded-[var(--radius-md)] border">
        <Icon icon={MinusSignIcon} variant="stroke" />
      </button>
      <BaseInput
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        value={shown}
        onChange={(event) => {
          setCurrent(event.target.value);
          onChange?.(event);
        }}
        className={cn(fieldClass, "[height:var(--row-h)] text-center")}
        {...props}
      />
      <button type="button" aria-label="Increase" disabled={disabled} onClick={() => nudge(1)} className="border-border bg-bg-elevated text-fg hover:bg-bg-subtle inline-flex size-9 items-center justify-center rounded-[var(--radius-md)] border">
        <Icon icon={Add01Icon} variant="stroke" />
      </button>
    </div>
  );
}

function PasswordInput({ className, disabled, ...props }: InputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <BaseInput
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        type={visible ? "text" : "password"}
        className={cn(fieldClass, "[height:var(--row-h)] pr-10 [&::-ms-reveal]:hidden", className)}
        {...props}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        disabled={disabled}
        onClick={() => setVisible((current) => !current)}
        className="text-fg-muted hover:text-fg absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center disabled:pointer-events-none disabled:opacity-50"
      >
        <Icon icon={visible ? ViewOffSlashIcon : ViewIcon} variant="stroke" />
      </button>
    </div>
  );
}

function SearchInput({ className, disabled, value, defaultValue, onChange, onValueChange, ...props }: InputProps) {
  const input = useRef<HTMLInputElement>(null);
  const [inner, setInner] = useState(String(defaultValue ?? ""));
  const shown = value !== undefined ? String(value) : inner;

  const apply = (next: string) => {
    setInner(next);
    onChange?.({ target: { value: next } } as never);
    onValueChange?.(next, { reason: "none" } as never);
    input.current?.focus();
  };

  return (
    <SearchChrome value={shown} disabled={disabled} onClear={() => apply("")}>
      <BaseInput
        ref={input}
        type="search"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        {...props}
        value={shown}
        onChange={(event) => {
          setInner(event.target.value);
          onChange?.(event);
        }}
        onValueChange={onValueChange}
        className={cn(searchControlClass, className)}
      />
    </SearchChrome>
  );
}

export function Input({ className, type, autoComplete = "off", spellCheck = false, ...props }: InputProps) {
  if (type === "password") return <PasswordInput className={className} {...props} />;
  if (type === "number") return <NumberInput className={className} {...props} />;
  if (type === "search") return <SearchInput className={className} {...props} />;
  return (
    <BaseInput
      type={type}
      autoComplete={autoComplete}
      spellCheck={spellCheck}
      className={cn(fieldClass, "[height:var(--row-h)]", className)}
      {...props}
    />
  );
}

export function Textarea({ className, spellCheck = false, ...props }: ComponentProps<"textarea">) {
  return <textarea spellCheck={spellCheck} className={cn(fieldClass, "hogoshi-textarea min-h-24 resize-y py-2", className)} {...props} />;
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-fg text-sm font-medium", className)} {...props} />;
}
