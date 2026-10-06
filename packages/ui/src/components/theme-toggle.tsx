"use client";

import { Moon02Icon, Sun01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { flushSync } from "react-dom";
import { cn } from "../lib/cn";
import { Icon } from "./icon";
import { sidebarLabel } from "./sidebar";
import { useTheme, type ResolvedMode } from "../theme/theme";

const REVEAL_MS = 900;
let switching = false;

function applyMode(next: ResolvedMode) {
  document.documentElement.setAttribute("data-mode", next);
  document.documentElement.style.colorScheme = next;
}

function freeze(media: HTMLVideoElement | HTMLCanvasElement, copy: Element) {
  const canvas = document.createElement("canvas");
  canvas.className = media.className;
  canvas.style.cssText = media.style.cssText;
  canvas.width = media instanceof HTMLVideoElement ? media.videoWidth || media.clientWidth : media.width;
  canvas.height = media instanceof HTMLVideoElement ? media.videoHeight || media.clientHeight : media.height;
  try {
    canvas.getContext("2d")?.drawImage(media, 0, 0, canvas.width, canvas.height);
  } catch {
    return;
  }
  copy.replaceWith(canvas);
}

function snapshot(next: ResolvedMode) {
  const body = document.body;
  const originals = [...body.querySelectorAll("*")];
  const page = document.createElement("div");
  page.className = body.className;
  page.style.cssText = body.style.cssText;
  page.append(...body.cloneNode(true).childNodes);

  const layer = document.createElement("div");
  layer.className = "hogoshi-theme-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.setAttribute("data-mode", next);
  layer.inert = true;
  layer.append(page);
  body.append(layer);

  const copies = [...page.querySelectorAll("*")];
  originals.forEach((node, at) => {
    const copy = copies[at];
    if (!copy) return;
    if (node.scrollTop || node.scrollLeft) {
      copy.scrollTop = node.scrollTop;
      copy.scrollLeft = node.scrollLeft;
    }
    if (node instanceof HTMLVideoElement || node instanceof HTMLCanvasElement) freeze(node, copy);
  });
  layer.scrollTop = window.scrollY;
  layer.scrollLeft = window.scrollX;
  return layer;
}

function reveal(layer: HTMLElement) {
  const radius = Math.ceil(Math.hypot(window.innerWidth, window.innerHeight));
  return layer
    .animate([{ clipPath: "circle(0px at 50% 50%)" }, { clipPath: `circle(${radius}px at 50% 50%)` }], {
      duration: REVEAL_MS,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: "forwards",
    })
    .finished.catch(() => undefined);
}

export function ThemeToggle({
  className,
  label,
  hideLabel = false,
}: {
  className?: string;
  label?: string;
  hideLabel?: boolean;
}) {
  const { resolved, setMode } = useTheme();

  const swap = (next: ResolvedMode) => {
    flushSync(() => setMode(next));
    applyMode(next);
  };

  const onClick = () => {
    if (switching) return;
    const root = document.documentElement;
    const next = root.getAttribute("data-mode") === "dark" ? "light" : "dark";
    const reduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches || root.getAttribute("data-motion") === "off";
    if (reduce) {
      swap(next);
      return;
    }

    switching = true;
    const layer = snapshot(next);
    void reveal(layer).then(() => {
      root.setAttribute("data-theme-switching", "");
      swap(next);
      layer.remove();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.removeAttribute("data-theme-switching");
          switching = false;
        });
      });
    });
  };

  return (
    <button
      type="button"
      className={cn(
        "text-fg-muted hover:bg-bg-subtle hover:text-fg inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        label
          ? "h-[calc(var(--row-h)-0.25rem)] w-full justify-start overflow-hidden px-3 whitespace-nowrap"
          : "size-8 justify-center",
        className,
      )}
      aria-label={label ?? (resolved === "dark" ? "Switch to light" : "Switch to dark")}
      onClick={onClick}
    >
      <Icon icon={resolved === "dark" ? Sun01Icon : Moon02Icon} variant="stroke" size={16} className="shrink-0" />
      {label ? <span className={cn(sidebarLabel, hideLabel && "opacity-0")}>{label}</span> : null}
    </button>
  );
}
