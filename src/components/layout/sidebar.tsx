"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n-context";
import { adminRoot, isNavActive, navSections, type NavIconSource, type NavItem } from "@/lib/nav";
import { useShell } from "./shell-context";

function NavIcon({ icon, className }: { icon: NavIconSource; className?: string }) {
  if (typeof icon !== "string") {
    const Glyph = icon;
    return <Glyph size={16} stroke={1.6} className={cn("shrink-0", className)} />;
  }

  return (
    <span
      aria-hidden
      className={cn("size-4 shrink-0 bg-current", className)}
      style={{
        maskImage: `url(${icon})`,
        WebkitMaskImage: `url(${icon})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}

/** Marks a row that leads nowhere yet, so the label alone cannot promise a screen. */
function SoonPill() {
  return (
    <span className="ml-auto shrink-0 rounded-full bg-canvas px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
      Soon
    </span>
  );
}

function NavRow({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { setMobileOpen } = useShell();
  const activeChild = (item.children ?? []).some((child) => isNavActive(pathname, child.href));
  const active = activeChild || isNavActive(pathname, item.href);
  const [open, setOpen] = useState(active);

  const rowClasses = cn(
    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
    active ? "bg-brand-50 text-brand-500" : "text-ink-800 hover:bg-canvas",
  );

  // Nothing to navigate to, so this is not a link and not focusable. It stays
  // in the menu to show where the product is going, and says so plainly.
  if (!item.ready) {
    return (
      <li>
        <span
          aria-disabled
          title={collapsed ? `${t(item.label)} — coming soon` : undefined}
          className={cn(rowClasses, "cursor-default text-ink-400 hover:bg-transparent")}
        >
          <NavIcon icon={item.icon} className="text-ink-300" />
          {!collapsed && (
            <>
              <span className="truncate">{t(item.label)}</span>
              <SoonPill />
            </>
          )}
        </span>
      </li>
    );
  }

  // The icon sits a shade lighter than the label, so it cannot ride on the
  // row's currentColor.
  const iconClasses = active ? undefined : "text-ink-500";

  if (item.children) {
    return (
      <li>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={rowClasses}
          aria-expanded={open}
          title={collapsed ? t(item.label) : undefined}
        >
          <NavIcon icon={item.icon} className={iconClasses} />
          {!collapsed && (
            <>
              <span className="truncate">{t(item.label)}</span>
              <ChevronRight
                className={cn("ml-auto size-4 shrink-0 transition-transform", open && "rotate-90")}
                strokeWidth={1.75}
              />
            </>
          )}
        </button>

        {!collapsed && open && (
          <ul className="mt-1 space-y-1 border-l border-line pl-4 ml-[22px]">
            {item.children.map((child) => (
              <li key={child.href}>
                {child.ready ? (
                  <Link
                    href={child.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-[13px] transition-colors",
                      isNavActive(pathname, child.href)
                        ? "font-medium text-brand-500"
                        : "text-ink-800 hover:text-brand-500",
                    )}
                  >
                    {t(child.label)}
                  </Link>
                ) : (
                  <span
                    aria-disabled
                    className="flex cursor-default items-center rounded-md px-3 py-1.5 text-[13px] text-ink-400"
                  >
                    <span className="truncate">{t(child.label)}</span>
                    <SoonPill />
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href}
        // The drawer is an overlay: leaving it open would hide the page the tap
        // just asked for. Closing here rather than on arrival means it happens
        // immediately, not after the new screen has finished loading.
        onClick={() => setMobileOpen(false)}
        className={rowClasses}
        title={collapsed ? t(item.label) : undefined}
      >
        <NavIcon icon={item.icon} className={iconClasses} />
        {!collapsed && <span className="truncate">{t(item.label)}</span>}
      </Link>
    </li>
  );
}

export function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useShell();
  const { t } = useI18n();
  const pathname = usePathname();

  // Backstop for every other way out of the drawer — the logo, a notification
  // link, a search result. Whatever navigates, the overlay should not survive it.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const railed = collapsed && !mobileOpen;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-white transition-[width,transform] duration-200",
          railed ? "w-[76px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute right-0 top-8 z-10 hidden -translate-y-1/2 translate-x-1/2 rounded-full transition hover:brightness-95 lg:block"
        >
          <Image
            src="/sidebar-icons/sidebar-toggle.svg"
            alt=""
            width={20}
            height={20}
            className={cn("size-6 transition-transform", collapsed && "rotate-180")}
          />
        </button>

        <div className="flex h-16 items-center gap-2 px-4">
          {!railed && (
            <Link
              href={adminRoot}
              onClick={() => setMobileOpen(false)}
              className="flex min-w-0 items-center"
            >
              <Image src="/sidebar-icons/Logo.png" alt="BestCar" width={115} height={36} priority />
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="ml-auto lg:hidden"
          >
            <X className="size-5" strokeWidth={1.75} />
          </Button>
        </div>

        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-6">
          {navSections.map((section, index) => (
            <div
              key={section.title ?? "root"}
              className={cn("py-4", index > 0 && "border-t border-line")}
            >
              {section.title && (
                <p
                  className={cn(
                    "mb-2 px-3 text-[13px] font-semibold text-navy-900",
                    railed && "px-0 text-center",
                  )}
                >
                  {railed ? "•" : t(section.title)}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <NavRow key={item.href} item={item} collapsed={railed} />
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
