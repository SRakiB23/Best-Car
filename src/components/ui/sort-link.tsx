"use client";

import { IconSelector, IconSortAscending, IconSortDescending } from "@tabler/icons-react";

import { listKeys, type SortDirection } from "@/lib/list-params";
import { useSetParams } from "@/lib/use-set-param";

export function SortLink({
  label,
  sortKey,
  activeKey,
  direction,
}: {
  label: string;
  sortKey: string;
  activeKey: string;
  direction: SortDirection;
}) {
  const setParams = useSetParams();
  const active = activeKey === sortKey;
  const next: SortDirection = active && direction === "desc" ? "asc" : "desc";

  const Icon = !active ? IconSelector : direction === "asc" ? IconSortAscending : IconSortDescending;

  return (
    <button
      type="button"
      onClick={() =>
        setParams({ [listKeys.sort]: sortKey, [listKeys.dir]: next, [listKeys.page]: "1" })
      }
      className="inline-flex items-center gap-1 transition hover:text-brand-500"
    >
      {label}
      <Icon size={14} stroke={1.8} className={active ? "text-brand-500" : "text-ink-400"} />
    </button>
  );
}
