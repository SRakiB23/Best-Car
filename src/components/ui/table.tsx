import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

export const tableCell = "px-4 py-3 first:pl-4 last:pr-4 sm:first:pl-5 sm:last:pr-5";

/**
 * Where a list stops being a table and becomes stacked cards. A table narrower
 * than its content can only scroll sideways, which on a phone hides half the
 * columns behind a gesture nobody discovers. `RecordList` renders the same rows
 * below this width — the two share the token so they cannot drift apart and
 * leave a range of screens with both, or neither.
 */
export type TableBreakpoint = "md" | "xl";

export const showTableFrom: Record<TableBreakpoint, string> = {
  md: "hidden md:block",
  xl: "hidden xl:block",
};

export const showCardsBelow: Record<TableBreakpoint, string> = {
  md: "md:hidden",
  xl: "xl:hidden",
};

export function Table({
  className,
  children,
  from = "md",
  ...props
}: ComponentProps<"table"> & { from?: TableBreakpoint }) {
  return (
    <div className={cn("scrollbar-thin overflow-x-auto", showTableFrom[from])}>
      <table
        className={cn("w-full min-w-[560px] border-collapse text-left", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function Th({ className, children, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn(tableCell, "whitespace-nowrap text-[13px] font-semibold text-navy-900", className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ className, children, ...props }: ComponentProps<"td">) {
  return (
    <td className={cn(tableCell, className)} {...props}>
      {children}
    </td>
  );
}

export function TableHeadRow({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="bg-surface">{children}</tr>
    </thead>
  );
}
