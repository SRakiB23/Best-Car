"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Field, controlClass } from "@/components/ui/field";
import { FormMessage, SubmitButton } from "@/components/ui/form-parts";
import { signIn } from "@/lib/auth-actions";
import { idleForm } from "@/lib/form-state";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, idleForm);

  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="next" value={next} />

      <Field label="Email" error={state.errors?.email}>
        <input
          className={controlClass}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@bestcar.com"
          autoFocus
        />
      </Field>

      <div>
        <Field label="Password" error={state.errors?.password}>
          <input
            className={controlClass}
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </Field>

        <Link
          href="/forgot-password"
          className="mt-1.5 inline-block text-xs font-medium text-brand-500 hover:text-brand-600"
        >
          Forgot password?
        </Link>
      </div>

      <FormMessage state={state} />

      <SubmitButton className="w-full" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
