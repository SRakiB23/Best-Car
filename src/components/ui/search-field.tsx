"use client";

import { useState } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";

import { listKeys } from "@/lib/list-params";
import { useI18n } from "@/lib/i18n-context";
import { useSetParams } from "@/lib/use-set-param";

export function SearchField({ value, placeholder }: { value: string; placeholder: string }) {
  const { t } = useI18n();
  const setParams = useSetParams();
  const [draft, setDraft] = useState(value);

  function submit(next: string) {
    setParams({ [listKeys.search]: next, [listKeys.page]: "1" });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(draft.trim());
      }}
      className="relative flex w-full items-center sm:w-[260px]"
    >
      <IconSearch
        size={16}
        stroke={1.8}
        className="pointer-events-none absolute left-3 text-ink-400"
      />
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full rounded-lg border border-line pl-9 pr-8 text-[13px] text-navy-900 outline-none transition placeholder:text-ink-400 focus:border-brand-300"
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            submit("");
          }}
          aria-label={t("Clear search")}
          className="absolute right-2 grid size-5 place-items-center rounded text-ink-400 hover:text-navy-900"
        >
          <IconX size={14} stroke={2} />
        </button>
      )}
    </form>
  );
}
