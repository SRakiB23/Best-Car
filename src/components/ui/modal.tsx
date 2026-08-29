"use client";

import { useEffect, type ReactNode } from "react";
import { IconX } from "@tabler/icons-react";

import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div className="fixed inset-0 bg-navy-900/45" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 my-8 w-full max-w-lg rounded-xl bg-white shadow-card",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-navy-900">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-ink-500">{description}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-500 transition hover:bg-canvas hover:text-navy-900 sm:size-8"
          >
            <IconX size={18} stroke={1.8} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
