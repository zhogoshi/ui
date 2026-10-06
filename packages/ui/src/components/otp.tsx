"use client";

import { OTPField } from "@base-ui/react/otp-field";
import { useRef, useState, type ComponentProps } from "react";
import { cn } from "../lib/cn";

const slotClass =
  "border-border bg-bg-elevated focus:border-accent focus:ring-ring size-10 cursor-text rounded-[var(--radius-md)] border text-center text-sm text-transparent caret-transparent outline-none selection:bg-transparent selection:text-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

const glyphClass = "text-fg absolute inset-0 flex items-center justify-center text-sm";

interface Glyph {
  id: number;
  text: string;
}

let seq = 0;

function OtpSlot({ text }: { text: string }) {
  const [glyph, setGlyph] = useState<Glyph | null>(null);
  const [leaving, setLeaving] = useState<Glyph[]>([]);

  if ((glyph?.text ?? "") !== text) {
    if (glyph) setLeaving((list) => [...list, glyph]);
    setGlyph(text ? { id: (seq += 1), text } : null);
  }

  return (
    <span className="relative">
      <OTPField.Input className={slotClass} />
      <span aria-hidden className="pointer-events-none absolute inset-px overflow-hidden rounded-[var(--radius-md)] select-none">
        {glyph ? (
          <span key={glyph.id} className={cn(glyphClass, "animate-[otp-in_calc(var(--motion-duration)*2)_var(--motion-ease)]")}>
            {glyph.text}
          </span>
        ) : null}
        {leaving.map((item) => (
          <span
            key={item.id}
            className={cn(glyphClass, "animate-[otp-out_calc(var(--motion-duration)*2)_var(--motion-ease)_forwards]")}
            onAnimationEnd={() => setLeaving((list) => list.filter((entry) => entry.id !== item.id))}
          >
            {item.text}
          </span>
        ))}
      </span>
    </span>
  );
}

type OtpProps = Omit<ComponentProps<typeof OTPField.Root>, "length" | "mask"> & {
  length?: number;
  mask?: boolean;
};

export function Otp({
  length = 6,
  className,
  mask = false,
  value,
  defaultValue = "",
  onValueChange,
  onValueComplete,
  ...props
}: OtpProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;

  return (
    <OTPField.Root
      ref={rootRef}
      length={length}
      mask={mask}
      value={current}
      className={cn("flex gap-2", className)}
      onValueChange={(next, eventDetails) => {
        setInner(next);
        onValueChange?.(next, eventDetails);
      }}
      onValueComplete={(next, eventDetails) => {
        rootRef.current?.querySelectorAll("input").forEach((input) => input.blur());
        onValueComplete?.(next, eventDetails);
      }}
      {...props}
    >
      {Array.from({ length }, (_, index) => {
        const char = current[index] ?? "";
        return <OtpSlot key={index} text={char && mask ? "•" : char} />;
      })}
    </OTPField.Root>
  );
}
