"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

import { cn } from "@/lib/cn";
import { listKeys } from "@/lib/list-params";
import { useI18n } from "@/lib/i18n-context";
import { useSetParams } from "@/lib/use-set-param";

function windowed(page: number, total: number) {
  const pages = new Set([1, total, page, page - 1, page + 1]);
  return [...pages].filter((value) => value >= 1 && value <= total).sort((a, b) => a - b);
}

export function Pagination({
  page,
  totalPages,
  totalRows,
  shown,
}: {
  page: number;
  totalPages: number;
  totalRows: number;
  shown: number;
}) {
  const { t } = useI18n();
  const setParams = useSetParams();
  const go = (next: number) => setParams({ [listKeys.page]: String(next) });

  const numbers = windowed(page, totalPages);
  // Larger on touch, original size once there is a pointer and a bigger screen.
  const step = "grid size-9 place-items-center rounded-md text-[13px] transition sm:size-8";

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-3.5 sm:flex-row">
      <p className="text-xs text-ink-500">
        {t("Showing")} {shown} {t("of")} {totalRows.toLocaleString("en-US")}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          aria-label={t("Previous page")}
          className={cn(step, "text-ink-500 hover:bg-canvas disabled:pointer-events-none disabled:opacity-40")}
        >
          <IconChevronLeft size={16} stroke={1.8} />
        </button>

        {numbers.map((number, index) => (
          <span key={number} className="flex items-center gap-1">
            {index > 0 && number - numbers[index - 1] > 1 && (
              <span className="px-1 text-xs text-ink-400">…</span>
            )}
            <button
              type="button"
              onClick={() => go(number)}
              aria-current={number === page ? "page" : undefined}
              className={cn(
                step,
                number === page
                  ? "bg-brand-500 font-semibold text-white"
                  : "text-ink-500 hover:bg-canvas",
              )}
            >
              {number}
            </button>
          </span>
        ))}

        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          aria-label={t("Next page")}
          className={cn(step, "text-ink-500 hover:bg-canvas disabled:pointer-events-none disabled:opacity-40")}
        >
          <IconChevronRight size={16} stroke={1.8} />
        </button>
      </div>
    </div>
  );
}
