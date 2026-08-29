"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { IconAlertTriangle, IconCheck, IconSend } from "@tabler/icons-react";

import { buttonClass } from "@/components/ui/button";
import { today } from "@/lib/booking";
import { cn } from "@/lib/cn";
import { submitInquiry, type InquiryState } from "@/lib/lead-actions";

const idle: InquiryState = { status: "idle" };

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-gold-400 focus:bg-white";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClass("gold", "md", "h-12 w-full text-base font-semibold sm:w-auto sm:px-7")}
    >
      <IconSend size={18} stroke={1.8} />
      {pending ? "Sending…" : "Send inquiry"}
    </button>
  );
}

function Field({
  name,
  label,
  error,
  ...props
}: React.ComponentProps<"input"> & { name: string; label: string; error?: string }) {
  return (
    <div>
      <label htmlFor={`inquiry-${name}`} className="text-sm font-medium text-ink-700">
        {label}
      </label>
      <input id={`inquiry-${name}`} name={name} className={fieldClass} {...props} />
      {error ? <p className="mt-1.5 text-xs text-negative">{error}</p> : null}
    </div>
  );
}

/**
 * Not everyone who lands here is ready to pick dates and pay. This captures the
 * ones who are still deciding, which the booking flow used to lose entirely.
 */
export function InquiryForm({
  vehicleId,
  /** Inside a dialog the card chrome is already there, so it can be dropped. */
  bare = false,
}: {
  vehicleId?: string;
  bare?: boolean;
}) {
  const [state, action] = useActionState(submitInquiry, idle);
  // Tracked only so the return date cannot offer a day before the pick-up.
  const [pickupDate, setPickupDate] = useState("");
  const errors = state.status === "error" ? (state.errors ?? {}) : {};

  const shell = bare ? "" : "rounded-2xl border border-line bg-white shadow-card";

  if (state.status === "success") {
    return (
      <div className={cn("p-8 text-center", shell)}>
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-positive/10 text-positive">
          <IconCheck size={24} stroke={2} />
        </span>
        <h3 className="mt-4 text-lg font-bold text-ink-900">Thanks — we have your inquiry</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
          Our team reviews every message and will get back to you by email, usually within a few
          hours.
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className={cn("p-6", shell, bare ? "sm:p-0" : "sm:p-8")}
      noValidate
    >
      {vehicleId ? <input type="hidden" name="vehicleId" value={vehicleId} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="name"
          label="Your name"
          placeholder="Nadia Rahman"
          autoComplete="name"
          maxLength={120}
          error={errors.name}
        />
        <Field
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={160}
          error={errors.email}
        />
      </div>

      <div className="mt-4">
        <Field
          name="phone"
          label="Phone (optional)"
          type="tel"
          placeholder="+880 17 1122 3344"
          autoComplete="tel"
          maxLength={32}
          error={errors.phone}
        />
      </div>

      {/* Required: the sales team triages on when the car is needed, so an
          inquiry with no dates cannot be placed in the queue. Approximate dates
          are fine and the hint says so, which is the honest way to ask for a
          date from someone who is still deciding. */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inquiry-pickupDate" className="text-sm font-medium text-ink-700">
            Pick-up date
          </label>
          <input
            id="inquiry-pickupDate"
            name="pickupDate"
            type="date"
            required
            min={today()}
            value={pickupDate}
            onChange={(event) => setPickupDate(event.target.value)}
            className={fieldClass}
          />
          {errors.pickupDate ? (
            <p className="mt-1.5 text-xs text-negative">{errors.pickupDate}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="inquiry-returnDate" className="text-sm font-medium text-ink-700">
            Return date
          </label>
          <input
            id="inquiry-returnDate"
            name="returnDate"
            type="date"
            required
            min={pickupDate || today()}
            className={fieldClass}
          />
          {errors.returnDate ? (
            <p className="mt-1.5 text-xs text-negative">{errors.returnDate}</p>
          ) : null}
        </div>
      </div>

      <p className="mt-1.5 text-xs text-ink-400">
        Not sure yet? Give us your best estimate — we will confirm what is free around then.
      </p>

      <div className="mt-4">
        <label htmlFor="inquiry-message" className="text-sm font-medium text-ink-700">
          What do you need?
        </label>
        <textarea
          id="inquiry-message"
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="We are a family of five arriving on the 12th and need an automatic SUV for about a week. Roughly what would that cost?"
          className={`${fieldClass} resize-none`}
        />
        {errors.message ? <p className="mt-1.5 text-xs text-negative">{errors.message}</p> : null}
        <p className="mt-1.5 text-xs text-ink-400">
          The more you tell us — budget, how many people, luggage — the more useful our reply will
          be.
        </p>
      </div>

      {state.status === "error" && state.message ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <IconAlertTriangle size={18} stroke={1.8} className="mt-0.5 shrink-0" />
          {state.message}
        </p>
      ) : null}

      <div className="mt-6">
        <SubmitButton />
      </div>
    </form>
  );
}
