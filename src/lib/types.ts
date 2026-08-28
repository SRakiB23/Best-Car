export type Money = number;

export type TrendDirection = "up" | "down";

export type Trend = {
  percent: number;
  direction: TrendDirection;
  comparedTo: string;
};

export type EarningSummary = {
  weeklyEarning: Money;
  trend: Trend;
  totalSales: number;
  purchasedGoods: number;
};

export type BestSeller = {
  id: string;
  name: string;
  price: Money;
  sales: number;
  image?: string;
};

export type PaymentStatus = "success" | "cancelled" | "pending";

export type Transaction = {
  id: string;
  product: string;
  image?: string;
  placedAgo: string;
  paymentMethod: string;
  reference: string;
  status: PaymentStatus;
  amount: Money;
};

export type SalesPoint = {
  month: string;
  value: number;
};

export type CountrySales = {
  isoNumericCode: string;
  name: string;
  sales: number;
};

export type CountrySalesSummary = {
  countries: CountrySales[];
  trend: Trend;
};

export type Store = {
  id: string;
  name: string;
  location: string;
};

export type Notification = {
  id: string;
  title: string;
  detail: string;
  receivedAgo: string;
  unread: boolean;
};

export type Message = {
  id: string;
  sender: string;
  preview: string;
  receivedAgo: string;
  unread: boolean;
};

export type Account = {
  name: string;
  role: string;
  email: string;
  phone: string;
  avatarUrl: string;
};

export type CurrencyCode = "USD" | "EUR" | "GBP" | "BDT";

export type Preferences = {
  storeName: string;
  currency: CurrencyCode;
  timezone: string;
  lowStockThreshold: number;
};

export type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: Money;
  stock: number;
  sales: number;
  revenue: Money;
  image?: string;
};

export type OrderRow = Transaction & {
  placedAt: string;
};

export type ListResult<T> = {
  rows: T[];
  total: number;
};
