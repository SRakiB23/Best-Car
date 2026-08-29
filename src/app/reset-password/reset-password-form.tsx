"use client";

import { useActionState } from "react";

import { Field, controlClass } from "@/components/ui/field";
import { FormMessage, SubmitButton } from "@/components/ui/form-parts";
import { idleForm } from "@/lib/form-state";
import { completePasswordReset } from "@/lib/password-reset-actions";

export function ResetPasswordForm({ email }: { email: string }) {
  const [state, action] = useActionState(completePasswordReset, idleForm);

  return (
    <form action={action} className="grid gap-4" noValidate>
      <Field label="Account">
        <input className={`${controlClass} bg-canvas text-ink-500`} value={email} readOnly />
      </Field>

      <Field
        label="New password"
        error={state.errors?.newPassword}
        hint="At least 8 characters, mixing letters and numbers."
      >
        <input
          className={controlClass}
          name="newPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          autoFocus
        />
      </Field>

      <Field label="Confirm new password" error={state.errors?.confirmPassword}>
        <input
          className={controlClass}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
        />
      </Field>

      <FormMessage state={state} />

      <SubmitButton className="w-full" pendingLabel="Saving password…">
        Set new password
      </SubmitButton>
    </form>
  );
}
