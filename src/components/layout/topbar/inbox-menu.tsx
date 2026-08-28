"use client";

import Link from "next/link";
import { useOptimistic, useTransition, type ReactNode } from "react";

import { Popover, PopoverHeader } from "@/components/ui/popover";
import { markInboxRead } from "@/lib/actions";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n-context";

export type InboxEntry = {
  id: string;
  heading: string;
  body: string;
  receivedAgo: string;
  unread: boolean;
  href?: string;
};

type InboxMenuProps = {
  label: string;
  title: string;
  icon: ReactNode;
  entries: InboxEntry[];
  inbox: "notifications" | "messages";
  triggerClassName?: string;
  emptyText: string;
};

export function InboxMenu({
  label,
  title,
  icon,
  entries,
  inbox,
  triggerClassName,
  emptyText,
}: InboxMenuProps) {
  const { t } = useI18n();
  const [, startTransition] = useTransition();
  // Optimistic so the badge clears instantly, but the server action is what
  // makes it stick across a refresh.
  const [items, markRead] = useOptimistic(entries, (current, id: string | undefined) =>
    current.map((item) => (id === undefined || item.id === id ? { ...item, unread: false } : item)),
  );
  const unread = items.filter((item) => item.unread).length;

  const read = (id?: string) =>
    startTransition(async () => {
      markRead(id);
      await markInboxRead(inbox, id);
    });

  return (
    <Popover
      label={label}
      triggerClassName={triggerClassName}
      panelClassName="w-[320px]"
      trigger={
        <>
          {icon}
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold leading-4 text-white">
              {unread}
            </span>
          )}
        </>
      }
    >
      {(close) => (
        <>
          <PopoverHeader
            title={title}
            action={
              unread > 0 ? (
                <button
                  type="button"
                  onClick={() => read()}
                  className="text-xs font-medium text-brand-500 transition hover:text-brand-600"
                >
                  {t("Mark all read")}
                </button>
              ) : (
                <span className="text-xs text-ink-400">{t("All read")}</span>
              )
            }
          />

          <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-[13px] text-ink-500">{emptyText}</p>
            ) : (
              items.map((item) => {
                const open = () => {
                  if (item.unread) read(item.id);
                  if (item.href) close();
                };

                const content = (
                  <>
                    <span
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        item.unread ? "bg-brand-500" : "bg-transparent",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[13px] font-semibold text-navy-900">
                          {item.heading}
                        </span>
                        <span className="shrink-0 text-[11px] text-ink-400">
                          {item.receivedAgo}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-500">{item.body}</span>
                    </span>
                  </>
                );

                const className = cn(
                  "flex w-full gap-3 border-b border-line px-4 py-3 text-left transition last:border-0 hover:bg-canvas",
                  item.unread && "bg-brand-50/60",
                );

                return item.href ? (
                  <Link key={item.id} href={item.href} onClick={open} className={className}>
                    {content}
                  </Link>
                ) : (
                  <button key={item.id} type="button" onClick={open} className={className}>
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </Popover>
  );
}
