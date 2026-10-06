"use client";

import { useEffect, useState } from "react";
import { cn } from "../lib/cn";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function useSettled(value: number, delay: number) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return settled;
}

function Reel({ digit }: { digit: string }) {
  const value = Number(digit);
  const [soft, setSoft] = useState(false);
  useEffect(() => {
    setSoft(true);
    const timer = window.setTimeout(() => setSoft(false), 160);
    return () => window.clearTimeout(timer);
  }, [value]);
  if (!Number.isInteger(value)) return <span className="inline-block px-px">{digit}</span>;
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
      <span
        className={cn(
          "absolute inset-x-0 top-0 flex flex-col transition-[transform,filter] duration-[var(--motion-duration)] ease-[var(--motion-ease)] motion-reduce:transition-none",
          soft ? "blur-[2px]" : "blur-none",
        )}
        style={{ transform: `translateY(-${value}em)` }}
      >
        {DIGITS.map((item) => (
          <span key={item} className="flex h-[1em] items-center justify-center">
            {item}
          </span>
        ))}
      </span>
    </span>
  );
}

export function Counter({ value, className }: { value: number; className?: string }) {
  const shown = useSettled(value, 120);
  return (
    <span className={cn("inline-flex items-center font-mono text-3xl font-medium tabular-nums", className)}>
      {String(shown)
        .split("")
        .map((digit, index, digits) => (
          <Reel key={digits.length - index} digit={digit} />
        ))}
    </span>
  );
}
