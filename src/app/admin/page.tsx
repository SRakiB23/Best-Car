import Link from "next/link";
import { IconCalendar } from "@tabler/icons-react";

import { BestSellerCard } from "@/components/dashboard/best-seller-card";
import { CountStatCard } from "@/components/dashboard/count-stat-card";
import { RecentTransactionsCard } from "@/components/dashboard/recent-transactions-card";
import { SalesAnalyticsCard } from "@/components/dashboard/sales-analytics-card";
import { SalesByCountriesCard } from "@/components/dashboard/sales-by-countries-card";
import { WeeklyEarningCard } from "@/components/dashboard/weekly-earning-card";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { RefreshButton } from "@/components/ui/refresh-button";
import {
  getBestSellers,
  getEarningSummary,
  getRecentTransactions,
  getSalesAnalytics,
  getSalesByCountry,
  orderSortKeys,
} from "@/lib/data";
import { readListParams } from "@/lib/list-params";
import {
  dateRangeOptions,
  filterKeys,
  readFilters,
  type DashboardSearchParams,
} from "@/lib/filters";
import { formatCountPlus } from "@/lib/format";
import { getAccount, getPreferences, getTranslator } from "@/lib/account-store";
import { getCountryShapes } from "@/lib/world-map";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const params = await searchParams;
  const { range, year, period } = readFilters(params);
  const { sort, dir } = readListParams(params, orderSortKeys, "date");
  const [{ currency }, { name }, t] = await Promise.all([
    getPreferences(),
    getAccount(),
    getTranslator(),
  ]);

  const viewAll = (href: string) => (
    <Link href={href} className={buttonClass("soft", "sm")}>
      {t("View All")}
    </Link>
  );

  const [
    { weeklyEarning, trend, totalSales, purchasedGoods },
    bestSellers,
    transactions,
    salesPoints,
    countrySales,
  ] = await Promise.all([
    getEarningSummary(range),
    getBestSellers(range),
    getRecentTransactions(sort, dir),
    getSalesAnalytics(year),
    getSalesByCountry(period),
  ]);

  const countryShapes = getCountryShapes();

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card className="flex-col items-start justify-between gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
        <p className="text-[15px] text-ink-700">
          <span className="mr-1">👋</span>
          {t("greeting.before")}
          <span className="font-semibold text-ink-900">{name}</span>
          {t("greeting.after")}
        </p>

        <div className="flex shrink-0 items-center gap-1.5">
          <FilterSelect
            name={filterKeys.range}
            value={range}
            options={dateRangeOptions}
            label={t("Filter dashboard by date range")}
            icon={<IconCalendar size={16} stroke={1.6} className="text-ink-500" />}
          />
          <RefreshButton
            label={t("Refresh dashboard")}
            className="grid size-9 place-items-center rounded-lg border border-line text-ink-500 hover:bg-canvas"
          />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-6">
        <WeeklyEarningCard
          weeklyEarning={weeklyEarning}
          trend={trend}
          currency={currency}
          className="sm:col-span-2"
        />

        <CountStatCard
          icon="/sale.svg"
          value={formatCountPlus(totalSales)}
          label={t("No of Bookings")}
          tone="brand"
        />

        <CountStatCard
          icon="/money.svg"
          value={formatCountPlus(purchasedGoods)}
          label={t("No of Rental Days")}
          tone="navy"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5 lg:gap-6">
        <BestSellerCard
          items={bestSellers}
          currency={currency}
          action={viewAll("/admin/products")}
          className="xl:col-span-2"
        />
        <RecentTransactionsCard
          transactions={transactions}
          currency={currency}
          sort={sort}
          direction={dir}
          action={viewAll("/admin/sales")}
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
