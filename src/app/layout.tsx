import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { getLocale } from "@/lib/account-store";
import { I18nProvider } from "@/lib/i18n-context";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Best Car",
  description:
    "Rent a car from the Best Car fleet. Check availability, see the full price up front and book online in a couple of minutes.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  // `data-scroll-behavior` tells the router the smooth scrolling in
  // globals.css is deliberate, so it suppresses it during route changes rather
  // than animating the jump to the top of a new page.
  return (
    <html lang={locale} className={jakarta.variable} data-scroll-behavior="smooth">
      <body>
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
