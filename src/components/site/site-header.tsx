"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

/** Section ids behind the hash links, used for scroll-spy on the storefront. */
const sectionIds = links
  .map((link) => link.href.split("#")[1])
  .filter((id): id is string => Boolean(id));

export function SiteHeader({ viewer }: { viewer?: HeaderViewer | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [spied, setSpied] = useState<string | null>(null);

  // Off the storefront the route decides; on it, the scrolled-to section does.
  const active =
    pathname === "/"
      ? (spied ?? links[0].href)
      : pathname.startsWith("/cars")
        ? "/cars"
        : links[0].href;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight whichever section is crossing the middle of the viewport, so the
  // nav keeps up with the smooth scroll instead of only updating on click.
  useEffect(() => {
    if (pathname !== "/") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        const top = visible.reduce((best, entry) =>
          entry.boundingClientRect.top < best.boundingClientRect.top ? entry : best,
        );
        setSpied(`/#${top.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    for (const id of sectionIds) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300 ease-out",
        scrolled ? "bg-night-900/85 shadow-float backdrop-blur-md" : "bg-night-900",
      )}
    >
      <Container
        className={cn(
          "flex items-center justify-between gap-4 transition-all duration-300 ease-out",
          scrolled ? "h-16" : "h-18",
        )}
      >
        <Link href="/" className="shrink-0" aria-label="Best Car — home">
          <Image
            src="/client-side/BestCarLogo.jpeg"
            alt="Best Car, premium and exotic car rental Dhaka"
            width={1024}
            height={513}
            priority
            className={cn(
              "w-auto rounded-md transition-all duration-300 ease-out",
              scrolled ? "h-9 sm:h-10" : "h-10 sm:h-11",
            )}
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSpied(link.href)}
              className={cn(
                "relative py-1 text-[13px] font-medium transition-colors duration-200",
                active === link.href ? "text-gold-300" : "text-white/80 hover:text-white",
              )}
            >
              {link.label}

              {/* Always rendered so the underline slides open rather than blinking in. */}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 -bottom-0.5 h-0.5 origin-left rounded-full bg-gold-300 transition-transform duration-300 ease-out",
                  active === link.href ? "scale-x-100" : "scale-x-0",
                )}
              />
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

      {/* grid-rows 0fr→1fr animates to the panel's natural height without measuring it. */}
      <Container
        inert={!open}
        className={cn(
          "grid transition-all duration-300 ease-out lg:hidden",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mb-4 rounded-2xl border border-white/10 bg-night-800 p-4">
          <nav className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  setSpied(link.href);
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
        </div>
      </Container>
    </header>
  );
}
