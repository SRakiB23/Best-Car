"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

import { Panel } from "@/components/site/panel";
import { cn } from "@/lib/cn";

type Trip = "pick-up" | "drop-off";

const locations = ["Dhaka", "Chattogram", "Sylhet", "Khulna"];
const dates = ["Today", "Tomorrow", "This weekend"];
const times = ["09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM"];

const fields = [
  { name: "location", label: "Locations", placeholder: "Select your city", options: locations },
  { name: "date", label: "Date", placeholder: "Select your date", options: dates },
  { name: "time", label: "Time", placeholder: "Select your time", options: times },
];

export function SelectField({
  label,
  placeholder,
  options,
  name,
}: {
  label: string;
  placeholder: string;
  options: string[];
  name?: string;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink-900">{label}</span>
      <span className="relative block">
        <select
          name={name}
          defaultValue=""
          className="w-full appearance-none truncate bg-transparent pr-6 text-xs text-ink-500 outline-none focus-visible:text-ink-900"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <IconChevronDown
          size={14}
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-ink-400"
        />
      </span>
    </label>
  );
}

export function RadioOption({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className="flex items-center gap-2 text-[13px] font-medium text-ink-900"
    >
      <span
        className={cn(
          "grid size-3.5 place-items-center rounded-full border transition",
          active ? "border-gold-500" : "border-ink-400",
        )}
      >
        <span className={cn("size-1.5 rounded-full", active ? "bg-gold-500" : "bg-transparent")} />
      </span>
      {label}
    </button>
  );
}

function TripFields({
  label,
  active,
  onSelect,
  prefix,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
  prefix: Trip;
}) {
  return (
    <div className="min-w-0 flex-1">
      <RadioOption label={label} active={active} onSelect={onSelect} />

      <div className="mt-4 flex items-stretch gap-4 sm:gap-6">
        {fields.map((field, index) => (
          <div key={field.label} className="flex min-w-0 flex-1 gap-4 sm:gap-6">
            {index > 0 ? <span className="w-px shrink-0 bg-line" /> : null}
            <SelectField
              name={`${prefix}-${field.name}`}
              label={field.label}
              placeholder={field.placeholder}
              options={field.options}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BookingSearch() {
  const [trip, setTrip] = useState<Trip>("pick-up");

  return (
    <Panel
      as="form"
      tone="white"
      elevation="float"
      id="booking"
      onSubmit={(event: React.FormEvent) => event.preventDefault()}
      className="mx-auto max-w-284 lg:flex lg:h-33 lg:items-center lg:py-0"
    >
      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:gap-10">
          <TripFields
            prefix="pick-up"
            label="Pick - Up"
            active={trip === "pick-up"}
            onSelect={() => setTrip("pick-up")}
          />
          <span className="hidden w-px self-stretch bg-line sm:block" />
          <TripFields
            prefix="drop-off"
            label="Drop - Off"
            active={trip === "drop-off"}
            onSelect={() => setTrip("drop-off")}
          />
        </div>

        <button
          type="submit"
          className="h-10 w-full shrink-0 rounded-lg bg-gold-300 px-10 text-[13px] font-semibold text-night-900 transition hover:bg-gold-400 lg:w-auto"
        >
          Search
        </button>
      </div>
    </Panel>
  );
}
