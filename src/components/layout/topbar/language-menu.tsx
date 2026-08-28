"use client";

import { useTransition } from "react";
import { IconCheck } from "@tabler/icons-react";

import { Popover, PopoverItem } from "@/components/ui/popover";
import { setLocale } from "@/lib/actions";
import { locales } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n-context";

export function LanguageMenu({ triggerClassName }: { triggerClassName?: string }) {
  const { locale, t } = useI18n();
  const [pending, startTransition] = useTransition();
  const current = locales.find((entry) => entry.code === locale) ?? locales[0];

  return (
    <Popover
      label={`${t("Language")}: ${current.label}`}
      triggerClassName={triggerClassName}
      trigger={<span className="text-base leading-none">{current.flag}</span>}
    >
      {(close) =>
        locales.map((entry) => (
          <PopoverItem
            key={entry.code}
            icon={<span className="text-base leading-none">{entry.flag}</span>}
            disabled={pending}
            onClick={() => {
              startTransition(() => setLocale(entry.code));
              close();
            }}
          >
            <span className="flex-1">{entry.label}</span>
            {entry.code === current.code && (
              <IconCheck size={16} stroke={2} className="shrink-0 text-brand-500" />
            )}
          </PopoverItem>
        ))
      }
    </Popover>
  );
}
