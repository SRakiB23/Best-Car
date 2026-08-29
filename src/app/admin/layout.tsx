import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { LeadsFab } from "@/components/leads/leads-fab";
import { getAccount } from "@/lib/account-store";
import { requireStaff } from "@/lib/auth";
import { getMessages, getNewLeadCount, getNotifications, getStores } from "@/lib/data";

export const metadata: Metadata = {
  title: "BestCar — Dashboard",
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Customers have accounts now, so a session alone is not enough to be here.
  await requireStaff();

  const [stores, notifications, messages, user, newLeads] = await Promise.all([
    getStores(),
    getNotifications(),
    getMessages(),
    getAccount(),
    getNewLeadCount(),
  ]);

  return (
    <AppShell topbar={{ stores, notifications, messages, user }}>
      {children}
      <LeadsFab count={newLeads} />
    </AppShell>
  );
}
