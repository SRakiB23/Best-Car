import Link from "next/link";
import { IconLock, IconMail, IconPhone } from "@tabler/icons-react";

import { Avatar } from "@/components/ui/avatar";
import { buttonClass } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
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

      <Card>
        <CardBody className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <Avatar
            name={account.name}
            src={account.avatarUrl || undefined}
            size={72}
            className="text-xl ring-4 ring-brand-50"
          />

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-lg font-semibold text-navy-900">{account.name}</p>
            <p className="text-[13px] text-brand-500">{account.role}</p>

            <div className="mt-2 flex flex-col items-center gap-x-4 gap-y-1 text-[13px] text-ink-500 sm:flex-row">
              <span className="flex items-center gap-1.5">
                <IconMail size={15} stroke={1.6} />
                {account.email}
              </span>
              <span className="flex items-center gap-1.5">
                <IconPhone size={15} stroke={1.6} />
                {account.phone}
              </span>
            </div>
          </div>

          <Link href="/admin/profile/password" className={buttonClass("outline", "md", "shrink-0")}>
            <IconLock size={16} stroke={1.6} />
            {t("Change password")}
          </Link>
        </CardBody>
      </Card>

      <ProfileForm account={account} />
    </div>
  );
}
