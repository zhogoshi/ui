import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export function Result({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto grid min-h-64 max-w-md place-content-center justify-items-center gap-3 px-4 py-16 text-center", className)}>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? <p className="text-fg-muted text-sm">{description}</p> : null}
      {children ? <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{children}</div> : null}
    </div>
  );
}
