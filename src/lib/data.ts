import { rangeDays, periodDays, comparisonLabel, periodComparison } from "./filters";
import type { ChartYear, DateRange, Period } from "./filters";
import { pageRange, type ListParams, type SortDirection } from "./list-params";
import { relativeTime } from "./relative-time";
import { likeTerm } from "./search";
import { createClient } from "./supabase/server";
import type {
  BestSeller,
  ListResult,
  OrderRow,
  PaymentStatus,
  ProductRow,
  CountrySalesSummary,
  EarningSummary,
  Message,
  Notification,
  SalesPoint,
  Store,
  Transaction,
  TrendDirection,
} from "./types";

function unwrap<T>(result: { data: T | null; error: { message: string } | null }, context: string) {
  if (result.error) throw new Error(`${context}: ${result.error.message}`);
  return result.data;
}

export async function getEarningSummary(range: DateRange): Promise<EarningSummary> {
  const supabase = await createClient();
  const rows = unwrap(
    await supabase.rpc("earning_summary", { window_days: rangeDays[range] }),
    "earning_summary",
  );

  const summary = rows?.[0];

  return {
    weeklyEarning: Number(summary?.revenue ?? 0),
    trend: {
      percent: Number(summary?.percent ?? 0),
      direction: (summary?.direction ?? "up") as TrendDirection,
      comparedTo: comparisonLabel[range],
    },
    totalSales: Number(summary?.total_sales ?? 0),
    purchasedGoods: Number(summary?.purchased_goods ?? 0),
  };
}

export async function getBestSellers(range: DateRange): Promise<BestSeller[]> {
  const supabase = await createClient();
  const rows = unwrap(
    await supabase.rpc("best_sellers", { window_days: rangeDays[range], max_rows: 5 }),
    "best_sellers",
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    price: Number(row.price),
    sales: Number(row.sales),
    image: row.image_url || undefined,
  }));
}

export async function getRecentTransactions(
  sort: OrderSortKey = "date",
  dir: SortDirection = "desc",
): Promise<Transaction[]> {
  const supabase = await createClient();
  const rows = unwrap(
    await supabase
      .from("order_list")
      .select("id, reference, payment_method, status, amount, placed_at, product_name, product_image")
      .order(orderColumns[sort], { ascending: dir === "asc" })
      .limit(5),
    "recent transactions",
  );

  return (rows ?? []).map((row) => ({
    id: row.id!,
    product: row.product_name!,
    image: row.product_image || undefined,
    placedAgo: relativeTime(row.placed_at!),
    paymentMethod: row.payment_method!,
    reference: row.reference!,
    status: row.status!,
    amount: Number(row.amount),
  }));
}

export async function getSalesAnalytics(year: ChartYear): Promise<SalesPoint[]> {
  const supabase = await createClient();
  const rows = unwrap(
    await supabase.rpc("sales_analytics", { target_year: Number(year) }),
    "sales_analytics",
  );

  return (rows ?? []).map((row) => ({ month: row.month_label, value: Number(row.total) }));
}

export async function getSalesByCountry(period: Period): Promise<CountrySalesSummary> {
  const supabase = await createClient();
  const days = periodDays[period];

  const [countries, trend] = await Promise.all([
    supabase.rpc("country_sales", { window_days: days }),
    supabase.rpc("sales_trend", { window_days: days }),
  ]);

  const rows = unwrap(countries, "country_sales") ?? [];
  const summary = (unwrap(trend, "sales_trend") ?? [])[0];

  return {
    countries: rows.map((row) => ({
      isoNumericCode: row.code,
      name: row.name,
      sales: Number(row.sales),
    })),
    trend: {
      percent: Number(summary?.percent ?? 0),
      direction: (summary?.direction ?? "up") as TrendDirection,
      comparedTo: periodComparison[period],
    },
  };
}

export async function getStores(): Promise<Store[]> {
  const supabase = await createClient();
  const rows = unwrap(
    await supabase.from("stores").select("id, name, location").order("sort_order"),
    "stores",
  );

  return rows ?? [];
}

export async function getNotifications(): Promise<Notification[]> {
  const supabase = await createClient();
  const rows = unwrap(
    await supabase
      .from("notifications")
      .select("id, title, detail, created_at, read_at")
      .order("created_at", { ascending: false }),
    "notifications",
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    detail: row.detail,
    receivedAgo: relativeTime(row.created_at),
    unread: row.read_at === null,
  }));
}

export async function getMessages(): Promise<Message[]> {
  const supabase = await createClient();
  const rows = unwrap(
    await supabase
      .from("messages")
      .select("id, sender, preview, created_at, read_at")
      .order("created_at", { ascending: false }),
    "messages",
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    sender: row.sender,
    preview: row.preview,
    receivedAgo: relativeTime(row.created_at),
    unread: row.read_at === null,
  }));
}

export const productSortKeys = ["name", "category", "price", "stock", "sales"] as const;
export const orderSortKeys = ["product", "payment", "status", "amount", "date"] as const;

export type ProductSortKey = (typeof productSortKeys)[number];
export type OrderSortKey = (typeof orderSortKeys)[number];

const productColumns: Record<ProductSortKey, string> = {
  name: "name",
  category: "category",
  price: "price",
  stock: "stock",
  sales: "sales",
};

const orderColumns: Record<OrderSortKey, string> = {
  product: "product_name",
  payment: "payment_method",
  status: "status",
  amount: "amount",
  date: "placed_at",
};

export async function getProducts(
  params: ListParams<ProductSortKey>,
): Promise<ListResult<ProductRow>> {
  const supabase = await createClient();
  const { from, to } = pageRange(params.page);

  let query = supabase
    .from("product_list")
    .select("id, name, category, price, stock, image_url, sales, revenue", { count: "exact" });

  const term = likeTerm(params.q);
  if (term) query = query.ilike("name", `%${term}%`);

  const result = await query
    .order(productColumns[params.sort], { ascending: params.dir === "asc" })
    .range(from, to);

  const rows = unwrap(result, "products") ?? [];

  return {
    rows: rows.map((row) => ({
      id: row.id!,
      name: row.name!,
      category: row.category!,
      price: Number(row.price),
      stock: Number(row.stock),
      sales: Number(row.sales),
      revenue: Number(row.revenue),
      image: row.image_url || undefined,
    })),
    total: result.count ?? 0,
  };
}

export async function getOrders(
  params: ListParams<OrderSortKey> & { status: PaymentStatus | "" },
): Promise<ListResult<OrderRow>> {
  const supabase = await createClient();
  const { from, to } = pageRange(params.page);

  const term = likeTerm(params.q);

  // The unfiltered screen shows a recent slice, but a search has to reach the
  // whole history or older references would look as though they never existed.
  let query = supabase
    .from(term ? "order_list" : "recent_order_list")
    .select(
      "id, reference, payment_method, status, amount, placed_at, product_name, product_image",
      { count: "exact" },
    );

  if (term) {
    query = query.or(`reference.ilike.%${term}%,product_name.ilike.%${term}%`);
  }
  if (params.status) query = query.eq("status", params.status);

  const result = await query
    .order(orderColumns[params.sort], { ascending: params.dir === "asc" })
    .range(from, to);

  const rows = unwrap(result, "orders") ?? [];

  return {
    rows: rows.map((row) => ({
      id: row.id!,
      product: row.product_name!,
      image: row.product_image || undefined,
      placedAgo: relativeTime(row.placed_at!),
      placedAt: row.placed_at!,
      paymentMethod: row.payment_method!,
      reference: row.reference!,
      status: row.status!,
      amount: Number(row.amount),
    })),
    total: result.count ?? 0,
  };
}
