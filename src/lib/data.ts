import {
  comparisonLabel,
  periodComparison,
  type ChartYear,
  type DateRange,
  type Period,
} from "./filters";
import type {
  BestSeller,
  CountrySalesSummary,
  CurrentUser,
  EarningSummary,
  Message,
  Notification,
  SalesPoint,
  Store,
  Transaction,
} from "./types";

const rangeScale: Record<DateRange, number> = {
  "7d": 1,
  "30d": 4.3,
  "90d": 12.8,
  "365d": 51,
};

const rangeTrend: Record<DateRange, number> = { "7d": 48, "30d": 32, "90d": 17, "365d": 61 };

export async function getEarningSummary(range: DateRange): Promise<EarningSummary> {
  const scale = rangeScale[range];

  return {
    weeklyEarning: Number((95000.45 * scale).toFixed(2)),
    trend: {
      percent: rangeTrend[range],
      direction: "up",
      comparedTo: comparisonLabel[range],
    },
    totalSales: Math.round(10000 * scale),
    purchasedGoods: Math.round(800 * scale),
  };
}

export async function getBestSellers(range: DateRange): Promise<BestSeller[]> {
  const scale = rangeScale[range];

  const items: BestSeller[] = [
    { id: "bs-1", name: "Range Rover", price: 260, sales: 6547 },
    { id: "bs-2", name: "Audi S3", price: 1474, sales: 3474 },
    { id: "bs-3", name: "Blue Nissan", price: 8784, sales: 1478 },
    { id: "bs-4", name: "Toyota Corolla", price: 3240, sales: 987 },
    { id: "bs-5", name: "Compact car", price: 597, sales: 784 },
  ];

  return items.map((item) => ({ ...item, sales: Math.round(item.sales * scale) }));
}

export async function getRecentTransactions(): Promise<Transaction[]> {
  return [
    {
      id: "tx-1",
      product: "Range Rover",
      placedAgo: "15 Mins",
      paymentMethod: "Paypal",
      reference: "#416645453773",
      status: "success",
      amount: 1099,
    },
    {
      id: "tx-2",
      product: "Red Toyota",
      placedAgo: "15 Mins",
      paymentMethod: "Apple Pay",
      reference: "#147784454554",
      status: "cancelled",
      amount: 600.55,
    },
    {
      id: "tx-3",
      product: "Blue Nissan",
      placedAgo: "15 Mins",
      paymentMethod: "Stripe",
      reference: "#147784454554",
      status: "pending",
      amount: 200.1,
    },
    {
      id: "tx-4",
      product: "Toyota Corolla",
      placedAgo: "15 Mins",
      paymentMethod: "PayU",
      reference: "#147784454554",
      status: "success",
      amount: 1569,
    },
    {
      id: "tx-5",
      product: "Range Rover",
      placedAgo: "15 Mins",
      paymentMethod: "Paytm",
      reference: "#147784454554",
      status: "success",
      amount: 1478,
    },
  ];
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep"];

const yearlySales: Record<ChartYear, number[]> = {
  "2021": [14000, 18500, 15000, 22000, 26000, 21000, 24500, 28000, 31000],
  "2022": [19000, 22000, 26500, 20000, 24000, 33000, 27500, 23000, 25000],
  "2023": [24000, 30000, 17500, 21000, 20500, 30000, 20000, 19000, 17000],
};

export async function getSalesAnalytics(year: ChartYear): Promise<SalesPoint[]> {
  return months.map((month, index) => ({ month, value: yearlySales[year][index] }));
}

const periodScale: Record<Period, number> = { week: 1, month: 4.1, year: 46 };
const periodTrend: Record<Period, number> = { week: 48, month: 26, year: 73 };

export async function getSalesByCountry(period: Period): Promise<CountrySalesSummary> {
  const scale = periodScale[period];

  const countries = [
    { isoNumericCode: "840", name: "United States", sales: 5120 },
    { isoNumericCode: "076", name: "Brazil", sales: 2870 },
    { isoNumericCode: "710", name: "South Africa", sales: 3455 },
    { isoNumericCode: "156", name: "China", sales: 4210 },
    { isoNumericCode: "356", name: "India", sales: 3980 },
    { isoNumericCode: "643", name: "Russia", sales: 1740 },
  ];

  return {
    countries: countries.map((item) => ({ ...item, sales: Math.round(item.sales * scale) })),
    trend: {
      percent: periodTrend[period],
      direction: "up",
      comparedTo: periodComparison[period],
    },
  };
}

export async function getStores(): Promise<Store[]> {
  return [
    { id: "coming-soon", name: "Coming Soon", location: "Default outlet" },
    { id: "grand-motors", name: "Grand Motors", location: "Dhaka, Banani" },
    { id: "city-autos", name: "City Autos", location: "Chattogram, GEC" },
    { id: "prime-wheels", name: "Prime Wheels", location: "Sylhet, Zindabazar" },
  ];
}

export async function getNotifications(): Promise<Notification[]> {
  return [
    {
      id: "nt-1",
      title: "Low stock alert",
      detail: "Blue Nissan dropped below 5 units.",
      receivedAgo: "8 Mins",
      unread: true,
    },
    {
      id: "nt-2",
      title: "Payment received",
      detail: "$1,478.00 settled via Paytm.",
      receivedAgo: "42 Mins",
      unread: false,
    },
    {
      id: "nt-3",
      title: "Warranty expiring",
      detail: "3 warranties expire within 7 days.",
      receivedAgo: "2 Hours",
      unread: false,
    },
  ];
}

export async function getMessages(): Promise<Message[]> {
  return [
    {
      id: "ms-1",
      sender: "Rakib Hasan",
      preview: "Can you confirm the Range Rover delivery date?",
      receivedAgo: "5 Mins",
      unread: true,
    },
    {
      id: "ms-2",
      sender: "Tanvir Ahmed",
      preview: "Invoice #147784454554 needs a reprint.",
      receivedAgo: "1 Hour",
      unread: false,
    },
  ];
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return {
    name: "Mike Witzel",
    role: "Store Administrator",
    email: "mike.witzel@bestcar.com",
    initials: "MW",
  };
}
