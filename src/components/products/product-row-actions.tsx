"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import { Button, buttonClass } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";
import { idleForm } from "@/lib/form-state";
import { useI18n } from "@/lib/i18n-context";
import { deleteProduct } from "@/lib/product-actions";
import { ProductModal, type EditableProduct } from "./product-modal";

const iconAction =
  "grid size-9 place-items-center rounded-lg text-ink-500 transition hover:bg-canvas hover:text-navy-900 sm:size-8";

function RemoveButton() {
  const { pending } = useFormStatus();
  const { t } = useI18n();

  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClass("brand", "md", "bg-negative hover:bg-negative/90")}
    >
      {pending ? t("Working…") : t("Delete")}
    </button>
  );
}

export function ProductRowActions({
  product,
  sales,
}: {
  product: EditableProduct;
  sales: number;
}) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [state, action] = useActionState(deleteProduct, idleForm);

  const settled = state.status !== "idle";

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Tooltip label={t("Edit product")}>
        <button
          type="button"
          aria-label={t("Edit product")}
          className={iconAction}
          onClick={() => setEditing(true)}
        >
          <IconPencil size={16} stroke={1.8} />
        </button>
      </Tooltip>

      {sales === 0 && (
        <Tooltip label={t("Delete product")}>
          <button
            type="button"
            aria-label={t("Delete product")}
            className={`${iconAction} hover:text-negative`}
            onClick={() => setConfirming(true)}
          >
            <IconTrash size={16} stroke={1.8} />
          </button>
        </Tooltip>
      )}

      <ProductModal open={editing} onClose={() => setEditing(false)} product={product} />

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t("Delete product")}
        description={product.name}
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
            <input type="hidden" name="id" value={product.id} />

            <p className="px-5 py-5 text-[13px] text-ink-700">
              {t("This car has never sold, so it will be removed along with its photo.")}
            </p>

            <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
              <Button onClick={() => setConfirming(false)}>{t("Cancel")}</Button>
              <RemoveButton />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
