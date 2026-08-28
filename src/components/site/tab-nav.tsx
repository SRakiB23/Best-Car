"use client";

import { cn } from "@/lib/cn";

export type TabItem<T extends string> = { id: T; label: string };

export function TabNav<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("scrollbar-thin overflow-x-auto border-b border-line", className)}>
      <div role="tablist" className="flex min-w-max lg:min-w-0">
        {items.map((item) => {
          const active = item.id === value;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.id)}
              className={cn(
                "relative flex-1 whitespace-nowrap px-4 pb-3 text-base font-semibold transition sm:px-6 sm:pb-4 lg:text-[22px]",
                active
                  ? "text-ink-900 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-gold-400"
                  : "text-ink-500 hover:text-ink-900",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
