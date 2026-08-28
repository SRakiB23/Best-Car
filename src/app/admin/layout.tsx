import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { getAccount } from "@/lib/account-store";
import { getMessages, getNotifications, getStores } from "@/lib/data";

export const metadata: Metadata = {
  title: "BestCar — Dashboard",
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [stores, notifications, messages, user] = await Promise.all([
    getStores(),
    getNotifications(),
    getMessages(),
    getAccount(),
  ]);

  return <AppShell topbar={{ stores, notifications, messages, user }}>{children}</AppShell>;
}
