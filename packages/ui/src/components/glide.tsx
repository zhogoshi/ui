"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "../lib/cn";

export const glideActive = "[[data-glide-ready]_&]:bg-transparent";

export interface GlideProps {
  selector: string;
  className?: string;
}

function attributesOf(selector: string) {
  return [...new Set([...selector.matchAll(/\[([\w-]+)/g)].map((match) => match[1]))];
}

function offsetWithin(target: HTMLElement, frame: Element | null) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = target;
  while (node && node !== frame) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return node === frame ? { x, y } : null;
}

export function Glide({ selector, className }: GlideProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const glide = ref.current;
    const scope = glide?.parentElement;
    if (!glide || !scope) return;
    let shown = false;

    const place = () => {
      const target = scope.querySelector<HTMLElement>(selector);
      const point = target ? offsetWithin(target, glide.offsetParent) : null;
      if (!target || !point) {
        glide.style.opacity = "0";
        delete scope.dataset.glideReady;
        shown = false;
        return;
      }
      scope.dataset.glideReady = "";
      if (!shown) glide.style.transition = "none";
      glide.style.transform = `translate(${point.x}px, ${point.y}px)`;
      glide.style.width = `${target.offsetWidth}px`;
      glide.style.height = `${target.offsetHeight}px`;
      if (!shown) {
        void glide.offsetWidth;
        glide.style.transition = "";
        shown = true;
      }
      glide.style.opacity = "1";
    };

    place();
    const mutations = new MutationObserver(place);
    mutations.observe(scope, { subtree: true, childList: true, attributes: true, attributeFilter: attributesOf(selector) });
    const resize = new ResizeObserver(place);
    resize.observe(scope);
    return () => {
      mutations.disconnect();
      resize.disconnect();
      delete scope.dataset.glideReady;
    };
  }, [selector]);

  return (
    <span
      ref={ref}
      aria-hidden
      className={cn(
        "bg-bg-subtle/55 pointer-events-none absolute top-0 left-0 rounded-[var(--radius-sm)] opacity-0 transition-[transform,width,height,opacity] duration-[calc(var(--motion-duration)*1.6)] ease-[var(--motion-ease)] motion-reduce:transition-none",
        className,
      )}
    />
  );
}
