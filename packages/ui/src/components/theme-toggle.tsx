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

function paintTheme(media: HTMLCanvasElement, mode: string | null) {
  media.dispatchEvent(new CustomEvent("hogoshi-theme-paint", { detail: mode }));
}

function freeze(media: HTMLVideoElement | HTMLCanvasElement, copy: Element) {
  const canvas = document.createElement("canvas");
  canvas.className = media.className;
  canvas.style.cssText = media.style.cssText;
  canvas.width = media instanceof HTMLVideoElement ? media.videoWidth || media.clientWidth : media.width;
  canvas.height = media instanceof HTMLVideoElement ? media.videoHeight || media.clientHeight : media.height;
  const next = copy.closest("[data-mode]")?.getAttribute("data-mode") ?? null;
  const current = document.documentElement.getAttribute("data-mode");
  if (media instanceof HTMLCanvasElement && next) paintTheme(media, next);
  try {
    canvas.getContext("2d")?.drawImage(media, 0, 0, canvas.width, canvas.height);
  } catch {
    if (media instanceof HTMLCanvasElement && current) paintTheme(media, current);
    return;
  }
  if (media instanceof HTMLCanvasElement && current) paintTheme(media, current);
  copy.replaceWith(canvas);
}

function lockScroll() {
  const root = document.querySelector("[data-scroll-root]");
  if (root instanceof HTMLElement) {
    const top = root.scrollTop;
    const left = root.scrollLeft;
    return () => {
      root.scrollTop = top;
      root.scrollLeft = left;
    };
  }
  const top = window.scrollY;
  const left = window.scrollX;
  const body = document.body;
  const prev = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
  };
  body.style.position = "fixed";
  body.style.top = `-${top}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  return () => {
    body.style.position = prev.position;
    body.style.top = prev.top;
    body.style.left = prev.left;
    body.style.right = prev.right;
    body.style.width = prev.width;
    window.scrollTo(left, top);
  };
}

function holdPage() {
  const root = document.documentElement;
  root.setAttribute("data-theme-switching", "");
  const media = [...document.querySelectorAll("video, audio")].filter(
    (node): node is HTMLMediaElement => node instanceof HTMLMediaElement && !node.paused,
  );
  media.forEach((node) => node.pause());
  const running = document.getAnimations().filter((animation) => animation.playState === "running");
  running.forEach((animation) => animation.pause());
  const stop = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " " && event.key !== "Escape") return;
    stop(event);
  };
  const url = location.href;
  const onPop = () => {
    if (location.href !== url) history.pushState(null, "", url);
  };
  document.addEventListener("click", stop, true);
  document.addEventListener("auxclick", stop, true);
  document.addEventListener("submit", stop, true);
  document.addEventListener("keydown", onKey, true);
  document.addEventListener("wheel", stop, { capture: true, passive: false });
  document.addEventListener("touchmove", stop, { capture: true, passive: false });
  window.addEventListener("popstate", onPop);
  return () => {
    document.removeEventListener("click", stop, true);
    document.removeEventListener("auxclick", stop, true);
    document.removeEventListener("submit", stop, true);
    document.removeEventListener("keydown", onKey, true);
    document.removeEventListener("wheel", stop, true);
    document.removeEventListener("touchmove", stop, true);
    window.removeEventListener("popstate", onPop);
    root.removeAttribute("data-theme-switching");
    running.forEach((animation) => {
      try {
        animation.play();
      } catch {
        return;
      }
    });
    media.forEach((node) => void node.play().catch(() => undefined));
  };
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
    if (node instanceof HTMLElement && copy instanceof HTMLElement) {
      const style = getComputedStyle(node);
      if (style.animationName && style.animationName !== "none") {
        copy.style.animation = "none";
        copy.style.opacity = style.opacity;
        copy.style.filter = style.filter;
        copy.style.transform = style.transform;
      }
    }
    if (node instanceof HTMLVideoElement || node instanceof HTMLCanvasElement) freeze(node, copy);
  });
  layer.scrollTop = window.scrollY;
  layer.scrollLeft = window.scrollX;
  return layer;
}

function reveal(layer: HTMLElement, inward: boolean) {
  const radius = Math.ceil(Math.hypot(window.innerWidth, window.innerHeight));
  const full = `circle(${radius}px at 50% 50%)`;
  const none = "circle(0px at 50% 50%)";
  if (inward) layer.style.clipPath = full;
  return layer
    .animate(inward ? [{ clipPath: full }, { clipPath: none }] : [{ clipPath: none }, { clipPath: full }], {
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
    if (root.getAttribute("data-motion") === "off") {
      swap(next);
      return;
    }

    switching = true;
    const release = holdPage();
    const current = next === "dark" ? "light" : "dark";
    const inward = next === "dark";
    const layer = snapshot(inward ? current : next);
    const unlock = lockScroll();
    const finish = () => {
      layer.remove();
      unlock();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          release();
          switching = false;
        });
      });
    };
    if (inward) {
      const radius = Math.ceil(Math.hypot(window.innerWidth, window.innerHeight));
      layer.style.clipPath = `circle(${radius}px at 50% 50%)`;
      swap(next);
      void reveal(layer, true).then(finish);
      return;
    }
    void reveal(layer, false).then(() => {
      swap(next);
      finish();
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
