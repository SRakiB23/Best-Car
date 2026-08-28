import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { IconCar, IconCircleCheckFilled } from "@tabler/icons-react";

import { Container } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeaderBar } from "@/components/site/site-header-bar";
import { buttonClass } from "@/components/ui/button";
import { currentUser } from "@/lib/auth";
import { formatDate } from "@/lib/booking";
import { getBooking } from "@/lib/vehicles";

export const metadata: Metadata = { title: "Booking confirmed | Best Car" };

export default async function BookingPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;

  // A booking now shows personal details, so only its owner or staff may see it.
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/bookings/${reference}`)}`);

  const booking = await getBooking(reference);

  if (!booking) notFound();

  const rows = [
    { label: "Reference", value: booking.reference },
    { label: "Pick-up", value: formatDate(booking.startDate) },
    { label: "Drop-off", value: formatDate(booking.endDate) },
    { label: "Duration", value: `${booking.days} ${booking.days === 1 ? "day" : "days"}` },
    { label: "Location", value: booking.pickupLocation || "To be confirmed" },
    { label: "Name", value: booking.customerName },
    { label: "Email", value: booking.customerEmail },
    { label: "Phone", value: booking.customerPhone },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <SiteHeaderBar />

      <main className="flex-1 bg-mist py-12 lg:py-20">
        <Container className="max-w-3xl">
          <div className="rounded-3xl bg-white p-6 shadow-float lg:p-10">
            <div className="flex flex-col items-center text-center">
              <IconCircleCheckFilled size={48} className="text-positive" />
              <h1 className="mt-4 text-3xl font-bold text-ink-900 lg:text-4xl">
                Your booking is confirmed
              </h1>
              <p className="mt-3 text-sm text-ink-500">
                We have emailed the details to {booking.customerEmail}. Keep reference{" "}
                <span className="font-semibold text-ink-900">{booking.reference}</span> handy at
                pick-up.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-4 rounded-2xl bg-mist p-4">
              <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
                {booking.vehicle.imageUrl ? (
                  <Image
                    src={booking.vehicle.imageUrl}
                    alt={booking.vehicle.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <IconCar size={28} stroke={1.5} className="text-ink-400" />
                )}
              </div>

              <div>
                <p className="text-lg font-bold text-ink-900">{booking.vehicle.name}</p>
                <p className="text-sm text-ink-500">{booking.vehicle.category}</p>
              </div>
            </div>

            <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {rows.map((row) => (
                <div key={row.label} className="flex flex-col gap-1">
                  <dt className="text-xs uppercase tracking-wide text-ink-400">{row.label}</dt>
                  <dd className="text-sm font-medium text-ink-900">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 rounded-2xl bg-night-900 p-6 text-white">
              <div className="flex items-center justify-between text-sm text-night-muted">
                <span>
                  ${booking.pricePerDay.toFixed(2)} × {booking.days}{" "}
                  {booking.days === 1 ? "day" : "days"}
                </span>
                <span>${booking.totalAmount.toFixed(2)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-base font-semibold">Total paid at pick-up</span>
                <span className="text-2xl font-bold text-gold-300">
                  ${booking.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/cars" className={buttonClass("navy", "md", "h-11 px-6 font-semibold")}>
                Book another car
              </Link>
              <Link href="/" className={buttonClass("outline", "md", "h-11 px-6 font-semibold")}>
                Back to home
              </Link>
            </div>
          </div>
        </Container>
      </main>

      <SiteFooter />
    </div>
  );
}
