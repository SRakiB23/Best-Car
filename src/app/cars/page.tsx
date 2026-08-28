import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/site/section";
import { VehicleCard } from "@/components/site/vehicle-card";
import { productCategories } from "@/lib/products";
import { cn } from "@/lib/cn";
import { listVehicles } from "@/lib/vehicles";

export const metadata: Metadata = {
  title: "Our cars | Best Car",
  description: "Browse the Best Car rental fleet and book your next drive in minutes.",
};

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = productCategories.find((item) => item === category);
  const vehicles = await listVehicles(active);

  return (
    <>
      <section className="bg-night-900 bg-linear-to-br from-night-900 via-night-800 to-night-700 py-14 sm:py-16 lg:py-20">
        <Container>
          <h1 className="text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl">
            Find your next drive
          </h1>
          <p className="mt-4 max-w-xl text-base text-night-muted lg:text-lg">
            Every car is fully insured, serviced and ready to collect. Pick a vehicle to check
            availability for your dates.
          </p>
        </Container>
      </section>

      <section className="bg-mist py-12 sm:py-14 lg:py-16">
        <Container>
          <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">
            <CategoryPill href="/cars" label="All cars" active={!active} />
            {productCategories.map((item) => (
              <CategoryPill
                key={item}
                href={`/cars?category=${item}`}
                label={item}
                active={active === item}
              />
            ))}
          </div>

          {vehicles.length === 0 ? (
            <p className="mt-8 rounded-2xl bg-white p-8 text-center text-sm text-ink-500 shadow-card sm:mt-10 sm:p-10">
              No cars in this category yet. Try another filter.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

function CategoryPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition",
        active
          ? "bg-night-900 text-white"
          : "bg-white text-ink-500 shadow-card hover:text-ink-900",
      )}
    >
      {label}
    </Link>
  );
}
