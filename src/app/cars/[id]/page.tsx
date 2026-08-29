import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { IconArrowLeft, IconCar, IconGasStation, IconManualGearbox, IconUsers } from "@tabler/icons-react";

import { BookingFlow } from "@/components/site/booking-flow";
import { Container } from "@/components/site/section";
import { currentViewer } from "@/lib/auth";
import { getBookedRanges, getVehicle } from "@/lib/vehicles";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicle(id);

  return { title: vehicle ? `${vehicle.name} | Best Car` : "Car not found | Best Car" };
}

const specs = [
  { icon: IconUsers, label: "5 Seats" },
  { icon: IconManualGearbox, label: "Automatic" },
  { icon: IconGasStation, label: "Petrol" },
];

export default async function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getVehicle(id);

  if (!vehicle) notFound();

  const [bookedRanges, viewer] = await Promise.all([getBookedRanges(vehicle.id), currentViewer()]);

  const customer = viewer
    ? { name: viewer.name, email: viewer.email, phone: viewer.phone }
    : null;

  return (
    <section className="bg-mist py-10 sm:py-12 lg:py-16">
      <Container>
        <Link
          href="/cars"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition hover:text-ink-900"
        >
          <IconArrowLeft size={16} />
          All cars
        </Link>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <div>
            {/* Same name as the grid card, so the photo travels between routes. */}
            <ViewTransition name={`vehicle-${vehicle.id}`} share="morph" default="none">
              <div className="relative grid aspect-16/10 place-items-center overflow-hidden rounded-3xl bg-white">
                {vehicle.imageUrl ? (
                  <Image
                    src={vehicle.imageUrl}
                    alt={vehicle.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <IconCar size={64} stroke={1.2} className="text-ink-400" />
                )}
              </div>
            </ViewTransition>

            <div className="mt-6 rounded-2xl bg-white p-6 shadow-card lg:p-8">
              <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
                {vehicle.category}
              </span>

              <h1 className="mt-4 text-3xl font-bold text-ink-900 lg:text-4xl">{vehicle.name}</h1>

              <p className="mt-2 text-xl font-bold text-ink-900">
                ${vehicle.pricePerDay.toFixed(2)}
                <span className="ml-1 text-sm font-normal text-ink-500">/ day</span>
              </p>

              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6 text-sm text-ink-500">
                {specs.map((spec) => (
                  <li key={spec.label} className="inline-flex items-center gap-2">
                    <spec.icon size={18} className="text-gold-600" stroke={1.6} />
                    {spec.label}
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-sm leading-relaxed text-ink-500">
                Fully insured and serviced before every rental. Unlimited mileage within the city,
                free cancellation up to 24 hours before pick-up, and roadside assistance included
                for the length of your booking.
              </p>
            </div>
          </div>

          <BookingFlow vehicle={vehicle} bookedRanges={bookedRanges} customer={customer} />
        </div>
      </Container>
    </section>
  );
}
