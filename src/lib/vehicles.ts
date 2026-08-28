import "server-only";

import type { Booking, Vehicle } from "./booking";
import { createClient } from "./supabase/server";

type VehicleRow = {
  id: string;
  name: string;
  category: string;
  price: number | string;
  image_url: string | null;
};

function toVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    pricePerDay: Number(row.price),
    imageUrl: row.image_url,
  };
}

export async function listVehicles(category?: string): Promise<Vehicle[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, name, category, price, image_url")
    .order("price", { ascending: true });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw new Error(`listVehicles: ${error.message}`);

  return (data ?? []).map(toVehicle);
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, category, price, image_url")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getVehicle: ${error.message}`);

  return data ? toVehicle(data) : null;
}

export async function getBookedRanges(vehicleId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("vehicle_booked_ranges", { p_vehicle_id: vehicleId });

  if (error) throw new Error(`vehicle_booked_ranges: ${error.message}`);

  return (data ?? []).map((row) => ({ startDate: row.start_date, endDate: row.end_date }));
}

export async function getBooking(reference: string): Promise<Booking | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("booking_payload", { p_reference: reference });

  if (error) throw new Error(`booking_payload: ${error.message}`);

  return data ? toBooking(data) : null;
}

type BookingPayload = {
  reference: string;
  status: Booking["status"];
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_location: string;
  start_date: string;
  end_date: string;
  days: number;
  price_per_day: number | string;
  total_amount: number | string;
  created_at: string;
  vehicle: { id: string; name: string; category: string; image_url: string | null };
};

export function toBooking(payload: unknown): Booking {
  const row = payload as BookingPayload;

  return {
    reference: row.reference,
    status: row.status,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    pickupLocation: row.pickup_location,
    startDate: row.start_date,
    endDate: row.end_date,
    days: row.days,
    pricePerDay: Number(row.price_per_day),
    totalAmount: Number(row.total_amount),
    createdAt: row.created_at,
    vehicle: {
      id: row.vehicle.id,
      name: row.vehicle.name,
      category: row.vehicle.category,
      imageUrl: row.vehicle.image_url,
    },
  };
}
