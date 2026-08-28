"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { IconAlertTriangle, IconCircleCheck, IconLoader2 } from "@tabler/icons-react";

import { buttonClass } from "@/components/ui/button";

import {
  checkAvailability,
  createBooking,
  type AvailabilityState,
  type BookingState,
} from "@/lib/booking-actions";
import { addDays, formatDate, today, type Vehicle } from "@/lib/booking";
import { cn } from "@/lib/cn";

type BookedRange = { startDate: string; endDate: string };

const steps = ["Select dates", "Your details", "Confirmation"];

function Submit({ label, pending: forced }: { label: string; pending?: boolean }) {
  const { pending } = useFormStatus();
  const busy = pending || forced;

  return (
    <button
      type="submit"
      disabled={busy}
      className={buttonClass("gold", "md", "h-12 w-full text-base font-semibold disabled:opacity-60")}
    >
      {busy ? <IconLoader2 size={18} className="animate-spin" /> : null}
      {busy ? "Please wait…" : label}
    </button>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink-900">{label}</span>
      {children}
      {error ? <span className="text-xs text-negative">{error}</span> : null}
    </label>
  );
}

const inputClass =
  "h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink-900 outline-none transition focus:border-gold-400";

export type BookingCustomer = { name: string; email: string; phone: string };

export function BookingFlow({
  vehicle,
  bookedRanges,
  customer,
}: {
  vehicle: Vehicle;
  bookedRanges: BookedRange[];
  customer: BookingCustomer | null;
}) {
  const router = useRouter();
  const formId = useId();

  const [availability, checkAction] = useActionState<AvailabilityState, FormData>(
    checkAvailability,
    { status: "idle" },
  );
  const [booking, bookAction] = useActionState<BookingState, FormData>(createBooking, {
    status: "idle",
  });

  const available = availability.status === "available" ? availability : null;
  const step = booking.status === "success" ? 2 : available ? 1 : 0;

  // A fresh key per checked range so a double submit cannot create two bookings.
  const rangeKey = available ? `${available.startDate}:${available.endDate}` : "";
  const idempotencyKey = useMemo(() => (rangeKey ? crypto.randomUUID() : ""), [rangeKey]);

  useEffect(() => {
    if (booking.status === "success") {
      router.push(`/bookings/${booking.booking.reference}`);
    }
  }, [booking, router]);

  const errors = availability.status === "error" ? (availability.errors ?? {}) : {};
  const bookingErrors = booking.status === "error" ? (booking.errors ?? {}) : {};

  const minEnd = useMemo(() => addDays(today(), 0), []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-float lg:p-8">
      <ol className="flex items-center gap-2 text-xs font-medium">
        {steps.map((label, index) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-[11px]",
                index <= step ? "bg-gold-300 text-night-900" : "bg-mist text-ink-400",
              )}
            >
              {index + 1}
            </span>
            <span className={cn("truncate", index <= step ? "text-ink-900" : "text-ink-400")}>
              {label}
            </span>
          </li>
        ))}
      </ol>

      <form action={checkAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="vehicleId" value={vehicle.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pick-up date" error={errors.startDate}>
            <input
              type="date"
              name="startDate"
              required
              min={minEnd}
              defaultValue={available?.startDate}
              className={inputClass}
            />
          </Field>

          <Field label="Drop-off date" error={errors.endDate}>
            <input
              type="date"
              name="endDate"
              required
              min={minEnd}
              defaultValue={available?.endDate}
              className={inputClass}
            />
          </Field>
        </div>

        <Submit label="Check availability" />
      </form>

      {availability.status === "error" && availability.message ? (
        <Notice tone="error">{availability.message}</Notice>
      ) : null}

      {availability.status === "unavailable" ? (
        <Notice tone="error">{availability.message}</Notice>
      ) : null}

      {bookedRanges.length ? (
        <div className="mt-4 rounded-xl bg-mist p-4">
          <p className="text-xs font-semibold text-ink-900">Already booked</p>
          <ul className="mt-2 flex flex-col gap-1 text-xs text-ink-500">
            {bookedRanges.map((range) => (
              <li key={`${range.startDate}-${range.endDate}`}>
                {formatDate(range.startDate)} – {formatDate(range.endDate)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {available ? (
        <div className="mt-6 border-t border-line pt-6">
          <Notice tone="success">
            Available from {formatDate(available.startDate)} to {formatDate(available.endDate)}.
          </Notice>

          <dl className="mt-4 flex flex-col gap-2 rounded-xl bg-mist p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">
                ${vehicle.pricePerDay.toFixed(2)} × {available.days}{" "}
                {available.days === 1 ? "day" : "days"}
              </dt>
              <dd className="font-medium text-ink-900">${available.total.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2">
              <dt className="font-semibold text-ink-900">Total</dt>
              <dd className="text-xl font-bold text-ink-900">${available.total.toFixed(2)}</dd>
            </div>
          </dl>

          {customer ? (
            <form action={bookAction} className="mt-6 flex flex-col gap-4" id={formId}>
              <input type="hidden" name="vehicleId" value={vehicle.id} />
              <input type="hidden" name="startDate" value={available.startDate} />
              <input type="hidden" name="endDate" value={available.endDate} />
              <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

              <Field label="Full name" error={bookingErrors.name}>
                <input
                  name="name"
                  required
                  autoComplete="name"
                  defaultValue={customer.name}
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" error={bookingErrors.email}>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    defaultValue={customer.email}
                    className={inputClass}
                  />
                </Field>

                <Field label="Phone" error={bookingErrors.phone}>
                  <input
                    name="phone"
                    required
                    autoComplete="tel"
                    defaultValue={customer.phone}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Pick-up location">
                <input
                  name="location"
                  placeholder="Gulshan, Dhaka"
                  autoComplete="off"
                  className={inputClass}
                />
              </Field>

              <Submit label={`Confirm booking · $${available.total.toFixed(2)}`} />

              <p className="text-center text-xs text-ink-500">
                The total is recalculated on our server before your booking is stored.
              </p>
            </form>
          ) : (
            <SignInPrompt vehicleId={vehicle.id} />
          )}

          {booking.status === "error" && booking.message ? (
            <Notice tone="error">{booking.message}</Notice>
          ) : null}

          {booking.status === "success" ? (
            <Notice tone="success">Booking {booking.booking.reference} confirmed. Redirecting…</Notice>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** The dates survive the round trip, so signing in drops them back on this car. */
function SignInPrompt({ vehicleId }: { vehicleId: string }) {
  const next = encodeURIComponent(`/cars/${vehicleId}`);

  return (
    <div className="mt-6 rounded-xl border border-line bg-mist p-5 text-center">
      <p className="text-sm font-semibold text-ink-900">Sign in to finish booking</p>
      <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-ink-500">
        Your account keeps your details on file and lets you track every rental in one place.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href={`/register?next=${next}`}
          className={buttonClass("gold", "md", "h-11 px-6 font-semibold")}
        >
          Create an account
        </Link>
        <Link
          href={`/login?next=${next}`}
          className={buttonClass("outline", "md", "h-11 bg-white px-6 font-semibold")}
        >
          I already have one
        </Link>
      </div>
    </div>
  );
}

function Notice({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm",
        tone === "error" ? "bg-negative/10 text-negative" : "bg-positive/10 text-positive",
      )}
    >
      {tone === "error" ? (
        <IconAlertTriangle size={16} className="mt-0.5 shrink-0" />
      ) : (
        <IconCircleCheck size={16} className="mt-0.5 shrink-0" />
      )}
      {children}
    </p>
  );
}
