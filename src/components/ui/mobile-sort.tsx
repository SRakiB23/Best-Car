"use client";

import { IconChevronDown, IconSortAscending, IconSortDescending } from "@tabler/icons-react";

import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n-context";
import { listKeys, type SortDirection } from "@/lib/list-params";
import { useSetParams } from "@/lib/use-set-param";
import { showCardsBelow, type TableBreakpoint } from "./table";

/**
 * Sorting normally lives in the table header, which does not exist once the
 * list is a stack of cards. This puts the same choices where they still fit,
 * and only for the widths that lost the header.
 */
export function MobileSort({
  options,
  sort,
  direction,
  until = "md",
}: {
  options: readonly { label: string; value: string }[];
  sort: string;
  direction: SortDirection;
  until?: TableBreakpoint;
}) {
  const { t } = useI18n();
  const setParams = useSetParams();

  const flipped: SortDirection = direction === "asc" ? "desc" : "asc";
  const Arrow = direction === "asc" ? IconSortAscending : IconSortDescending;

  return (
    <div className={cn("flex items-center gap-1.5", showCardsBelow[until])}>
      <div className="relative inline-flex h-9 items-center rounded-lg border border-line px-3 text-[13px] font-medium text-ink-700">
        <select
          aria-label={t("Sort by")}
          value={sort}
          onChange={(event) =>
            setParams({ [listKeys.sort]: event.target.value, [listKeys.page]: "1" })
          }
          className="cursor-pointer appearance-none bg-transparent pr-5 outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
        <IconChevronDown
          size={14}
          stroke={1.8}
          className="pointer-events-none absolute right-2.5 text-ink-400"
        />
      </div>

      <button
        type="button"
        onClick={() => setParams({ [listKeys.dir]: flipped, [listKeys.page]: "1" })}
        aria-label={direction === "asc" ? t("Sort descending") : t("Sort ascending")}
        className="grid size-9 shrink-0 place-items-center rounded-lg border border-line text-ink-500 transition hover:bg-canvas hover:text-navy-900"
      >
        <Arrow size={16} stroke={1.8} />
      </button>
    </div>
  );
}
