import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconCar } from "@tabler/icons-react";

import { buttonClass } from "@/components/ui/button";
import type { Vehicle } from "@/lib/booking";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1 hover:shadow-float">
      {/* Pairs with the hero on /cars/[id] so the photo morphs instead of redrawing. */}
      <ViewTransition name={`vehicle-${vehicle.id}`} share="morph" default="none">
        <div className="relative grid aspect-16/10 place-items-center overflow-hidden bg-mist">
          {vehicle.imageUrl ? (
            <Image
              src={vehicle.imageUrl}
              alt={vehicle.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <IconCar size={40} stroke={1.5} className="text-ink-400" />
          )}

          {/* Gold sheen sweeping across the photo on hover. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-12 bg-linear-to-r from-transparent via-gold-100/50 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[400%] motion-reduce:hidden"
          />

          <span className="absolute left-4 top-4 rounded-full bg-night-900/80 px-3 py-1 text-xs font-medium text-gold-300 backdrop-blur">
            {vehicle.category}
          </span>
        </div>
      </ViewTransition>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-ink-900">{vehicle.name}</h3>

        {/* Wraps rather than overflows: the button carries `shrink-0`, so a
            four-figure daily rate in a narrow column has nowhere else to go. */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <p className="min-w-0 text-xl font-bold text-ink-900">
            ${vehicle.pricePerDay.toFixed(2)}
            <span className="ml-1 text-sm font-normal text-ink-500">/ day</span>
          </p>

          <Link
            href={`/cars/${vehicle.id}`}
            className={buttonClass("gold", "md", "h-11 px-5 text-base font-semibold")}
          >
            Rent Now
          </Link>
        </div>
      </div>
    </article>
  );
}
