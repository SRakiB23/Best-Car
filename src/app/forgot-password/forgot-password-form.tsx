"use client";

import { useActionState } from "react";
import { IconMailCheck } from "@tabler/icons-react";

import { Field, controlClass } from "@/components/ui/field";
import { FormMessage, SubmitButton } from "@/components/ui/form-parts";
import { idleForm } from "@/lib/form-state";
import { requestPasswordReset } from "@/lib/password-reset-actions";

export function ForgotPasswordForm({ linkExpired }: { linkExpired: boolean }) {
  const [state, action] = useActionState(requestPasswordReset, idleForm);

  // Replaced rather than reset: the answer is the same for every address, so
  // leaving the field there only invites someone to fish with a second one.
  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-line bg-canvas px-4 py-5 text-center">
        <IconMailCheck size={26} stroke={1.7} className="mx-auto text-brand-500" />
        <p className="mt-3 text-[13px] leading-relaxed text-ink-700">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4" noValidate>
      {linkExpired && state.status === "idle" ? (
        <p className="rounded-lg bg-negative/10 px-3 py-2.5 text-[13px] text-negative">
          That reset link has expired or has already been used. Request a new one below.
        </p>
      ) : null}

      <Field
        label="Email"
        error={state.errors?.email}
        hint="We'll email a link that lets you choose a new password."
      >
        <input
          className={controlClass}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          autoFocus
        />
      </Field>

      <FormMessage state={state} />

      <SubmitButton className="w-full" pendingLabel="Sending link…">
        Send reset link
      </SubmitButton>
    </form>
  );
}
