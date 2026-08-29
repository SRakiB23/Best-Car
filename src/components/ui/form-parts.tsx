"use client";

import { useFormStatus } from "react-dom";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

import { useI18n } from "@/lib/i18n-context";
import { Button } from "./button";
import type { FormState } from "@/lib/form-state";

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className,
}: {
  children: string;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  const { t } = useI18n();

  return (
    <Button type="submit" variant="brand" disabled={pending} className={className}>
      {pending ? t(pendingLabel) : t(children)}
    </Button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) return null;

  const success = state.status === "success";
  const Glyph = success ? IconCheck : IconAlertCircle;

  return (
    <p
      role="status"
      className={`flex min-w-0 items-center gap-1.5 text-[13px] font-medium ${
        success ? "text-positive" : "text-negative"
      }`}
    >
      <Glyph size={15} stroke={2.2} className="shrink-0" />
      {state.message}
    </p>
  );
}
