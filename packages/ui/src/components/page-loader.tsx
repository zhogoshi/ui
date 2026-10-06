"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { cn } from "../lib/cn";

export function PageLoader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div role="status" aria-label="Loading" className={cn("grid size-full min-h-40 place-items-center", className)} {...props}>
      <span className="border-ring size-10 animate-[loader-pulse_1.2s_var(--motion-ease)_infinite] rounded-full border-2 motion-reduce:animate-none" />
    </div>
  );
}

export function BootScreen() {
  const [phase, setPhase] = useState<"on" | "out" | "off">("on");

  useEffect(() => {
    const hide = () => setPhase("out");
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });
    return () => window.removeEventListener("load", hide);
  }, []);

  if (phase === "off") return null;

  return (
    <div
      className={cn(
        "bg-bg fixed inset-0 z-[calc(var(--z-toast)+10)] transition-opacity duration-[calc(var(--motion-duration)*2)] ease-[var(--motion-ease)]",
        phase === "out" && "pointer-events-none opacity-0",
      )}
      onTransitionEnd={() => setPhase("off")}
    >
      <PageLoader className="size-full min-h-0" />
    </div>
  );
}
