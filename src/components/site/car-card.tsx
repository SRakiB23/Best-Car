"use client";

import Image from "next/image";
import { useState } from "react";
import { IconCar, IconHeart, IconHeartFilled } from "@tabler/icons-react";

import { buttonClass } from "@/components/ui/button";
import type { Car } from "@/lib/cars";
import { cn } from "@/lib/cn";

export function CarCard({ car }: { car: Car }) {
  const [saved, setSaved] = useState(false);

  return (
    <article className="group flex w-full max-w-76 flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-float lg:h-97">
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-bold text-ink-900">{car.name}</h3>
        <button
          type="button"
          aria-label={saved ? `Remove ${car.name} from saved cars` : `Save ${car.name}`}
          aria-pressed={saved}
          onClick={() => setSaved((value) => !value)}
          className={cn(
            "shrink-0 rounded-full p-1 transition",
            saved ? "text-gold-500" : "text-ink-400 hover:text-gold-500",
          )}
        >
          {saved ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
        </button>
      </header>

      <div className="relative my-4 grid flex-1 place-items-center overflow-hidden rounded-xl bg-mist">
        {car.image ? (
          <Image
            src={car.image}
            alt={car.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <IconCar size={40} stroke={1.5} className="text-ink-400" />
        )}
      </div>

      <footer className="mt-auto flex items-center justify-between gap-3">
        <p className="text-xl font-bold text-ink-900">
          ${car.pricePerDay.toFixed(2)}
          <span className="ml-1 text-sm font-normal text-ink-500">/ day</span>
        </p>
        <button
          type="button"
          className={buttonClass("gold", "md", "h-11 rounded-lg px-5 text-base font-semibold")}
        >
          Rent Now
        </button>
      </footer>
    </article>
  );
}
