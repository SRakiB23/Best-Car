import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeaderBar } from "@/components/site/site-header-bar";

export const metadata: Metadata = {
  title: "My account | Best Car",
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <SiteHeaderBar />
      <main className="flex-1 bg-mist">{children}</main>
      <SiteFooter />
    </div>
  );
}
