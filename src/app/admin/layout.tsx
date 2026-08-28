import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { getAccount } from "@/lib/account-store";
import { requireStaff } from "@/lib/auth";
import { getMessages, getNotifications, getStores } from "@/lib/data";

export const metadata: Metadata = {
  title: "BestCar — Dashboard",
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Customers have accounts now, so a session alone is not enough to be here.
  await requireStaff();

  const [stores, notifications, messages, user] = await Promise.all([
    getStores(),
    getNotifications(),
    getMessages(),
    getAccount(),
  ]);

  return <AppShell topbar={{ stores, notifications, messages, user }}>{children}</AppShell>;
}
