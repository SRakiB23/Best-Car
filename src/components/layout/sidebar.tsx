"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n-context";
import { adminRoot, navSections, type NavIconSource, type NavItem } from "@/lib/nav";
import { useShell } from "./shell-context";

function isActive(pathname: string, href: string) {
  if (href === adminRoot) return pathname === adminRoot;
  return pathname === href || pathname.startsWith(`${href}/`);
}

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

function NavRow({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const active = isActive(pathname, item.href);
  const [open, setOpen] = useState(active);

  const rowClasses = cn(
    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
    active ? "bg-brand-50 text-brand-500" : "text-ink-800 hover:bg-canvas",
  );

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
                <Link
                  href={child.href}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-[13px] transition-colors",
                    pathname === child.href
                      ? "font-medium text-brand-500"
                      : "text-ink-800 hover:text-brand-500",
                  )}
                >
                  {t(child.label)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link href={item.href} className={rowClasses} title={collapsed ? t(item.label) : undefined}>
        <NavIcon icon={item.icon} className={iconClasses} />
        {!collapsed && <span className="truncate">{t(item.label)}</span>}
      </Link>
    </li>
  );
}

export function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useShell();
  const { t } = useI18n();

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
            <Link href={adminRoot} className="flex min-w-0 items-center">
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
