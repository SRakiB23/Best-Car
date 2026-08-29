import { PageHeader } from "@/components/ui/page-header";
import { getAccount, getTranslator } from "@/lib/account-store";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const [account, t] = await Promise.all([getAccount(), getTranslator()]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title={t("My Profile")}
        description={t("Your account details across the dashboard.")}
      />

      <ProfileForm account={account} />
    </div>
  );
}
