import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { getLocale } from "@/lib/account-store";
import { I18nProvider } from "@/lib/i18n-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BestCar",
  description: "Inventory, stock and sales management for car dealerships.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={inter.variable}>
      <body>
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
