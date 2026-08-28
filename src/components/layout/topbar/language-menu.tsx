"use client";

import { IconCheck } from "@tabler/icons-react";

import { Popover, PopoverItem } from "@/components/ui/popover";
import { useStoredState } from "@/lib/use-stored-state";

export const languages = [
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "bn", flag: "🇧🇩", label: "Bangla" },
  { code: "ar", flag: "🇸🇦", label: "Arabic" },
  { code: "de", flag: "🇩🇪", label: "German" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

export function LanguageMenu({ triggerClassName }: { triggerClassName?: string }) {
  const [active, setActive] = useStoredState("bestcar.language", languages[0].code);
  const current = languages.find((language) => language.code === active) ?? languages[0];

  return (
    <Popover
      label={`Language: ${current.label}`}
      triggerClassName={triggerClassName}
      trigger={<span className="text-base leading-none">{current.flag}</span>}
    >
      {(close) =>
        languages.map((language) => (
          <PopoverItem
            key={language.code}
            icon={<span className="text-base leading-none">{language.flag}</span>}
            onClick={() => {
              setActive(language.code);
              close();
            }}
          >
            <span className="flex-1">{language.label}</span>
            {language.code === current.code && (
              <IconCheck size={16} stroke={2} className="shrink-0 text-brand-500" />
            )}
          </PopoverItem>
        ))
      }
    </Popover>
  );
}
