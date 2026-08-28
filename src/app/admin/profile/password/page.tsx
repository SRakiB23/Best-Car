import { PageHeader } from "@/components/ui/page-header";
import { getTranslator } from "@/lib/account-store";
import { PasswordForm } from "./password-form";

export default async function ChangePasswordPage() {
  const t = await getTranslator();

  return (
    <div className="max-w-xl space-y-4 lg:space-y-6">
      <PageHeader
        title={t("Change Password")}
        description={t("Use at least 8 characters, mixing letters and numbers.")}
      />
      <PasswordForm />
    </div>
  );
}
