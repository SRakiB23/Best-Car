"use client";

import { useState } from "react";
import { IconAlertCircle, IconCheck, IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";

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

const fieldClass =
  "h-10 w-full rounded-lg border border-line px-3 text-[13px] text-navy-900 outline-none transition placeholder:text-ink-400 focus:border-brand-300";

export function AddNewModal() {
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
          Add New
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
                  className={fieldClass}
                  placeholder="Range Rover Sport"
                  value={fields.name}
                  onChange={(event) => update("name", event.target.value)}
                />
              </Field>

              <Field label="Category">
                <select
                  className={fieldClass}
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
                  className={fieldClass}
                  inputMode="decimal"
                  placeholder="1499.00"
                  value={fields.price}
                  onChange={(event) => update("price", event.target.value)}
                />
              </Field>

              <Field label="Quantity" error={errors.quantity}>
                <input
                  className={fieldClass}
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

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-xs font-medium text-ink-700">{label}</span>
      {children}
      {error && (
        <span className="mt-1 flex items-center gap-1 text-xs text-negative">
          <IconAlertCircle size={13} stroke={2} />
          {error}
        </span>
      )}
    </label>
  );
}
