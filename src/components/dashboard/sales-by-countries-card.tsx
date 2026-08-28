"use client";

import { useState } from "react";
import { IconArrowUp } from "@tabler/icons-react";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { cn } from "@/lib/cn";
import { filterKeys, periodOptions, type Period } from "@/lib/filters";
import type { CountrySales, Trend } from "@/lib/types";
import { mapSize, type CountryShape } from "@/lib/world-map";

type SalesByCountriesCardProps = {
  shapes: CountryShape[];
  sales: CountrySales[];
  trend: Trend;
  period: Period;
  className?: string;
};

export function SalesByCountriesCard({
  shapes,
  sales,
  trend,
  period,
  className,
}: SalesByCountriesCardProps) {
  const [hovered, setHovered] = useState<CountrySales | null>(null);

  const ranked = [...sales].sort((a, b) => b.sales - a.sales);
  const leadingCodes = new Set(
    ranked.slice(0, Math.ceil(ranked.length / 2)).map((item) => item.isoNumericCode),
  );
  const byCode = new Map(sales.map((item) => [item.isoNumericCode, item]));

  const rising = trend.direction === "up";

  return (
    <Card className={className}>
      <CardHeader
        title="Sales by Countries"
        action={
          <FilterSelect
            name={filterKeys.period}
            value={period}
            options={periodOptions}
            label="Filter sales by period"
          />
        }
      />

      <CardBody className="flex flex-col justify-between gap-4">
        <div className="relative">
          <svg
            viewBox={`0 0 ${mapSize.width} ${mapSize.height}`}
            className="h-auto w-full"
            role="img"
            aria-label="Sales by country"
          >
            {shapes.map((shape) => {
              const record = byCode.get(shape.isoNumericCode);
              const leading = record && leadingCodes.has(shape.isoNumericCode);

              return (
                <path
                  key={shape.isoNumericCode + shape.name}
                  d={shape.path}
                  className={cn(
                    "transition-colors",
                    !record && "fill-line",
                    record && (leading ? "fill-navy-900" : "fill-brand-500"),
                    record && "cursor-pointer",
                  )}
                  onMouseEnter={() => record && setHovered(record)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
          </svg>

          {hovered && (
            <div className="pointer-events-none absolute left-1/2 top-1/4 w-[140px] -translate-x-1/2 overflow-hidden rounded-lg shadow-card">
              <p className="bg-brand-500 px-3 py-1.5 text-center text-[13px] font-semibold text-white">
                {hovered.name}
              </p>
              <p className="bg-white px-3 py-2 text-center text-[13px] text-ink-700">
                {hovered.sales.toLocaleString("en-US")} Sales
              </p>
            </div>
          )}
        </div>

        <p className="flex items-center justify-center gap-1 text-[13px] text-ink-500">
          <IconArrowUp
            size={14}
            stroke={2.4}
            className={cn(rising ? "text-positive" : "rotate-180 text-negative")}
          />
          <span className={cn("font-semibold", rising ? "text-positive" : "text-negative")}>
            {trend.percent}%
          </span>
          {rising ? "increase" : "decrease"} compare to {trend.comparedTo}
        </p>
      </CardBody>
    </Card>
  );
}
