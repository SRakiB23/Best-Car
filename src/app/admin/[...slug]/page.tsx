import { IconTool } from "@tabler/icons-react";

import { Card, CardBody } from "@/components/ui/card";
import { getTranslator } from "@/lib/account-store";
import { adminRoot, navSections } from "@/lib/nav";

function titleFor(path: string) {
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.href === path) return item.label;
      const child = item.children?.find((entry) => entry.href === path);
      if (child) return child.label;
    }
  }

  return path
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/-/g, " "))
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" / ");
}

export default async function StubPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = `${adminRoot}/${slug.join("/")}`;
  const t = await getTranslator();

  return (
    <Card>
      <CardBody className="grid place-items-center gap-3 py-20 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-500">
          <IconTool size={22} stroke={1.6} />
        </span>
        <h1 className="text-lg font-semibold text-navy-900">{t(titleFor(path))}</h1>
        <p className="max-w-sm text-[13px] text-ink-500">
          This screen is not built yet. The dashboard is the completed section.
        </p>
        <code className="rounded-md bg-canvas px-2 py-1 text-xs text-ink-500">{path}</code>
      </CardBody>
    </Card>
  );
}
