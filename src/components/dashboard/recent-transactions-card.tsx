import { IconClock } from "@tabler/icons-react";

import { Card, CardHeader } from "@/components/ui/card";
import { SortLink } from "@/components/ui/sort-link";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, TableHeadRow, Td, Th } from "@/components/ui/table";
import { Thumbnail } from "@/components/ui/thumbnail";
import { getTranslator } from "@/lib/account-store";
import { formatAmount } from "@/lib/format";
import type { SortDirection } from "@/lib/list-params";
import type { CurrencyCode, Transaction } from "@/lib/types";

const columns = [
  { label: "#" },
  { label: "Order Details", sortKey: "product" },
  { label: "Payment", sortKey: "payment" },
  { label: "Status", sortKey: "status" },
  { label: "Amount", sortKey: "amount" },
] as const;

export async function RecentTransactionsCard({
  transactions,
  currency,
  sort,
  direction,
  action,
  className,
}: {
  transactions: Transaction[];
  currency: CurrencyCode;
  sort: string;
  direction: SortDirection;
  action?: React.ReactNode;
  className?: string;
}) {
  const t = await getTranslator();

  return (
    <Card className={className}>
      <CardHeader title={t("Recent Transactions")} action={action} />

      <Table>
        <TableHeadRow>
          {columns.map((column) => (
            <Th key={column.label}>
              {"sortKey" in column ? (
                <SortLink
                  label={t(column.label)}
                  sortKey={column.sortKey}
                  activeKey={sort}
                  direction={direction}
                />
              ) : (
                column.label
              )}
            </Th>
          ))}
        </TableHeadRow>

        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={transaction.id}>
              <Td className="text-[13px] text-ink-500">{index + 1}</Td>

              <Td>
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
              </Td>

              <Td>
                <p className="whitespace-nowrap text-[13px] text-ink-700">
                  {transaction.paymentMethod}
                </p>
                <p className="mt-0.5 whitespace-nowrap text-xs font-medium text-link">
                  {transaction.reference}
                </p>
              </Td>

              <Td>
                <StatusPill status={transaction.status} />
              </Td>

              <Td className="whitespace-nowrap text-[13px] font-semibold text-navy-900">
                {formatAmount(transaction.amount, currency)}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
