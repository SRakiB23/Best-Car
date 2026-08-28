"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";

import { Container } from "@/components/site/section";
import { SignOutButton } from "@/components/site/sign-out-button";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const links = [
  { label: "Home", href: "/#home" },
  { label: "How it Work", href: "/#how-it-works" },
  { label: "Our Cars", href: "/cars" },
  { label: "Why Choose Us", href: "/#why-choose-us" },
  { label: "Testimonial", href: "/#testimonial" },
];

export type HeaderViewer = { name: string; isStaff: boolean };

export function SiteHeader({ viewer }: { viewer?: HeaderViewer | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() =>
    pathname.startsWith("/cars") ? "/cars" : links[0].href,
  );

  return (
    <header className="relative z-30 bg-night-900">
      <Container className="flex h-18 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="Best Car — home">
          <Image
            src="/client-side/BestCarLogo.jpeg"
            alt="Best Car, premium and exotic car rental Dhaka"
            width={1024}
            height={513}
            priority
            className="h-10 w-auto rounded-md sm:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setActive(link.href)}
              className={cn(
                "relative py-1 text-[13px] font-medium transition",
                active === link.href
                  ? "text-gold-300 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gold-300"
                  : "text-white/80 hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <span className="h-6 w-px bg-white/15" />

          {viewer ? (
            <>
              <Link
                href={viewer.isStaff ? "/admin" : "/account/bookings"}
                className="text-[13px] font-medium text-white/80 hover:text-white"
              >
                {viewer.isStaff ? "Dashboard" : "My bookings"}
              </Link>
              <SignOutButton className={buttonClass("gold", "md", "px-6 font-semibold")}>
                Sign out
              </SignOutButton>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="text-[13px] font-medium text-white/80 hover:text-white"
              >
                Register
              </Link>
              <Link href="/login" className={buttonClass("gold", "md", "px-6 font-semibold")}>
                Log In
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="grid size-9 place-items-center rounded-lg border border-white/15 text-white lg:hidden"
        >
          {open ? <IconX size={18} /> : <IconMenu2 size={18} />}
        </button>
      </Container>

      <Container className={cn("lg:hidden", open ? "block" : "hidden")}>
        <div className="mb-4 rounded-2xl border border-white/10 bg-night-800 p-4">
          <nav className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  setActive(link.href);
                  setOpen(false);
                }}
                className={cn(
                  "rounded-lg px-2 py-2.5 text-[13px] font-medium",
                  active === link.href ? "text-gold-300" : "text-white/80 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3">
            {viewer ? (
              <>
                <Link
                  href={viewer.isStaff ? "/admin" : "/account/bookings"}
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-white/15 py-2 text-center text-[13px] font-medium text-white"
                >
                  {viewer.isStaff ? "Dashboard" : "My bookings"}
                </Link>
                <SignOutButton className={buttonClass("gold", "md", "flex-1 font-semibold")}>
                  Sign out
                </SignOutButton>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="flex-1 rounded-lg border border-white/15 py-2 text-center text-[13px] font-medium text-white"
                >
                  Register
                </Link>
                <Link href="/login" className={buttonClass("gold", "md", "flex-1 font-semibold")}>
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
