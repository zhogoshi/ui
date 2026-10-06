"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { useMemo, useState } from "react";
import { cn } from "../lib/cn";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { Icon } from "./icon";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEAR_MIN = 1920;
const FUTURE_YEAR = 2030;

export interface CalendarRange {
  from?: Date;
  to?: Date;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function dayStamp(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function sameDay(a: Date, b: Date) {
  return dayStamp(a) === dayStamp(b);
}

const CELL = 100 / 7;
const glide =
  "absolute h-8 rounded-[var(--radius-sm)] transition-[left,top,width,opacity] duration-[calc(var(--motion-duration)*1.6)] ease-[var(--motion-ease)] motion-reduce:transition-none";

const rowTop = (index: number) => `calc(${Math.floor(index / 7)} * 2.25rem + 0.125rem)`;

function Selection({ marks, band }: { marks: number[]; band: readonly [number, number] | null }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 6 }, (_, row) => {
        const start = band ? Math.floor(band[0] / 7) : -1;
        const end = band ? Math.floor(band[1] / 7) : -1;
        const on = Boolean(band) && row >= start && row <= end;
        const from = on ? Math.max(band![0], row * 7) % 7 : 0;
        const to = on ? Math.min(band![1], row * 7 + 6) % 7 : 0;
        return (
          <span
            key={row}
            className={cn(glide, "bg-accent-muted")}
            style={{
              top: rowTop(row * 7),
              left: `${from * CELL}%`,
              width: on ? `${(to - from + 1) * CELL}%` : 0,
              opacity: on ? 1 : 0,
            }}
          />
        );
      })}
      {[0, 1].map((slot) => {
        const mark = marks[slot] ?? marks[0] ?? 0;
        const on = marks[slot] != null;
        return (
          <span
            key={slot}
            className={cn(glide, "bg-accent w-8")}
            style={{
              top: rowTop(mark),
              left: `calc(${(mark % 7) * CELL}% + (${CELL}% - 2rem) / 2)`,
              opacity: on ? 1 : 0,
            }}
          />
        );
      })}
    </div>
  );
}

