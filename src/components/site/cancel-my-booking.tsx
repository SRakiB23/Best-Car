"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { cancelBooking } from "@/lib/booking-admin-actions";
import { idleForm } from "@/lib/form-state";

function ConfirmButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-[13px] font-semibold text-negative transition hover:opacity-80 disabled:opacity-50"
    >
      {pending ? "Cancelling…" : "Yes, cancel"}
    </button>
  );
}

export function CancelMyBooking({ reference, vehicle }: { reference: string; vehicle: string }) {
  const [asking, setAsking] = useState(false);
  const [state, action] = useActionState(cancelBooking, idleForm);

  if (state.status === "error") {
    return <p className="text-[13px] text-negative">{state.message}</p>;
  }

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="text-[13px] font-medium text-negative transition hover:opacity-80"
      >
        Cancel
      </button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-3">
      <input type="hidden" name="reference" value={reference} />
      <span className="sr-only">Cancel your booking for {vehicle}?</span>

      <button
        type="button"
        onClick={() => setAsking(false)}
        className="text-[13px] font-medium text-ink-500 transition hover:text-ink-900"
      >
        Keep
      </button>
      <ConfirmButton />
    </form>
  );
}
