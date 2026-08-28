"use client";

import { IconCalendar } from "@tabler/icons-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { chartYearOptions, filterKeys, type ChartYear } from "@/lib/filters";
import type { SalesPoint } from "@/lib/types";

const ticks = [10000, 20000, 30000, 40000, 50000, 60000];

const axisStyle = {
  tick: { fill: "var(--color-ink-500)", fontSize: 12 },
  axisLine: false,
  tickLine: false,
} as const;

export function SalesAnalyticsCard({
  points,
  year,
  className,
}: {
  points: SalesPoint[];
  year: ChartYear;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader
        title="Sales Analytics"
        action={
          <FilterSelect
            name={filterKeys.year}
            value={year}
            options={chartYearOptions}
            label="Filter sales analytics by year"
            icon={<IconCalendar size={14} stroke={1.6} className="text-ink-500" />}
          />
        }
      />

      <CardBody>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="var(--color-line)" vertical={false} />

              <XAxis dataKey="month" dy={8} {...axisStyle} />
              <YAxis
                domain={[10000, 60000]}
                ticks={ticks}
                tickFormatter={(value: number) => `${value / 1000}k`}
                {...axisStyle}
              />

              <Tooltip
                cursor={{ stroke: "var(--color-brand-500)", strokeDasharray: 0 }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--color-line)",
                  fontSize: 12,
                  boxShadow: "var(--shadow-card)",
                }}
                labelStyle={{ color: "var(--color-navy-900)", fontWeight: 600 }}
                formatter={(value) => [Number(value).toLocaleString("en-US"), "Sales"]}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-brand-500)"
                strokeWidth={2}
                fill="url(#salesFill)"
                dot={{
                  r: 4,
                  fill: "var(--color-brand-500)",
                  stroke: "var(--color-brand-500)",
                  strokeWidth: 2,
                }}
                activeDot={{ r: 6, fill: "var(--color-brand-500)", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
