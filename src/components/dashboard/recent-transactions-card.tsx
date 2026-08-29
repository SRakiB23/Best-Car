import { IconClock } from "@tabler/icons-react";

import { Card, CardHeader } from "@/components/ui/card";
import { MobileSort } from "@/components/ui/mobile-sort";
import {
  RecordCard,
  RecordField,
  RecordFields,
  RecordHeading,
  RecordList,
} from "@/components/ui/record-list";
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

/** Derived from the columns so the two views can never offer different sorts. */
const sortOptions = columns
  .filter((column) => "sortKey" in column)
  .map((column) => ({ label: column.label, value: column.sortKey }));

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
      <CardHeader
        title={t("Recent Transactions")}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {/* Replaces the sortable header the card view does not have. */}
            <MobileSort options={sortOptions} sort={sort} direction={direction} />
            {action}
          </div>
        }
      />

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

      {/* The amount leads on a phone: it is the column someone scans a ledger
          for, and the one a squeezed table pushed off the right edge. */}
      <RecordList>
        {transactions.map((transaction) => (
          <RecordCard key={transaction.id}>
            <RecordHeading
              media={<Thumbnail src={transaction.image} alt={transaction.product} />}
              title={<span className="line-clamp-2">{transaction.product}</span>}
              subtitle={
                <span className="flex items-center gap-1">
                  <IconClock size={13} stroke={1.6} />
                  {transaction.placedAgo}
                </span>
              }
              aside={
                <span className="text-[13px] font-semibold text-navy-900">
                  {formatAmount(transaction.amount, currency)}
                </span>
              }
            />

            <RecordFields>
              <RecordField label={t("Payment")}>
                {transaction.paymentMethod}
                <span className="mt-0.5 block text-xs font-medium text-link">
                  {transaction.reference}
                </span>
              </RecordField>

              <RecordField label={t("Status")}>
                <StatusPill status={transaction.status} />
              </RecordField>
            </RecordFields>
          </RecordCard>
        ))}
      </RecordList>

    </Card>
  );
}
