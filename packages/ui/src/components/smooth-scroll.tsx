"use client";

import { useEffect, type ReactNode } from "react";

const IDLE_MS = 700;
const EASE = 0.16;
const LINE = 40;
const DRIFT = 2;
const SCROLL_KEYS = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];

interface Motion {
  x: number;
  y: number;
  writtenX: number;
  writtenY: number;
  frame: number;
  last: number;
}

const motions = new WeakMap<Element, Motion>();

function markScrolling(element: Element) {
  const node = element as HTMLElement;
  node.setAttribute("data-scrolling", "");
  window.clearTimeout(Number(node.dataset.scrollTimer ?? 0));
  node.dataset.scrollTimer = String(
    window.setTimeout(() => {
      node.removeAttribute("data-scrolling");
      delete node.dataset.scrollTimer;
    }, IDLE_MS),
  );
}

function motionAllowed() {
  const motion = document.documentElement.getAttribute("data-motion");
  if (motion === "off" || motion === "reduced") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function stop(element: Element) {
  const motion = motions.get(element);
  if (!motion) return;
  cancelAnimationFrame(motion.frame);
  motions.delete(element);
}

function stopFrom(target: EventTarget | null) {
  for (let node = target instanceof Element ? target : null; node; node = node.parentElement) stop(node);
  if (document.scrollingElement) stop(document.scrollingElement);
}

function canScroll(element: Element, dx: number, dy: number) {
  const root = element === document.scrollingElement;
  const style = getComputedStyle(element);
  const scrollY = root
    ? style.overflowY !== "hidden" && getComputedStyle(document.body).overflowY !== "hidden"
    : /auto|scroll|overlay/.test(style.overflowY);
  const scrollX = root ? style.overflowX !== "hidden" : /auto|scroll|overlay/.test(style.overflowX);
  const maxY = element.scrollHeight - element.clientHeight;
  const maxX = element.scrollWidth - element.clientWidth;
  const motion = motions.get(element);
  const top = motion?.y ?? element.scrollTop;
  const left = motion?.x ?? element.scrollLeft;
  const vertical = scrollY && maxY > 0 && (dy < 0 ? top > 0 : dy > 0 && top < maxY);
  const horizontal = scrollX && maxX > 0 && (dx < 0 ? left > 0 : dx > 0 && left < maxX);
  return vertical || horizontal;
}

function findScroller(target: EventTarget | null, dx: number, dy: number) {
  let node = target instanceof Element ? target : null;
  while (node && node !== document.body && node !== document.documentElement) {
    if (node.hasAttribute("data-native-scroll")) return null;
    if (canScroll(node, dx, dy)) return node;
    node = node.parentElement;
  }
  const root = document.scrollingElement;
  return root && canScroll(root, dx, dy) ? root : null;
}

function isMouseWheel(event: WheelEvent) {
  if (event.deltaMode !== 0) return true;
  return event.deltaX === 0 && Math.abs(event.deltaY) >= 50 && Number.isInteger(event.deltaY);
}

function step(element: Element, motion: Motion, now: number) {
  const moved =
    Math.abs(element.scrollTop - motion.writtenY) > DRIFT || Math.abs(element.scrollLeft - motion.writtenX) > DRIFT;
  if (moved) {
    motions.delete(element);
    return;
  }
  const dt = Math.min(64, now - motion.last || 16);
  motion.last = now;
  const k = 1 - Math.pow(1 - EASE, dt / 16.67);
  const nextY = element.scrollTop + (motion.y - element.scrollTop) * k;
  const nextX = element.scrollLeft + (motion.x - element.scrollLeft) * k;
  const done = Math.abs(motion.y - nextY) < 0.5 && Math.abs(motion.x - nextX) < 0.5;
  element.scrollTop = done ? motion.y : nextY;
  element.scrollLeft = done ? motion.x : nextX;
  motion.writtenY = element.scrollTop;
  motion.writtenX = element.scrollLeft;
  if (done) {
    motions.delete(element);
    return;
  }
  motion.frame = requestAnimationFrame((time) => step(element, motion, time));
}

function onWheel(event: WheelEvent) {
  if (event.defaultPrevented || event.ctrlKey) return;
  if (!isMouseWheel(event) || !motionAllowed()) {
    stopFrom(event.target);
    return;
  }
  const scale = event.deltaMode === 1 ? LINE : event.deltaMode === 2 ? window.innerHeight : 1;
  const sideways = event.shiftKey && !event.deltaX;
  const dx = (sideways ? event.deltaY : event.deltaX) * scale;
  const dy = (sideways ? 0 : event.deltaY) * scale;
  const element = findScroller(event.target, dx, dy);
  if (!element) return;
  event.preventDefault();
  const maxY = element.scrollHeight - element.clientHeight;
  const maxX = element.scrollWidth - element.clientWidth;
  const current = motions.get(element);
  const motion = current ?? {
    x: element.scrollLeft,
    y: element.scrollTop,
    writtenX: element.scrollLeft,
    writtenY: element.scrollTop,
    frame: 0,
    last: performance.now(),
  };
  if (Math.sign(dy) !== Math.sign(motion.y - element.scrollTop) && motion.y !== element.scrollTop) motion.y = element.scrollTop;
  motion.y = Math.max(0, Math.min(maxY, motion.y + dy));
  motion.x = Math.max(0, Math.min(maxX, motion.x + dx));
  if (current) return;
  motions.set(element, motion);
  motion.frame = requestAnimationFrame((time) => step(element, motion, time));
}

function onScroll(event: Event) {
  const target = event.target === document ? document.scrollingElement : event.target;
  if (target instanceof Element) markScrolling(target);
}

function onPointerDown(event: PointerEvent) {
  stopFrom(event.target);
}

function onKeyDown(event: KeyboardEvent) {
  if (SCROLL_KEYS.includes(event.key)) stopFrom(event.target);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    window.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("wheel", onWheel);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return children;
}

export function scrollToTop(element: Element = document.scrollingElement ?? document.documentElement) {
  stop(element);
  element.scrollTo({ top: 0, behavior: motionAllowed() ? "smooth" : "auto" });
}
