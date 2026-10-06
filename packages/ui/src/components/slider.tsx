"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

type SliderProps = Omit<ComponentProps<typeof BaseSlider.Root>, "value" | "defaultValue" | "onValueChange"> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
};

export function Slider({ className, onValueChange, ...props }: SliderProps) {
  return (
    <BaseSlider.Root
      className={cn(
        "hogoshi-grab flex w-full touch-none items-center py-2 data-[disabled]:opacity-50",
        className,
      )}
      onValueChange={(next) => onValueChange?.(typeof next === "number" ? next : next[0])}
      {...props}
    >
      <BaseSlider.Control className="flex w-full items-center">
        <BaseSlider.Track className="bg-bg-muted relative h-1 w-full rounded-full">
          <BaseSlider.Indicator className="bg-accent absolute h-full rounded-full" />
          <BaseSlider.Thumb className="hogoshi-grab border-accent bg-bg-elevated size-4 rounded-full border shadow-[var(--shadow-sm)] outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
