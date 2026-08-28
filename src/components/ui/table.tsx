import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

export const tableCell = "px-4 py-3 first:pl-4 last:pr-4 sm:first:pl-5 sm:last:pr-5";

export function Table({ className, children, ...props }: ComponentProps<"table">) {
  return (
    <div className="scrollbar-thin overflow-x-auto">
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
