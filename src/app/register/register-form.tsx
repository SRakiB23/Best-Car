"use client";

import { useActionState } from "react";

import { Field, controlClass } from "@/components/ui/field";
import { FormMessage, SubmitButton } from "@/components/ui/form-parts";
import { signUp } from "@/lib/auth-actions";
import { idleForm } from "@/lib/form-state";

export function RegisterForm({ next }: { next: string }) {
  const [state, action] = useActionState(signUp, idleForm);

  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="next" value={next} />

      <Field label="Full name" error={state.errors?.name}>
        <input
          className={controlClass}
          name="name"
          autoComplete="name"
          placeholder="Rakib Hasan"
          autoFocus
        />
      </Field>

      <Field label="Email" error={state.errors?.email}>
        <input
          className={controlClass}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Phone" error={state.errors?.phone}>
        <input
          className={controlClass}
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+8801700000000"
        />
      </Field>

      <Field label="Password" error={state.errors?.password}>
        <input
          className={controlClass}
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
      </Field>

      <FormMessage state={state} />

      <SubmitButton className="w-full" pendingLabel="Creating account…">
        Create account
      </SubmitButton>
    </form>
  );
}
