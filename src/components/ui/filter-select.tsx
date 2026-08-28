"use client";

import type { ReactNode } from "react";
import { IconChevronDown } from "@tabler/icons-react";

import { cn } from "@/lib/cn";
import { useSetParam } from "@/lib/use-set-param";

type FilterSelectProps = {
  name: string;
  value: string;
  options: readonly { value: string; label: string }[];
  label: string;
  icon?: ReactNode;
  className?: string;
};

export function FilterSelect({
  name,
  value,
  options,
  label,
  icon,
  className,
}: FilterSelectProps) {
  const setParam = useSetParam();

  return (
    <div
      className={cn(
        "relative inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-[13px] font-medium text-ink-700",
        className,
      )}
    >
      {icon}
      <select
        aria-label={label}
        value={value}
        onChange={(event) => setParam(name, event.target.value)}
        className="cursor-pointer appearance-none bg-transparent pr-5 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <IconChevronDown
        size={14}
        stroke={1.8}
        className="pointer-events-none absolute right-2.5 text-ink-400"
      />
    </div>
  );
}
