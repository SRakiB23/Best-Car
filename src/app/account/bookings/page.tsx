import Image from "next/image";
import Link from "next/link";
import { IconCalendar, IconCar, IconMapPin } from "@tabler/icons-react";

import { CancelMyBooking } from "@/components/site/cancel-my-booking";
import { Container } from "@/components/site/section";
import { buttonClass } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/booking";
import { cn } from "@/lib/cn";
import { listMyBookings } from "@/lib/my-bookings";

export default async function MyBookingsPage() {
  const user = await requireUser();
  const bookings = await listMyBookings(user.id);

  const upcoming = bookings.filter((booking) => booking.status === "confirmed");

  return (
    <Container className="py-12 sm:py-14 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-ink-900 lg:text-4xl">
            My bookings
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {upcoming.length > 0
              ? `You have ${upcoming.length} active ${upcoming.length === 1 ? "rental" : "rentals"}.`
              : "Every rental you book will show up here."}
          </p>
        </div>

        <Link href="/cars" className={buttonClass("gold", "md", "h-11 px-6 font-semibold")}>
          Book another car
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-2xl bg-white p-12 text-center shadow-card">
          <IconCar size={40} stroke={1.4} className="text-ink-400" />
          <p className="mt-4 text-base font-semibold text-ink-900">No bookings yet</p>
          <p className="mt-1 max-w-sm text-sm text-ink-500">
            Browse the fleet, pick your dates and your rental will appear here straight away.
          </p>
          <Link
            href="/cars"
            className={buttonClass("gold", "md", "mt-6 h-11 px-6 font-semibold")}
          >
            Browse cars
          </Link>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col gap-5">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-card sm:flex-row sm:items-center sm:gap-6 lg:p-6"
            >
              <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden rounded-xl bg-mist sm:w-44">
                {booking.image ? (
                  <Image
                    src={booking.image}
                    alt={booking.vehicle}
                    fill
                    sizes="(min-width: 640px) 176px, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full place-items-center">
                    <IconCar size={28} stroke={1.5} className="text-ink-400" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-ink-900">{booking.vehicle}</h2>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      booking.status === "confirmed"
                        ? "bg-positive/10 text-positive"
                        : "bg-negative/10 text-negative",
                    )}
                  >
                    {booking.status === "confirmed" ? "Confirmed" : "Cancelled"}
                  </span>
                </div>

                <p className="mt-1 text-xs font-medium text-ink-500">{booking.reference}</p>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-700">
                  <span className="inline-flex items-center gap-2">
                    <IconCalendar size={15} stroke={1.6} className="text-gold-600" />
                    {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                    <span className="text-ink-500">
                      ({booking.days} {booking.days === 1 ? "day" : "days"})
                    </span>
                  </span>

                  {booking.pickupLocation ? (
                    <span className="inline-flex items-center gap-2">
                      <IconMapPin size={15} stroke={1.6} className="text-gold-600" />
                      {booking.pickupLocation}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="shrink-0 sm:text-right">
                <p className="text-xl font-bold text-ink-900">
                  ${booking.totalAmount.toFixed(2)}
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  ${booking.pricePerDay.toFixed(2)} / day
                </p>

                <div className="mt-3 flex items-center gap-3 sm:justify-end">
                  <Link
                    href={`/bookings/${booking.reference}`}
                    className="text-[13px] font-medium text-ink-700 hover:text-ink-900"
                  >
                    View
                  </Link>

                  {booking.status === "confirmed" ? (
                    <CancelMyBooking reference={booking.reference} vehicle={booking.vehicle} />
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
