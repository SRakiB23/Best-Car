"use client";

import Image from "next/image";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";

import { Popover, PopoverItem } from "@/components/ui/popover";
import { useStoredState } from "@/lib/use-stored-state";
import type { Store } from "@/lib/types";

export function StoreSelect({ stores }: { stores: Store[] }) {
  const [activeId, setActiveId] = useStoredState("bestcar.store", stores[0].id);
  const active = stores.find((store) => store.id === activeId) ?? stores[0];

  return (
    <Popover
      label="Switch store"
      triggerClassName="h-9 gap-2 border border-line px-3 text-[13px] font-medium text-ink-700 hover:bg-canvas"
      panelClassName="min-w-[260px]"
      trigger={
        <>
          <Image
            src="/sidebar-icons/coming-soon.svg"
            alt=""
            width={18}
            height={18}
            className="size-[18px] object-contain"
          />
          {active.name}
          <IconChevronDown size={14} stroke={1.8} className="text-ink-400" />
        </>
      }
    >
      {(close) =>
        stores.map((store) => (
          <PopoverItem
            key={store.id}
            onClick={() => {
              setActiveId(store.id);
              close();
            }}
          >
            <span className="flex-1">
              <span className="block font-medium text-navy-900">{store.name}</span>
              <span className="block text-xs text-ink-500">{store.location}</span>
            </span>
            {store.id === active.id && (
              <IconCheck size={16} stroke={2} className="shrink-0 text-brand-500" />
            )}
          </PopoverItem>
        ))
      }
    </Popover>
  );
}
