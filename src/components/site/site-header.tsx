"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";

import { Container } from "@/components/site/section";
import { SignOutButton } from "@/components/site/sign-out-button";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { scrollToId } from "@/lib/scroll-to-hash";
import { useDismiss } from "@/lib/use-dismiss";

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

  // The panel floats over the page now, so tapping past it has to dismiss it.
  // Every link in the panel closes it on the way out, so this only has to
  // handle taps that land elsewhere.
  const header = useRef<HTMLElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, header, close);

  /**
   * On the storefront a hash link is not navigation, it is a scroll — and the
   * browser's own hash scroll is aimed once, before the page has finished
   * settling. Taking it over lets us keep the section pinned while it does.
   * Off the storefront this stays a normal link, so the page loads at the
   * anchor and CSS `scroll-padding-top` handles the offset.
   */
  const onHashClick = useCallback(
    (event: React.MouseEvent, href: string) => {
      const id = href.split("#")[1];
      if (!id || pathname !== "/" || event.metaKey || event.ctrlKey || event.shiftKey) return;

      event.preventDefault();
      setSpied(href);
      setOpen(false);
      window.history.pushState(null, "", href);
      scrollToId(id);
    },
    [pathname],
  );

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
      ref={header}
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
              onClick={(event) => {
                setSpied(link.href);
                onHashClick(event, link.href);
              }}
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
              <SignOutButton className={buttonClass("gold", "md", "h-10 px-6 font-semibold")}>
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
              <Link href="/login" className={buttonClass("gold", "md", "h-10 px-6 font-semibold")}>
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
          className="grid size-10 place-items-center rounded-lg border border-white/15 text-white lg:hidden"
        >
          {open ? <IconX size={18} /> : <IconMenu2 size={18} />}
        </button>
      </Container>

      {/* Overlaid rather than stacked inside the header. In the flow, opening
          and closing it changed the header's height, which moved every anchor
          on the page — tap a section link and the panel collapsed mid-scroll,
          landing you a panel's height past the heading you asked for. */}
      <div
        className={cn(
          "absolute inset-x-0 top-full lg:hidden",
          !open && "pointer-events-none",
        )}
      >
        {/* grid-rows 0fr→1fr animates to the panel's natural height without measuring it. */}
        <Container
          inert={!open}
          className={cn(
            "grid transition-all duration-300 ease-out",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mb-4 rounded-2xl border border-white/10 bg-night-800 p-4 shadow-float">
              <nav className="flex flex-col">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(event) => {
                      setSpied(link.href);
                      setOpen(false);
                      onHashClick(event, link.href);
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
                    <SignOutButton className={buttonClass("gold", "md", "h-11 flex-1 font-semibold")}>
                      Sign out
                    </SignOutButton>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="flex-1 rounded-lg border border-white/15 py-2 text-center text-[13px] font-medium text-white"
                    >
                      Register
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className={buttonClass("gold", "md", "h-11 flex-1 font-semibold")}
                    >
                      Log In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}
