"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { useDismiss } from "@/lib/use-dismiss";
import { Tooltip } from "./tooltip";

type PopoverProps = {
  label: string;
  trigger: ReactNode;
  triggerClassName?: string;
  panelClassName?: string;
  showTooltip?: boolean;
  children: (close: () => void) => ReactNode;
};

export function Popover({
  label,
  trigger,
  triggerClassName,
  panelClassName,
  showTooltip = true,
  children,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, container, close);

  const button = (
    <button
      type="button"
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen((value) => !value)}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg transition",
        triggerClassName,
      )}
    >
      {trigger}
    </button>
  );

  return (
    <div ref={container} className="relative inline-flex">
      {showTooltip && !open ? <Tooltip label={label}>{button}</Tooltip> : button}

      {open && (
        <div
          role="menu"
          className={cn(
            // The cap keeps a fixed-width panel inside the viewport on a phone,
            // where anchoring to the right edge would otherwise push it off-screen.
            "absolute right-0 top-full z-50 mt-2 min-w-[220px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-white shadow-card",
            panelClassName,
          )}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

export function PopoverHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
      <p className="text-[13px] font-semibold text-navy-900">{title}</p>
      {action}
    </div>
  );
}

export function PopoverItem({
  icon,
  children,
  onClick,
  disabled,
  className,
}: {
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] text-ink-700 transition hover:bg-canvas hover:text-navy-900 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}
