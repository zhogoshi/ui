"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";

const transition =
  "transition-[opacity,transform,translate,scale] duration-[var(--motion-duration)] ease-[var(--motion-ease)] motion-reduce:transition-none";

const backdropTransition =
  "transition-[opacity,backdrop-filter] duration-[calc(var(--motion-duration)*2.2)] ease-[var(--motion-ease)] motion-reduce:transition-none";

export const backdropMotion = `${backdropTransition} opacity-100 backdrop-blur-2xl data-[starting-style]:opacity-0 data-[starting-style]:backdrop-blur-[0px] data-[ending-style]:opacity-0 data-[ending-style]:backdrop-blur-[0px]`;

export const popupMotion = `${transition} origin-[var(--transform-origin)] scale-100 opacity-100 data-[starting-style]:scale-[0.96] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.96] data-[ending-style]:opacity-0`;

export const popupClass =
  "border-border bg-bg-elevated/60 text-fg relative z-[var(--z-popover)] min-w-40 overflow-visible rounded-[var(--radius-md)] border p-1 shadow-[var(--shadow-md)] backdrop-blur-2xl outline-none " +
  popupMotion;

export const popupItemClass =
  "relative flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[highlighted]:text-fg";

export const HIGHLIGHTED = "[data-highlighted]";

export const popupArrowClass =
  "pointer-events-none data-[side=bottom]:top-[-5px] data-[side=left]:right-[-8px] data-[side=left]:rotate-90 data-[side=right]:left-[-8px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-5px] data-[side=top]:rotate-180";

export function PopupArrowSvg({ inverted = false }: { inverted?: boolean }) {
  return (
    <svg width="12" height="6" viewBox="0 0 12 6" aria-hidden>
      <path
        d="M0.8 5.4 L6 1 L11.2 5.4"
        className={inverted ? "fill-fg stroke-fg" : "fill-bg-elevated stroke-border"}
        strokeWidth="1"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PopupArrow({
  arrow: Arrow,
  inverted = false,
}: {
  arrow: ComponentType<{ className?: string; children?: ReactNode }>;
  inverted?: boolean;
}) {
  return (
    <Arrow className={popupArrowClass}>
      <PopupArrowSvg inverted={inverted} />
    </Arrow>
  );
}

export function useAnchoredPopup() {
  const [desktop, setDesktop] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const apply = () => setDesktop(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  if (!desktop) {
    return {
      side: "bottom" as const,
      align: "center" as const,
      sideOffset: 8,
      popupClassName: "w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)]",
    };
  }
  return { side: "bottom" as const, align: "start" as const, sideOffset: 6, popupClassName: "" };
}
