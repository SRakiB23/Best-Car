"use client";

import { useActionState } from "react";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, controlClass } from "@/components/ui/field";
import { FormMessage, SubmitButton } from "@/components/ui/form-parts";
import { changePassword } from "@/lib/actions";
import { idleForm } from "@/lib/form-state";
import { useI18n } from "@/lib/i18n-context";

const fields = [
  { name: "currentPassword", label: "Current password" },
  { name: "newPassword", label: "New password" },
  { name: "confirmPassword", label: "Confirm new password" },
] as const;

export function PasswordForm() {
  const { t } = useI18n();
  const [state, action] = useActionState(changePassword, idleForm);

  return (
    <Card>
      <CardHeader title={t("Password")} />

      <form action={action} key={state.status === "success" ? "reset" : "editing"}>
        <CardBody className="space-y-4">
          {fields.map((field) => (
            <Field key={field.name} label={t(field.label)} error={state.errors?.[field.name]}>
              <input
                name={field.name}
                type="password"
                autoComplete="off"
                className={controlClass}
              />
            </Field>
          ))}
        </CardBody>

        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
          <FormMessage state={state} />
          <SubmitButton>{t("Update password")}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
