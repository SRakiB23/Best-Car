"use client";

import { useActionState } from "react";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, controlClass } from "@/components/ui/field";
import { FormMessage, SubmitButton } from "@/components/ui/form-parts";
import { currencyOptions, timezoneOptions } from "@/lib/account";
import { savePreferences } from "@/lib/actions";
import { idleForm } from "@/lib/form-state";
import { useI18n } from "@/lib/i18n-context";
import type { Preferences } from "@/lib/types";

export function SettingsForm({ preferences }: { preferences: Preferences }) {
  const { t } = useI18n();
  const [state, action] = useActionState(savePreferences, idleForm);

  return (
    <Card>
      <CardHeader title={t("General settings")} />

      <form action={action}>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Store name")} error={state.errors?.storeName} className="sm:col-span-2">
            <input name="storeName" defaultValue={preferences.storeName} className={controlClass} />
          </Field>

          <Field
            label={t("Currency")}
            error={state.errors?.currency}
            hint={t("Applied to every amount on the dashboard.")}
          >
            <select name="currency" defaultValue={preferences.currency} className={controlClass}>
              {currencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("Timezone")}>
            <select name="timezone" defaultValue={preferences.timezone} className={controlClass}>
              {timezoneOptions.map((zone) => (
                <option key={zone}>{zone}</option>
              ))}
            </select>
          </Field>

          <Field
            label={t("Low stock threshold")}
            error={state.errors?.lowStockThreshold}
            hint={t("Units remaining before a product is flagged.")}
          >
            <input
              name="lowStockThreshold"
              inputMode="numeric"
              defaultValue={preferences.lowStockThreshold}
              className={controlClass}
            />
          </Field>
        </CardBody>

        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
          <FormMessage state={state} />
          <SubmitButton>{t("Save settings")}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
