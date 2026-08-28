import Image from "next/image";
import Link from "next/link";
import { IconBrandDiscord, IconBrandFacebook, IconBrandInstagram, IconBrandTwitter } from "@tabler/icons-react";

import { Container } from "@/components/site/section";

const columns = [
  {
    title: "About",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Featured", href: "#fleet" },
      { label: "Partnership", href: "#partnership" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Events", href: "#events" },
      { label: "Blog", href: "#blog" },
      { label: "Podcast", href: "#podcast" },
    ],
  },
  {
    title: "Socials",
    links: [
      { label: "Discord", href: "#discord" },
      { label: "Instagram", href: "#instagram" },
      { label: "Twitter", href: "#twitter" },
    ],
  },
];

const socials = [
  { label: "Facebook", href: "#facebook", icon: IconBrandFacebook },
  { label: "Instagram", href: "#instagram", icon: IconBrandInstagram },
  { label: "Twitter", href: "#twitter", icon: IconBrandTwitter },
  { label: "Discord", href: "#discord", icon: IconBrandDiscord },
];

export function SiteFooter() {
  return (
    <footer className="bg-night-900">
      <Container className="grid gap-12 py-14 lg:grid-cols-[1.2fr_repeat(3,1fr)] lg:gap-10 lg:py-16">
        <div className="max-w-sm">
          <Image
            src="/client-side/BestCarLogo.jpeg"
            alt="Best Car"
            width={1024}
            height={413}
            className="h-10 w-auto rounded-md"
          />

          <p className="mt-5 text-base font-medium leading-relaxed text-night-muted">
            Our vision is to provide convenience and help increase your sales business.
          </p>

          <ul className="mt-6 flex items-center gap-3">
            {socials.map((social) => (
              <li key={social.label}>
                <Link
                  href={social.href}
                  aria-label={social.label}
                  className="grid size-9 place-items-center rounded-full bg-gold-300 text-night-900 transition hover:bg-gold-400"
                >
                  <social.icon size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {columns.map((column) => (
          <nav key={column.title}>
            <h3 className="text-xl font-semibold text-white">{column.title}</h3>
            <ul className="mt-5 flex flex-col gap-4">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-base font-medium text-night-muted transition hover:text-gold-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="bg-mist-200">
        <Container className="flex flex-col items-center gap-4 py-5 text-base font-semibold text-ink-700 sm:flex-row sm:justify-between">
          <p>&copy;2026 Best Auto. All rights reserved</p>

          <div className="flex items-center gap-8">
            <Link href="#privacy" className="transition hover:text-gold-600">
              Privacy &amp; Policy
            </Link>
            <Link href="#terms" className="transition hover:text-gold-600">
              Terms &amp; Condition
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
