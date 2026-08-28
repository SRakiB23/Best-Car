import type { ReactNode } from "react";
import { IconAlertCircle } from "@tabler/icons-react";

import { cn } from "@/lib/cn";

export const controlClass =
  "h-10 w-full rounded-lg border border-line px-3 text-[13px] text-navy-900 outline-none transition placeholder:text-ink-400 focus:border-brand-300";

export function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium text-ink-700">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 flex items-center gap-1 text-xs text-negative">
          <IconAlertCircle size={13} stroke={2} />
          {error}
        </span>
      ) : (
        hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>
      )}
    </label>
  );
}
