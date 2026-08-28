"use client";

import { signOut } from "@/lib/auth-actions";
import { useI18n } from "@/lib/i18n-context";
import { menuFooterClass } from "./link-menu";

export function SignOutButton() {
  const { t } = useI18n();

  return (
    <form action={signOut}>
      <button type="submit" className={menuFooterClass}>
        {t("Sign out")}
      </button>
    </form>
  );
}
