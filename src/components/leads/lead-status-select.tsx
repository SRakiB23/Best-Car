"use client";

import { useActionState, useEffect, useRef } from "react";

import { idleForm } from "@/lib/form-state";
import { setLeadStatus } from "@/lib/lead-actions";
import type { LeadStatus } from "@/lib/types";

const options: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

/** Lets staff move a lead along without a modal; the pill beside it shows state. */
export function LeadStatusSelect({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [state, action, pending] = useActionState(setLeadStatus, idleForm);
  const form = useRef<HTMLFormElement>(null);

  // Keep the control in step with the row after a revalidate.
  useEffect(() => {
    if (state.status === "success") form.current?.reset();
  }, [state.status]);

  return (
    <form ref={form} action={action}>
      <input type="hidden" name="leadId" value={leadId} />
      <label className="sr-only" htmlFor={`lead-status-${leadId}`}>
        Lead status
      </label>
      <select
        id={`lead-status-${leadId}`}
        name="status"
        defaultValue={status}
        disabled={pending}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-8 rounded-lg border border-line bg-white px-2 text-xs text-ink-700 outline-none transition focus:border-gold-400 disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {state.status === "error" ? (
        <p role="alert" className="mt-1 text-[11px] text-negative">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
