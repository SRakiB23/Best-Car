import { PageHeader } from "@/components/ui/page-header";
import { getPreferences, getTranslator } from "@/lib/account-store";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const [preferences, t] = await Promise.all([getPreferences(), getTranslator()]);

  return (
    <div className="max-w-3xl space-y-4 lg:space-y-6">
      <PageHeader
        title={t("Settings")}
        description={t("Store preferences applied across the dashboard.")}
      />
      <SettingsForm preferences={preferences} />
    </div>
  );
}
