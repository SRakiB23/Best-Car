import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser, getMessages, getNotifications, getStores } from "@/lib/data";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BestCar — Dashboard",
  description: "Inventory, stock and sales management for car dealerships.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [stores, notifications, messages, user] = await Promise.all([
    getStores(),
    getNotifications(),
    getMessages(),
    getCurrentUser(),
  ]);

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AppShell topbar={{ stores, notifications, messages, user }}>{children}</AppShell>
      </body>
    </html>
  );
}
