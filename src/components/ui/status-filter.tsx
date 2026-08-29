"use client";

import { cn } from "@/lib/cn";
import { listKeys } from "@/lib/list-params";
import { useI18n } from "@/lib/i18n-context";
import { useSetParams } from "@/lib/use-set-param";

export type StatusOption = { value: string; label: string };

const paymentOptions: StatusOption[] = [
  { value: "", label: "All" },
  { value: "success", label: "Success" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

export function StatusFilter({
  value,
  options = paymentOptions,
  className,
}: {
  value: string;
  options?: StatusOption[];
  className?: string;
}) {
  const { t } = useI18n();
  const setParams = useSetParams();

  return (
    <div className={cn("flex items-center gap-1 rounded-lg bg-surface p-1", className)}>
      {options.map((option) => (
        <button
          key={option.value || "all"}
          type="button"
          onClick={() => setParams({ status: option.value, [listKeys.page]: "1" })}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-medium transition",
            option.value === value
              ? "bg-white text-navy-900 shadow-sm"
              : "text-ink-500 hover:text-navy-900",
          )}
        >
          {t(option.label)}
        </button>
      ))}
    </div>
  );
}
