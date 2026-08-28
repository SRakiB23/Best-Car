import { IconClock } from "@tabler/icons-react";

import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { SortLink } from "@/components/ui/sort-link";
import { StatusFilter } from "@/components/ui/status-filter";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, TableHeadRow, Td, Th } from "@/components/ui/table";
import { Thumbnail } from "@/components/ui/thumbnail";
import { getPreferences, getTranslator } from "@/lib/account-store";
import { getOrders, orderSortKeys } from "@/lib/data";
import { formatAmount } from "@/lib/format";
import { pageCount, readListParams } from "@/lib/list-params";
import type { DashboardSearchParams } from "@/lib/filters";
import type { PaymentStatus } from "@/lib/types";

const columns = [
  { label: "Order Details", sortKey: "product" },
  { label: "Payment", sortKey: "payment" },
  { label: "Status", sortKey: "status" },
  { label: "Date", sortKey: "date" },
  { label: "Amount", sortKey: "amount" },
] as const;

const statuses: PaymentStatus[] = ["success", "pending", "cancelled"];

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const raw = await searchParams;
  const params = readListParams(raw, orderSortKeys, "date");
  const requested = Array.isArray(raw.status) ? raw.status[0] : raw.status;
  const status = statuses.includes(requested as PaymentStatus)
    ? (requested as PaymentStatus)
    : "";

  const [{ currency }, t, { rows, total }] = await Promise.all([
    getPreferences(),
    getTranslator(),
    getOrders({ ...params, status }),
  ]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader title={t("Sales")} description={t("Every order placed across your stores.")} />

      <Card>
        <CardHeader
          title={t("All Transactions")}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <StatusFilter value={status} />
              <SearchField key={params.q} value={params.q} placeholder={t("Search product or reference")} />
            </div>
          }
        />

        {rows.length === 0 ? (
          <EmptyState
            title={t("No transactions found")}
            hint={t("Try a different search term or status.")}
          />
        ) : (
          <>
            <Table>
              <TableHeadRow>
                {columns.map((column) => (
                  <Th key={column.label}>
                    <SortLink
                      label={t(column.label)}
                      sortKey={column.sortKey}
                      activeKey={params.sort}
                      direction={params.dir}
                    />
                  </Th>
                ))}
              </TableHeadRow>

              <tbody>
                {rows.map((order) => (
                  <tr key={order.id} className="border-t border-line">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Thumbnail src={order.image} alt={order.product} />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-navy-900">
                            {order.product}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
                            <IconClock size={13} stroke={1.6} />
                            {order.placedAgo}
                          </p>
                        </div>
                      </div>
                    </Td>

                    <Td>
                      <p className="whitespace-nowrap text-[13px] text-ink-700">
                        {order.paymentMethod}
                      </p>
                      <p className="mt-0.5 whitespace-nowrap text-xs font-medium text-link">
                        {order.reference}
                      </p>
                    </Td>

                    <Td>
                      <StatusPill status={order.status} />
                    </Td>

                    <Td className="whitespace-nowrap text-[13px] text-ink-500">
                      {dateFormat.format(new Date(order.placedAt))}
                    </Td>

                    <Td className="whitespace-nowrap text-[13px] font-semibold text-navy-900">
                      {formatAmount(order.amount, currency)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Pagination
              page={params.page}
              totalPages={pageCount(total)}
              totalRows={total}
              shown={rows.length}
            />
          </>
        )}
      </Card>
    </div>
  );
}
