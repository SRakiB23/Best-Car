import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { showCardsBelow, type TableBreakpoint } from "./table";

/**
 * The small-screen half of every list in the dashboard. Each row becomes a card
 * with its columns as labelled fields, so nothing is hidden behind a horizontal
 * scroll the way a squeezed table hides it.
 *
 * Pair it with `<Table from={...}>` using the same breakpoint: one renders where
 * the other does not.
 */
export function RecordList({
  until = "md",
  className,
  children,
}: {
  until?: TableBreakpoint;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ul className={cn("divide-y divide-line border-t border-line", showCardsBelow[until], className)}>
      {children}
    </ul>
  );
}

export function RecordCard({ className, children }: { className?: string; children: ReactNode }) {
  return <li className={cn("space-y-3 p-4", className)}>{children}</li>;
}

/**
 * The line that identifies the row: what it is on the left, the number that
 * matters on the right. Everything else belongs in `RecordFields` below it.
 */
export function RecordHeading({
  media,
  title,
  subtitle,
  aside,
}: {
  media?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      {media}

      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-navy-900">{title}</div>
        {subtitle ? <div className="mt-0.5 text-xs text-ink-500">{subtitle}</div> : null}
      </div>

      {aside ? <div className="shrink-0 text-right">{aside}</div> : null}
    </div>
  );
}

/** Two columns at any phone width worth supporting; one if the label is long. */
export function RecordFields({ className, children }: { className?: string; children: ReactNode }) {
  return <dl className={cn("grid grid-cols-2 gap-x-4 gap-y-3", className)}>{children}</dl>;
}

export function RecordField({
  label,
  wide,
  children,
}: {
  label: string;
  /** Spans both columns, for prose or anything that would otherwise wrap badly. */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-w-0", wide && "col-span-2")}>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className="mt-1 text-[13px] text-ink-700">{children}</dd>
    </div>
  );
}

export function RecordActions({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 border-t border-line pt-3", className)}>
      {children}
    </div>
  );
}
