"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconSearch } from "@tabler/icons-react";

import { Thumbnail } from "@/components/ui/thumbnail";
import { useI18n } from "@/lib/i18n-context";
import { navDestinations } from "@/lib/nav";
import { search } from "@/lib/search-actions";
import { minQueryLength, noResults, type SearchHit, type SearchResults } from "@/lib/search";
import { useDismiss } from "@/lib/use-dismiss";

export function SearchBox() {
  const { t } = useI18n();
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(0);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(noResults);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pending, startTransition] = useTransition();

  const term = query.trim();
  const asking = term.length >= minQueryLength;

  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, container, close);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // Modifier first, and `key` is optional: autofill and IME-generated events
      // reach this listener without one, and reading `.toLowerCase()` on that
      // threw for every keystroke in the document.
      if (!event.metaKey && !event.ctrlKey) return;

      if (event.key?.toLowerCase() === "k") {
        event.preventDefault();
        input.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const pages = useMemo<SearchHit[]>(() => {
    if (!asking) return [];
    const needle = term.toLowerCase();

    // Only screens that exist. Offering an unbuilt one costs a click and a
    // dead end, which is worse than the result simply not being there.
    return navDestinations
      .map((page) => ({ ...page, label: t(page.label), section: t(page.section) }))
      .filter((page) => page.label.toLowerCase().includes(needle))
      .slice(0, 4)
      .map((page) => ({
        id: page.href,
        href: page.href,
        title: page.label,
        subtitle: page.section,
      }));
  }, [asking, term, t]);

  const groups = [
    { key: "products", label: t("Products"), hits: results.products },
    { key: "orders", label: t("Transactions"), hits: results.orders },
    { key: "pages", label: t("Pages"), hits: pages },
  ].filter((group) => group.hits.length > 0);

  const flat = groups.flatMap((group) => group.hits);
  const searching = pending && flat.length === 0;

  function ask(value: string) {
    setQuery(value);
    setActive(0);
    setOpen(true);
    clearTimeout(timer.current);

    if (value.trim().length < minQueryLength) {
      setResults(noResults);
      return;
    }

    const id = ++latest.current;
    timer.current = setTimeout(() => {
      startTransition(async () => {
        const found = await search(value);
        // A slower earlier request must not overwrite a newer answer.
        if (id === latest.current) setResults(found);
      });
    }, 250);
  }

  function go(hit: SearchHit | undefined) {
    if (!hit) return;
    setOpen(false);
    setQuery("");
    setResults(noResults);
    input.current?.blur();
    router.push(hit.href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (flat.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((index) => (index + step + flat.length) % flat.length);
    }
  }

  return (
    <div ref={container} className="relative hidden max-w-[280px] flex-1 sm:block">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          go(flat[active]);
        }}
        className="relative flex items-center"
      >
        <IconSearch
          size={16}
          stroke={1.8}
          className="pointer-events-none absolute left-3 text-ink-400"
        />
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(event) => ask(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t("Search")}
          aria-label={t("Search")}
          className="h-9 w-full rounded-lg border border-line pl-9 pr-14 text-[13px] text-navy-900 outline-none transition placeholder:text-ink-400 focus:border-brand-300"
        />
        <kbd className="pointer-events-none absolute right-2 rounded border border-line bg-canvas px-1.5 py-0.5 text-[10px] font-medium text-ink-400">
          ⌘K
        </kbd>
      </form>

      {open && asking && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-white shadow-card">
          {searching ? (
            <p className="px-4 py-6 text-center text-[13px] text-ink-500">{t("Searching…")}</p>
          ) : flat.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-ink-500">
              {t("No matches found.")}
            </p>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto py-1">
              {groups.map((group) => (
                <li key={group.key}>
                  <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    {group.label}
                  </p>

                  <ul>
                    {group.hits.map((hit) => {
                      const index = flat.indexOf(hit);

                      return (
                        <li key={`${group.key}-${hit.id}`}>
                          <button
                            type="button"
                            onClick={() => go(hit)}
                            onMouseEnter={() => setActive(index)}
                            className={`flex w-full items-center gap-3 px-4 py-2 text-left transition ${
                              index === active ? "bg-canvas" : ""
                            }`}
                          >
                            {group.key === "pages" ? (
                              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-canvas text-ink-400">
                                <IconArrowRight size={15} stroke={1.8} />
                              </span>
                            ) : (
                              <Thumbnail src={hit.image} alt={hit.title} className="size-8" />
                            )}

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-medium text-navy-900">
                                {hit.title}
                              </span>
                              <span className="block truncate text-xs text-ink-500">
                                {hit.subtitle}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
