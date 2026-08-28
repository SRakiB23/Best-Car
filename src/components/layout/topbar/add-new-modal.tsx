"use client";

import { useState } from "react";
import { IconCheck, IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Field, controlClass } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n-context";


const categories = ["SUV", "Sedan", "Hatchback", "Coupe", "Pickup"];

type Fields = { name: string; category: string; price: string; quantity: string };
type Errors = Partial<Record<keyof Fields, string>>;

const empty: Fields = { name: "", category: categories[0], price: "", quantity: "1" };

function validate({ name, price, quantity }: Fields): Errors {
  const errors: Errors = {};

  if (name.trim().length < 3) errors.name = "Enter at least 3 characters.";
  if (!(Number(price) > 0)) errors.price = "Enter a price greater than 0.";
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
    errors.quantity = "Enter a whole number of 1 or more.";
  }

  return errors;
}

export function AddNewModal() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [created, setCreated] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setFields(empty);
    setErrors({});
    setCreated(null);
  }

  function update<K extends keyof Fields>(key: K, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const found = validate(fields);
    setErrors(found);

    if (Object.keys(found).length === 0) setCreated(fields.name.trim());
  }

  return (
    <>
      <Tooltip label="Add a new product">
        <Button variant="brand" onClick={() => setOpen(true)} className="hidden sm:inline-flex">
          <IconPlus size={16} stroke={2.4} />
          {t("Add New")}
        </Button>
      </Tooltip>

      <Modal
        open={open}
        onClose={close}
        title="Add New Product"
        description="Create a product in the current store."
      >
        {created ? (
          <div className="grid place-items-center gap-3 px-5 py-10 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-brand-50 text-positive">
              <IconCheck size={24} stroke={2.2} />
            </span>
            <p className="text-[15px] font-semibold text-navy-900">{created} created</p>
            <p className="max-w-xs text-[13px] text-ink-500">
              The form validated and submitted. Connect a real endpoint to persist it.
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                onClick={() => {
                  setFields(empty);
                  setCreated(null);
                }}
              >
                Add another
              </Button>
              <Button variant="brand" onClick={close}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
              <Field label="Product name" error={errors.name} className="sm:col-span-2">
                <input
                  className={controlClass}
                  placeholder="Range Rover Sport"
                  value={fields.name}
                  onChange={(event) => update("name", event.target.value)}
                />
              </Field>

              <Field label="Category">
                <select
                  className={controlClass}
                  value={fields.category}
                  onChange={(event) => update("category", event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </Field>

              <Field label="Price (USD)" error={errors.price}>
                <input
                  className={controlClass}
                  inputMode="decimal"
                  placeholder="1499.00"
                  value={fields.price}
                  onChange={(event) => update("price", event.target.value)}
                />
              </Field>

              <Field label="Quantity" error={errors.quantity}>
                <input
                  className={controlClass}
                  inputMode="numeric"
                  value={fields.quantity}
                  onChange={(event) => update("quantity", event.target.value)}
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
              <Button onClick={close}>Cancel</Button>
              <Button type="submit" variant="brand">
                Create product
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

