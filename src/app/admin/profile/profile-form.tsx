"use client";

import Link from "next/link";
import { useActionState } from "react";
import { IconLock } from "@tabler/icons-react";

import { AvatarPicker } from "@/components/ui/avatar-picker";
import { buttonClass } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
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
      <form action={action}>
        {/* The photo lives with the identity it belongs to, so the page shows
            one avatar that is also the control for changing it. */}
        <div className="flex flex-col items-center gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-start">
          <AvatarPicker
            name={account.name}
            currentImage={account.avatarUrl || undefined}
            error={state.errors?.avatar}
          />

          <div className="min-w-0 flex-1 text-center sm:pt-1 sm:text-left">
            <p className="text-lg font-semibold text-navy-900">{account.name}</p>
            <p className="text-[13px] text-brand-500">{account.role}</p>
            <p className="mt-1 text-xs text-ink-400">
              {t("JPEG, PNG, WebP or AVIF up to 5 MB.")}
            </p>
          </div>

          <Link
            href="/admin/profile/password"
            className={buttonClass("outline", "md", "shrink-0")}
          >
            <IconLock size={16} stroke={1.6} />
            {t("Change password")}
          </Link>
        </div>

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
        </CardBody>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
          <FormMessage state={state} />
          <SubmitButton>{t("Save changes")}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