export function Calendar({
  value,
  onChange,
  mode = "single",
  range,
  onRangeChange,
  allowPast = true,
  allowFuture = true,
  className,
}: {
  value?: Date;
  onChange?: (date: Date) => void;
  mode?: "single" | "range";
  range?: CalendarRange;
  onRangeChange?: (range: CalendarRange) => void;
  allowPast?: boolean;
  allowFuture?: boolean;
  className?: string;
}) {
  const [cursor, setCursor] = useState(() => startOfMonth(value ?? range?.from ?? new Date()));
  const [direction, setDirection] = useState<1 | -1>(1);
  const today = dayStamp(new Date());
  const yearCap = allowFuture ? FUTURE_YEAR : new Date().getFullYear();
  const years = useMemo(() => {
    const list: number[] = [];
    for (let year = yearCap; year >= YEAR_MIN; year -= 1) list.push(year);
    return list;
  }, [yearCap]);

  const cells = useMemo(() => {
    const first = (startOfMonth(cursor).getDay() + 6) % 7;
    const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return [...Array.from({ length: first }, () => null), ...Array.from({ length: count }, (_, index) => index + 1)];
  }, [cursor]);

  const selection = useMemo(() => {
    const first = cells.indexOf(1);
    const start = dayStamp(cursor);
    const end = dayStamp(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0));
    const indexOf = (stamp: number) => first + new Date(stamp).getDate() - 1;
    const visible = (date?: Date) => (date && dayStamp(date) >= start && dayStamp(date) <= end ? indexOf(dayStamp(date)) : null);
    const picked = mode === "single" ? [value] : [range?.from, range?.to];
    const marks = [...new Set(picked.map(visible).filter((mark): mark is number => mark !== null))];
    if (mode !== "range" || !range?.from || !range.to || sameDay(range.from, range.to)) return { marks, band: null };
    const from = Math.max(dayStamp(range.from), start);
    const to = Math.min(dayStamp(range.to), end);
    if (from > to) return { marks, band: null };
    return { marks, band: [indexOf(from), indexOf(to)] as const };
  }, [cells, cursor, mode, range, value]);

  const move = (next: Date, dir: 1 | -1) => {
    setDirection(dir);
    setCursor(startOfMonth(next));
  };

  const blocked = (day: number) => {
    const stamp = dayStamp(new Date(cursor.getFullYear(), cursor.getMonth(), day));
    if (!allowPast && stamp < today) return true;
    if (!allowFuture && stamp > today) return true;
    return false;
  };

  const pick = (day: number) => {
    if (blocked(day)) return;
    const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
    if (mode === "single") {
      onChange?.(date);
      return;
    }
    const current = range ?? {};
    if (!current.from || current.to) {
      onRangeChange?.({ from: date, to: undefined });
      return;
    }
    if (dayStamp(date) < dayStamp(current.from)) onRangeChange?.({ from: date, to: current.from });
    else onRangeChange?.({ from: current.from, to: date });
  };

  return (
    <div className={cn("bg-bg-elevated border-border w-72 rounded-[var(--radius-lg)] border p-3", className)}>
      <div className="mb-2 flex items-center justify-between gap-1">
        <button
          type="button"
          className="text-fg-muted hover:bg-bg-subtle hover:text-fg inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)]"
          onClick={() => move(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1), -1)}
          aria-label="Previous month"
        >
          <Icon icon={ArrowLeft01Icon} variant="stroke" />
        </button>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="hover:bg-bg-subtle rounded-[var(--radius-sm)] px-2 py-1 text-sm font-semibold">
              {MONTHS[cursor.getMonth()]}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-64 overflow-y-auto">
              {MONTHS.map((month, index) => (
                <DropdownMenuItem key={month} onClick={() => move(new Date(cursor.getFullYear(), index, 1), index >= cursor.getMonth() ? 1 : -1)}>
                  {month}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="hover:bg-bg-subtle rounded-[var(--radius-sm)] px-2 py-1 text-sm font-semibold">
              {cursor.getFullYear()}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-64 overflow-y-auto">
              {years.map((year) => (
                <DropdownMenuItem key={year} onClick={() => move(new Date(year, cursor.getMonth(), 1), year >= cursor.getFullYear() ? 1 : -1)}>
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <button
          type="button"
          className="text-fg-muted hover:bg-bg-subtle hover:text-fg inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)]"
          onClick={() => move(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1), 1)}
          aria-label="Next month"
        >
          <Icon icon={ArrowRight01Icon} variant="stroke" />
        </button>
      </div>
      <div
        key={`${cursor.getFullYear()}-${cursor.getMonth()}`}
        className={cn(
          "text-center",
          direction > 0 ? "animate-[month-next_var(--motion-duration)_var(--motion-ease)]" : "animate-[month-prev_var(--motion-duration)_var(--motion-ease)]",
        )}
      >
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((day) => (
            <span key={day} className="text-fg-muted text-[11px]">
              {day}
            </span>
          ))}
        </div>
        <div className="relative grid grid-cols-7">
          <Selection
            marks={selection.marks}
            band={selection.band}
          />
          {cells.map((day, index) => {
            if (day === null) return <span key={`empty-${index}`} />;
            const marked = selection.marks.includes(index);
            return (
              <div key={day} className="flex h-9 items-center justify-center">
                <button
                  type="button"
                  disabled={blocked(day)}
                  className={cn(
                    "relative flex size-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-sm transition-colors duration-[var(--motion-duration)] disabled:cursor-not-allowed disabled:opacity-40",
                    marked ? "text-accent-fg" : "hover:bg-bg-subtle",
                  )}
                  onClick={() => pick(day)}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
