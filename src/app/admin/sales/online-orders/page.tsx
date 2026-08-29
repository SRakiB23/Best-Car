import { IconCalendar, IconClock, IconMapPin } from "@tabler/icons-react";

import { CancelBookingAction } from "@/components/bookings/cancel-booking-action";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MobileSort } from "@/components/ui/mobile-sort";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import {
  RecordActions,
  RecordCard,
  RecordField,
  RecordFields,
  RecordHeading,
  RecordList,
} from "@/components/ui/record-list";
import { SearchField } from "@/components/ui/search-field";
import { SortLink } from "@/components/ui/sort-link";
import { StatusFilter, type StatusOption } from "@/components/ui/status-filter";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, TableHeadRow, Td, Th } from "@/components/ui/table";
import { Thumbnail } from "@/components/ui/thumbnail";
import { getPreferences, getTranslator } from "@/lib/account-store";
import { bookingSortKeys, getBookings } from "@/lib/data";
import { formatAmount } from "@/lib/format";
import { pageCount, readListParams } from "@/lib/list-params";
import type { DashboardSearchParams } from "@/lib/filters";
import type { BookingStatus } from "@/lib/types";

const columns = [
  { label: "Vehicle", sortKey: "vehicle" },
  { label: "Customer", sortKey: "customer" },
  { label: "Rental Period", sortKey: "pickup" },
  { label: "Status", sortKey: "status" },
  { label: "Booked", sortKey: "date" },
  { label: "Total", sortKey: "amount" },
] as const;

const sortOptions = columns.map((column) => ({ label: column.label, value: column.sortKey }));

const actionsColumn = "Actions";

const statuses: BookingStatus[] = ["confirmed", "cancelled"];

const statusOptions: StatusOption[] = [
  { value: "", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

export default async function OnlineOrdersPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const raw = await searchParams;
  const params = readListParams(raw, bookingSortKeys, "date");
  const requested = Array.isArray(raw.status) ? raw.status[0] : raw.status;
  const status = statuses.includes(requested as BookingStatus)
    ? (requested as BookingStatus)
    : "";

  const [{ currency }, t, { rows, total }] = await Promise.all([
    getPreferences(),
    getTranslator(),
    getBookings({ ...params, status }),
  ]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title={t("Online Orders")}
        description={t("Rentals booked by customers on the storefront.")}
      />

      <Card>
        <CardHeader
          title={t("Bookings")}
          action={
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <div className="scrollbar-thin -mx-1 max-w-full overflow-x-auto px-1">
                <StatusFilter value={status} options={statusOptions} className="w-max" />
              </div>
              <MobileSort options={sortOptions} sort={params.sort} direction={params.dir} />
              <SearchField
                key={params.q}
                value={params.q}
                placeholder={t("Search customer, vehicle or reference")}
              />
            </div>
          }
        />

        {rows.length === 0 ? (
          <EmptyState
            title={t("No bookings yet")}
            hint={t("Rentals booked on the storefront will appear here.")}
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
                <Th className="text-right">{t(actionsColumn)}</Th>
              </TableHeadRow>

              <tbody>
                {rows.map((booking) => (
                  <tr key={booking.id} className="border-t border-line">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Thumbnail src={booking.image} alt={booking.vehicle} />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-navy-900">
                            {booking.vehicle}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-link">
                            {booking.reference}
                          </p>
                        </div>
                      </div>
                    </Td>

                    <Td>
                      <p className="truncate text-[13px] font-medium text-navy-900">
                        {booking.customerName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-ink-500">
                        {booking.customerEmail}
                      </p>
                    </Td>

                    <Td>
                      <p className="flex items-center gap-1.5 whitespace-nowrap text-[13px] text-ink-700">
                        <IconCalendar size={13} stroke={1.6} />
                        {dayFormat.format(new Date(booking.startDate))} &ndash;{" "}
                        {dayFormat.format(new Date(booking.endDate))}
                        <span className="text-ink-500">
                          ({booking.days} {t("days")})
                        </span>
                      </p>
                      {booking.pickupLocation ? (
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
                          <IconMapPin size={13} stroke={1.6} />
                          {booking.pickupLocation}
                        </p>
                      ) : null}
                    </Td>

                    <Td>
                      <StatusPill status={booking.status} />
                    </Td>

                    <Td className="whitespace-nowrap text-[13px] text-ink-500">
                      <span className="flex items-center gap-1">
                        <IconClock size={13} stroke={1.6} />
                        {booking.bookedAgo}
                      </span>
                    </Td>

                    <Td className="whitespace-nowrap text-[13px] font-semibold text-navy-900">
                      {formatAmount(booking.totalAmount, currency)}
                      <span className="mt-0.5 block text-xs font-normal text-ink-500">
                        {formatAmount(booking.pricePerDay, currency)} / {t("day")}
                      </span>
                    </Td>

                    <Td>
                      {booking.status === "confirmed" ? (
                        <CancelBookingAction
                          reference={booking.reference}
                          customer={booking.customerName}
                          vehicle={booking.vehicle}
                        />
                      ) : null}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <RecordList>
              {rows.map((booking) => (
                <RecordCard key={booking.id}>
                  <RecordHeading
                    media={<Thumbnail src={booking.image} alt={booking.vehicle} />}
                    title={<span className="line-clamp-2">{booking.vehicle}</span>}
                    subtitle={
                      <span className="font-medium text-link">{booking.reference}</span>
                    }
                    aside={<StatusPill status={booking.status} />}
                  />

                  <RecordFields>
                    <RecordField label={t("Customer")} wide>
                      <span className="font-medium text-navy-900">{booking.customerName}</span>
                      <span className="mt-0.5 block truncate text-xs text-ink-500">
                        {booking.customerEmail}
                      </span>
                    </RecordField>

                    <RecordField label={t("Rental Period")} wide>
                      <span className="flex flex-wrap items-center gap-1.5">
                        <IconCalendar size={13} stroke={1.6} className="shrink-0" />
                        {dayFormat.format(new Date(booking.startDate))} &ndash;{" "}
                        {dayFormat.format(new Date(booking.endDate))}
                        <span className="text-ink-500">
                          ({booking.days} {t("days")})
                        </span>
                      </span>
                      {booking.pickupLocation ? (
                        <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                          <IconMapPin size={13} stroke={1.6} className="shrink-0" />
                          {booking.pickupLocation}
                        </span>
                      ) : null}
                    </RecordField>

                    <RecordField label={t("Total")}>
                      <span className="font-semibold text-navy-900">
                        {formatAmount(booking.totalAmount, currency)}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-500">
                        {formatAmount(booking.pricePerDay, currency)} / {t("day")}
                      </span>
                    </RecordField>

                    <RecordField label={t("Booked")}>
                      <span className="flex items-center gap-1 text-ink-500">
                        <IconClock size={13} stroke={1.6} />
                        {booking.bookedAgo}
                      </span>
                    </RecordField>
                  </RecordFields>

                  {booking.status === "confirmed" ? (
                    <RecordActions>
                      <CancelBookingAction
                        reference={booking.reference}
                        customer={booking.customerName}
                        vehicle={booking.vehicle}
                      />
                    </RecordActions>
                  ) : null}
                </RecordCard>
              ))}
            </RecordList>

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
