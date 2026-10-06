import { ArrowDown01Icon, ArrowUp01Icon, ArrowUpDownIcon } from "@hugeicons-pro/core-stroke-rounded";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { Icon } from "./icon";

export type SortDirection = "asc" | "desc";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-separate border-spacing-0 text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("text-fg-muted text-left text-xs", className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("text-fg", className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("border-border border-b last:border-0", className)} {...props} />;
}

export function TableHead({
  className,
  sort,
  onSort,
  children,
  ...props
}: ComponentProps<"th"> & { sort?: SortDirection | false; onSort?: () => void }) {
  const icon = sort === "asc" ? ArrowUp01Icon : sort === "desc" ? ArrowDown01Icon : ArrowUpDownIcon;
  return (
    <th className={cn("border-border border-b px-3 py-2 font-medium", className)} {...props}>
      {onSort ? (
        <button type="button" className="hover:text-fg inline-flex cursor-pointer items-center gap-1" onClick={onSort}>
          {children}
          <Icon icon={icon} variant="stroke" size={14} className={sort ? "text-fg" : "text-fg-subtle"} />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("border-border border-b px-3 py-2.5 align-middle", className)} {...props} />;
}
