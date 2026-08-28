"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Popover, PopoverItem } from "@/components/ui/popover";

export type MenuLink = { label: string; href: string; icon?: ReactNode };

export function LinkMenu({
  label,
  trigger,
  triggerClassName,
  panelClassName,
  header,
  links,
  footer,
}: {
  label: string;
  trigger: ReactNode;
  triggerClassName?: string;
  panelClassName?: string;
  header?: ReactNode;
  links: MenuLink[];
  footer?: ReactNode;
}) {
  const router = useRouter();

  return (
    <Popover
      label={label}
      trigger={trigger}
      triggerClassName={triggerClassName}
      panelClassName={panelClassName}
    >
      {(close) => (
        <>
          {header}
          {links.map((link) => (
            <PopoverItem
              key={link.href}
              icon={link.icon}
              onClick={() => {
                router.push(link.href);
                close();
              }}
            >
              {link.label}
            </PopoverItem>
          ))}
          {footer}
        </>
      )}
    </Popover>
  );
}

export function MenuFooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="block border-t border-line px-4 py-2.5 text-center text-xs font-medium text-brand-500 transition hover:bg-canvas"
    >
      {children}
    </Link>
  );
}
