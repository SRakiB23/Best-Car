import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeaderBar } from "@/components/site/site-header-bar";

export default function CarsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <SiteHeaderBar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
