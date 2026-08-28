"use server";

import { revalidatePath } from "next/cache";

import {
  bookingErrorMessage,
  quote,
  validateCustomer,
  validateDates,
  type Booking,
} from "./booking";
import { createClient } from "./supabase/server";
import { toBooking } from "./vehicles";

export type AvailabilityState =
  | { status: "idle" }
  | { status: "error"; errors?: Record<string, string>; message?: string }
  | {
      status: "available";
      startDate: string;
      endDate: string;
      days: number;
      total: number;
    }
  | { status: "unavailable"; startDate: string; endDate: string; message: string };

export type BookingState =
  | { status: "idle" }
  | { status: "error"; errors?: Record<string, string>; message?: string }
  | { status: "success"; booking: Booking };

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export async function checkAvailability(
  _previous: AvailabilityState,
  form: FormData,
): Promise<AvailabilityState> {
  const vehicleId = text(form, "vehicleId");
  const startDate = text(form, "startDate");
  const endDate = text(form, "endDate");

  const errors = validateDates(startDate, endDate);
  if (Object.keys(errors).length) return { status: "error", errors };

  const supabase = await createClient();

  const vehicle = await supabase
    .from("products")
    .select("price")
    .eq("id", vehicleId)
    .maybeSingle();

  if (vehicle.error) return { status: "error", message: "We could not reach the booking system." };
  if (!vehicle.data) return { status: "error", message: "That vehicle is no longer available." };

  const { data, error } = await supabase.rpc("vehicle_is_available", {
    p_vehicle_id: vehicleId,
    p_start: startDate,
    p_end: endDate,
  });

  if (error) return { status: "error", message: "We could not check availability. Try again." };

  if (!data) {
    return {
      status: "unavailable",
      startDate,
      endDate,
      message: "This car is already booked for those dates. Please choose another range.",
    };
  }

  const priced = quote(Number(vehicle.data.price), startDate, endDate);

  return { status: "available", startDate, endDate, days: priced.days, total: priced.total };
}

export async function createBooking(
  _previous: BookingState,
  form: FormData,
): Promise<BookingState> {
  const vehicleId = text(form, "vehicleId");
  const startDate = text(form, "startDate");
  const endDate = text(form, "endDate");
  const name = text(form, "name");
  const email = text(form, "email");
  const phone = text(form, "phone");
  const location = text(form, "location");
  const idempotencyKey = text(form, "idempotencyKey");

  const errors = { ...validateDates(startDate, endDate), ...validateCustomer({ name, email, phone }) };
  if (Object.keys(errors).length) return { status: "error", errors };

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_booking", {
    p_vehicle_id: vehicleId,
    p_start: startDate,
    p_end: endDate,
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_location: location,
    p_idempotency_key: idempotencyKey || undefined,
  });

  if (error) return { status: "error", message: bookingErrorMessage(error.message) };
  if (!data) return { status: "error", message: "We could not complete your booking." };

  const booking = toBooking(data);
  revalidatePath(`/cars/${vehicleId}`);

  return { status: "success", booking };
}
