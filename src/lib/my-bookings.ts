import "server-only";

import { createClient } from "./supabase/server";

export type MyBooking = {
  id: string;
  reference: string;
  status: "confirmed" | "cancelled";
  startDate: string;
  endDate: string;
  days: number;
  pricePerDay: number;
  totalAmount: number;
  pickupLocation: string;
  vehicle: string;
  vehicleCategory: string;
  image: string | null;
};

/** RLS scopes this to the signed-in customer, so no user filter is needed here. */
export async function listMyBookings(userId: string): Promise<MyBooking[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("booking_list")
    .select(
      "id, reference, status, start_date, end_date, days, price_per_day, total_amount, pickup_location, vehicle_name, vehicle_category, vehicle_image",
    )
    .eq("user_id", userId)
    .order("start_date", { ascending: false });

  if (error) throw new Error(`listMyBookings: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id!,
    reference: row.reference!,
    status: row.status as "confirmed" | "cancelled",
    startDate: row.start_date!,
    endDate: row.end_date!,
    days: Number(row.days),
    pricePerDay: Number(row.price_per_day),
    totalAmount: Number(row.total_amount),
    pickupLocation: row.pickup_location!,
    vehicle: row.vehicle_name!,
    vehicleCategory: row.vehicle_category!,
    image: row.vehicle_image || null,
  }));
}
