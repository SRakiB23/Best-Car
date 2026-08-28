"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { IconBan } from "@tabler/icons-react";

import { Button, buttonClass } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";
import { cancelBooking } from "@/lib/booking-admin-actions";
import { idleForm } from "@/lib/form-state";
import { useI18n } from "@/lib/i18n-context";

function ConfirmButton() {
  const { pending } = useFormStatus();
  const { t } = useI18n();

  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClass("brand", "md", "bg-negative hover:bg-negative/90")}
    >
      {pending ? t("Working…") : t("Cancel booking")}
    </button>
  );
}

export function CancelBookingAction({
  reference,
  customer,
  vehicle,
}: {
  reference: string;
  customer: string;
  vehicle: string;
}) {
  const { t } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const [state, action] = useActionState(cancelBooking, idleForm);

  const settled = state.status !== "idle";

  return (
    <div className="flex justify-end">
      <Tooltip label={t("Cancel booking")}>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="grid size-8 place-items-center rounded-lg text-ink-500 transition hover:bg-canvas hover:text-negative"
        >
          <IconBan size={16} stroke={1.8} />
        </button>
      </Tooltip>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t("Cancel booking")}
        description={`${reference} — ${vehicle}`}
        className="max-w-md"
      >
        {settled ? (
          <div className="px-5 py-6">
            <p
              className={`text-[13px] ${
                state.status === "success" ? "text-ink-700" : "text-negative"
              }`}
            >
              {state.message}
            </p>

            <div className="mt-4 flex justify-end">
              <Button variant="brand" onClick={() => setConfirming(false)}>
                {t("Done")}
              </Button>
            </div>
          </div>
        ) : (
          <form action={action}>
            <input type="hidden" name="reference" value={reference} />

            <p className="px-5 py-5 text-[13px] text-ink-700">
              {t("The dates will be released for other customers and the revenue reversed.")}{" "}
              {customer}
            </p>

            <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
              <Button onClick={() => setConfirming(false)}>{t("Keep booking")}</Button>
              <ConfirmButton />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
