import { SiteHeader } from "@/components/site/site-header";
import { currentViewer } from "@/lib/auth";

/** Server wrapper so every storefront page shows the signed-in state. */
export async function SiteHeaderBar() {
  const viewer = await currentViewer();

  return (
    <SiteHeader viewer={viewer ? { name: viewer.name, isStaff: viewer.isStaff } : null} />
  );
}
