"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import type { ReactNode } from "react";
import { IconChevronDown } from "@tabler/icons-react";

import { Panel } from "@/components/site/panel";
import { cn } from "@/lib/cn";

type Trip = "pick-up" | "drop-off";
type TripValues = { location: string; date: string; time: string };

const locations = ["Dhaka", "Chattogram", "Sylhet", "Khulna"];

/** Local calendar day, not UTC, so the min date matches what the user sees on their clock. */
function toInputDate(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function addDays(date: string, days: number) {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + days);
  return toInputDate(next);
}

const controlClass =
  "w-full min-w-0 appearance-none truncate bg-transparent text-xs text-ink-900 outline-none placeholder:text-ink-400 focus-visible:text-ink-900";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink-900">{label}</span>
      <span className="relative block">{children}</span>
    </label>
  );
}

export function SelectField({
  label,
  placeholder,
  options,
  name,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: string[];
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <select
        name={name}
        value={value}
        defaultValue={value === undefined ? "" : undefined}
        onChange={(event) => onChange?.(event.target.value)}
        className={cn(controlClass, "pr-6", !value && "text-ink-500")}
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
    </Field>
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
  values,
  minDate,
  onChange,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
  prefix: Trip;
  values: TripValues;
  minDate: string;
  onChange: (patch: Partial<TripValues>) => void;
}) {
  return (
    <div className="min-w-0 flex-1">
      <RadioOption label={label} active={active} onSelect={onSelect} />

      {/* Stacks on phones, three-up from tablet; dividers only appear once the columns exist. */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-line">
        <div className="min-w-0 sm:pr-4 lg:pr-5">
          <SelectField
            name={`${prefix}-location`}
            label="Location"
            placeholder="Select your city"
            options={locations}
            value={values.location}
            onChange={(location) => onChange({ location })}
          />
        </div>

        <div className="min-w-0 sm:px-4 lg:px-5">
          <Field label="Date">
            <input
              type="date"
              name={`${prefix}-date`}
              value={values.date}
              min={minDate}
              onChange={(event) => onChange({ date: event.target.value })}
              className={controlClass}
            />
          </Field>
        </div>

        <div className="min-w-0 sm:pl-4 lg:pl-5">
          <Field label="Time">
            <input
              type="time"
              name={`${prefix}-time`}
              value={values.time}
              step={900}
              onChange={(event) => onChange({ time: event.target.value })}
              className={controlClass}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

export function BookingSearch() {
  const router = useRouter();
  const errorId = useId();
  const [trip, setTrip] = useState<Trip>("pick-up");
  const [today] = useState(() => toInputDate(new Date()));

  const [pickUp, setPickUp] = useState<TripValues>(() => ({
    location: "",
    date: toInputDate(new Date()),
    time: "10:00",
  }));
  const [dropOff, setDropOff] = useState<TripValues>(() => ({
    location: "",
    date: addDays(toInputDate(new Date()), 3),
    time: "10:00",
  }));

  const returnsBeforePickup =
    `${dropOff.date}T${dropOff.time}` <= `${pickUp.date}T${pickUp.time}`;

  function updatePickUp(patch: Partial<TripValues>) {
    const next = { ...pickUp, ...patch };
    setPickUp(next);
    // Keep the return leg valid instead of letting the user submit a negative rental.
    if (dropOff.date < next.date) setDropOff({ ...dropOff, date: next.date });
  }

  return (
    <Panel
      as="form"
      tone="white"
      elevation="float"
      id="booking"
      onSubmit={(event: React.FormEvent) => {
        event.preventDefault();
        if (returnsBeforePickup) return;

        const params = new URLSearchParams({
          pickup: pickUp.location,
          from: `${pickUp.date}T${pickUp.time}`,
          to: `${dropOff.date}T${dropOff.time}`,
        });
        if (dropOff.location) params.set("dropoff", dropOff.location);

        router.push(`/cars?${params.toString()}`);
      }}
      className="mx-auto max-w-284 lg:flex lg:min-h-33 lg:items-center lg:py-0"
    >
      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex flex-1 flex-col gap-6 sm:gap-8 lg:flex-row lg:gap-10">
          <TripFields
            prefix="pick-up"
            label="Pick - Up"
            active={trip === "pick-up"}
            onSelect={() => setTrip("pick-up")}
            values={pickUp}
            minDate={today}
            onChange={updatePickUp}
          />
          <span className="hidden w-px self-stretch bg-line lg:block" />
          <TripFields
            prefix="drop-off"
            label="Drop - Off"
            active={trip === "drop-off"}
            onSelect={() => setTrip("drop-off")}
            values={dropOff}
            minDate={pickUp.date}
            onChange={(patch) => setDropOff({ ...dropOff, ...patch })}
          />
        </div>

        <div className="flex shrink-0 flex-col gap-2 lg:items-end">
          <button
            type="submit"
            disabled={returnsBeforePickup}
            aria-describedby={returnsBeforePickup ? errorId : undefined}
            className="h-10 w-full shrink-0 rounded-lg bg-gold-300 px-10 text-[13px] font-semibold text-night-900 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
          >
            Search
          </button>
          {returnsBeforePickup ? (
            <p id={errorId} className="text-[11px] font-medium text-ink-500">
              Drop-off must be after pick-up.
            </p>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
