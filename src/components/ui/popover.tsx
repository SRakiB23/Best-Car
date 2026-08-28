"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";
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

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

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
            "absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-line bg-white shadow-card",
            panelClassName,
          )}
        >
          {children(() => setOpen(false))}
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
  className,
}: {
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] text-ink-700 transition hover:bg-canvas hover:text-navy-900",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}
