"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconUserSearch } from "@tabler/icons-react";

/**
 * Floating shortcut to the leads inbox. Overlays the shell rather than sitting
 * in the dashboard grid, so the provided page layouts stay untouched.
 *
 * Kept below the mobile sidebar's z-40 scrim: at an equal value it renders later
 * in the tree, so it would float undimmed over an open menu and stay clickable
 * through it.
 */
export function LeadsFab({ count }: { count: number }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin/leads")) return null;

  return (
    <Link
      href="/admin/leads"
      aria-label={count > 0 ? `Leads, ${count} new` : "Leads"}
      className="group fixed bottom-15 right-6 z-30 flex items-center gap-2.5 rounded-full bg-brand-strong px-4 py-3.5 text-white shadow-lg shadow-navy-900/25 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
    >
      <span className="relative grid place-items-center">
        <IconUserSearch size={22} stroke={1.7} />
        {count > 0 ? (
          <span className="absolute -right-2.5 -top-2.5 grid min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-bold leading-5 text-brand-strong">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>

      <span className="hidden text-sm font-semibold sm:inline">Leads</span>
    </Link>
  );
}
