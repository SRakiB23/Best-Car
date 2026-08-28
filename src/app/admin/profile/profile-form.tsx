"use client";

import { useActionState } from "react";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, controlClass } from "@/components/ui/field";
import { FormMessage, SubmitButton } from "@/components/ui/form-parts";
import { saveProfile } from "@/lib/actions";
import { idleForm } from "@/lib/form-state";
import { useI18n } from "@/lib/i18n-context";
import type { Account } from "@/lib/types";

export function ProfileForm({ account }: { account: Account }) {
  const { t } = useI18n();
  const [state, action] = useActionState(saveProfile, idleForm);

  return (
    <Card>
      <CardHeader title={t("Profile details")} />

      <form action={action}>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Full name")} error={state.errors?.name}>
            <input name="name" defaultValue={account.name} className={controlClass} />
          </Field>

          <Field label={t("Email address")} error={state.errors?.email}>
            <input
              name="email"
              type="email"
              defaultValue={account.email}
              className={controlClass}
            />
          </Field>

          <Field label={t("Phone")}>
            <input name="phone" defaultValue={account.phone} className={controlClass} />
          </Field>

          <Field
            label={t("Profile image URL")}
            error={state.errors?.avatarUrl}
            hint={t("Leave empty to show your initials.")}
          >
            <input
              name="avatarUrl"
              defaultValue={account.avatarUrl}
              placeholder="https://example.com/photo.jpg"
              className={controlClass}
            />
          </Field>
        </CardBody>

        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
          <FormMessage state={state} />
          <SubmitButton>{t("Save changes")}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
