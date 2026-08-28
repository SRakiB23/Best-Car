"use client";

import { useMemo, useState } from "react";
import { IconClock, IconSelector, IconSortAscending, IconSortDescending } from "@tabler/icons-react";

import { Card, CardHeader } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Thumbnail } from "@/components/ui/thumbnail";
import { cn } from "@/lib/cn";
import { formatAmount } from "@/lib/format";
import type { Transaction } from "@/lib/types";

type SortKey = "product" | "paymentMethod" | "status" | "amount";
type SortDirection = "asc" | "desc";

const columns: { label: string; sortKey?: SortKey }[] = [
  { label: "#" },
  { label: "Order Details", sortKey: "product" },
  { label: "Payment", sortKey: "paymentMethod" },
  { label: "Status", sortKey: "status" },
  { label: "Amount", sortKey: "amount" },
];

const cell = "px-4 py-3 first:pl-4 last:pr-4 sm:first:pl-5 sm:last:pr-5";

function compare(a: Transaction, b: Transaction, key: SortKey) {
  const left = a[key];
  const right = b[key];

  return typeof left === "number" && typeof right === "number"
    ? left - right
    : String(left).localeCompare(String(right));
}

export function RecentTransactionsCard({
  transactions,
  action,
  className,
}: {
  transactions: Transaction[];
  action?: React.ReactNode;
  className?: string;
}) {
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection } | null>(null);

  const rows = useMemo(() => {
    if (!sort) return transactions;

    const sorted = [...transactions].sort((a, b) => compare(a, b, sort.key));
    return sort.direction === "asc" ? sorted : sorted.reverse();
  }, [transactions, sort]);

  function toggle(key: SortKey) {
    setSort((current) =>
      current?.key === key
        ? current.direction === "asc"
          ? { key, direction: "desc" }
          : null
        : { key, direction: "asc" },
    );
  }

  return (
    <Card className={className}>
      <CardHeader title="Recent Transactions" action={action} />

      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="bg-surface">
              {columns.map(({ label, sortKey }) => {
                const activeSort = sortKey && sort?.key === sortKey ? sort.direction : null;
                const SortIcon =
                  activeSort === "asc"
                    ? IconSortAscending
                    : activeSort === "desc"
                      ? IconSortDescending
                      : IconSelector;

                return (
                  <th
                    key={label}
                    aria-sort={
                      activeSort ? (activeSort === "asc" ? "ascending" : "descending") : undefined
                    }
                    className={cn(
                      cell,
                      "whitespace-nowrap text-[13px] font-semibold text-navy-900",
                    )}
                  >
                    {sortKey ? (
                      <button
                        type="button"
                        onClick={() => toggle(sortKey)}
                        className="inline-flex items-center gap-1 transition hover:text-brand-500"
                      >
                        {label}
                        <SortIcon
                          size={14}
                          stroke={1.8}
                          className={activeSort ? "text-brand-500" : "text-ink-400"}
                        />
                      </button>
                    ) : (
                      label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rows.map((transaction, index) => (
              <tr key={transaction.id}>
                <td className={cn(cell, "text-[13px] text-ink-500")}>{index + 1}</td>

                <td className={cell}>
                  <div className="flex items-center gap-3">
                    <Thumbnail src={transaction.image} alt={transaction.product} />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-navy-900">
                        {transaction.product}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
                        <IconClock size={13} stroke={1.6} />
                        {transaction.placedAgo}
                      </p>
                    </div>
                  </div>
                </td>

                <td className={cell}>
                  <p className="whitespace-nowrap text-[13px] text-ink-700">
                    {transaction.paymentMethod}
                  </p>
                  <p className="mt-0.5 whitespace-nowrap text-xs font-medium text-link">
                    {transaction.reference}
                  </p>
                </td>

                <td className={cell}>
                  <StatusPill status={transaction.status} />
                </td>

                <td
                  className={cn(cell, "whitespace-nowrap text-[13px] font-semibold text-navy-900")}
                >
                  {formatAmount(transaction.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
