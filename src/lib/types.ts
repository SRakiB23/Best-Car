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
  link?: string;
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

export type BookingStatus = "confirmed" | "cancelled";

export type BookingRow = {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupLocation: string;
  startDate: string;
  endDate: string;
  days: number;
  pricePerDay: Money;
  totalAmount: Money;
  status: BookingStatus;
  bookedAgo: string;
  vehicle: string;
  vehicleCategory: string;
  image?: string;
};

export type LeadStatus = "new" | "qualified" | "contacted" | "closed";

export type LeadPriority = "low" | "medium" | "high";

/** Everything from `leadScore` down is null until the model has been run. */
export type LeadRow = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  source: string;
  status: LeadStatus;
  receivedAgo: string;
  vehicle?: string;
  /** Dates the customer picked in the form, not the model's reading of them. */
  pickupDate: string | null;
  returnDate: string | null;
  leadScore: number | null;
  priority: LeadPriority | null;
  intent: string | null;
  estimatedBudgetAmount: number | null;
  estimatedBudgetPeriod: string | null;
  rentalDurationDays: number | null;
  rentalDurationLabel: string | null;
  vehiclePreference: string | null;
  vehiclePreferenceCategory: string | null;
  urgency: string | null;
  aiSummary: string | null;
  recommendedAction: string | null;
  missingInformation: string[];
  qualifiedAt: string | null;
};

export type ListResult<T> = {
  rows: T[];
  total: number;
};
