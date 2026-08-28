export type Vehicle = {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  imageUrl: string | null;
};

export type Booking = {
  reference: string;
  status: "confirmed" | "cancelled";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupLocation: string;
  startDate: string;
  endDate: string;
  days: number;
  pricePerDay: number;
  totalAmount: number;
  createdAt: string;
  vehicle: { id: string; name: string; category: string; imageUrl: string | null };
};

export type BookingDraft = {
  vehicleId: string;
  startDate: string;
  endDate: string;
  name: string;
  email: string;
  phone: string;
  location: string;
};

export const maxRentalDays = 90;

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(date: string, amount: number) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + amount);
  return next.toISOString().slice(0, 10);
}

export function rentalDays(startDate: string, endDate: string) {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.floor((end - start) / 86_400_000) + 1;
}

/** Mirrors the server-side calculation so the UI can preview a total it never submits. */
export function quote(pricePerDay: number, startDate: string, endDate: string) {
  const days = rentalDays(startDate, endDate);
  return { days, total: Math.round(pricePerDay * days * 100) / 100 };
}

export function validateDates(startDate: string, endDate: string) {
  const errors: Record<string, string> = {};

  if (!isoDate.test(startDate)) errors.startDate = "Choose a pick-up date.";
  if (!isoDate.test(endDate)) errors.endDate = "Choose a drop-off date.";
  if (Object.keys(errors).length) return errors;

  if (startDate < today()) errors.startDate = "Pick-up cannot be in the past.";
  if (endDate < startDate) errors.endDate = "Drop-off must be on or after pick-up.";
  else if (rentalDays(startDate, endDate) > maxRentalDays) {
    errors.endDate = `Rentals are limited to ${maxRentalDays} days.`;
  }

  return errors;
}

export function validateCustomer(draft: Pick<BookingDraft, "name" | "email" | "phone">) {
  const errors: Record<string, string> = {};

  if (draft.name.trim().length < 2) errors.name = "Enter your full name.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (draft.phone.trim().replace(/\D/g, "").length < 6) errors.phone = "Enter a valid phone number.";

  return errors;
}

export const bookingErrors: Record<string, string> = {
  INVALID_NAME: "Enter your full name.",
  INVALID_EMAIL: "Enter a valid email address.",
  INVALID_PHONE: "Enter a valid phone number.",
  INVALID_DATES: "Choose both a pick-up and drop-off date.",
  START_IN_PAST: "Pick-up cannot be in the past.",
  END_BEFORE_START: "Drop-off must be on or after pick-up.",
  RANGE_TOO_LONG: `Rentals are limited to ${maxRentalDays} days.`,
  VEHICLE_NOT_FOUND: "That vehicle is no longer available.",
  VEHICLE_UNAVAILABLE: "This car is already booked for those dates. Please choose another range.",
  AUTH_REQUIRED: "Please sign in to complete your booking.",
  NOT_YOUR_BOOKING: "That booking belongs to another account.",
  BOOKING_NOT_FOUND: "We could not find that booking.",
};

export function bookingErrorMessage(raw: string) {
  const code = Object.keys(bookingErrors).find((key) => raw.includes(key));
  return code ? bookingErrors[code] : "We could not complete your booking. Please try again.";
}

export function formatDate(value: string) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
