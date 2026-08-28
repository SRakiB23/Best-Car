"use client";

import { useState } from "react";

import { CarCard } from "@/components/site/car-card";
import { Container, SectionHeading } from "@/components/site/section";
import { TabNav } from "@/components/site/tab-nav";
import { buttonClass } from "@/components/ui/button";
import { type CarCategory, carCategories, carsByCategory, totalCars } from "@/lib/cars";

const pageSize = 4;

export function PopularDeals() {
  const [category, setCategory] = useState<CarCategory>("popular");
  const [visible, setVisible] = useState(pageSize);

  const cars = carsByCategory(category);
  const shown = cars.slice(0, visible);

  const selectCategory = (next: CarCategory) => {
    setCategory(next);
    setVisible(pageSize);
  };

  return (
    <section id="rental-details" className="bg-mist py-16 lg:py-24">
      <Container>
        <SectionHeading
          title="Most popular car rental deals"
          subtitle="A high-performing web-based car rental system for any rent-a-car company and website"
        />

        <TabNav
          items={carCategories}
          value={category}
          onChange={selectCategory}
          className="mt-12"
        />

        <div className="mt-8 grid justify-items-center gap-8 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4">
          {shown.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        <div className="relative mt-10 flex flex-col items-center gap-4 sm:mt-12">
          {visible < cars.length ? (
            <button
              type="button"
              onClick={() => setVisible((count) => count + pageSize)}
              className={buttonClass("outline", "md", "bg-white px-6")}
            >
              Show more car
            </button>
          ) : null}

          <span className="text-xs text-ink-500 sm:absolute sm:right-0 sm:top-2.5">
            {totalCars} Car
          </span>
        </div>
      </Container>
    </section>
  );
}
