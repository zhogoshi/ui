import { cn } from "../lib/cn";

const sides = {
  top: "top-0 h-[calc(var(--safe-top)+2rem)] bg-gradient-to-b [mask-image:linear-gradient(to_bottom,black_30%,transparent)]",
  bottom: "bottom-0 h-[var(--bottombar-space)] bg-gradient-to-t [mask-image:linear-gradient(to_top,black_30%,transparent)]",
};

export function ChromeVeil({ side, fixed = false, className }: { side: "top" | "bottom"; fixed?: boolean; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "from-bg pointer-events-none inset-x-0 to-transparent backdrop-blur-xl",
        fixed ? "fixed z-[calc(var(--z-sticky)-1)]" : "absolute",
        sides[side],
        className,
      )}
    />
  );
}
