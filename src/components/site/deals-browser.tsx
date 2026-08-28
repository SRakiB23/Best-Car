"use client";

import Link from "next/link";
import { useState } from "react";

import { sectionGap } from "@/components/site/section";
import { TabNav } from "@/components/site/tab-nav";
import { VehicleCard } from "@/components/site/vehicle-card";
import { buttonClass } from "@/components/ui/button";
import type { Vehicle } from "@/lib/booking";

const groups = {
  popular: null,
  large: ["SUV", "Pickup"],
  small: ["Hatchback", "Sedan"],
  exclusive: ["Coupe"],
} as const;

type Group = keyof typeof groups;

const tabs: { id: Group; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "large", label: "Large Car" },
  { id: "small", label: "Small Car" },
  { id: "exclusive", label: "Exclusive Car" },
];

const pageSize = 8;

export function DealsBrowser({ vehicles }: { vehicles: Vehicle[] }) {
  const [group, setGroup] = useState<Group>("popular");
  const [visible, setVisible] = useState(pageSize);

  const categories = groups[group];
  const filtered = categories
    ? vehicles.filter((vehicle) => categories.includes(vehicle.category as never))
    : vehicles;
  const shown = filtered.slice(0, visible);

  const selectGroup = (next: Group) => {
    setGroup(next);
    setVisible(pageSize);
  };

  return (
    <>
      <TabNav items={tabs} value={group} onChange={selectGroup} className={sectionGap} />

      {shown.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white p-8 text-center text-sm text-ink-500 shadow-card sm:mt-10 sm:p-10">
          No cars in this category right now.
        </p>
      ) : (
        <div className="mt-8 grid justify-items-center gap-6 sm:mt-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          {shown.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}

      <div className="relative mt-10 flex flex-col items-center gap-4 sm:mt-12">
        {visible < filtered.length ? (
          <button
            type="button"
            onClick={() => setVisible((count) => count + pageSize)}
            className={buttonClass("outline", "md", "bg-white px-6")}
          >
            Show more car
          </button>
        ) : (
          <Link href="/cars" className={buttonClass("outline", "md", "bg-white px-6")}>
            Browse all cars
          </Link>
        )}

        <span className="text-xs text-ink-500 sm:absolute sm:right-0 sm:top-2.5">
          {vehicles.length} Car
        </span>
      </div>
    </>
  );
}
