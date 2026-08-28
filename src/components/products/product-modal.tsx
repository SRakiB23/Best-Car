"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";

import { Button, buttonClass } from "@/components/ui/button";
import { Field, controlClass } from "@/components/ui/field";
import { FormMessage, SubmitButton } from "@/components/ui/form-parts";
import { ImagePicker } from "@/components/ui/image-picker";
import { Modal } from "@/components/ui/modal";
import { idleForm } from "@/lib/form-state";
import { useI18n } from "@/lib/i18n-context";
import { createProduct, updateProduct } from "@/lib/product-actions";
import { productCategories } from "@/lib/products";

export type EditableProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
};

export function ProductModal({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product?: EditableProduct;
}) {
  const { t } = useI18n();
  const editing = Boolean(product);
  const [state, action, pending] = useActionState(
    editing ? updateProduct : createProduct,
    idleForm,
  );
  const [formKey, setFormKey] = useState(0);

  const done = state.status === "success";

  function close() {
    if (pending) return;
    setFormKey((key) => key + 1);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={editing ? t("Edit Product") : t("Add New Product")}
      description={
        editing
          ? t("Update the details of this car.")
          : t("Create a product in the current store.")
      }
    >
      {done ? (
        <div className="grid place-items-center gap-3 px-5 py-10 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-brand-50 text-positive">
            <IconCheck size={24} stroke={2.2} />
          </span>
          <p className="max-w-xs text-[15px] font-semibold text-navy-900">{state.message}</p>

          <div className="mt-2 flex gap-2">
            {editing ? (
              <Button variant="brand" onClick={close}>
                {t("Done")}
              </Button>
            ) : (
              <>
                <Button onClick={() => setFormKey((key) => key + 1)}>{t("Add another")}</Button>
                <Link href="/admin/products" onClick={close} className={buttonClass("brand")}>
                  {t("View products")}
                </Link>
              </>
            )}
          </div>
        </div>
      ) : (
        <form key={formKey} action={action} noValidate>
          {product && <input type="hidden" name="id" value={product.id} />}

          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ImagePicker name="image" error={state.errors?.image} currentImage={product?.image} />
            </div>

            <Field label={t("Product name")} error={state.errors?.name} className="sm:col-span-2">
              <input
                className={controlClass}
                name="name"
                placeholder="Range Rover Sport"
                defaultValue={product?.name}
              />
            </Field>

            <Field label={t("Category")} error={state.errors?.category}>
              <select className={controlClass} name="category" defaultValue={product?.category ?? "SUV"}>
                {productCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </Field>

            <Field label={t("Price")} error={state.errors?.price}>
              <input
                className={controlClass}
                name="price"
                inputMode="decimal"
                placeholder="1499.00"
                defaultValue={product?.price}
              />
            </Field>

            <Field label={t("Stock")} error={state.errors?.stock} className="sm:col-span-2">
              <input
                className={controlClass}
                name="stock"
                inputMode="numeric"
                defaultValue={product?.stock ?? 1}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
            <FormMessage state={state} />

            <div className="ml-auto flex shrink-0 gap-2">
              <Button onClick={close}>{t("Cancel")}</Button>
              <SubmitButton pendingLabel={editing ? "Saving…" : "Uploading…"}>
                {editing ? "Save changes" : "Create product"}
              </SubmitButton>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
