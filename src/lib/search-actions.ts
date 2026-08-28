"use server";

import { getPreferences } from "./account-store";
import { requireUser } from "./auth";
import { formatAmount } from "./format";
import { relativeTime } from "./relative-time";
import { likeTerm, minQueryLength, noResults, type SearchResults } from "./search";
import { createClient } from "./supabase/server";

export async function search(query: string): Promise<SearchResults> {
  const term = likeTerm(query);
  if (term.length < minQueryLength) return noResults;

  await requireUser();
  const supabase = await createClient();
  const { currency } = await getPreferences();

  const [products, orders] = await Promise.all([
    supabase
      .from("product_list")
      .select("id, name, category, price, image_url")
      .ilike("name", `%${term}%`)
      .order("sales", { ascending: false })
      .limit(5),
    supabase
      .from("order_list")
      .select("id, reference, product_name, product_image, amount, placed_at")
      .or(`reference.ilike.%${term}%,product_name.ilike.%${term}%`)
      .order("placed_at", { ascending: false })
      .limit(5),
  ]);

  return {
    products: (products.data ?? []).map((row) => ({
      id: row.id!,
      href: `/admin/products?q=${encodeURIComponent(row.name!)}`,
      title: row.name!,
      subtitle: `${row.category} · ${formatAmount(Number(row.price), currency)}`,
      image: row.image_url || undefined,
    })),
    orders: (orders.data ?? []).map((row) => ({
      id: row.id!,
      href: `/admin/sales?q=${encodeURIComponent(row.reference!)}`,
      title: row.reference!,
      subtitle: `${row.product_name} · ${formatAmount(Number(row.amount), currency)} · ${relativeTime(row.placed_at!)}`,
      image: row.product_image || undefined,
    })),
  };
}
