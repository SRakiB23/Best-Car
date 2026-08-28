import { IconCalendar } from "@tabler/icons-react";

import { BestSellerCard } from "@/components/dashboard/best-seller-card";
import { CountStatCard } from "@/components/dashboard/count-stat-card";
import { RecentTransactionsCard } from "@/components/dashboard/recent-transactions-card";
import { SalesAnalyticsCard } from "@/components/dashboard/sales-analytics-card";
import { SalesByCountriesCard } from "@/components/dashboard/sales-by-countries-card";
import { WeeklyEarningCard } from "@/components/dashboard/weekly-earning-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { RefreshButton } from "@/components/ui/refresh-button";
import {
  getBestSellers,
  getEarningSummary,
  getRecentTransactions,
  getSalesAnalytics,
  getSalesByCountry,
} from "@/lib/data";
import {
  dateRangeOptions,
  filterKeys,
  readFilters,
  type DashboardSearchParams,
} from "@/lib/filters";
import { formatCountPlus } from "@/lib/format";
import { getCountryShapes } from "@/lib/world-map";

const viewAll = (
  <Button variant="soft" size="sm">
    View All
  </Button>
);

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const { range, year, period } = readFilters(await searchParams);

  const [
    { weeklyEarning, trend, totalSales, purchasedGoods },
    bestSellers,
    transactions,
    salesPoints,
    countrySales,
  ] = await Promise.all([
    getEarningSummary(range),
    getBestSellers(range),
    getRecentTransactions(),
    getSalesAnalytics(year),
    getSalesByCountry(period),
  ]);

  const countryShapes = getCountryShapes();

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card className="flex-col items-start justify-between gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
        <p className="text-[15px] text-ink-700">
          <span className="mr-1">👋</span>
          Hi <span className="font-semibold text-ink-900">Mike Witzel</span>, here&apos;s what&apos;s
          happening with your store today.
        </p>

        <div className="flex shrink-0 items-center gap-1.5">
          <FilterSelect
            name={filterKeys.range}
            value={range}
            options={dateRangeOptions}
            label="Filter dashboard by date range"
            icon={<IconCalendar size={16} stroke={1.6} className="text-ink-500" />}
          />
          <RefreshButton
            label="Refresh dashboard"
            className="grid size-9 place-items-center rounded-lg border border-line text-ink-500 hover:bg-canvas"
          />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-6">
        <WeeklyEarningCard
          weeklyEarning={weeklyEarning}
          trend={trend}
          className="sm:col-span-2"
        />

        <CountStatCard
          icon="/sale.svg"
          value={formatCountPlus(totalSales)}
          label="No of Total Sales"
          tone="brand"
        />

        <CountStatCard
          icon="/money.svg"
          value={formatCountPlus(purchasedGoods)}
          label="No of Purchased Goods"
          tone="navy"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5 lg:gap-6">
        <BestSellerCard items={bestSellers} action={viewAll} className="xl:col-span-2" />
        <RecentTransactionsCard
          transactions={transactions}
          action={viewAll}
          className="xl:col-span-3"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3 lg:gap-6">
        <SalesAnalyticsCard points={salesPoints} year={year} className="xl:col-span-2" />
        <SalesByCountriesCard
          shapes={countryShapes}
          sales={countrySales.countries}
          trend={countrySales.trend}
          period={period}
        />
      </div>
    </div>
  );
}
