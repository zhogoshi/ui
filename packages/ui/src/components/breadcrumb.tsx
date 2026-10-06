import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({
  items,
  separator = "/",
  className,
}: {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-fg-muted flex min-w-0 items-center gap-1.5 text-sm", className)}>
      {items.map((item, index) => {
        const current = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
            {index > 0 ? <span className="text-fg-subtle shrink-0">{separator}</span> : null}
            {item.href && !current ? (
              <a href={item.href} className="hover:text-fg truncate rounded-[var(--radius-sm)] outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {item.label}
              </a>
            ) : (
              <span className={cn("truncate", current && "text-fg font-medium")}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
